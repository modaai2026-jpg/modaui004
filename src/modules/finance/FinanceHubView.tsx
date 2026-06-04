import React, { useState, useEffect } from 'react';
import { 
  Wallet, Landmark, ArrowUpCircle, ArrowDownCircle, History, 
  CreditCard, Link as LinkIcon, Smartphone, Users, Gift, 
  TrendingUp, Star, ShieldCheck, ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import axios from 'axios';
import CurrencyView from './CurrencyView';
import VirtualCardView from './VirtualCardView';
import P2PMarketView from './P2PMarketView';
import PaymentLinkView from './PaymentLinkView';
import WalletOpsView from './WalletOpsView';

type FinanceTab = 'overview' | 'currency' | 'payment_link' | 'virtual_card' | 'p2p' | 'ops' | 'additional';

interface FinanceHubViewProps {
  tenantId?: string;
}

export default function FinanceHubView({ tenantId }: FinanceHubViewProps) {
  const [activeTab, setActiveTab] = useState<FinanceTab>('overview');
  const [overview, setOverview] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchOverview();
    }
  }, [activeTab, tenantId]);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/finance/overview', {
        params: { merchantId: tenantId }
      });
      if (res.data.success) {
        setOverview(res.data.wallet);
        setTransactions(res.data.recentTransactions);
      }
    } catch (err) {
      console.error('Failed to fetch finance overview:', err);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'overview', name: '金融概览', icon: Wallet, desc: '资产与交易统计' },
    { id: 'currency', name: '货币管理', icon: Landmark, desc: '多币种汇率配置' },
    { id: 'payment_link', name: '付款链接', icon: LinkIcon, desc: '快捷收款创建' },
    { id: 'virtual_card', name: '虚拟卡', icon: CreditCard, desc: '全球支付卡签发' },
    { id: 'p2p', name: 'P2P 市场', icon: Users, desc: '点对点资产交易' },
    { id: 'ops', name: '充值提现', icon: ArrowUpCircle, desc: '资金流转管理' },
    { id: 'additional', name: '增值服务', icon: Star, desc: '礼品卡与推荐计划' },
  ];

  return (
    <div className="flex flex-col space-y-6 animate-fadeIn">
      {/* Horizontal Sub-nav */}
      <div className="flex items-center space-x-1 p-1 bg-[#09090B] border border-[#2F3336]/60 rounded-xl overflow-x-auto no-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as FinanceTab)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-[11px] font-medium transition-all shrink-0 cursor-pointer ${
              activeTab === item.id
                ? 'bg-[#1D9BF0]/15 border border-[#1D9BF0]/35 text-sky-400 font-bold'
                : 'text-[#8B949E] hover:text-white hover:bg-neutral-900 border border-transparent'
            }`}
          >
            <item.icon className="w-3.5 h-3.5" />
            <span>{item.name}</span>
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-[600px]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: `总余额 (${overview?.currency || 'USD'})`, value: `${overview?.currency === 'USD' ? '$' : ''}${overview?.balance?.toLocaleString() || '0.00'}`, trend: '+12%', icon: Wallet, color: 'text-white' },
                { label: '今日收入', value: `${overview?.currency === 'USD' ? '$' : ''}${overview?.earnings?.toLocaleString() || '0.00'}`, trend: '+5%', icon: TrendingUp, color: 'text-emerald-400' },
                { label: '累计提现', value: '$45,000.00', trend: '稳定', icon: ArrowDownCircle, color: 'text-sky-400' },
                { label: '活跃卡片', value: '12 张', trend: '3张待激活', icon: CreditCard, color: 'text-amber-400' },
              ].map((stat, i) => (
                <div key={i} className="bg-[#09090B] border border-[#2F3336] p-4 rounded-xl flex flex-col justify-between h-28">
                  <div className="flex justify-between items-start">
                    <p className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider">{stat.label}</p>
                    <stat.icon className={`w-4 h-4 ${stat.color} opacity-20`} />
                  </div>
                  <span className={`text-xl font-bold font-mono ${stat.color} mt-1`}>{stat.value}</span>
                  <span className="text-[9px] text-[#8B949E] font-mono mt-auto flex items-center space-x-1">
                    <span className="text-emerald-500">{stat.trend}</span>
                    <span>较上月同期</span>
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Actions & Recent Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-[#09090B] border border-[#2F3336] rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#2F3336] flex justify-between items-center">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">最近交易流水</h3>
                    <button className="text-[10px] text-sky-400 hover:underline">查看全部</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] font-mono">
                      <thead className="bg-[#0c0c0e] text-[#8B949E] uppercase text-[9px]">
                        <tr>
                          <th className="p-3">时间</th>
                          <th className="p-3">类型</th>
                          <th className="p-3">描述</th>
                          <th className="p-3 text-right">金额</th>
                          <th className="p-3 text-center">状态</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2F3336]/40 text-zinc-300">
                        {transactions.length > 0 ? transactions.map((tx, i) => (
                          <tr key={i} className="hover:bg-white/5 transition-colors">
                            <td className="p-3">{new Date(tx.createdAt).toLocaleString()}</td>
                            <td className="p-3">
                              <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-[#2F3336] text-[9px]">
                                {tx.type === 'deposit' ? '存款' : tx.type === 'withdraw' ? '提现' : '转账'}
                              </span>
                            </td>
                            <td className="p-3 max-w-[200px] truncate">{tx.description}</td>
                            <td className={`p-3 text-right font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-white'}`}>
                              {tx.amount > 0 ? '+' : ''}{tx.amount}
                            </td>
                            <td className="p-3 text-center">
                              <span className={`text-emerald-400 text-[9px] font-bold`}>{tx.status}</span>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-[#8B949E] italic">暂无最近交易记录</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-4">
                <div className="bg-[#09090B] border border-[#2F3336] p-5 rounded-xl space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-sky-400" />
                    安全中枢
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-zinc-900/50 border border-[#2F3336] rounded-lg">
                      <p className="text-[10px] text-[#8B949E] uppercase">身份核验 (KYC)</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs font-bold text-emerald-400">已通过 L2 认证</span>
                        <ChevronRight className="w-3 h-3 text-[#8B949E]" />
                      </div>
                    </div>
                    <div className="p-3 bg-zinc-900/50 border border-[#2F3336] rounded-lg">
                      <p className="text-[10px] text-[#8B949E] uppercase">两步验证 (2FA)</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs font-bold text-sky-400">已开启 Google Auth</span>
                        <ChevronRight className="w-3 h-3 text-[#8B949E]" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <button className="w-full py-3 bg-[#1D9BF0] hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer">
                  <ArrowUpCircle className="w-4 h-4" />
                  立即发起存款
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'currency' && <CurrencyView />}
        {activeTab === 'virtual_card' && <VirtualCardView />}
        {activeTab === 'p2p' && <P2PMarketView />}
        {activeTab === 'payment_link' && <PaymentLinkView />}
        {activeTab === 'ops' && <WalletOpsView />}
        {activeTab === 'additional' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#09090B] border border-[#2F3336] p-6 rounded-2xl space-y-4">
              <Gift className="w-8 h-8 text-sky-400" />
              <h3 className="text-sm font-bold text-white">礼品卡系统</h3>
              <p className="text-xs text-[#8B949E] leading-relaxed">
                创建并管理可兑换的数字礼品卡，支持批量生成、面额自定义及实时核销状态监控。
              </p>
              <button className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-[#2F3336] rounded-lg text-[11px] font-bold text-white transition-all cursor-pointer">
                进入礼品卡中心
              </button>
            </div>
            <div className="bg-[#09090B] border border-[#2F3336] p-6 rounded-2xl space-y-4">
              <Smartphone className="w-8 h-8 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">手机充值 (Airtime)</h3>
              <p className="text-xs text-[#8B949E] leading-relaxed">
                对接全球 150+ 国家运营商，支持实时话费、流量包充值，自动计算最优汇率。
              </p>
              <button className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-[#2F3336] rounded-lg text-[11px] font-bold text-white transition-all cursor-pointer">
                立即充值
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
