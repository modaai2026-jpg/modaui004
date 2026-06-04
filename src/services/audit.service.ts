/**
 * Audit Log Service - 企业级审计系统
 * 记录所有关键事件：登录、权限变更、数据修改、支付、Agent执行等
 */

export type AuditAction =
  | 'USER_LOGIN' | 'USER_LOGOUT' | 'USER_REGISTER'
  | 'PERMISSION_GRANT' | 'PERMISSION_REVOKE' | 'ROLE_CHANGE'
  | 'MERCHANT_CREATE' | 'MERCHANT_UPDATE' | 'MERCHANT_DELETE'
  | 'STORE_CREATE' | 'STORE_UPDATE' | 'STORE_DELETE'
  | 'PRODUCT_CREATE' | 'PRODUCT_UPDATE' | 'PRODUCT_DELETE'
  | 'ORDER_CREATE' | 'ORDER_UPDATE' | 'ORDER_CANCEL'
  | 'PAYMENT_PROCESS' | 'PAYMENT_SUCCESS' | 'PAYMENT_FAILED' | 'REFUND'
  | 'AGENT_EXECUTE' | 'WORKFLOW_START' | 'WORKFLOW_COMPLETE' | 'AGENT_COLLABORATION' | 'AGENT_FEEDBACK'
  | 'CONFIG_CHANGE' | 'FEATURE_TOGGLE' | 'QUOTA_ADJUST'
  | 'API_CALL' | 'PROMPT_VERSION_CREATE' | 'PROMPT_ACTIVATE' | 'PROMPT_ROLLBACK'
  | 'MODEL_USAGE' | 'SECURITY_VIOLATION' | 'DATA_EXPORT';

export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface AuditLog {
  id: string;
  timestamp: number;
  userId: string;
  userEmail: string;
  tenantId?: string;
  action: AuditAction;
  severity: AuditSeverity;
  resource?: {
    type: string;
    id: string;
    name?: string;
  };
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failed';
  errorMessage?: string;
}

class AuditLogService {
  private logs: AuditLog[] = [];
  private maxLocalSize = 1000;
  private dbRef: any = null;
  private batchQueue: AuditLog[] = [];
  private batchInterval: NodeJS.Timeout | null = null;
  private batchSize = 50;

  /**
   * 初始化，连接 Firebase 或后端
   */
  public async initialize(dbReference?: any) {
    if (dbReference) {
      this.dbRef = dbReference;
    }
    // 启动批量同步
    this.startBatchSync();
  }

  /**
   * 记录审计日志
   */
  public async log(
    action: AuditAction,
    userId: string,
    userEmail: string,
    options: {
      resource?: { type: string; id: string; name?: string };
      changes?: { before?: Record<string, any>; after?: Record<string, any> };
      metadata?: Record<string, any>;
      severity?: AuditSeverity;
      status?: 'success' | 'failed';
      errorMessage?: string;
      tenantId?: string;
    } = {}
  ): Promise<AuditLog> {
    const auditLog: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      userId,
      userEmail,
      tenantId: options.tenantId,
      action,
      severity: options.severity || this.determineSeverity(action),
      resource: options.resource,
      changes: options.changes,
      metadata: options.metadata,
      ipAddress: typeof window !== 'undefined' ? undefined : process.env.CLIENT_IP,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      status: options.status || 'success',
      errorMessage: options.errorMessage
    };

    // 添加到本地队列
    this.logs.unshift(auditLog);
    if (this.logs.length > this.maxLocalSize) {
      this.logs.pop();
    }

    // 添加到批处理队列
    this.batchQueue.push(auditLog);

    return auditLog;
  }

  /**
   * 简化的日志方法 - 针对常见事件
   */
  public async logAction(action: AuditAction, userId: string, userEmail: string) {
    return this.log(action, userId, userEmail, { severity: 'info', status: 'success' });
  }

  /**
   * 是否需要批准的操作
   */
  public async logApprovalRequired(
    action: AuditAction,
    userId: string,
    userEmail: string,
    resource: { type: string; id: string }
  ) {
    return this.log(action, userId, userEmail, {
      resource,
      severity: 'warning',
      metadata: { requiresApproval: true }
    });
  }

  /**
   * 权限决策日志
   */
  public async logPermissionDecision(
    userId: string,
    userEmail: string,
    resource: string,
    decision: 'allowed' | 'denied',
    reason: string
  ) {
    return this.log(
      decision === 'denied' ? 'SECURITY_VIOLATION' : 'PERMISSION_GRANT',
      userId,
      userEmail,
      {
        severity: decision === 'denied' ? 'warning' : 'info',
        metadata: { resource, decision, reason },
        status: 'success'
      }
    );
  }

  /**
   * 获取日志历史
   */
  public getHistory(limit: number = 100): AuditLog[] {
    return this.logs.slice(0, limit);
  }

  /**
   * 按用户过滤
   */
  public getByUser(userId: string, limit: number = 50): AuditLog[] {
    return this.logs.filter(log => log.userId === userId).slice(0, limit);
  }

  /**
   * 按操作类型过滤
   */
  public getByAction(action: AuditAction, limit: number = 50): AuditLog[] {
    return this.logs.filter(log => log.action === action).slice(0, limit);
  }

  /**
   * 按时间范围过滤
   */
  public getByTimeRange(startTime: number, endTime: number): AuditLog[] {
    return this.logs.filter(log => log.timestamp >= startTime && log.timestamp <= endTime);
  }

  /**
   * 获取失败的操作
   */
  public getFailures(limit: number = 50): AuditLog[] {
    return this.logs.filter(log => log.status === 'failed').slice(0, limit);
  }

  /**
   * 启动批处理同步
   */
  private startBatchSync() {
    this.batchInterval = setInterval(() => {
      if (this.batchQueue.length > 0) {
        this.flushBatch();
      }
    }, 5000); // 每 5 秒检查一次
  }

  /**
   * 批处理同步到数据库
   */
  private async flushBatch() {
    if (this.batchQueue.length === 0) return;

    const batch = this.batchQueue.splice(0, this.batchSize);

    if (this.dbRef) {
      try {
        // 批量保存到 Firebase
        for (const log of batch) {
          try {
            // 假设有 Firestore 引用
            if (typeof this.dbRef.collection === 'function') {
              const logCollection = this.dbRef.collection('audit_logs');
              await logCollection.add(log);
            }
          } catch (e) {
            console.error('Failed to save audit log to database:', e);
            // 重新加入队列以便重试
            this.batchQueue.unshift(log);
          }
        }
      } catch (e) {
        console.error('Batch sync failed:', e);
      }
    }
  }

  /**
   * 根据操作类型判断严重程度
   */
  private determineSeverity(action: AuditAction): AuditSeverity {
    if (action.includes('DELETE') || action.includes('REFUND') || action === 'SECURITY_VIOLATION') {
      return 'critical';
    }
    if (action.includes('PERMISSION') || action.includes('CONFIG') || action.includes('QUOTA')) {
      return 'warning';
    }
    return 'info';
  }

  /**
   * 清理旧日志（备用）
   */
  public async cleanup(beforeTime: number) {
    this.logs = this.logs.filter(log => log.timestamp > beforeTime);
  }

  /**
   * 销毁服务
   */
  public destroy() {
    if (this.batchInterval) {
      clearInterval(this.batchInterval);
      this.batchInterval = null;
    }
    // 最后一次同步
    if (this.batchQueue.length > 0) {
      this.flushBatch();
    }
  }
}

export const auditLogService = new AuditLogService();

