import React, { useEffect, useState } from 'react';
import { CreditCard, CheckCircle } from 'lucide-react';
import { apiService } from '../services/api';

interface BillingSubscriptionPanelProps {
  tenantId: string;
  onAddLog?: (sender: string, emoji: string, message: string, type: 'info' | 'success' | 'warn') => void;
}

interface SubscriptionItem {
  id: string;
  planId: string;
  status: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  createdAt?: string;
}

interface InvoiceItem {
  id: string;
  subscriptionId?: string;
  amount: number;
  status: string;
  createdAt: string;
  description?: string;
}

const PLAN_OPTIONS = [
  {
    id: 'free',
    name: '基础试用版',
    price: 0,
    description: '适合初创演示与小规模体验，包含 1 家店铺、5 个产品、1000 次调用',
    badge: '试用'
  },
  {
    id: 'growth',
    name: '成长加速版',
    price: 199,
    description: '适合快速扩张的商家，包含 3 家店铺、5000 个商品、智能运营助手',
    badge: '推荐'
  },
  {
    id: 'enterprise',
    name: '企业尊享版',
    price: 799,
    description: '面向多门店与品牌矩阵，含无限店铺、雇员席位、定制运营 SLA',
    badge: '旗舰'
  }
];

export default function BillingSubscriptionPanel({ tenantId, onAddLog }: BillingSubscriptionPanelProps) {
  const [activeTab, setActiveTab] = useState<'current' | 'plans' | 'invoices'>('current');
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadBillingData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const subsRes = await apiService.billing.listSubscriptions();
      const invRes = await apiService.billing.listInvoices();
      setSubscriptions((subsRes && (subsRes.subscriptions || subsRes.data?.subscriptions)) || []);
      setInvoices((invRes && (invRes.invoices || invRes.data?.invoices)) || []);
    } catch (err: any) {
      console.warn('Billing load failed', err);
      setError('无法加载订阅与发票数据，已退回本地模拟视图。');
      setSubscriptions([]);
      setInvoices([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBillingData();
  }, [tenantId]);

  const handleSubscribe = async (planId: string) => {
    setIsSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      const res = await apiService.billing.subscribe(planId);
      if (res && res.success) {
        setMessage(`已成功订阅 ${planId} 计划。`);
        if (onAddLog) onAddLog('订阅系统', '✅', `已订阅 ${planId} 计划`, 'success');
        await loadBillingData();
      } else {
        throw new Error(res?.error || '订阅失败');
      }
    } catch (err: any) {
      console.error('Subscribe failed', err);
      setError(err.message || '订阅请求失败');
      if (onAddLog) onAddLog('订阅系统', '⚠️', `订阅 ${planId} 失败：${err.message || err}`, 'warn');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeSubscription = subscriptions[0];

  return (
    <div className="lg:col-span-12 bg-[#09090B] border border-[#2F3336] rounded-xl p-5 space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-slate-300">
            <CreditCard className="w-4 h-4 text-indigo-400" />
            <span className="text-xs uppercase tracking-[0.2em] font-mono text-[#8B949E]">订阅 & 发票</span>
          </div>
          <h3 className="text-sm font-bold text-white mt-2">SaaS 订阅与账单中枢</h3>
          <p className="text-[10px] text-neutral-500 mt-1">一处查看当前套餐、历史发票，或直接升级至更高阶计划。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('current')}
            className={`px-3 py-2 text-[10px] rounded border ${activeTab === 'current' ? 'border-indigo-400 text-indigo-300' : 'border-neutral-800 text-neutral-500 hover:text-neutral-300'}`}
          >
            当前订阅
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('plans')}
            className={`px-3 py-2 text-[10px] rounded border ${activeTab === 'plans' ? 'border-indigo-400 text-indigo-300' : 'border-neutral-800 text-neutral-500 hover:text-neutral-300'}`}
          >
            订阅计划
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('invoices')}
            className={`px-3 py-2 text-[10px] rounded border ${activeTab === 'invoices' ? 'border-indigo-400 text-indigo-300' : 'border-neutral-800 text-neutral-500 hover:text-neutral-300'}`}
          >
            发票记录
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-700/50 bg-rose-950/40 p-3 text-rose-200 text-xs">{error}</div>
      )}
      {message && (
        <div className="rounded-xl border border-emerald-700/50 bg-emerald-950/30 p-3 text-emerald-200 text-xs">{message}</div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#2F3336] p-4 bg-black/60">
          <div className="text-[9px] uppercase tracking-[0.2em] font-mono text-slate-500">当前套餐</div>
          <div className="mt-3 text-lg font-bold text-white">{activeSubscription ? activeSubscription.planId.toUpperCase() : '未订阅'}</div>
          <div className="text-[11px] text-slate-400 mt-2">{activeSubscription ? `到期 ${new Date(activeSubscription.currentPeriodEnd || '').toLocaleDateString()}` : '可立即选择套餐并启用'}.</div>
        </div>
        <div className="rounded-xl border border-[#2F3336] p-4 bg-black/60">
          <div className="text-[9px] uppercase tracking-[0.2em] font-mono text-slate-500">发票数</div>
          <div className="mt-3 text-lg font-bold text-white">{invoices.length}</div>
          <div className="text-[11px] text-slate-400 mt-2">最近 30 天账单记录</div>
        </div>
        <div className="rounded-xl border border-[#2F3336] p-4 bg-black/60">
          <div className="text-[9px] uppercase tracking-[0.2em] font-mono text-slate-500">最新动态</div>
          <div className="mt-3 text-sm font-medium text-white">{isLoading ? '数据加载中...' : activeSubscription ? `当前计划 ${activeSubscription.planId} 运行良好` : '请先订阅一个计划'}</div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-[#2F3336] bg-[#0B0B0D] p-5">
        {activeTab === 'current' && (
          <div className="space-y-4">
            {!activeSubscription ? (
              <div className="text-xs text-neutral-400">当前还未订阅计费套餐。请切换到“订阅计划”页选择并激活。</div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="rounded-xl border border-[#2F3336] p-4 bg-black/70">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-mono">订阅ID</div>
                  <div className="mt-2 text-white font-bold text-sm">{activeSubscription.id}</div>
                  <div className="text-[11px] text-slate-400 mt-3">创建于 {activeSubscription.createdAt ? new Date(activeSubscription.createdAt).toLocaleString() : '未知'}</div>
                </div>
                <div className="rounded-xl border border-[#2F3336] p-4 bg-black/70">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-mono">订阅状态</div>
                  <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold ${activeSubscription.status === 'active' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'}`}>
                    <CheckCircle className="w-3.5 h-3.5" /> {activeSubscription.status}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-3">下一个计费日：{activeSubscription.currentPeriodEnd ? new Date(activeSubscription.currentPeriodEnd).toLocaleDateString() : '待定'}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="grid gap-4 xl:grid-cols-3">
            {PLAN_OPTIONS.map((plan) => (
              <div key={plan.id} className="rounded-xl border border-[#2F3336] p-4 bg-black/70">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-slate-400 uppercase tracking-[0.2em] font-mono">{plan.badge}</div>
                    <div className="mt-2 text-lg font-bold text-white">{plan.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">¥{plan.price}</div>
                    <div className="text-[11px] text-slate-500">/月</div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-4">{plan.description}</p>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubscribe(plan.id)}
                  className="mt-5 w-full rounded-lg border border-[#2F3336] bg-indigo-500/10 text-[11px] font-bold text-indigo-200 hover:bg-indigo-500/20 transition disabled:opacity-40"
                >
                  {plan.price === 0 ? '立即开始' : `订阅 ${plan.name}`}
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-xs text-neutral-500">正在加载发票数据…</div>
            ) : invoices.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#2F3336] p-6 text-xs text-neutral-400">暂无可展示的发票数据。系统会在您首次订阅后生成账单凭证。</div>
            ) : (
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="rounded-xl border border-[#2F3336] p-4 bg-black/70 grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-mono">发票号</div>
                      <div className="mt-2 text-white font-bold">{invoice.id}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-mono">金额</div>
                      <div className="mt-2 text-white font-bold">¥{invoice.amount.toFixed(2)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-mono">状态</div>
                      <div className="mt-2 inline-flex items-center gap-2 text-[11px] font-bold text-slate-200">
                        <span className={invoice.status === 'paid' ? 'text-emerald-300' : 'text-amber-300'}>{invoice.status}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-2">{new Date(invoice.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="lg:col-span-3 text-[10px] text-slate-400">{invoice.description || 'SaaS 订阅/续费账单'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
