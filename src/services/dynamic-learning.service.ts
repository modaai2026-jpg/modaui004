/**
 * Dynamic Learning & Feedback System
 * 用户反馈 → 分析 → 自动优化 Prompt → A/B 测试
 *
 * 核心特性:
 * - 实时反馈采集
 * - 智能反馈分析 (聚类、模式识别)
 * - Prompt 自动优化建议
 * - 自动启动 A/B 测试
 */

import { auditLogService } from './audit.service';
import { notificationService } from './notification.service';
import { promptManagementService } from './prompt-management.service';
import { smartModelRouter } from './smart-model-router.service';

export type FeedbackRating = 1 | 2 | 3 | 4 | 5;
export type FeedbackCategory =
  | 'quality'        // 质量不足
  | 'cost'           // 成本太高
  | 'speed'          // 太慢
  | 'relevance'      // 不相关
  | 'tone'           // 语气不对
  | 'accuracy'       // 准确度
  | 'other';

export interface UserFeedback {
  id: string;
  timestamp: number;

  // 关联信息
  agentId: string;
  merchantId: string;
  executionId: string;

  // 反馈内容
  rating: FeedbackRating;
  category: FeedbackCategory;
  message: string;

  // 上下文
  context?: {
    task?: string;
    input?: string;
    output?: string;
  };

  // 用户信息
  userId: string;
  userName: string;

  // 状态
  processed: boolean;
  processedAt?: number;
  actionTaken?: string;
}

export interface FeedbackPattern {
  category: FeedbackCategory;
  frequency: number;
  examples: string[];
  severity: 'low' | 'medium' | 'high';
  suggestedFix?: string;
}

export interface PromptOptimizationSuggestion {
  id: string;
  agentId: string;
  timestamp: number;

  // 分析结果
  patterns: FeedbackPattern[];
  affectedArea: string;  // "tone" | "accuracy" | "length" | etc

  // 建议
  suggestion: string;
  confidenceScore: number;  // 0-100

  // 状态
  status: 'pending' | 'applied' | 'rejected' | 'testing';
  appliedVersion?: number;

  // 效果
  metrics?: {
    beforeQuality: number;
    afterQuality: number;
    improvement: number;
  };
}

class DynamicLearningService {
  private feedbacks: UserFeedback[] = [];
  private patterns: Map<string, FeedbackPattern[]> = new Map();
  private suggestions: PromptOptimizationSuggestion[] = [];
  private maxFeedbackSize = 5000;

  /**
   * 收集用户反馈
   */
  public async recordFeedback(
    agentId: string,
    merchantId: string,
    executionId: string,
    rating: FeedbackRating,
    category: FeedbackCategory,
    message: string,
    userId: string,
    userName: string,
    context?: {
      task?: string;
      input?: string;
      output?: string;
    }
  ): Promise<UserFeedback> {
    const feedback: UserFeedback = {
      id: `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      agentId,
      merchantId,
      executionId,
      rating,
      category,
      message,
      context,
      userId,
      userName,
      processed: false
    };

    this.feedbacks.push(feedback);
    if (this.feedbacks.length > this.maxFeedbackSize) {
      this.feedbacks.shift();
    }

    // 立即触发分析（异步）
    setImmediate(() => this.analyzeFeedback(agentId, merchantId));

    // 记录审计
    await auditLogService.log(
      'AGENT_FEEDBACK',
      userId,
      userName,
      {
        resource: { type: 'Agent', id: agentId },
        metadata: {
          executionId,
          rating,
          category,
          message
        }
      }
    );

    return feedback;
  }

  /**
   * 分析反馈，识别模式
   */
  private async analyzeFeedback(agentId: string, merchantId: string) {
    // 收集最近的反馈
    const recentFeedbacks = this.feedbacks.filter(
      f => f.agentId === agentId &&
           Date.now() - f.timestamp < 604800000 &&  // 最近 7 天
           !f.processed
    );

    if (recentFeedbacks.length < 5) {
      // 样本太少，暂不分析
      return;
    }

    // 按类别分组
    const categoryCounts = new Map<FeedbackCategory, number>();
    const categoryExamples = new Map<FeedbackCategory, string[]>();

    for (const fb of recentFeedbacks) {
      categoryCounts.set(
        fb.category,
        (categoryCounts.get(fb.category) || 0) + 1
      );

      if (!categoryExamples.has(fb.category)) {
        categoryExamples.set(fb.category, []);
      }
      categoryExamples.get(fb.category)!.push(fb.message);
    }

    // 识别主要问题
    const patterns: FeedbackPattern[] = [];
    for (const [category, count] of categoryCounts.entries()) {
      const frequency = count / recentFeedbacks.length;

      if (frequency > 0.2) {  // 超过 20% 的反馈
        const avgRating = recentFeedbacks
          .filter(f => f.category === category)
          .reduce((sum, f) => sum + f.rating, 0) / count;

        const severity = avgRating < 2 ? 'high' : avgRating < 3.5 ? 'medium' : 'low';

        patterns.push({
          category,
          frequency: count,
          examples: categoryExamples.get(category) || [],
          severity,
          suggestedFix: this.getSuggestedFix(category)
        });
      }
    }

    if (patterns.length > 0) {
      this.patterns.set(agentId, patterns);

      // 生成优化建议
      await this.generateOptimizationSuggestions(agentId, merchantId, patterns);
    }

    // 标记为已处理
    for (const fb of recentFeedbacks) {
      fb.processed = true;
      fb.processedAt = Date.now();
    }
  }

  /**
   * 生成 Prompt 优化建议
   */
  private async generateOptimizationSuggestions(
    agentId: string,
    merchantId: string,
    patterns: FeedbackPattern[]
  ) {
    for (const pattern of patterns) {
      if (pattern.severity === 'low') {
        continue;  // 忽略低严重性问题
      }

      const suggestion = await this.createOptimizationSuggestion(
        agentId,
        merchantId,
        pattern
      );

      if (suggestion && suggestion.confidenceScore > 60) {
        // 自动创建新版本进行测试
        await this.applyOptimizationSuggestion(agentId, suggestion);

        notificationService.notify(
          '🤖 Prompt 自动优化',
          `${agentId} 发现问题: ${this.getCategoryLabel(pattern.category)}，已生成优化建议`,
          {
            level: 'info',
            category: 'system',
            details: {
              agentId,
              category: pattern.category,
              confidence: suggestion.confidenceScore,
              suggestionId: suggestion.id
            }
          }
        );
      }
    }
  }

  /**
   * 使用 AI 生成优化建议
   */
  private async createOptimizationSuggestion(
    agentId: string,
    merchantId: string,
    pattern: FeedbackPattern
  ): Promise<PromptOptimizationSuggestion | null> {
    // 获取当前 Prompt
    const currentPrompt = promptManagementService.getActivePrompt(agentId);
    if (!currentPrompt) return null;

    // 简化版本：直接生成建议（实际应使用 Claude/GPT 来分析）
    // 这里示例如下：
    const suggestion: PromptOptimizationSuggestion = {
      id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      agentId,
      timestamp: Date.now(),
      patterns: [pattern],
      affectedArea: pattern.category,
      suggestion: `优化 ${this.getCategoryLabel(pattern.category)}: 
        ${pattern.examples.slice(0, 2).join('; ')}`,
      confidenceScore: Math.min(100, pattern.frequency * 100),
      status: 'pending'
    };

    this.suggestions.push(suggestion);
    return suggestion;
  }

  /**
   * 应用优化建议（创建新版本 + 启动 A/B 测试）
   */
  private async applyOptimizationSuggestion(
    agentId: string,
    suggestion: PromptOptimizationSuggestion
  ) {
    try {
      const currentPrompt = promptManagementService.getActivePrompt(agentId);
      if (!currentPrompt) return;

      // 创建改进的 Prompt（简化示例）
      const improvedPrompt = this.improvePrompt(
        currentPrompt.systemPrompt,
        suggestion.affectedArea
      );

      // 创建新版本
      const newVersion = await promptManagementService.createPromptVersion(
        agentId,
        improvedPrompt,
        {
          title: `优化版: ${suggestion.affectedArea}`,
          description: suggestion.suggestion,
          author: 'auto-optimizer',
          status: 'testing'
        }
      );

      // 启动 A/B 测试
      const test = await promptManagementService.startABTest(
        agentId,
        currentPrompt.version,
        newVersion.version,
        0.3,  // 30% 流量用于测试
        604800000  // 7 天
      );

      suggestion.status = 'testing';
      suggestion.appliedVersion = newVersion.version;

      // 发送通知
      notificationService.notify(
        'A/B 测试已启动',
        `Agent ${agentId} 已启动 A/B 测试，测试版本: ${newVersion.version}`,
        {
          level: 'info',
          category: 'config',
          details: {
            agentId,
            currentVersion: currentPrompt.version,
            testVersion: newVersion.version,
            testId: test.id
          }
        }
      );

    } catch (e) {
      console.error('Error applying optimization suggestion:', e);
      suggestion.status = 'rejected';
    }
  }

  /**
   * 改进 Prompt（简化版，实际应使用 AI）
   */
  private improvePrompt(originalPrompt: string, area: string): string {
    let improved = originalPrompt;

    switch (area) {
      case 'tone':
        improved += '\n\n[优化] 语气调整: 更友好、更自然，避免过于正式';
        break;
      case 'accuracy':
        improved += '\n\n[优化] 准确性提升: 在输出前进行事实检查';
        break;
      case 'cost':
        improved += '\n\n[优化] 成本优化: 简化输出，去除不必要的冗余内容';
        break;
      case 'speed':
        improved += '\n\n[优化] 速度提升: 直接输出核心内容';
        break;
      case 'quality':
        improved += '\n\n[优化] 质量提升: 提供更详细的背景和更好的结构化输出';
        break;
      case 'relevance':
        improved += '\n\n[优化] 相关性改进: 更准确地理解用户需求';
        break;
    }

    return improved;
  }

  /**
   * 获取反馈统计
   */
  public getPatterns(agentId: string): FeedbackPattern[] {
    return this.patterns.get(agentId) || [];
  }

  /**
   * 获取优化建议
   */
  public getSuggestions(
    agentId: string,
    status?: 'pending' | 'applied' | 'rejected' | 'testing'
  ): PromptOptimizationSuggestion[] {
    return this.suggestions.filter(s => {
      if (s.agentId !== agentId) return false;
      if (status && s.status !== status) return false;
      return true;
    });
  }

  /**
   * 获取反馈数据
   */
  public getFeedback(
    agentId: string,
    limit: number = 100,
    timeRangeMs: number = 604800000  // 7 天
  ): UserFeedback[] {
    const threshold = Date.now() - timeRangeMs;
    return this.feedbacks
      .filter(f => f.agentId === agentId && f.timestamp > threshold)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * 获取反馈统计
   */
  public getFeedbackStats(agentId: string): {
    totalFeedback: number;
    avgRating: number;
    ratingDistribution: Record<number, number>;
    categoryDistribution: Record<string, number>;
  } {
    const feedbacks = this.feedbacks.filter(f => f.agentId === agentId);

    if (feedbacks.length === 0) {
      return {
        totalFeedback: 0,
        avgRating: 0,
        ratingDistribution: {},
        categoryDistribution: {}
      };
    }

    const ratingDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const categoryDist: Record<string, number> = {};

    for (const fb of feedbacks) {
      ratingDist[fb.rating]++;
      categoryDist[fb.category] = (categoryDist[fb.category] || 0) + 1;
    }

    const avgRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;

    return {
      totalFeedback: feedbacks.length,
      avgRating,
      ratingDistribution: ratingDist,
      categoryDistribution: categoryDist
    };
  }

  /**
   * 工具函数
   */
  private getCategoryLabel(category: FeedbackCategory): string {
    const labels: Record<FeedbackCategory, string> = {
      quality: '质量不足',
      cost: '成本过高',
      speed: '速度太慢',
      relevance: '不够相关',
      tone: '语气不当',
      accuracy: '准确度低',
      other: '其他问题'
    };
    return labels[category];
  }

  private getSuggestedFix(category: FeedbackCategory): string {
    const fixes: Record<FeedbackCategory, string> = {
      quality: '增加输出细节和结构化信息',
      cost: '使用成本更低的模型或简化输出',
      speed: '优化 Prompt 以减少处理时间',
      relevance: '改进上下文理解和输入解析',
      tone: '调整语气和表达方式',
      accuracy: '增加事实检查和验证步骤',
      other: '需要进一步分析'
    };
    return fixes[category];
  }
}

export const dynamicLearningService = new DynamicLearningService();

