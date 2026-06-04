# MODAUI V7 快速开发指南

## 🚀 5 分钟快速开始

### 1️⃣ 了解新系统

MODAUI 现在有 4 个核心系统服务:

```typescript
// 1. 发送通知
import { notificationService } from './services/notification.service';

notificationService.notify(
  '订单已创建',
  '您有一个新订单需要处理',
  {
    level: 'success',
    category: 'order',
    details: { orderId: '12345' }
  }
);

// 2. 记录审计
import { auditLogService } from './services/audit.service';

await auditLogService.log(
  'ORDER_CREATE',
  userId,
  userEmail,
  {
    resource: { type: 'Order', id: '12345' },
    severity: 'info',
    status: 'success'
  }
);

// 3. 记录监控指标
import { monitoringService } from './services/monitoring.service';

monitoringService.recordMetric('api_requests', 1, 'count');

// 4. 获取/设置配置
import { configRegistry } from './services/config-registry.service';

const isNotifyEnabled = configRegistry.get('feature.notification.enabled');
configRegistry.set('feature.notification.enabled', false);
```

### 2️⃣ 访问管理面板

底部右下角有 4 个快捷按钮:

```
🔔 Notification Center  → 查看所有通知
👁️ Audit Log Viewer     → 查看操作日志
📊 Monitoring Dashboard → 查看系统指标
⚙️ Settings Center      → 管理配置
```

### 3️⃣ 在您的代码中集成

```typescript
// 在任何 React 组件中使用
import { notificationService } from '@/services/notification.service';

function MyComponent() {
  const handleSave = async () => {
    try {
      // 执行操作
      await saveData();
      
      // 发送成功通知
      notificationService.notify(
        '保存成功',
        '数据已保存',
        { level: 'success', category: 'system' }
      );
    } catch (error) {
      // 发送错误通知
      notificationService.notify(
        '保存失败',
        error.message,
        { level: 'error', category: 'system' }
      );
    }
  };

  return <button onClick={handleSave}>Save</button>;
}
```

---

## 📚 详细文档

### NotificationService

```typescript
// 订阅通知
const unsubscribe = notificationService.subscribe('order', (notif) => {
  console.log('New order notification:', notif);
});

// 发送通知
notificationService.notify(title, message, options);

// 获取未读通知
const unread = notificationService.getUnread();

// 标记为已读
notificationService.markAsRead(notificationId);

// 获取历史
const history = notificationService.getHistory(100);

// 清空所有
notificationService.clearHistory();
```

### AuditLogService

```typescript
// 记录操作
await auditLogService.log(
  'PRODUCT_CREATE',
  userId,
  userEmail,
  {
    resource: { type: 'Product', id: '123', name: 'iPhone' },
    changes: {
      before: {},
      after: { name: 'iPhone', price: 999 }
    }
  }
);

// 简化版本
await auditLogService.logAction('USER_LOGIN', userId, userEmail);

// 

获取历史
const logs = auditLogService.getHistory(50);

// 按用户过滤
const userLogs = auditLogService.getByUser(userId, 50);

// 按操作过滤
const productLogs = auditLogService.getByAction('PRODUCT_CREATE', 50);

// 按时间范围
const rangeLogs = auditLogService.getByTimeRange(startTime, endTime);

// 获取失败的操作
const failures = auditLogService.getFailures(50);
```

### MonitoringService

```typescript
// 记录指标
monitoringService.recordMetric('api_requests', 1, 'count');
monitoringService.recordMetric('response_time', 145, 'ms');

// 设置告警
monitoringService.setAlert('api_requests', 1000, 'warning');

// 获取活跃告警
const alerts = monitoringService.getActiveAlerts();

// 解决告警
monitoringService.resolveAlert(alertId);

// 获取指标统计
const stats = monitoringService.getMetricStats('api_requests');
// { total: 50, avg: 1.2, max: 5, min: 1 }

// 获取系统概览
const systemMetrics = monitoringService.getSystemMetrics();

// 订阅实时更新
const unsubscribe = monitoringService.subscribe((metrics) => {
  console.log('Updated metrics:', metrics);
});
```

### ConfigRegistry

```typescript
// 获取配置
const notifyEnabled = configRegistry.get('feature.notification.enabled');

// 设置配置
configRegistry.set(
  'feature.notification.enabled',
  false,
  userId,
  userEmail
);

// 获取某个类别的所有配置
const featureConfigs = configRegistry.getByCategory('feature');

// 获取所有配置
const allConfigs = configRegistry.getAll();

// 订阅变更
const unsubscribe = configRegistry.subscribe((key, oldValue, newValue) => {
  console.log(`${key} changed from ${oldValue} to ${newValue}`);
});

// 重置为默认值
configRegistry.resetToDefaults();
```

---

## 🔧 常见任务

### 任务 1: 添加新的审计操作

```typescript
// 1. 在 audit.service.ts 中添加新操作类型
export type AuditAction = 
  // 现有类型...
  | 'MY_NEW_ACTION';

// 2. 在代码中使用
await auditLogService.log(
  'MY_NEW_ACTION',
  userId,
  userEmail,
  { severity: 'info', status: 'success' }
);

// 3. 在 AuditLogViewer 中自动显示
```

### 任务 2: 添加新的通知类别

```typescript
// 1. 在 notification.service.ts 中添加类别
export type NotificationCategory = 
  // 现有类型...
  | 'myapp';

// 2. 在代码中使用
notificationService.notify(
  'Title',
  'Message',
  { category: 'myapp', level: 'info' }
);

// 3. 订阅该类别
notificationService.subscribe('myapp', (notif) => {
  console.log('My app notification:', notif);
});
```

### 任务 3: 添加新的配置项

```typescript
// 在 config-registry.service.ts 中的 initializeDefaults() 方法
configRegistry.register({
  key: 'myapp.myfeature.enabled',
  category: 'feature',
  label: 'My Feature',
  description: 'Enable my awesome feature',
  value: true,
  type: 'boolean',
  defaultValue: true,
  editable: true,
  requiresRestart: false,
  audit: true
});

// 现在可以在 UI 中管理这个配置
```

---

## 🐛 调试技巧

### 查看所有通知

```typescript
// 在浏览器控制台
notificationService.getHistory().forEach(n => console.log(n));
```

### 查看所有审计日志

```typescript
auditLogService.getHistory().forEach(log => console.log(log));
```

### 查看实时监控指标

```typescript
const metrics = monitoringService.getSystemMetrics();
console.table({
  'API 请求': metrics.requests.total,
  'Agent 执行': metrics.agents.active,
  '活跃用户': metrics.users.active,
  '支付处理': metrics.payment.totalProcessed
});
```

### 测试配置变更

```typescript
// 在浏览器控制台
configRegistry.set('feature.notification.enabled', false);
// 立即看到通知面板的禁用效果
```

---

## ⚠️ 注意事项

### DO ✅

- ✅ 使用服务来记录关键操作
- ✅ 为用户重要的操作发送通知
- ✅ 在服务初始化时订阅事件
- ✅ 使用配置中心管理所有设置
- ✅ 定期记录系统指标

### DON'T ❌

- ❌ 直接修改服务内部状态
- ❌ 在通知数据中包含敏感信息
- ❌ 硬编码配置值
- ❌ 忽略错误处理
- ❌ 发送过频繁的通知

---

## 📊 性能提示

### 通知

```typescript
// Good ✅ - 批量操作后发送一条通知
operations.forEach(op => executeOp(op));
notificationService.notify('Batch complete', `${operations.length} items processed`);

// Bad ❌ - 为每个操作发送通知
operations.forEach(op => {
  executeOp(op);
  notificationService.notify('Completed', `${op.id} done`);
});
```

### 审计日志

```typescript
// Good ✅ - 批处理自动化，5秒同步一次
// 直接调用即可

// Bad ❌ - 手动等待同步
// 不要在代码中等待 flushBatch()
```

### 监控指标

```typescript
// Good ✅ - 定期记录关键指标
setInterval(() => {
  monitoringService.recordMetric('active_users', getCurrentUserCount());
}, 60000);

// Bad ❌ - 频繁记录
users.forEach(u => {
  monitoringService.recordMetric('user_check', 1);
});
```

---

## 🔐 安全最佳实践

### 审计日志

```typescript
// ✅ 包含敏感资源信息
await auditLogService.log(
  'PAYMENT_PROCESS',
  userId,
  userEmail,
  {
    resource: { type: 'Payment', id: 'pay_123' },
    metadata: { amount: 99.99, currency: 'USD' }
  }
);

// ❌ 不要包含密码/密钥
await auditLogService.log('USER_LOGIN', userId, userEmail, {
  metadata: { password: 'xxx' } // 危险!
});
```

### 通知

```typescript
// ✅ 公开信息
notificationService.notify('Order created', 'Your order #123 is confirmed', {
  level: 'success'
});

// ❌ 敏感信息
notificationService.notify('Payment received', `Customer paid $${amount}`, {
  level: 'success'
});
```

### 配置

```typescript
// ✅ 在 Platform Settings 中管理
configRegistry.set('payment.stripe.enabled', true);

// ❌ 不要在客户端代码中包含 API 密钥
// process.env.STRIPE_KEY // 危险!
```

---

## 📞 获取帮助

### 检查日志

所有关键信息都记录在浏览器控制台中：

```
[NotificationService] Subscription added for category: order
[AuditService] Batch synced: 5 logs
[MonitoringService] Alert triggered: api_requests > 1000
[ConfigRegistry] Config updated: feature.notification.enabled
```

### 查看完整报告

```
/www/wwwroot/pay.modaui.com/docs/audit/task-01-complete-truth-audit.md
/www/wwwroot/pay.modaui.com/docs/audit/EXECUTION_SUMMARY.md
```

---

## 🎓 进阶话题

### 自定义通知处理

```typescript
// 创建通知聚合器
class NotificationAggregator {
  private pendingNotifications: Notification[] = [];
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    notificationService.subscribe('all', (notif) => {
      this.pendingNotifications.push(notif);
      if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), 5000);
      }
    });
  }

  flush() {
    if (this.pendingNotifications.length > 0) {
      notificationService.notify(
        '批量通知',
        `有 ${this.pendingNotifications.length} 条新通知`,
        { level: 'info', category: 'system' }
      );
      this.pendingNotifications = [];
      this.timer = null;
    }
  }
}
```

### 实时监控仪表板

```typescript
// 创建实时更新的指标看板
function RealtimeMetricsDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);

  useEffect(() => {
    const unsub = monitoringService.subscribe((newMetrics) => {
      setMetrics(newMetrics);
    });

    return unsub;
  }, []);

  return (
    <div>
      <div>API 请求: {metrics?.requests.total}</div>
      <div>活跃用户: {metrics?.users.active}</div>
      <div>Agent 执行: {metrics?.agents.active}</div>
      <div>支付处理: {metrics?.payment.totalProcessed}</div>
    </div>
  );
}
```

---

## ✅ 检查清单

在提交代码前，确保：

- [ ] 关键操作都有审计日志
- [ ] 用户重要的操作都有通知
- [ ] 系统指标被正确记录
- [ ] 所有配置都通过 configRegistry 管理
- [ ] 没有硬编码的值
- [ ] 错误处理到位
- [ ] 敏感信息不在日志中
- [ ] 性能检查通过

---

**最后更新**: 2026-06-04  
**版本**: V7  
**维护者**: MODAUI 执行代理  

🚀 **现在您已准备好开始开发!**

