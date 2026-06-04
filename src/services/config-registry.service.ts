/**
 * Configuration Registry - 平台配置中心
 * 所有配置集中管理，禁止硬编码
 * 支持功能开关、权限配置、监控配置等
 */

export type ConfigCategory = 'feature' | 'payment' | 'notification' | 'workflow' | 'agent' | 'security' | 'quota';

export interface ConfigItem {
  key: string;
  value: any;
  category: ConfigCategory;
  label: string;
  description: string;
  type: 'boolean' | 'string' | 'number' | 'json' | 'select';
  options?: Array<{ label: string; value: any }>;
  defaultValue: any;
  editable: boolean;
  requiresRestart: boolean;
  audit: boolean; // 是否记录修改
}

export interface ConfigSchema {
  version: string;
  lastUpdated: number;
  items: Map<string, ConfigItem>;
}

export class ConfigRegistry {
  private configs: Map<string, ConfigItem> = new Map();
  private schema: ConfigSchema;
  private changeListeners: Array<(key: string, oldValue: any, newValue: any) => void> = [];
  private dbRef: any = null;

  constructor() {
    this.schema = {
      version: '1.0.0',
      lastUpdated: Date.now(),
      items: this.configs
    };
    this.initializeDefaults();
  }

  private initializeDefaults() {
    // Feature Toggles
    this.register({
      key: 'feature.notification.enabled',
      category: 'feature',
      label: '通知系统',
      description: '启用全局通知系统',
      value: true,
      type: 'boolean',
      defaultValue: true,
      editable: true,
      requiresRestart: false,
      audit: true
    });

    this.register({
      key: 'feature.audit.enabled',
      category: 'feature',
      label: '审计系统',
      description: '启用审计日志记录',
      value: true,
      type: 'boolean',
      defaultValue: true,
      editable: true,
      requiresRestart: false,
      audit: true
    });

    this.register({
      key: 'feature.monitoring.enabled',
      category: 'feature',
      label: '监控系统',
      description: '启用系统监控',
      value: true,
      type: 'boolean',
      defaultValue: true,
      editable: true,
      requiresRestart: false,
      audit: true
    });

    // Payment Configuration
    this.register({
      key: 'payment.stripe.enabled',
      category: 'payment',
      label: 'Stripe 支付',
      description: '启用 Stripe 支付网关',
      value: true,
      type: 'boolean',
      defaultValue: true,
      editable: true,
      requiresRestart: true,
      audit: true
    });

    this.register({
      key: 'payment.wechat.enabled',
      category: 'payment',
      label: '微信支付',
      description: '启用微信支付网关',
      value: true,
      type: 'boolean',
      defaultValue: true,
      editable: true,
      requiresRestart: true,
      audit: true
    });

    this.register({
      key: 'payment.paypal.enabled',
      category: 'payment',
      label: 'PayPal 支付',
      description: '启用 PayPal 支付网关',
      value: false,
      type: 'boolean',
      defaultValue: false,
      editable: true,
      requiresRestart: true,
      audit: true
    });

    // Notification Configuration
    this.register({
      key: 'notification.maxQueueSize',
      category: 'notification',
      label: '最大队列大小',
      description: '通知队列最大缓存数量',
      value: 1000,
      type: 'number',
      defaultValue: 1000,
      editable: true,
      requiresRestart: false,
      audit: false
    });

    this.register({
      key: 'notification.batchSize',
      category: 'notification',
      label: '批处理大小',
      description: '每批处理的通知数量',
      value: 50,
      type: 'number',
      defaultValue: 50,
      editable: true,
      requiresRestart: false,
      audit: false
    });

    // Workflow Configuration
    this.register({
      key: 'workflow.maxConcurrent',
      category: 'workflow',
      label: '最大并发流程',
      description: '同时运行的最大工作流数量',
      value: 100,
      type: 'number',
      defaultValue: 100,
      editable: true,
      requiresRestart: false,
      audit: false
    });

    this.register({
      key: 'workflow.timeout',
      category: 'workflow',
      label: '流程超时 (ms)',
      description: '工作流执行超时时间',
      value: 300000,
      type: 'number',
      defaultValue: 300000,
      editable: true,
      requiresRestart: false,
      audit: false
    });

    // Agent Configuration
    this.register({
      key: 'agent.maxTokens',
      category: 'agent',
      label: '最大 Tokens',
      description: 'Agent 单次执行最大 Tokens',
      value: 4000,
      type: 'number',
      defaultValue: 4000,
      editable: true,
      requiresRestart: false,
      audit: false
    });

    this.register({
      key: 'agent.retryAttempts',
      category: 'agent',
      label: '重试次数',
      description: 'Agent 执行失败重试次数',
      value: 3,
      type: 'number',
      defaultValue: 3,
      editable: true,
      requiresRestart: false,
      audit: false
    });

    // Security Configuration
    this.register({
      key: 'security.jwtExpiry',
      category: 'security',
      label: 'JWT 过期时间 (小时)',
      description: 'JWT Token 过期时间',
      value: 24,
      type: 'number',
      defaultValue: 24,
      editable: true,
      requiresRestart: false,
      audit: true
    });

    this.register({
      key: 'security.sessionTimeout',
      category: 'security',
      label: '会话超时 (分钟)',
      description: '用户会话无操作超时',
      value: 60,
      type: 'number',
      defaultValue: 60,
      editable: true,
      requiresRestart: false,
      audit: true
    });

    // Quota Configuration
    this.register({
      key: 'quota.defaultTokenLimit',
      category: 'quota',
      label: '默认 Token 额度',
      description: '新租户默认 Token 上限',
      value: 5000,
      type: 'number',
      defaultValue: 5000,
      editable: true,
      requiresRestart: false,
      audit: true
    });
  }

  /**
   * 注册配置项
   */
  public register(item: ConfigItem) {
    this.configs.set(item.key, item);
  }

  /**
   * 获取配置值
   */
  public get(key: string): any {
    const config = this.configs.get(key);
    return config ? config.value : undefined;
  }

  /**
   * 设置配置值
   */
  public set(key: string, newValue: any, userId?: string, userEmail?: string): boolean {
    const config = this.configs.get(key);
    if (!config) {
      console.warn(`Configuration key not found: ${key}`);
      return false;
    }

    if (!config.editable) {
      console.warn(`Configuration is not editable: ${key}`);
      return false;
    }

    const oldValue = config.value;
    config.value = newValue;
    this.schema.lastUpdated = Date.now();

    // 触发审计日志（如果启用）
    if (config.audit) {
      this.notifyAudit(key, oldValue, newValue, userId, userEmail);
    }

    // 通知变更监听器
    this.changeListeners.forEach(listener => {
      try {
        listener(key, oldValue, newValue);
      } catch (e) {
        console.error('Error in config change listener:', e);
      }
    });

    return true;
  }

  /**
   * 获取所有配置（按类别）
   */
  public getByCategory(category: ConfigCategory): ConfigItem[] {
    return Array.from(this.configs.values()).filter(item => item.category === category);
  }

  /**
   * 获取所有配置
   */
  public getAll(): ConfigItem[] {
    return Array.from(this.configs.values());
  }

  /**
   * 导出配置schema
   */
  public exportSchema(): ConfigSchema {
    return {
      version: this.schema.version,
      lastUpdated: this.schema.lastUpdated,
      items: this.schema.items
    };
  }

  /**
   * 订阅配置变更
   */
  public subscribe(callback: (key: string, oldValue: any, newValue: any) => void): () => void {
    this.changeListeners.push(callback);
    return () => {
      this.changeListeners = this.changeListeners.filter(cb => cb !== callback);
    };
  }

  /**
   * 审计通知（集成后续审计系统）
   */
  private notifyAudit(key: string, oldValue: any, newValue: any, userId?: string, userEmail?: string) {
    const auditData = {
      action: 'CONFIG_CHANGE',
      resource: 'ConfigRegistry',
      changes: { before: { [key]: oldValue }, after: { [key]: newValue } },
      userId,
      userEmail,
      timestamp: Date.now()
    };

    // 将来集成 auditLogService
    console.log('[CONFIG_AUDIT]', auditData);
  }

  /**
   * 重置为默认值
   */
  public resetToDefaults() {
    this.configs.forEach(config => {
      config.value = config.defaultValue;
    });
    this.schema.lastUpdated = Date.now();
  }
}

export const configRegistry = new ConfigRegistry();

