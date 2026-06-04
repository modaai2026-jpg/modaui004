import React from 'react';
import { Users, ArrowRightLeft, TrendingUp, ShieldCheck, Search, Filter } from 'lucide-react';

export default function P2PMarketView() {
  const offers = [
    { id: '1', user: 'CryptoKing', type: 'Buy', amount: '5,000 USDT', rate: '7.21', method: 'Bank Transfer', status: 'Active' },
    { id: '2', user: 'FastTrader', type: 'Sell', amount: '1,200 USDT', rate: '7.25', method: 'Alipay', status: 'Active' },
    { id: '3', user: 'SafeWallet', type: 'Buy', amount: '10,000 USDT', rate: '7.20', method: 'WeChat Pay', status: 'Active' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">P2P 资产交易市场</h2>
          <p className="text-[10px] text-[#8B949E] mt-1">在商户间直接进行资产兑换，支持多种本地支付方式</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-[#2F3336] rounded-lg text-[11px] font-bold text-white transition-all cursor-pointer">
            发布广告
          </button>
          <button className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-lg shadow-sky-500/20">
            我的订单
          </button>
        </div>
      </div>

      {/* Market Controls */}
      <div className="flex flex-wrap gap-4 items-center bg-[#09090B] border border-[#2F3336] p-3 rounded-xl">
        <div className="flex bg-black border border-[#2F3336] rounded-lg p-0.5">
          <button className="px-4 py-1 bg-sky-500 text-white text-[10px] font-bold rounded-md">我要买</button>
          <button className="px-4 py-1 text-[#8B949E] text-[10px] font-bold">我要卖</button>
        </div>
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input type="text" placeholder="搜索币种、金额或支付方式..." className="w-full bg-black border border-[#2F3336] rounded-lg py-1.5 pl-9 pr-4 text-[11px] text-white outline-none focus:border-sky-500/50 transition-all" />
        </div>
        <button className="p-1.5 bg-zinc-900 border border-[#2F3336] rounded-lg text-zinc-400">
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Offers Table */}
      <div className="bg-[#09090B] border border-[#2F3336] rounded-xl overflow-hidden">
        <table className="w-full text-left text-[11px] font-mono">
          <thead className="bg-[#0c0c0e] text-[#8B949E] uppercase text-[9px]">
            <tr>
              <th className="p-4">广告主</th>
              <th className="p-4">类型</th>
              <th className="p-4">数量 / 限额</th>
              <th className="p-4">价格 (CNY)</th>
              <th className="p-4">支付方式</th>
              <th className="p-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2F3336]/40 text-zinc-300">
            {offers.map((offer) => (
              <tr key={offer.id} className="hover:bg-white/5 transition-colors group">
                <td className="p-4 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-sky-400">
                    {offer.user[0]}
                  </div>
                  <span className="font-bold">{offer.user}</span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${offer.type === 'Buy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {offer.type === 'Buy' ? '购买' : '出售'}
                  </span>
                </td>
                <td className="p-4">{offer.amount}</td>
                <td className="p-4 text-lg font-bold text-white">¥ {offer.rate}</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-zinc-900 border border-[#2F3336] rounded-lg text-[10px]">
                    {offer.method}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="px-4 py-1.5 bg-[#1D9BF0] hover:bg-sky-500 text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer">
                    立即下单
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
