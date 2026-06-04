import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  BarChart, Bar, LineChart, Line, ResponsiveContainer, XAxis, YAxis,
  CartesianGrid, Tooltip as ReTooltip, Legend as ReLegend, Cell
} from 'recharts';
import {
  Activity, AlertTriangle, TrendingUp, Users, Zap, CreditCard,
  X, RefreshCw
} from 'lucide-react';
import { monitoringService, SystemMetrics, Alert } from '../services/monitoring.service';

interface MonitoringDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MonitoringDashboard({ isOpen, onClose }: MonitoringDashboardProps) {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // 订阅实时指标更新
    const unsubscribe = monitoringService.subscribe((newMetrics) => {
      setMetrics(newMetrics);
      setAlerts(monitoringService.getActiveAlerts());

      // 更新图表数据
      setChartData(prev => {
        const updated = [...prev];
        updated.push({
          time: new Date(newMetrics.timestamp).toLocaleTimeString(),
          requests: newMetrics.requests.total,
          agents: newMetrics.agents.active,
          users: newMetrics.users.active,
          payment: newMetrics.payment.totalProcessed
        });
        return updated.slice(-20); // 保持最后 20 条数据
      });
    });

    // 初始加载
    const initialMetrics = monitoringService.getSystemMetrics();
    setMetrics(initialMetrics);
    setAlerts(monitoringService.getActiveAlerts());

    return unsubscribe;
  }, [isOpen]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // 模拟刷新延迟
    setTimeout(() => {
      const newMetrics = monitoringService.getSystemMetrics();
      setMetrics(newMetrics);
      setRefreshing(false);
    }, 500);
  };

  const handleResolveAlert = (alertId: string) => {
    monitoringService.resolveAlert(alertId);
    setAlerts(monitoringService.getActiveAlerts());
  };

  if (!isOpen || !metrics) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-neutral-950 border border-[#2F3336] rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2F3336]">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-[#1D9BF0]" />
            <h2 className="text-lg font-bold text-white">实时监控</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-1 hover:bg-neutral-900 rounded transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-5 h-5 text-[#8B949E] ${refreshing ? 'animate-spin' : ''}`}
              />
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-neutral-900 rounded transition-colors"
            >
              <X className="w-5 h-5 text-[#8B949E]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Key Metrics */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-b border-[#2F3336]">
            <MetricCard
              label="API 请求"
              value={metrics.requests.total}
              icon={<TrendingUp className="w-5 h-5" />}
              color="blue"
            />
            <MetricCard
              label="活跃 Agent"
              value={metrics.agents.active}
              icon={<Zap className="w-5 h-5" />}
              color="yellow"
            />
            <MetricCard
              label="活跃用户"
              value={metrics.users.active}
              icon={<Users className="w-5 h-5" />}
              color="green"
            />
            <MetricCard
              label="支付处理"
              value={metrics.payment.totalProcessed}
              icon={<CreditCard className="w-5 h-5" />}
              color="purple"
            />
          </div>

          {/* Charts */}
          {chartData.length > 0 && (
            <div className="p-6 space-y-6 border-b border-[#2F3336]">
              <div>
                <h3 className="text-sm font-bold text-white mb-3">请求趋势</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2F3336" />
                    <XAxis dataKey="time" stroke="#8B949E" />
                    <YAxis stroke="#8B949E" />
                    <ReTooltip
                      contentStyle={{ backgroundColor: '#171819', border: '1px solid #2F3336' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <ReLegend />
                    <Line
                      type="monotone"
                      dataKey="requests"
                      stroke="#1D9BF0"
                      dot={false}
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="agents"
                      stroke="#FBBF24"
                      dot={false}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white mb-3">用户与支付对比</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2F3336" />
                    <XAxis dataKey="time" stroke="#8B949E" />
                    <YAxis stroke="#8B949E" />
                    <ReTooltip
                      contentStyle={{ backgroundColor: '#171819', border: '1px solid #2F3336' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <ReLegend />
                    <Bar dataKey="users" fill="#10B981" />
                    <Bar dataKey="payment" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="p-6 border-b border-[#2F3336]">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                活跃告警 ({alerts.length})
              </h3>
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 rounded-lg border flex items-center justify-between ${
                      alert.severity === 'critical'
                        ? 'bg-red-500/10 border-red-500/30 text-red-400'
                        : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                    }`}
                  >
                    <div className="text-xs">
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-[10px] mt-1 opacity-70">
                        实际值: {alert.actual.toFixed(2)} / 阈值: {alert.threshold}
                      </p>
                    </div>
                    <button
                      onClick={() => handleResolveAlert(alert.id)}
                      className="ml-2 px-2 py-1 text-xs hover:bg-white/10 rounded transition-colors"
                    >
                      解决
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Metrics */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailPanel title="请求性能">
                <DetailItem label="成功率" value={`${(metrics.requests.successRate * 100).toFixed(1)}%`} />
                <DetailItem label="平均延迟" value={`${metrics.requests.avgLatency}ms`} />
                <DetailItem label="峰值" value={`${metrics.requests.peak}`} />
              </DetailPanel>

              <DetailPanel title="数据库">
                <DetailItem label="查询数" value={`${metrics.database.queryCount}`} />
                <DetailItem label="平均查询时间" value={`${metrics.database.avgQueryTime}ms`} />
                <DetailItem label="连接池" value={`${metrics.database.connectionPool}`} />
              </DetailPanel>

              <DetailPanel title="Agent 执行">
                <DetailItem label="活跃" value={`${metrics.agents.active}`} />
                <DetailItem label="运行中" value={`${metrics.agents.running}`} />
                <DetailItem label="失败" value={`${metrics.agents.failed}`} />
                <DetailItem label="平均执行时间" value={`${metrics.agents.avgExecutionTime.toFixed(0)}ms`} />
              </DetailPanel>

              <DetailPanel title="用户统计">
                <DetailItem label="活跃用户" value={`${metrics.users.active}`} />
                <DetailItem label="今日新增" value={`${metrics.users.newToday}`} />
                <DetailItem label="留存率" value={`${(metrics.users.retention * 100).toFixed(1)}%`} />
              </DetailPanel>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  color
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  const colorClass = {
    blue: 'text-[#1D9BF0]',
    yellow: 'text-yellow-500',
    green: 'text-green-500',
    purple: 'text-purple-500'
  }[color] || 'text-[#1D9BF0]';

  return (
    <div className="bg-neutral-900 border border-[#2F3336] rounded-lg p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs text-[#8B949E] mb-1">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className={`${colorClass} opacity-60`}>{icon}</div>
      </div>
    </div>
  );
}

function DetailPanel({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-neutral-900 border border-[#2F3336] rounded-lg p-4">
      <h4 className="text-sm font-bold text-white mb-3">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-[#8B949E]">{label}</span>
      <span className="text-white font-mono font-medium">{value}</span>
    </div>
  );
}

export default MonitoringDashboard;

