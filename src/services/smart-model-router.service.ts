/**
 * Smart Model Router - 智能模型路由系统
 * 根据任务类型、成本预算、延迟要求自动选择最优 LLM
 *
 * 核心特性:
 * - 多模型支持 (GPT-4o, Claude, Gemini, Ollama)
 * - 动态成本追踪
 * - 性能基准测试
 * - 成本优化
 */

import { monitoringService } from './monitoring.service';
import { auditLogService } from './audit.service';

export interface ModelMetrics {
  modelId: string;
  vendor: 'openai' | 'anthropic' | 'google' | 'ollama' | 'deepseek';
  modelName: string;

  // 成本指标
  costPer1kInputTokens: number;
  costPer1kOutputTokens: number;

  // 性能指标
  avgLatency: number;        // 平均延迟 (ms)
  p95Latency: number;        // 95% 延迟
  qualityScore: number;      // 0-100

  // 限制指标
  rateLimit: number;         // 每分钟请求数
  maxTokens: number;         // 最大输入 tokens
  contextWindow: number;     // 上下文窗口大小
  maxRetries: number;        // 建议重试次数

  // 可靠性
  uptimePercent: number;     // 99.5%
  failureRate: number;       // 错误率

  // 状态
  lastUpdated: number;
  isAvailable: boolean;
  dailyQuotaRemaining: number;
}

export type TaskType =
  | 'content_generation'    // 海报、文案生成
  | 'data_analysis'         // 数据分析
  | 'customer_service'      // 客服回复
  | 'product_classification'// 商品分类
  | 'financial_calculation' // 财务计算
  | 'image_analysis'        // 图像分析
  | 'complex_reasoning';    // 复杂推理

export interface RoutingDecision {
  selectedModel: string;
  reason: string;
  alternatives: Array<{
    model: string;
    cost: number;
    latency: number;
    quality: number;
    score: number;
  }>;
  estimatedCost: number;
  estimatedLatency: number;
  timestamp: number;
}

export interface ModelUsageRecord {
  id: string;
  timestamp: number;
  modelId: string;
  taskType: TaskType;
  agentId: string;
  inputTokens: number;
  outputTokens: number;
  actualLatency: number;
  actualCost: number;
  success: boolean;
  qualityRating?: number;  // 1-5
}

class SmartModelRouter {
  private models: Map<string, ModelMetrics> = new Map();
  private usageHistory: ModelUsageRecord[] = [];
  private maxHistorySize = 10000;
  private dailyQuotas: Map<string, number> = new Map();
  private routingDecisions: RoutingDecision[] = [];
  private taskTypeWeights: Map<TaskType, string[]> = new Map();

  constructor() {
    this.initializeModels();
    this.initializeTaskWeights();
    this.startCleanupRoutine();
  }

  /**
   * 初始化模型配置
   */
  private initializeModels() {
    // GPT-4o - 高质量，高成本
    this.models.set('gpt-4o', {
      modelId: 'gpt-4o',
      vendor: 'openai',
      modelName: 'GPT-4 Omni',
      costPer1kInputTokens: 0.005,
      costPer1kOutputTokens: 0.015,
      avgLatency: 2800,
      p95Latency: 4200,
      qualityScore: 95,
      rateLimit: 10000,
      maxTokens: 128000,
      contextWindow: 128000,
      maxRetries: 3,
      uptimePercent: 99.9,
      failureRate: 0.1,
      lastUpdated: Date.now(),
      isAvailable: true,
      dailyQuotaRemaining: 1000000
    });

    // GPT-4o-mini - 便宜，快速
    this.models.set('gpt-4o-mini', {
      modelId: 'gpt-4o-mini',
      vendor: 'openai',
      modelName: 'GPT-4 Mini',
      costPer1kInputTokens: 0.00015,
      costPer1kOutputTokens: 0.0006,
      avgLatency: 800,
      p95Latency: 1200,
      qualityScore: 75,
      rateLimit: 20000,
      maxTokens: 128000,
      contextWindow: 128000,
      maxRetries: 3,
      uptimePercent: 99.95,
      failureRate: 0.05,
      lastUpdated: Date.now(),
      isAvailable: true,
      dailyQuotaRemaining: 10000000
    });

    // Claude 3.5 Sonnet - 平衡
    this.models.set('claude-3.5-sonnet', {
      modelId: 'claude-3.5-sonnet',
      vendor: 'anthropic',
      modelName: 'Claude 3.5 Sonnet',
      costPer1kInputTokens: 0.003,
      costPer1kOutputTokens: 0.015,
      avgLatency: 1500,
      p95Latency: 2200,
      qualityScore: 92,
      rateLimit: 100000,
      maxTokens: 200000,
      contextWindow: 200000,
      maxRetries: 3,
      uptimePercent: 99.8,
      failureRate: 0.2,
      lastUpdated: Date.now(),
      isAvailable: true,
      dailyQuotaRemaining: 5000000
    });

    // Gemini 2.0 - 便宜，长上下文
    this.models.set('gemini-2.0', {
      modelId: 'gemini-2.0',
      vendor: 'google',
      modelName: 'Gemini 2.0 Flash',
      costPer1kInputTokens: 0.0001,
      costPer1kOutputTokens: 0.0004,
      avgLatency: 1200,
      p95Latency: 1800,
      qualityScore: 88,
      rateLimit: 60000,
      maxTokens: 1000000,
      contextWindow: 1000000,
      maxRetries: 2,
      uptimePercent: 99.7,
      failureRate: 0.3,
      lastUpdated: Date.now(),
      isAvailable: true,
      dailyQuotaRemaining: 8000000
    });

    // DeepSeek - 经济
    this.models.set('deepseek-v3', {
      modelId: 'deepseek-v3',
      vendor: 'deepseek',
      modelName: 'DeepSeek V3',
      costPer1kInputTokens: 0.00012,
      costPer1kOutputTokens: 0.0004,
      avgLatency: 2200,
      p95Latency: 3000,
      qualityScore: 85,
      rateLimit: 50000,
      maxTokens: 200000,
      contextWindow: 200000,
      maxRetries: 3,
      uptimePercent: 99.6,
      failureRate: 0.4,
      lastUpdated: Date.now(),
      isAvailable: true,
      dailyQuotaRemaining: 20000000
    });

    // Ollama (本地) - 零成本
    this.models.set('ollama-llama2', {
      modelId: 'ollama-llama2',
      vendor: 'ollama',
      modelName: 'Llama 2 (本地)',
      costPer1kInputTokens: 0,
      costPer1kOutputTokens: 0,
      avgLatency: 3500,
      p95Latency: 5000,
      qualityScore: 70,
      rateLimit: 100000,
      maxTokens: 4096,
      contextWindow: 4096,
      maxRetries: 1,
      uptimePercent: 99.5,
      failureRate: 0.5,
      lastUpdated: Date.now(),
      isAvailable: true,
      dailyQuotaRemaining: 999999999
    });
  }

  /**
   * 初始化任务类型与模型权重
   */
  private initializeTaskWeights() {
    // 高质量任务 - 优先 GPT-4o / Claude
    this.taskTypeWeights.set('content_generation', [
      'gpt-4o',
      'claude-3.5-sonnet',
      'gemini-2.0',
      'deepseek-v3'
    ]);

    // 数据分析 - Claude 优先
    this.taskTypeWeights.set('data_analysis', [
      'claude-3.5-sonnet',
      'gpt-4o',
      'deepseek-v3',
      'gemini-2.0'
    ]);

    // 客服 - 快速便宜
    this.taskTypeWeights.set('customer_service', [
      'gpt-4o-mini',
      'deepseek-v3',
      'gemini-2.0',
      'claude-3.5-sonnet'
    ]);

    // 分类 - 任何都行
    this.taskTypeWeights.set('product_classification', [
      'deepseek-v3',
      'gemini-2.0',
      'gpt-4o-mini',
      'claude-3.5-sonnet'
    ]);

    // 财务 - 精确性
    this.taskTypeWeights.set('financial_calculation', [
      'claude-3.5-sonnet',
      'gpt-4o-mini',
      'deepseek-v3'
    ]);

    // 复杂推理
    this.taskTypeWeights.set('complex_reasoning', [
      'gpt-4o',
      'claude-3.5-sonnet',
      'deepseek-v3'
    ]);

    // 图像分析
    this.taskTypeWeights.set('image_analysis', [
      'gpt-4o',
      'gemini-2.0',
      'claude-3.5-sonnet'
    ]);
  }

  /**
   * 核心路由决策
   */
  public async selectBestModel(
    taskType: TaskType,
    constraints: {
      maxCost?: number;           // 每次最大成本 (USD)
      maxLatency?: number;        // 最大延迟 (ms)
      minQuality?: number;        // 最小质量评分
      maxContextLength?: number;  // 需要的上下文长度
      preferredModels?: string[];  // 首选模型列表
      fallbackToLocal?: boolean;   // 超过预算是否退回本地
    } = {}
  ): Promise<RoutingDecision> {
    const decision: RoutingDecision = {
      selectedModel: '',
      reason: '',
      alternatives: [],
      estimatedCost: 0,
      estimatedLatency: 0,
      timestamp: Date.now()
    };

    // 获取推荐的模型列表
    const preferredList = this.taskTypeWeights.get(taskType) || [];
    const candidates = preferredList
      .map(modelId => this.models.get(modelId))
      .filter((m): m is ModelMetrics => m !== undefined && m.isAvailable);

    if (candidates.length === 0) {
      throw new Error(`No available models for task: ${taskType}`);
    }

    // 过滤约束
    let filtered = candidates.filter(m => {
      if (constraints.maxLatency && m.avgLatency > constraints.maxLatency) return false;
      if (constraints.minQuality && m.qualityScore < constraints.minQuality) return false;
      if (constraints.maxContextLength && m.contextWindow < constraints.maxContextLength) return false;
      if (m.dailyQuotaRemaining <= 0) return false;
      return true;
    });

    // 如果没有通过过滤，检查成本约束
    if (filtered.length === 0) {
      // 尝试放宽延迟约束 (保留成本约束)
      if (constraints.maxLatency) {
        filtered = candidates.filter(m => {
          if (constraints.maxCost && m.costPer1kOutputTokens > constraints.maxCost / 1000) return false;
          return m.dailyQuotaRemaining > 0;
        });
      }

      // 还是没有, 尝试本地模型
      if (filtered.length === 0 && constraints.fallbackToLocal) {
        const ollama = this.models.get('ollama-llama2');
        if (ollama) {
          filtered = [ollama];
          decision.reason = 'Fallback to local model due to budget constraints';
        }
      }
    }

    if (filtered.length === 0) {
      throw new Error('No models satisfy constraints');
    }

    // 计算综合评分
    let bestModel = filtered[0];
    let bestScore = -Infinity;

    for (const model of filtered) {
      // 综合评分 = 质量* 40% - 延迟分* 30% - 成本分* 30%
      const qualityScore = model.qualityScore;
      const latencyScore = Math.max(0, 100 - (model.avgLatency / 50)); // 规范化
      const costScore = Math.max(0, 100 - (model.costPer1kOutputTokens * 100000)); // 规范化

      const score = qualityScore * 0.4 + latencyScore * 0.3 + costScore * 0.3;

      decision.alternatives.push({
        model: model.modelId,
        cost: model.costPer1kOutputTokens,
        latency: model.avgLatency,
        quality: model.qualityScore,
        score
      });

      if (score > bestScore) {
        bestScore = score;
        bestModel = model;
      }
    }

    decision.selectedModel = bestModel.modelId;
    decision.estimatedCost = bestModel.costPer1kOutputTokens;
    decision.estimatedLatency = bestModel.avgLatency;
    decision.reason = `Selected based on task type (${taskType}) and constraints`;

    // 记录决策
    this.routingDecisions.push(decision);
    if (this.routingDecisions.length > 10000) {
      this.routingDecisions.shift();
    }

    return decision;
  }

  /**
   * 记录模型使用
   */
  public async recordUsage(
    modelId: string,
    taskType: TaskType,
    agentId: string,
    inputTokens: number,
    outputTokens: number,
    actualLatency: number,
    success: boolean,
    qualityRating?: number
  ): Promise<ModelUsageRecord> {
    const model = this.models.get(modelId);
    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }

    // 计算成本
    const inputCost = (inputTokens / 1000) * model.costPer1kInputTokens;
    const outputCost = (outputTokens / 1000) * model.costPer1kOutputTokens;
    const totalCost = inputCost + outputCost;

    // 创建记录
    const usage: ModelUsageRecord = {
      id: `usage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      modelId,
      taskType,
      agentId,
      inputTokens,
      outputTokens,
      actualLatency,
      actualCost: totalCost,
      success,
      qualityRating
    };

    this.usageHistory.push(usage);
    if (this.usageHistory.length > this.maxHistorySize) {
      this.usageHistory.shift();
    }

    // 更新日配额
    model.dailyQuotaRemaining -= inputTokens + outputTokens;

    // 记录监控指标
    await monitoringService.recordMetric(
      `model_usage:${modelId}`,
      1,
      'count'
    );
    await monitoringService.recordMetric(
      `model_cost:${modelId}`,
      totalCost,
      'USD'
    );
    await monitoringService.recordMetric(
      `model_latency:${modelId}`,
      actualLatency,
      'ms'
    );

    // 成功率追踪
    if (!success) {
      model.failureRate = (model.failureRate * 0.9) + 10;
    } else {
      model.failureRate = model.failureRate * 0.95;
    }

    // 记录审计
    await auditLogService.log(
      'MODEL_USAGE',
      agentId,
      'system',
      {
        metadata: {
          modelId,
          taskType,
          inputTokens,
          outputTokens,
          cost: totalCost.toFixed(6),
          latency: actualLatency,
          success
        }
      }
    );

    return usage;
  }

  /**
   * 获取模型性能统计
   */
  public getModelStats(modelId: string): {
    totalUsages: number;
    totalCost: number;
    avgLatency: number;
    successRate: number;
    avgQuality: number;
  } | null {
    const usages = this.usageHistory.filter(u => u.modelId === modelId);
    if (usages.length === 0) return null;

    const totalTokens = usages.reduce((sum, u) => sum + u.inputTokens + u.outputTokens, 0);
    const totalCost = usages.reduce((sum, u) => sum + u.actualCost, 0);
    const avgLatency = usages.reduce((sum, u) => sum + u.actualLatency, 0) / usages.length;
    const successRate = (usages.filter(u => u.success).length / usages.length) * 100;
    const avgQuality = usages.reduce((sum, u) => sum + (u.qualityRating || 0), 0) / usages.length;

    return {
      totalUsages: usages.length,
      totalCost,
      avgLatency,
      successRate,
      avgQuality
    };
  }

  /**
   * 获取所有模型状态
   */
  public getAllModelStats() {
    const stats: Record<string, any> = {};
    for (const [modelId, model] of this.models.entries()) {
      stats[modelId] = {
        ...model,
        performance: this.getModelStats(modelId)
      };
    }
    return stats;
  }

  /**
   * 启动定期清理
   */
  private startCleanupRoutine() {
    setInterval(() => {
      // 每天重置日配额
      for (const model of this.models.values()) {
        model.dailyQuotaRemaining = model.rateLimit * 60 * 24; // 假设日限额
      }
    }, 86400000); // 24 小时
  }
}

export const smartModelRouter = new SmartModelRouter();

