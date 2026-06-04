import React from 'react';
import { Link as LinkIcon, Plus, Copy, ExternalLink, Trash2, Clock } from 'lucide-react';

export default function PaymentLinkView() {
  const links = [
    { id: '1', title: '夏季新品定金', amount: '299.00', currency: 'USD', status: 'Active', clicks: 124, created: '2026-06-01' },
    { id: '2', title: '定制化咨询服务', amount: '1,500.00', currency: 'USD', status: 'Active', clicks: 45, created: '2026-05-28' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">快捷付款链接</h2>
          <p className="text-[10px] text-[#8B949E] mt-1">无需店铺，通过社交媒体或聊天工具发送链接即可收款</p>
        </div>
        <button className="flex items-center space-x-2 px-3 py-1.5 bg-[#1D9BF0] hover:bg-sky-500 text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer">
          <Plus className="w-3.5 h-3.5" />
          <span>创建链接</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {links.map((link) => (
          <div key={link.id} className="bg-[#09090B] border border-[#2F3336] p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-sky-500/30 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center text-sky-400 border border-[#2F3336]">
                <LinkIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">{link.title}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-emerald-400 font-bold font-mono">{link.amount} {link.currency}</span>
                  <span className="text-[9px] text-[#8B949E] flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> {link.created}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-[9px] text-[#8B949E] uppercase font-mono">点击量</p>
                <p className="text-xs font-bold text-white font-mono">{link.clicks}</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-[#2F3336] rounded-lg text-sky-400 transition-all cursor-pointer" title="复制链接">
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-[#2F3336] rounded-lg text-[#8B949E] hover:text-white transition-all cursor-pointer" title="预览">
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-[#2F3336] rounded-lg text-red-400/60 hover:text-red-400 transition-all cursor-pointer" title="删除">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="bg-[#09090B] border border-dashed border-[#2F3336] p-8 rounded-xl flex flex-col items-center justify-center text-center space-y-2 opacity-60 hover:opacity-100 transition-all cursor-pointer group">
          <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center group-hover:bg-sky-500/10 transition-colors">
            <Plus className="w-6 h-6 text-zinc-500 group-hover:text-sky-400" />
          </div>
          <p className="text-[11px] font-bold text-[#8B949E] group-hover:text-white transition-colors">添加自定义收款场景</p>
        </div>
      </div>
    </div>
  );
}
