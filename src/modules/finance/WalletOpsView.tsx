import React, { useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle, History, Wallet, CheckCircle2, RefreshCw } from 'lucide-react';

export default function WalletOpsView() {
  const [activeMode, setActiveMode] = useState<'deposit' | 'withdraw'>('deposit');

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">资金存取与流水管理</h2>
          <p className="text-[10px] text-[#8B949E] mt-1">处理商户账户的充值、提现申请，并查看完整审计日志</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Operation Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#09090B] border border-[#2F3336] p-1 rounded-xl flex">
            <button 
              onClick={() => setActiveMode('deposit')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'deposit' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/10' : 'text-[#8B949E] hover:text-white'
              }`}
            >
              <ArrowUpCircle className="w-4 h-4" /> 账户充值
            </button>
            <button 
              onClick={() => setActiveMode('withdraw')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'withdraw' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/10' : 'text-[#8B949E] hover:text-white'
              }`}
            >
              <ArrowDownCircle className="w-4 h-4" /> 发起提现
            </button>
          </div>

          <div className="bg-[#09090B] border border-[#2F3336] p-6 rounded-2xl space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider ml-1">操作金额 (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
                <input type="number" placeholder="0.00" className="w-full bg-black border border-[#2F3336] focus:border-sky-500/50 rounded-xl py-3 pl-8 pr-4 text-lg font-bold text-white outline-none transition-all" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider ml-1">
                {activeMode === 'deposit' ? '选择充值方式' : '选择提现目标'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-3 bg-black border border-sky-500/30 rounded-xl flex flex-col items-center gap-2 group cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-sky-400" />
                  </div>
                  <span className="text-[10px] font-bold text-white">内部钱包</span>
                </button>
                <button className="p-3 bg-black border border-[#2F3336] hover:border-zinc-700 rounded-xl flex flex-col items-center gap-2 group cursor-pointer transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
                    <History className="w-4 h-4 text-zinc-500" />
                  </div>
                  <span className="text-[10px] font-bold text-[#8B949E]">外部账户</span>
                </button>
              </div>
            </div>

            <button className={`w-full py-3 rounded-xl text-xs font-bold text-white transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 ${
              activeMode === 'deposit' ? 'bg-sky-500 hover:bg-sky-400 shadow-sky-500/20' : 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/20'
            }`}>
              <CheckCircle2 className="w-4 h-4" />
              确认提交{activeMode === 'deposit' ? '充值' : '提现'}申请
            </button>
          </div>
        </div>

        {/* Audit Log / History */}
        <div className="lg:col-span-7">
          <div className="bg-[#09090B] border border-[#2F3336] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#2F3336] flex justify-between items-center">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4 text-zinc-400" />
                资金流水审计日志
              </h3>
              <button className="p-1.5 bg-zinc-900 border border-[#2F3336] rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="divide-y divide-[#2F3336]/40">
              {[
                { id: '1', type: 'Deposit', amount: '+$500.00', date: '2026-06-03 10:15', status: 'Success', method: 'Bank Transfer' },
                { id: '2', type: 'Withdraw', amount: '-$1,200.00', date: '2026-06-02 16:40', status: 'Pending', method: 'PayPal' },
                { id: '3', type: 'Earning', amount: '+$245.50', date: '2026-06-02 09:00', status: 'Success', method: 'Platform Sales' },
                { id: '4', type: 'Referral', amount: '+$50.00', date: '2026-06-01 14:20', status: 'Success', method: 'User Invitation' },
              ].map((log) => (
                <div key={log.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      log.type === 'Deposit' ? 'bg-emerald-500/10 text-emerald-400' : 
                      log.type === 'Withdraw' ? 'bg-amber-500/10 text-amber-400' : 'bg-sky-500/10 text-sky-400'
                    }`}>
                      {log.type === 'Deposit' ? <ArrowUpCircle className="w-4 h-4" /> : 
                       log.type === 'Withdraw' ? <ArrowDownCircle className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{log.type} - {log.method}</p>
                      <p className="text-[9px] text-[#8B949E] font-mono">{log.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-bold font-mono ${log.amount.startsWith('+') ? 'text-emerald-400' : 'text-white'}`}>
                      {log.amount}
                    </p>
                    <p className={`text-[9px] font-bold ${log.status === 'Success' ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {log.status.toUpperCase()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full py-3 bg-black/40 text-[10px] text-[#8B949E] font-bold hover:text-white transition-colors border-t border-[#2F3336]">
              加载更多历史记录
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
