import React, { useState, useEffect } from 'react';
import { Landmark, Plus, RefreshCw, Check, X, Edit2 } from 'lucide-react';
import axios from 'axios';

export default function CurrencyView() {
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/finance/currencies');
      if (res.data.success) {
        setCurrencies(res.data.currencies);
      }
    } catch (err) {
      console.error('Failed to fetch currencies:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">货币与汇率管理</h2>
          <p className="text-[10px] text-[#8B949E] mt-1">配置系统支持的法定货币及实时对美金汇率</p>
        </div>
        <button className="flex items-center space-x-2 px-3 py-1.5 bg-[#1D9BF0] hover:bg-sky-500 text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer">
          <Plus className="w-3.5 h-3.5" />
          <span>新增货币</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {currencies.map((curr) => (
          <div key={curr.id} className="bg-[#09090B] border border-[#2F3336] p-5 rounded-2xl space-y-4 group hover:border-sky-500/30 transition-all">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-lg font-bold text-white border border-[#2F3336]">
                  {curr.symbol}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">{curr.name}</h3>
                  <p className="text-[10px] font-mono text-[#8B949E] uppercase tracking-widest">{curr.code}</p>
                </div>
              </div>
              <div className={`px-2 py-0.5 rounded text-[9px] font-bold ${curr.status ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {curr.status ? '已启用' : '已禁用'}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px]">
                <span className="text-[#8B949E]">汇率 (1 USD =)</span>
                <span className="text-white font-mono font-bold">{curr.rate} {curr.code}</span>
              </div>
              <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500" style={{ width: curr.isDefault ? '100%' : '60%' }} />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button className="flex-1 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-[#2F3336] rounded-lg text-[10px] text-white transition-all cursor-pointer flex items-center justify-center gap-1.5">
                <Edit2 className="w-3 h-3" />
                编辑汇率
              </button>
              <button className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-[#2F3336] rounded-lg text-[#8B949E] hover:text-white transition-all cursor-pointer">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
