import React from 'react';
import { CreditCard, Plus, Lock, Eye, ShieldCheck, Zap } from 'lucide-react';

export default function VirtualCardView() {
  const cards = [
    { id: '1', number: '4532 **** **** 8829', holder: 'MODA PLATFORM', expiry: '12/28', type: 'VISA', status: 'Active', balance: 2500.00 },
    { id: '2', number: '5412 **** **** 1024', holder: 'AI OPERATIONS', expiry: '06/27', type: 'MasterCard', status: 'Blocked', balance: 0.00 },
  ];

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">虚拟支付卡中心</h2>
          <p className="text-[10px] text-[#8B949E] mt-1">即时签发全球通用的虚拟借记卡，支持广告投放与海外采购</p>
        </div>
        <button className="flex items-center space-x-2 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-lg shadow-sky-500/20">
          <Plus className="w-3.5 h-3.5" />
          <span>申请新卡</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cards.map((card) => (
          <div key={card.id} className="relative group">
            <div className={`p-6 rounded-2xl border aspect-[1.6/1] flex flex-col justify-between overflow-hidden transition-all duration-300 ${
              card.status === 'Active' 
                ? 'bg-gradient-to-br from-zinc-900 via-black to-zinc-900 border-[#2F3336] hover:border-sky-500/40' 
                : 'bg-neutral-950 border-red-500/20 grayscale opacity-60'
            }`}>
              {/* Card Header */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[9px] font-mono text-sky-400 uppercase tracking-[0.2em]">Virtual Business Card</p>
                  <h3 className="text-lg font-bold text-white italic tracking-tighter">{card.type}</h3>
                </div>
                <Zap className={`w-6 h-6 ${card.status === 'Active' ? 'text-sky-400' : 'text-zinc-600'}`} />
              </div>

              {/* Card Number */}
              <div className="space-y-1">
                <p className="text-xl font-mono text-white tracking-[0.15em] drop-shadow-md">{card.number}</p>
                <div className="flex gap-8">
                  <div>
                    <p className="text-[8px] text-[#8B949E] uppercase font-mono">Expiry</p>
                    <p className="text-xs font-mono text-white">{card.expiry}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-[#8B949E] uppercase font-mono">CVV</p>
                    <p className="text-xs font-mono text-white">***</p>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[8px] text-[#8B949E] uppercase font-mono">Card Holder</p>
                  <p className="text-xs font-bold text-white tracking-wide">{card.holder}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] text-[#8B949E] uppercase font-mono">Balance</p>
                  <p className="text-sm font-bold text-white font-mono">${card.balance.toLocaleString()}</p>
                </div>
              </div>

              {/* Status Overlay */}
              {card.status !== 'Active' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                  <div className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full text-red-400 text-[10px] font-bold uppercase tracking-widest">
                    CARD BLOCKED
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 mt-3">
              <button className="flex-1 py-2 bg-[#09090B] hover:bg-zinc-900 border border-[#2F3336] rounded-xl text-[10px] text-white font-bold transition-all flex items-center justify-center gap-2 cursor-pointer">
                <Eye className="w-3 h-3" /> 查看详情
              </button>
              <button className="flex-1 py-2 bg-[#09090B] hover:bg-zinc-900 border border-[#2F3336] rounded-xl text-[10px] text-white font-bold transition-all flex items-center justify-center gap-2 cursor-pointer">
                <Lock className="w-3 h-3" /> 冻结卡片
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
