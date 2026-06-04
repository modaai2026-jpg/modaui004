import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { ResponsiveContainer, LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, Cell, BarChart as ReBarChart, Bar } from 'recharts';
import { SlsTooltip, ChnTooltip } from '../../utils/merchant-helpers';
import { TaskLog, TeamMember } from '../../types';

interface MerchantWorkbenchProps {
  sales: number;
  orders: number;
  dailySalesData: any[];
  channelsData: any[];
  selectedStaff: TeamMember;
  logs: TaskLog[];
}

export default function MerchantWorkbench({ 
  sales, 
  orders, 
  dailySalesData, 
  channelsData, 
  selectedStaff,
  logs 
}: MerchantWorkbenchProps) {
  return (
    <div className="space-y-6">
      {/* Grid cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#09090B] border border-[#2F3336] p-4 rounded-xl flex flex-col justify-between h-28 text-left animate-fadeIn">
          <p className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider">今日累计收入</p>
          <span className="text-lg font-bold font-mono tracking-tight text-white mt-1">
            ¥ {sales.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-[9px] text-sky-400 font-mono mt-auto flex items-center space-x-1">
            <TrendingUp className="w-2.5 h-2.5" />
            <span>自动增加28%</span>
          </span>
        </div>

        <div className="bg-[#09090B] border border-[#2F3336] p-4 rounded-xl flex flex-col justify-between h-28 text-left animate-fadeIn">
          <p className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider">成单数量</p>
          <span className="text-lg font-bold font-mono tracking-tight text-white mt-1">{orders} 笔</span>
          <span className="text-[9px] text-[#8B949E] font-mono mt-auto">处理完毕</span>
        </div>

        <div className="bg-[#09090B] border border-[#2F3336] p-4 rounded-xl flex flex-col justify-between h-28 text-left animate-fadeIn">
          <p className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider">数字员工</p>
          <span className="text-lg font-bold font-mono text-[#1D9BF0] mt-1">4位智能在岗</span>
          <span className="text-[9px] text-sky-400 font-mono mt-auto flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span>持续运行</span>
          </span>
        </div>

        <div className="bg-[#09090B] border border-[#2F3336] p-4 rounded-xl flex flex-col justify-between h-28 text-left animate-fadeIn">
          <p className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider">算力消耗 (今天)</p>
          <span className="text-lg font-bold font-mono text-amber-500 mt-1">8,420 Tokens</span>
          <span className="text-[9px] text-[#8B949E] font-mono mt-auto">额度充足</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-8 bg-[#09090B] border border-[#2F3336] rounded-xl overflow-hidden flex flex-col h-[340px]">
          <div className="p-4 border-b border-[#2F3336] flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
              <span>近7日营运流水 (Real-time AI Sync)</span>
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">Ver: 2.0.4 • Updated just now</span>
          </div>
          <div className="flex-1 p-4 pb-2">
            <ResponsiveContainer width="100%" height="100%">
              <ReLineChart data={dailySalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1D1D1F" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#4B5563', fontSize: 10, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  hide 
                  domain={['auto', 'auto']}
                />
                <ReTooltip content={<SlsTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#1D9BF0" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#1D9BF0', strokeWidth: 2, stroke: '#000' }}
                  activeDot={{ r: 6, fill: '#38BDF8', strokeWidth: 0 }}
                  animationDuration={1500}
                />
              </ReLineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channels / Distribution */}
        <div className="lg:col-span-4 bg-[#09090B] border border-[#2F3336] rounded-xl overflow-hidden flex flex-col h-[340px]">
          <div className="p-4 border-b border-[#2F3336]">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
              <span>获客渠道分布</span>
            </span>
          </div>
          <div className="flex-1 p-4 flex flex-col">
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={channelsData}>
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <ReTooltip content={<ChnTooltip />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {channelsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
                    ))}
                  </Bar>
                </ReBarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-auto space-y-2">
              {channelsData.map((chn, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: chn.color }} />
                    <span className="text-neutral-400">{chn.name}</span>
                  </div>
                  <span className="text-white font-bold">{chn.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Task Log Feed (Workbench Mini) */}
      <div className="bg-[#09090B] border border-[#2F3336] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#2F3336] flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-rose-400" />
            <span>最近系统指令流 (Recent AI Tasks)</span>
          </span>
          <button className="text-[10px] text-[#1D9BF0] font-bold hover:underline flex items-center gap-1">
            <span>查看完整审计日志</span>
            <ArrowRight className="w-2.5 h-2.5" />
          </button>
        </div>
        <div className="divide-y divide-[#2F3336]/40 max-h-[200px] overflow-y-auto scrollbar-none">
          {logs.slice(0, 5).map((log) => (
            <div key={log.id} className="p-3 flex items-start space-x-3 hover:bg-white/[0.02] transition-colors">
              <span className="text-base shrink-0">{log.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10.5px] font-bold text-zinc-300">{log.sender}</span>
                  <span className="text-[9px] font-mono text-zinc-600">{log.timestamp}</span>
                </div>
                <p className="text-[11px] text-zinc-500 truncate leading-relaxed">
                  {log.message}
                </p>
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="p-10 text-center text-zinc-600 text-xs font-mono italic">
              等待第一个 AI 业务指令下达...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
