/**
 * Prompt Management & Hot Reload Service
 * 支持实时更新 Prompt、版本管理、A/B 测试、回滚
 *
 * 核心特性:
 * - 热更新 (无需重启 Agent)
 * - 完整版本历史
 * - 一键回滚
 * - A/B 测试框架
 * - 版本对比
 */

import { auditLogService } from './audit.service';
import { notificationService } from './notification.service';

export interface PromptVersion {
  id: string;
  version: number;
  agentId: string;

  // 内容
  systemPrompt: string;
  temperature: number;
  maxTokens: number;

  // 元数据
  title: string;
  description: string;
  author: string;
  createdAt: number;

  // 状态
  status: 'draft' | 'active' | 'archived' | 'testing';
  isDefault: boolean;

  // A/B 测试
  abTestId?: string;
  abTestGroup?: 'A' | 'B';

  // 性能指标
  metrics?: {
    avgQuality: number;
    usageCount: number;
    successRate: number;
    avgCost: number;
  };
}

export interface PromptABTest {
  id: string;
  agentId: string;

  // 对比版本
  controlVersion: number;
  variantVersion: number;

  // 参数
  splitRatio: number;  // 0.5 = 50%
  duration: number;    // 毫秒
  startTime: number;
  endTime?: number;

  // 指标
  controlMetrics?: {
    sampleSize: number;
    avgQuality: number;
    successRate: number;
  };
  variantMetrics?: {
    sampleSize: number;
    avgQuality: number;
    successRate: number;
  };

  // 状态
  status: 'running' | 'completed' | 'paused' | 'cancelled';
  winner?: 'control' | 'variant';
}

class PromptManagementService {
  private promptVersions: Map<string, PromptVersion[]> = new Map();
  private currentActiveVersion: Map<string, number> = new Map();
  private promptCache: Map<string, PromptVersion> = new Map();
  private abTests: Map<string, PromptABTest> = new Map();
  private versionUpdateSubscribers: Map<string, Set<(v: PromptVersion) => void>> = new Map();

  /**
   * 创建新版本的 Prompt
   */
  public async createPromptVersion(
    agentId: string,
    systemPrompt: string,
    options: {
      title?: string;
      description?: string;
      temperature?: number;
      maxTokens?: number;
      author?: string;
      status?: 'draft' | 'active' | 'archived' | 'testing';
    } = {}
  ): Promise<PromptVersion> {
    // 获取或初始化版本列表
    if (!this.promptVersions.has(agentId)) {
      this.promptVersions.set(agentId, []);
    }

    const versions = this.promptVersions.get(agentId)!;
    const nextVersion = versions.length + 1;

    const newVersion: PromptVersion = {
      id: `pv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      version: nextVersion,
      agentId,
      systemPrompt,
      temperature: options.temperature ?? 0.7,
      maxTokens: options.maxTokens ?? 2000,
      title: options.title || `Version ${nextVersion}`,
      description: options.description || '',
      author: options.author || 'system',
      createdAt: Date.now(),
      status: options.status || 'draft',
      isDefault: false
    };

    versions.push(newVersion);

    // 更新缓存
    this.promptCache.set(`${agentId}:${nextVersion}`, newVersion);

    // 记录审计
    await auditLogService.log(
      'PROMPT_VERSION_CREATE',
      options.author || 'system',
      'admin@modaui.test',
      {
        resource: { type: 'Agent', id: agentId },
        metadata: {
          version: nextVersion,
          title: newVersion.title,
          status: newVersion.status
        }
      }
    );

    return newVersion;
  }

  /**
   * 激活某个版本（立即生效，无需重启）
   */
  public async activateVersion(
    agentId: string,
    version: number,
    updatedBy: string
  ): Promise<PromptVersion> {
    const versions = this.promptVersions.get(agentId);
    if (!versions) {
      throw new Error(`No versions found for agent: ${agentId}`);
    }

    const targetVersion = versions.find(v => v.version === version);
    if (!targetVersion) {
      throw new Error(`Version not found: ${version}`);
    }

    // 取消之前的激活
    const currentVersion = this.currentActiveVersion.get(agentId);
    if (currentVersion) {
      const prevVersion = versions.find(v => v.version === currentVersion);
      if (prevVersion) {
        prevVersion.status = 'archived';
        prevVersion.isDefault = false;
      }
    }

    // 激活新版本
    targetVersion.status = 'active';
    targetVersion.isDefault = true;
    this.currentActiveVersion.set(agentId, version);

    // 立即更新缓存
    this.promptCache.set(agentId, targetVersion);

    // 通知所有订订阅者
    await this.notifyVersionChange(agentId, targetVersion);

    // 发送通知
    notificationService.notify(
      `Prompt 已更新 (${agentId})`,
      `已激活版本 ${version}: ${targetVersion.title}`,
      {
        level: 'info',
        category: 'config',
        details: { agentId, version, title: targetVersion.title }
      }
    );

    // 记录审计
    await auditLogService.log(
      'PROMPT_ACTIVATE',
      updatedBy,
      'admin@modaui.test',
      {
        resource: { type: 'Agent', id: agentId },
        metadata: {
          version,
          title: targetVersion.title,
          previousVersion: currentVersion
        }
      }
    );

    return targetVersion;
  }

  /**
   * 回滚到指定版本
   */
  public async rollbackToVersion(
    agentId: string,
    version: number,
    reason: string,
    rolledBackBy: string
  ): Promise<PromptVersion> {
    const versions = this.promptVersions.get(agentId);
    if (!versions) {
      throw new Error(`No versions found for agent: ${agentId}`);
    }

    const targetVersion = versions.find(v => v.version === version);
    if (!targetVersion) {
      throw new Error(`Version not found: ${version}`);
    }

    // 记录审计（标记为回滚）
    await auditLogService.log(
      'PROMPT_ROLLBACK',
      rolledBackBy,
      'admin@modaui.test',
      {
        resource: { type: 'Agent', id: agentId },
        metadata: {
          version,
          reason,
          title: targetVersion.title
        }
      }
    );

    // 激活目标版本
    return await this.activateVersion(agentId, version, rolledBackBy);
  }

  /**
   * 获取当前活动的 Prompt
   */
  public getActivePrompt(agentId: string): PromptVersion | null {
    // 先查缓存
    const cached = this.promptCache.get(agentId);
    if (cached && cached.status === 'active') {
      return cached;
    }

    // 再查版本列表
    const versions = this.promptVersions.get(agentId);
    if (!versions) return null;

    const active = versions.find(v => v.status === 'active' && v.isDefault);
    if (active) {
      this.promptCache.set(agentId, active);
    }

    return active || null;
  }

  /**
   * 对比两个版本
   */
  public compareVersions(
    agentId: string,
    version1: number,
    version2: number
  ): {
    v1: PromptVersion | null;
    v2: PromptVersion | null;
    differences: string[];
  } {
    const versions = this.promptVersions.get(agentId);
    if (!versions) {
      return { v1: null, v2: null, differences: [] };
    }

    const v1 = versions.find(v => v.version === version1);
    const v2 = versions.find(v => v.version === version2);

    const differences: string[] = [];

    if (v1 && v2) {
      if (v1.systemPrompt !== v2.systemPrompt) {
        differences.push('systemPrompt');
      }
      if (v1.temperature !== v2.temperature) {
        differences.push('temperature');
      }
      if (v1.maxTokens !== v2.maxTokens) {
        differences.push('maxTokens');
      }
      if (v1.title !== v2.title) {
        differences.push('title');
      }
    }

    return { v1, v2, differences };
  }

  /**
   * 获取版本历史
   */
  public getVersionHistory(agentId: string, limit: number = 50): PromptVersion[] {
    const versions = this.promptVersions.get(agentId) || [];
    return versions.sort((a, b) => b.version - a.version).slice(0, limit);
  }

  /**
   * 启动 A/B 测试
   */
  public async startABTest(
    agentId: string,
    controlVersion: number,
    variantVersion: number,
    splitRatio: number = 0.5,
    durationMs: number = 604800000 // 7 天
  ): Promise<PromptABTest> {
    const versions = this.promptVersions.get(agentId) || [];

    if (!versions.find(v => v.version === controlVersion)) {
      throw new Error(`Control version not found: ${controlVersion}`);
    }
    if (!versions.find(v => v.version === variantVersion)) {
      throw new Error(`Variant version not found: ${variantVersion}`);
    }

    const test: PromptABTest = {
      id: `abtest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      agentId,
      controlVersion,
      variantVersion,
      splitRatio,
      duration: durationMs,
      startTime: Date.now(),
      status: 'running'
    };

    this.abTests.set(test.id, test);

    // 标记版本为测试中
    const controlV = versions.find(v => v.version === controlVersion);
    const variantV = versions.find(v => v.version === variantVersion);
    if (controlV) {
      controlV.abTestId = test.id;
      controlV.abTestGroup = 'A';
    }
    if (variantV) {
      variantV.abTestId = test.id;
      variantV.abTestGroup = 'B';
    }

    notificationService.notify(
      'A/B 测试启动',
      `Agent ${agentId} 已启动 A/B 测试 (比例: ${(splitRatio * 100).toFixed(0)}%)`,
      {
        level: 'info',
        category: 'config',
        details: {
          agentId,
          controlVersion,
          variantVersion,
          testId: test.id
        }
      }
    );

    return test;
  }

  /**
   * 获取 A/B 测结果
   */
  public getABTestResult(testId: string): PromptABTest | null {
    return this.abTests.get(testId) || null;
  }

  /**
   * 完成 A/B 测试，选择赢家
   */
  public async completeABTest(
    testId: string,
    winner: 'control' | 'variant',
    completedBy: string
  ): Promise<PromptABTest | null> {
    const test = this.abTests.get(testId);
    if (!test) return null;

    test.status = 'completed';
    test.winner = winner;
    test.endTime = Date.now();

    const winnerVersion = winner === 'control' ? test.controlVersion : test.variantVersion;

    // 自动激活赢家版本
    await this.activateVersion(test.agentId, winnerVersion, completedBy);

    notificationService.notify(
      'A/B 测试完成',
      `${winner === 'control' ? 'Control' : 'Variant'} 版本胜出`,
      {
        level: 'success',
        category: 'config',
        details: { testId, winner, agentId: test.agentId }
      }
    );

    return test;
  }

  /**
   * 订阅版本变更
   */
  public subscribe(agentId: string, handler: (v: PromptVersion) => void): () => void {
    if (!this.versionUpdateSubscribers.has(agentId)) {
      this.versionUpdateSubscribers.set(agentId, new Set());
    }

    this.versionUpdateSubscribers.get(agentId)!.add(handler);

    return () => {
      this.versionUpdateSubscribers.get(agentId)?.delete(handler);
    };
  }

  /**
   * 通知版本变更
   */
  private async notifyVersionChange(agentId: string, version: PromptVersion) {
    const handlers = this.versionUpdateSubscribers.get(agentId);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(version);
        } catch (e) {
          console.error(`Error in prompt version subscriber for ${agentId}:`, e);
        }
      }
    }
  }

  /**
   * 批量操作：克隆版本
   */
  public async cloneVersion(
    agentId: string,
    sourceVersion: number,
    newTitle: string,
    clonedBy: string
  ): Promise<PromptVersion> {
    const versions = this.promptVersions.get(agentId) || [];
    const source = versions.find(v => v.version === sourceVersion);

    if (!source) {
      throw new Error(`Source version not found: ${sourceVersion}`);
    }

    return await this.createPromptVersion(
      agentId,
      source.systemPrompt,
      {
        title: newTitle,
        description: `克隆自版本 ${sourceVersion}`,
        temperature: source.temperature,
        maxTokens: source.maxTokens,
        author: clonedBy,
        status: 'draft'
      }
    );
  }

  /**
   * 获取版本统计
   */
  public getVersionStats(agentId: string) {
    const versions = this.promptVersions.get(agentId) || [];
    const active = versions.find(v => v.status === 'active');
    const testing = versions.filter(v => v.status === 'testing');
    const archived = versions.filter(v => v.status === 'archived');

    return {
      totalVersions: versions.length,
      activeVersion: active?.version,
      testingCount: testing.length,
      archivedCount: archived.length,
      createdAt: versions.length > 0 ? versions[0].createdAt : null,
      lastModified: versions.length > 0 ? versions[versions.length - 1].createdAt : null
    };
  }
}

export const promptManagementService = new PromptManagementService();

