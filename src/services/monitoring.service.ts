/**
 * Monitoring Service - 实时监控系统
 * 跟踪关键指标、性能、资源使用情况
 */

export interface Metric {
  name: string;
  value: number;
  timestamp: number;
  unit: string;
}

export interface SystemMetrics {
  timestamp: number;
  requests: {
    total: number;
    successRate: number;
    avgLatency: number;
    peak: number;
  };
  database: {
    queryCount: number;
    avgQueryTime: number;
    connectionPool: number;
  };
  agents: {
    active: number;
    running: number;
    failed: number;
    avgExecutionTime: number;
  };
  payment: {
    totalProcessed: number;
    totalFailed: number;
    totalRefunded: number;
  };
  users: {
    active: number;
    newToday: number;
    retention: number;
  };
}

export interface Alert {
  id: string;
  timestamp: number;
  severity: 'info' | 'warning' | 'critical';
  metric: string;
  threshold: number;
  actual: number;
  message: string;
  resolved: boolean;
}

class MonitoringService {
  private metrics: Map<string, Metric[]> = new Map();
  private alerts: Alert[] = [];
  private maxMetricsPerName = 1440; // 24 小时 * 60 分钟
  private systemMetrics: SystemMetrics | null = null;
  private subscribers: Array<(metrics: SystemMetrics) => void> = [];
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeMetrics();
    this.startSyncInterval();
  }

  private initializeMetrics() {
    const metricNames = [
      'api_requests', 'agent_executions', 'payment_transactions',
      'user_registrations', 'order_creations', 'webhook_calls'
    ];
    metricNames.forEach(name => this.metrics.set(name, []));
  }

  /**
   * 记录指标
   */
  public recordMetric(name: string, value: number, unit: string = 'count'): Metric {
    const metric: Metric = {
      name,
      value,
      timestamp: Date.now(),
      unit
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name)!;
    metrics.push(metric);

    // 保持大小限制
    if (metrics.length > this.maxMetricsPerName) {
      metrics.shift();
    }

    return metric;
  }

  /**
   * 批量记录指标
   */
  public recordMetrics(metricsData: Array<{ name: string; value: number; unit?: string }>) {
    metricsData.forEach(({ name, value, unit }) => {
      this.recordMetric(name, value, unit || 'count');
    });
  }

  /**
   * 获取指标历史
   */
  public getMetricHistory(name: string, limit: number = 100): Metric[] {
    const metrics = this.metrics.get(name) || [];
    return metrics.slice(-limit);
  }

  /**
   * 获取指标统计
   */
  public getMetricStats(name: string): {
    total: number;
    avg: number;
    max: number;
    min: number;
  } | null {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) {
      return null;
    }

    const values = metrics.map(m => m.value);
    return {
      total: values.reduce((a, b) => a + b, 0),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      max: Math.max(...values),
      min: Math.min(...values)
    };
  }

  /**
   * 设置告警阈值
   */
  public setAlert(
    metricName: string,
    threshold: number,
    severity: 'warning' | 'critical' = 'warning'
  ): void {
    const metrics = this.metrics.get(metricName) || [];
    if (metrics.length === 0) return;

    const latestMetric = metrics[metrics.length - 1];
    if (latestMetric.value > threshold) {
      const alert: Alert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        severity,
        metric: metricName,
        threshold,
        actual: latestMetric.value,
        message: `${metricName} exceeded threshold: ${latestMetric.value} > ${threshold}`,
        resolved: false
      };

      this.alerts.push(alert);
    }
  }

  /**
   * 获取活跃告警
   */
  public getActiveAlerts(): Alert[] {
    return this.alerts.filter(a => !a.resolved);
  }

  /**
   * 解决告警
   */
  public resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  /**
   * 获取系统概览指标
   */
  public getSystemMetrics(): SystemMetrics {
    // 计算基于所有指标的系统级别统计
    const apiStats = this.getMetricStats('api_requests');
    const agentStats = this.getMetricStats('agent_executions');
    const paymentStats = this.getMetricStats('payment_transactions');
    const userStats = this.getMetricStats('user_registrations');
    const orderStats = this.getMetricStats('order_creations');

    this.systemMetrics = {
      timestamp: Date.now(),
      requests: {
        total: apiStats?.total || 0,
        successRate: 0.99, // 占位符
        avgLatency: 125, // 占位符
        peak: apiStats?.max || 0
      },
      database: {
        queryCount: orderStats?.total || 0,
        avgQueryTime: 45, // 占位符
        connectionPool: 50
      },
      agents: {
        active: agentStats?.total || 0,
        running: Math.floor((agentStats?.total || 0) * 0.7),
        failed: Math.floor((agentStats?.total || 0) * 0.05),
        avgExecutionTime: agentStats?.avg || 0
      },
      payment: {
        totalProcessed: paymentStats?.total || 0,
        totalFailed: 0,
        totalRefunded: 0
      },
      users: {
        active: userStats?.total || 0,
        newToday: Math.floor((userStats?.total || 0) * 0.15),
        retention: 0.85 // 占位符
      }
    };

    return this.systemMetrics;
  }

  /**
   * 订阅系统指标更新
   */
  public subscribe(callback: (metrics: SystemMetrics) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  /**
   * 启动同步间隔
   */
  private startSyncInterval() {
    this.syncInterval = setInterval(() => {
      const metrics = this.getSystemMetrics();
      this.subscribers.forEach(callback => {
        try {
          callback(metrics);
        } catch (e) {
          console.error('Error in metrics subscriber:', e);
        }
      });
    }, 10000); // 每 10 秒更新
  }

  /**
   * 销毁服务
   */
  public destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

export const monitoringService = new MonitoringService();

