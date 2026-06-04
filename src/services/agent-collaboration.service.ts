/**
 * Agent Collaboration Hub - 智能体协作中枢
 * 实现 Agent 间的实时消息传递、上下文共享、链式执行
 *
 * 核心特性:
 * - Pub/Sub 消息总线
 * - 共享执行上下文 (Context Hub)
 * - 智能任务路由
 * - 链式 Agent 执行
 */

import { notificationService } from './notification.service';
import { auditLogService } from './audit.service';

export type AgentMessageType =
  | 'REQUEST'      // 请求其他 Agent 执行
  | 'RESPONSE'     // 返回执行结果
  | 'NOTIFY'       // 通知事件
  | 'QUERY'        // 查询共享数据
  | 'UPDATE'       // 更新共享数据
  | 'ERROR';       // 错误报告

export interface AgentMessage {
  id: string;
  from: string;              // 发送 Agent ID (aria-designer)
  to: string[];              // 接收 Agent ID 数组
  type: AgentMessageType;
  action: string;            // 具体操作 (DESIGN_POSTER, COST_CHECK, etc)
  payload: Record<string, any>;
  correlationId: string;     // 追踪链式调用
  timestamp: number;
  priority: 'low' | 'normal' | 'high';
  timeout: number;           // 超时时间 (ms)
  retryCount?: number;
}

export interface AgentContext {
  sessionId: string;
  merchantId: string;
  organizationId: string;

  // 执行链信息
  chain: {
    startAgent: string;      // 初始触发 Agent
    executionSequence: string[];
    currentAgent: string;
    depth: number;           // 递归深度
  };

  // 共享数据
  sharedData: {
    inputs: Record<string, any>;
    intermediateResults: Record<string, any>;
    finalResult: any;
  };

  // 执行追踪
  executionTrace: {
    agentId: string;
    status: 'pending' | 'executing' | 'completed' | 'failed';
    startTime: number;
    endTime?: number;
    result?: any;
    error?: string;
  }[];

  // 元数据
  metadata: {
    priority: 'low' | 'normal' | 'high';
    totalTokensUsed: number;
    totalCostEstimate: number;
    startTime: number;
    expectedCompletionTime?: number;
  };
}

export interface AgentCollaborationResult {
  contextId: string;
  status: 'success' | 'partial_success' | 'failed';
  results: {
    agentId: string;
    result: any;
    status: 'success' | 'failed';
    tokensUsed: number;
    cost: number;
  }[];
  totalTokensUsed: number;
  totalCost: number;
  executionTime: number;
  errors: Array<{
    agentId: string;
    error: string;
    timestamp: number;
  }>;
}

class AgentCollaborationHub {
  private contexts: Map<string, AgentContext> = new Map();
  private messageQueue: Map<string, AgentMessage[]> = new Map();
  private subscribers: Map<string, Set<(msg: AgentMessage) => void>> = new Map();
  private executionHistory: AgentCollaborationResult[] = [];
  private maxContextSize = 100;
  private maxQueueSize = 1000;

  /**
   * 创建新的协作上下文
   */
  public createContext(
    merchantId: string,
    organizationId: string,
    initialData?: Record<string, any>
  ): string {
    const contextId = `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const context: AgentContext = {
      sessionId: contextId,
      merchantId,
      organizationId,
      chain: {
        startAgent: '',
        executionSequence: [],
        currentAgent: '',
        depth: 0
      },
      sharedData: {
        inputs: initialData || {},
        intermediateResults: {},
        finalResult: null
      },
      executionTrace: [],
      metadata: {
        priority: 'normal',
        totalTokensUsed: 0,
        totalCostEstimate: 0,
        startTime: Date.now()
      }
    };

    this.contexts.set(contextId, context);

    // 限制大小
    if (this.contexts.size > this.maxContextSize) {
      const firstKey = this.contexts.keys().next().value;
      this.contexts.delete(firstKey);
    }

    return contextId;
  }

  /**
   * 获取上下文
   */
  public getContext(contextId: string): AgentContext | null {
    return this.contexts.get(contextId) || null;
  }

  /**
   * 向共享上下文添加数据
   */
  public updateContextData(
    contextId: string,
    dataKey: string,
    value: any,
    isIntermediate: boolean = false
  ): boolean {
    const context = this.getContext(contextId);
    if (!context) return false;

    if (isIntermediate) {
      context.sharedData.intermediateResults[dataKey] = value;
    } else {
      context.sharedData.inputs[dataKey] = value;
    }

    // 发送 UPDATE 通知
    this.broadcast({
      from: 'system',
      to: [],
      type: 'UPDATE',
      action: 'CONTEXT_UPDATED',
      payload: { contextId, dataKey, value },
      correlationId: contextId,
      timestamp: Date.now(),
      priority: 'normal',
      timeout: 30000
    });

    return true;
  }

  /**
   * 发送消息给其他 Agent
   */
  public async sendMessage(
    message: AgentMessage
  ): Promise<AgentMessage> {
    // 验证
    if (!message.from || message.to.length === 0) {
      throw new Error('Invalid message: from and to required');
    }

    // 确保队列存在
    for (const agentId of message.to) {
      if (!this.messageQueue.has(agentId)) {
        this.messageQueue.set(agentId, []);
      }
    }

    // 添加到队列
    for (const agentId of message.to) {
      const queue = this.messageQueue.get(agentId)!;
      queue.push(message);

      // 限制队列大小
      if (queue.length > this.maxQueueSize) {
        queue.shift();
      }

      // 通知订阅者
      await this.notifySubscribers(agentId, message);
    }

    return message;
  }

  /**
   * Agent 订阅消息
   */
  public subscribe(
    agentId: string,
    handler: (msg: AgentMessage) => void
  ): () => void {
    if (!this.subscribers.has(agentId)) {
      this.subscribers.set(agentId, new Set());
    }

    this.subscribers.get(agentId)!.add(handler);

    // 返回取消订阅函数
    return () => {
      const subscribers = this.subscribers.get(agentId);
      if (subscribers) {
        subscribers.delete(handler);
      }
    };
  }

  /**
   * 通知所有订阅者
   */
  private async notifySubscribers(agentId: string, message: AgentMessage) {
    const handlers = this.subscribers.get(agentId);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(message);
        } catch (e) {
          console.error(`Agent subscription error for ${agentId}:`, e);
        }
      }
    }
  }

  /**
   * 广播消息给所有 Agent
   */
  public broadcast(message: Omit<AgentMessage, 'id'>): void {
    const msg: AgentMessage = {
      ...message,
      id: `msg_${Date.now()}`
    };

    // 通知所有订阅者
    for (const [agentId, handlers] of this.subscribers.entries()) {
      for (const handler of handlers) {
        try {
          handler(msg);
        } catch (e) {
          console.error(`Broadcast error for agent ${agentId}:`, e);
        }
      }
    }
  }

  /**
   * Agent 链式执行 - 核心协作
   *
   * 示例:
   * collaborateAgents(
   *   designer,
   *   [marketing_manager, accountant],
   *   'create_campaign',
   *   contextId
   * )
   *
   * 执行流程:
   * 1. Designer 生成海报并更新上下文
   * 2. Marketing Manager receive 海报数据，评估成本
   * 3. Accountant 收到评估，进行账目记录
   */
  public async executeCollaborativeChain(
    contextId: string,
    agents: Array<{
      id: string;
      role: string;
      execute: (context: AgentContext) => Promise<any>;
    }>,
    timeout: number = 60000
  ): Promise<AgentCollaborationResult> {
    const context = this.getContext(contextId);
    if (!context) {
      throw new Error(`Context not found: ${contextId}`);
    }

    const result: AgentCollaborationResult = {
      contextId,
      status: 'success',
      results: [],
      totalTokensUsed: 0,
      totalCost: 0,
      executionTime: 0,
      errors: []
    };

    const startTime = Date.now();
    let agentIndex = 0;

    try {
      for (const agent of agents) {
        const traceEntry: {
          agentId: string;
          status: 'pending' | 'executing' | 'completed' | 'failed';
          startTime: number;
          endTime?: number;
          result?: any;
          error?: string;
        } = {
          agentId: agent.id,
          status: 'executing',
          startTime: Date.now(),
          endTime: undefined,
          result: undefined,
          error: undefined
        };

        context.executionTrace.push(traceEntry);
        context.chain.currentAgent = agent.id;
        context.chain.depth = agentIndex;
        agentIndex++;

        try {
          // 通知前一个 Agent（如果存在）
          if (agentIndex > 1) {
            await this.sendMessage({
              id: `msg_${Date.now()}`,
              from: agents[agentIndex - 2].id,
              to: [agent.id],
              type: 'REQUEST',
              action: 'CONTINUE_EXECUTION',
              payload: {
                intermediateResults: context.sharedData.intermediateResults
              },
              correlationId: contextId,
              timestamp: Date.now(),
              priority: context.metadata.priority,
              timeout
            });
          }

          // 执行 Agent
          const agentResult = await Promise.race([
            agent.execute(context),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error(`Agent timeout: ${agent.id}`)), timeout)
            )
          ]);

          // 更新结果
          traceEntry.status = 'completed';
          traceEntry.endTime = Date.now();
          traceEntry.result = agentResult;

          result.results.push({
            agentId: agent.id,
            result: agentResult,
            status: 'success',
            tokensUsed: agentResult.tokensUsed || 0,
            cost: agentResult.cost || 0
          });

          // 累计成本和 token
          result.totalTokensUsed += agentResult.tokensUsed || 0;
          result.totalCost += agentResult.cost || 0;
          context.metadata.totalTokensUsed += agentResult.tokensUsed || 0;
          context.metadata.totalCostEstimate += agentResult.cost || 0;

          // 保存中间结果
          context.sharedData.intermediateResults[agent.id] = agentResult;

        } catch (error) {
          traceEntry.status = 'failed';
          traceEntry.endTime = Date.now();
          traceEntry.error = (error as Error).message;

          result.results.push({
            agentId: agent.id,
            result: null,
            status: 'failed',
            tokensUsed: 0,
            cost: 0
          });

          result.errors.push({
            agentId: agent.id,
            error: (error as Error).message,
            timestamp: Date.now()
          });

          result.status = 'partial_success';
        }
      }

      context.sharedData.finalResult = result;
      result.executionTime = Date.now() - startTime;

      // 记录审计
      await auditLogService.log(
        'AGENT_COLLABORATION',
        context.merchantId,
        'system',
        {
          resource: {
            type: 'AgentChain',
            id: contextId
          },
          metadata: {
            agentCount: agents.length,
            tokensUsed: result.totalTokensUsed,
            cost: result.totalCost,
            executionTime: result.executionTime,
            status: result.status
          }
        }
      );

      return result;

    } catch (error) {
      result.status = 'failed';
      result.errors.push({
        agentId: 'system',
        error: (error as Error).message,
        timestamp: Date.now()
      });
      return result;
    }
  }

  /**
   * 获取执行历史
   */
  public getExecutionHistory(limit: number = 100): AgentCollaborationResult[] {
    return this.executionHistory.slice(-limit);
  }

  /**
   * 清理旧上下文
   */
  public cleanup(olderThanMs: number = 3600000) {
    const threshold = Date.now() - olderThanMs;
    const keysToDelete: string[] = [];

    for (const [key, context] of this.contexts.entries()) {
      if (context.metadata.startTime < threshold) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.contexts.delete(key));
    return keysToDelete.length;
  }
}

export const agentCollaborationHub = new AgentCollaborationHub();

