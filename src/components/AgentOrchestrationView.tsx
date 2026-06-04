import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings, Zap, GitBranch, BarChart3, Brain, Link2, ArrowRight,
  CheckCircle, AlertCircle, Clock, DollarSign, TrendingUp, X,
  ChevronDown, ChevronUp, Play, Pause, RotateCcw
} from 'lucide-react';
import { agentCollaborationHub } from '../services/agent-collaboration.service';
import { smartModelRouter } from '../services/smart-model-router.service';
import { promptManagementService } from '../services/prompt-management.service';
import { dynamicLearningService } from '../services/dynamic-learning.service';
import { apiService, getActiveTenantId } from '../services/api';
import { notificationService } from '../services/notification.service';

interface AgentOrchestrationViewProps {
  onBackToLanding: () => void;
}

export default function AgentOrchestrationView({ onBackToLanding }: AgentOrchestrationViewProps) {
  const [activeTab, setActiveTab] = useState<'collaboration' | 'routing' | 'prompts' | 'learning'>('collaboration');
  const [selectedAgent, setSelectedAgent] = useState<string>('aria-designer');
  const [collaborationChains, setCollaborationChains] = useState<any[]>([]);
  const [modelStats, setModelStats] = useState<any[]>([]);
  const [promptVersions, setPromptVersions] = useState<any[]>([]);
  const [feedbackStats, setFeedbackStats] = useState<any>(null);

  useEffect(() => {
    loadAllData();
  }, [selectedAgent]);

  const loadAllData = async () => {
    // 加载模型统计
    const allStats = smartModelRouter.getAllModelStats();
    setModelStats(Object.entries(allStats).map(([key, value]) => ({ modelId: key, ...value })));

    // 加载 Prompt 版本
    const versions = promptManagementService.getVersionHistory(selectedAgent, 10);
    setPromptVersions(versions);

    // 加载反馈统计
    const stats = dynamicLearningService.getFeedbackStats(selectedAgent);
    setFeedbackStats(stats);
  };

  const agents = [
    'aria-designer', 'barton-purchasing', 'cyrus-operations', 'daphne-marketing',
    'fiona-finance', 'claire-customer-service'
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Brain className="w-8 h-8 text-cyan-400" />
          <h1 className="text-3xl font-bold">🚀 AI 智能体协作系统</h1>
          <span className="text-xs px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full">Shopily 级别</span>
        </div>
        <button
          onClick={onBackToLanding}
          className="px-4 py-2 text-sm bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors"
        >
          ← 返回
        </button>
      </div>

      {/* Agent Selection */}
      <div className="mb-6 grid grid-cols-6 gap-2">
        {agents.map(agent => (
          <button
            key={agent}
            onClick={() => setSelectedAgent(agent)}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
              selectedAgent === agent
                ? 'bg-cyan-500 text-black'
                : 'bg-neutral-900 text-cyan-400 hover:bg-neutral-800'
            }`}
          >
            {agent.split('-')[0]}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-neutral-800">
        {(['collaboration', 'routing', 'prompts', 'learning'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === tab
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            {tab === 'collaboration' && '🔗 Agent 协作'}
            {tab === 'routing' && '🧭 模型路由'}
            {tab === 'prompts' && '📝 Prompt 管理'}
            {tab === 'learning' && '🧠 动态学习'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Collaboration Tab */}
        {activeTab === 'collaboration' && (
          <CollaborationPanel agent={selectedAgent} />
        )}

        {/* Routing Tab */}
        {activeTab === 'routing' && (
          <RoutingPanel modelStats={modelStats} />
        )}

        {/* Prompts Tab */}
        {activeTab === 'prompts' && (
          <PromptsPanel agent={selectedAgent} versions={promptVersions} />
        )}

        {/* Learning Tab */}
        {activeTab === 'learning' && (
          <LearningPanel agent={selectedAgent} feedbackStats={feedbackStats} />
        )}
      </div>
    </div>
  );
}

/**
 * 协作面板 - 显示 Agent 链式执行
 */
function CollaborationPanel({ agent }: { agent: string }) {
  const [chains, setChains] = useState<any[]>([]);
  const [liveTask, setLiveTask] = useState<string>('请生成本周营销活动提案，并给出执行路径');
  const [liveResponse, setLiveResponse] = useState<string>('');
  const [liveHistory, setLiveHistory] = useState<any[]>([]);
  const [isExecutingLive, setIsExecutingLive] = useState<boolean>(false);

  const agentRoleMap: Record<string, { title: string; prompt: string }> = {
    'aria-designer': {
      title: '视觉与版式设计师',
      prompt: '你是一个服装电商视觉与版式设计专家，擅长生成高转化的商品页面与营销创意。'
    },
    'barton-purchasing': {
      title: '采购与供应链专家',
      prompt: '你是一个供应链与采购管理专家，负责库存补货、供应商议价和成本控制。'
    },
    'cyrus-operations': {
      title: '运营与履约经理',
      prompt: '你是一个运营与履约专家，负责订单执行、物流调度和客户满意度提升。'
    },
    'daphne-marketing': {
      title: '营销与增长策划师',
      prompt: '你是一个营销与增长专家，负责广告投放、用户促活、活动策划和转化优化。'
    },
    'fiona-finance': {
      title: '财务与预算分析师',
      prompt: '你是一个财务分析师，负责预算审计、收入预测和盈利优化。'
    },
    'claire-customer-service': {
      title: '客户成功与服务专员',
      prompt: '你是一个客户成功专家，负责客服流程、投诉处理和复购策略。'
    }
  };

  const executeAgentLive = async () => {
    const tenantId = getActiveTenantId();
    const roleMeta = agentRoleMap[agent] || {
      title: 'AI 智能员工',
      prompt: '你是一个高效的行业型数字员工，负责将创始人的指令转化为可执行业务方案。'
    };

    setIsExecutingLive(true);
    try {
      const result = await apiService.agents.execute(tenantId, agent, liveTask, `${roleMeta.prompt} 你当前的岗位是：${roleMeta.title}。`);
      setLiveResponse(result.response || '已完成执行，后台已生成任务记录。');
      setLiveHistory(prev => [
        {
          id: `${Date.now()}`,
          agent,
          tenantId,
          task: liveTask,
          result: result.response || '',
          completedAt: new Date().toISOString(),
          status: result.success ? 'success' : 'failed'
        },
        ...prev
      ].slice(0, 10));
      notificationService.notify('✅ 实时执行完成', '真实 Agent 执行路径已打通并写入后端任务队列', { level: 'success', category: 'agent' });
    } catch (error: any) {
      console.error(error);
      notificationService.notify('❌ Agent 执行失败', error.message || '请检查后台日志', { level: 'error', category: 'agent' });
      setLiveResponse(`执行失败：${error.message || '未知错误'}`);
    } finally {
      setIsExecutingLive(false);
    }
  };

  const testCollaboration = async () => {
    const contextId = agentCollaborationHub.createContext('merchant_test', 'org_test', {
      task: 'create_campaign',
      inputs: { productName: '测试产品' }
    });

    // 模拟 Agent 链式执行
    const mockAgents = [
      {
        id: 'aria-designer',
        role: 'Designer',
        execute: async (ctx: any) => ({
          result: '生成了海报',
          poster: 'design_url',
          tokensUsed: 150,
          cost: 0.05
        })
      },
      {
        id: 'soren-marketing',
        role: 'Marketing Manager',
        execute: async (ctx: any) => ({
          result: '评估了成本和效果',
          estimatedCost: 100,
          tokensUsed: 120,
          cost: 0.04
        })
      },
      {
        id: 'fiona-finance',
        role: 'Finance',
        execute: async (ctx: any) => ({
          result: '记录了账目',
          approval: true,
          tokensUsed: 80,
          cost: 0.03
        })
      }
    ];

    const result = await agentCollaborationHub.executeCollaborativeChain(
      contextId,
      mockAgents,
      30000
    );

    setChains(prev => [result, ...prev].slice(0, 10));

    notificationService.notify(
      '✅ Agent 链式执行完成',
      `成功协作 ${result.results.length} 个 Agent，总成本 $${result.totalCost.toFixed(4)}`,
      {
        level: 'success',
        category: 'system'
      }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Link2 className="w-5 h-5 text-cyan-400" />
          Agent 链式协作
        </h3>
        <button
          onClick={testCollaboration}
          className="px-4 py-2 text-sm bg-cyan-500 hover:bg-cyan-600 text-black font-medium rounded-lg transition-all flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          测试链式执行
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.5fr_1fr] mt-4">
        <div className="space-y-3 p-4 rounded-2xl border border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">实时执行真实 Agent</h4>
              <p className="text-[11px] text-neutral-400">直接调用后端 `/api/agents/execute`，生成真实推理结果并同步任务队列。</p>
            </div>
            <span className="text-[10px] text-neutral-500">租户: {getActiveTenantId()}</span>
          </div>

          <textarea
            value={liveTask}
            onChange={(e) => setLiveTask(e.target.value)}
            className="w-full min-h-[8rem] rounded-xl border border-neutral-800 bg-black px-3 py-3 text-sm text-white focus:outline-none"
          />

          <button
            onClick={executeAgentLive}
            disabled={isExecutingLive}
            className="w-full py-2 text-sm font-bold rounded-xl text-black bg-cyan-400 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExecutingLive ? '执行中...' : `向 ${agent} 发送真实指令`}
          </button>

          <div className="rounded-xl border border-neutral-800 bg-[#071013] p-3 text-sm text-neutral-300">
            <div className="text-[10px] text-neutral-500 mb-2">最新返回结果：</div>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-emerald-200">
              {liveResponse || '尚未执行任何实时任务。'}
            </div>
          </div>
        </div>

        <div className="space-y-3 p-4 rounded-2xl border border-neutral-800 bg-neutral-950/80">
          <h4 className="text-sm font-bold text-white">执行历史 / 后端任务记录</h4>
          <div className="space-y-2 max-h-[19rem] overflow-y-auto">
            {liveHistory.length === 0 ? (
              <div className="text-[11px] text-neutral-500">暂无实时执行记录，首次执行后结果会显示在这里。</div>
            ) : liveHistory.map((entry) => (
              <div key={entry.id} className="rounded-xl border border-neutral-800 bg-black/40 p-3 text-xs text-neutral-300">
                <div className="flex items-center justify-between gap-3 text-[10px] text-neutral-500">
                  <span>{entry.agent}</span>
                  <span>{entry.status === 'success' ? '✅' : '❌'}</span>
                </div>
                <div className="mt-2 text-[11px] text-neutral-400">{entry.task}</div>
                <div className="mt-2 text-[12px] text-emerald-200 whitespace-pre-wrap">{entry.result}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {chains.length > 0 && (
        <div className="space-y-3">
          {chains.map((chain, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-black/50 border border-cyan-500/20 rounded p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono text-cyan-400">执行 #{idx + 1}</span>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded ${
                    chain.status === 'success'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {chain.status}
                  </span>
                  <span className="text-xs text-neutral-400">{chain.executionTime}ms</span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                {chain.results.map((r: any, i: number) => (
                  <div key={i} className="bg-neutral-800 rounded p-2">
                    <div className="font-mono text-cyan-400">{r.agentId}</div>
                    <div className="text-neutral-400">{r.status}</div>
                    <div className="text-yellow-400">
                      ${r.cost.toFixed(4)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-neutral-400">
                💰 总成本: ${chain.totalCost.toFixed(4)} | 📊 Tokens: {chain.totalTokensUsed}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="text-xs text-neutral-500 p-3 bg-black/50 rounded border border-neutral-800">
        💡 Agent 协作总线允许多个 Agent 以链式方式执行。前一个 Agent 的输出自动成为下一个的输入。
      </div>
    </motion.div>
  );
}

/**
 * 模型路由面板
 */
function RoutingPanel({ modelStats }: { modelStats: any[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 gap-4"
    >
      {modelStats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-mono text-sm text-cyan-400">{stat.modelName}</h4>
            <span className={`text-xs px-2 py-1 rounded ${
              stat.isAvailable
                ? 'bg-green-500/20 text-green-400'
                : 'bg-red-500/20 text-red-400'
            }`}>
              {stat.isAvailable ? 'Available' : 'Unavailable'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-black/50 p-2 rounded">
              <div className="text-neutral-400">质量评分</div>
              <div className="text-lg font-bold text-cyan-400">{stat.qualityScore}</div>
            </div>
            <div className="bg-black/50 p-2 rounded">
              <div className="text-neutral-400">平均延迟</div>
              <div className="text-lg font-bold text-yellow-400">{stat.avgLatency}ms</div>
            </div>
            <div className="bg-black/50 p-2 rounded">
              <div className="text-neutral-400">成本/1K</div>
              <div className="text-lg font-bold text-green-400">${stat.costPer1kOutputTokens.toFixed(5)}</div>
            </div>
            <div className="bg-black/50 p-2 rounded">
              <div className="text-neutral-400">可用性</div>
              <div className="text-lg font-bold text-blue-400">{stat.uptimePercent}%</div>
            </div>
          </div>

          {stat.performance && (
            <div className="text-xs border-t border-neutral-800 pt-2 space-y-1">
              <div className="flex justify-between text-neutral-400">
                <span>使用次数: {stat.performance.totalUsages}</span>
                <span className="text-green-400">成功率: {stat.performance.successRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>总成本: ${stat.performance.totalCost.toFixed(4)}</span>
                <span className="text-blue-400">平均质量: {stat.performance.avgQuality.toFixed(1)}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </motion.div>
  );
}

/**
 * Prompt 管理面板
 */
function PromptsPanel({ agent, versions }: { agent: string; versions: any[] }) {
  const [selectedVersion, setSelectedVersion] = useState<any | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 版本列表 */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 space-y-3">
          <h3 className="font-bold flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-cyan-400" />
            版本历史 ({versions.length})
          </h3>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {versions.map(v => (
              <button
                key={v.version}
                onClick={() => setSelectedVersion(v)}
                className={`w-full text-left p-3 rounded border transition-all${
                  selectedVersion?.version === v.version
                    ? ' bg-cyan-500/10 border-cyan-500'
                    : ' bg-black/50 border-neutral-700 hover:border-neutral-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm">{v.title}</span>
                  {v.isDefault && (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  )}
                </div>
                <div className="text-xs text-neutral-400 mt-1">
                  v{v.version} • {new Date(v.createdAt).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 版本详情 */}
        {selectedVersion && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 space-y-3">
            <h3 className="font-bold">{selectedVersion.title}</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-neutral-400">状态:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  selectedVersion.status === 'active'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {selectedVersion.status}
                </span>
              </div>
              <div className="text-neutral-400 text-xs">{selectedVersion.description}</div>
              <div className="bg-black/50 p-2 rounded text-xs font-mono max-h-32 overflow-y-auto">
                {selectedVersion.systemPrompt.substring(0, 200)}...
              </div>
              {selectedVersion.status !== 'active' && (
                <button className="w-full mt-2 px-3 py-2 text-xs bg-cyan-500 hover:bg-cyan-600 text-black font-medium rounded transition-all">
                  激活此版本
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-black/50 border border-neutral-800 rounded p-3 text-xs text-neutral-400">
        💡 支持热更新 - 无需重启 Agent，新版本立即生效
      </div>
    </motion.div>
  );
}

/**
 * 动态学习面板
 */
function LearningPanel({ agent, feedbackStats }: { agent: string; feedbackStats: any }) {
  if (!feedbackStats) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-4"
    >
      {/* 反馈统计 */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 space-y-4">
        <h3 className="font-bold flex items-center gap-2">
          <Brain className="w-5 h-5 text-cyan-400" />
          用户反馈统计
        </h3>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-black/50 p-3 rounded">
            <div className="text-neutral-400 text-xs">总反馈</div>
            <div className="text-2xl font-bold text-cyan-400">{feedbackStats.totalFeedback}</div>
          </div>
          <div className="bg-black/50 p-3 rounded">
            <div className="text-neutral-400 text-xs">平均评分</div>
            <div className="text-2xl font-bold text-yellow-400">{feedbackStats.avgRating.toFixed(1)}</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">评分分布</div>
          {[5, 4, 3, 2, 1].map(rating => (
            <div key={rating} className="flex items-center gap-2">
              <span className="text-xs w-4">{rating}⭐</span>
              <div className="flex-1 bg-neutral-800 rounded h-2">
                <div
                  className="h-2 bg-cyan-500 rounded"
                  style={{ width: `${(feedbackStats.ratingDistribution[rating] / feedbackStats.totalFeedback * 100) || 0}%` }}
                />
              </div>
              <span className="text-xs text-neutral-400 w-8">{feedbackStats.ratingDistribution[rating] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 问题分类 */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 space-y-4">
        <h3 className="font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-400" />
          主要问题分类
        </h3>

        <div className="space-y-2">
          {Object.entries(feedbackStats.categoryDistribution)
            .sort(([, a]: any, [, b]: any) => b - a)
            .slice(0, 6)
            .map(([category, count]: any) => (
              <div key={category} className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">{category}</span>
                <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs font-mono">
                  {count}
                </span>
              </div>
            ))}
        </div>

        <button className="w-full mt-4 px-3 py-2 text-sm bg-cyan-500 hover:bg-cyan-600 text-black font-medium rounded transition-all">
          查看优化建议
        </button>
      </div>
    </motion.div>
  );
}

