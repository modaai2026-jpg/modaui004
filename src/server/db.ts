import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Types representing our database schemas

export interface DBUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: 'Platform Admin' | 'Merchant Owner' | 'Manager' | 'Staff' | 'Customer';
  merchantId?: string; // Links users to their specific tenant
  verified: boolean;
  createdAt: string;
  profile?: {
    fullName?: string;
    phone?: string;
    avatar?: string;
  };
}

export interface DBSession {
  id: string;
  userId: string;
  expiresAt: string;
}

export interface DBAuthToken {
  id: string;
  userId: string;
  token: string;
  type: 'refresh' | 'email_verification' | 'password_reset';
  expiresAt: string;
  createdAt: string;
  used: boolean;
  metadata?: Record<string, any>;
}

export interface DBMerchant {
  id: string;
  name: string;
  ownerId: string;
  status: 'active' | 'suspended' | 'pending';
  billingPlan: 'free' | 'growth' | 'enterprise';
  createdAt: string;
}

export interface DBStore {
  id: string;
  merchantId: string;
  name: string;
  domain: string;
  themeId?: string;
  branding: {
    logo?: string;
    colorTheme?: 'classic' | 'warm' | 'emerald' | 'monochrome' | 'retro' | 'dark' | 'royal' | 'indigo';
    bannerText?: string;
  };
  createdAt: string;
}

export interface DBProduct {
  id: string;
  storeId: string;
  name: string;
  category: string;
  price: number;
  inventory: number;
  sku: string;
  variant: {
    color?: string[];
    size?: string[];
  };
  images: string[];
  createdAt: string;
}

export interface DBCartItem {
  productId: string;
  quantity: number;
}

export interface DBCart {
  userId: string;
  items: DBCartItem[];
  coupon?: string;
  discount: number; // in currency units
}

export interface DBOrder {
  id: string;
  userId: string;
  storeId: string;
  merchantId: string;
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
  }[];
  totalPrice: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'completed' | 'cancelled' | 'refunded' | 'return_requested' | 'returned' | 'partially_refunded';
  shipmentTracking?: {
    carrier: string;
    trackingNumber: string;
    status: string;
  };
  cancellationReason?: string;
  refundReason?: string;
  returnReason?: string;
  refundAmount?: number;
  timeline: {
    status: string;
    message: string;
    timestamp: string;
  }[];
  createdAt: string;
}

export interface DBPaymentRecord {
  id: string;
  orderId: string;
  amount: number;
  method: 'Stripe' | 'Alipay' | 'WeChatPay' | 'PayPal';
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  transactionId: string;
  createdAt: string;
}

export interface DBFinanceRecord {
  id: string;
  merchantId: string;
  type: 'revenue' | 'expense';
  amount: number;
  orderId?: string;
  description: string;
  createdAt: string;
}

export interface DBAIAgent {
  id: string;
  teamId: string;
  name: string;
  role: 'sales_assistant' | 'marketing_strategist' | 'support_rep' | 'inventory_manager';
  systemPrompt: string;
  status: 'idle' | 'running' | 'paused';
  memoryContext: string[]; // local agent context array
  createdAt: string;
}

export interface DBAITeam {
  id: string;
  merchantId: string;
  name: string;
  createdAt: string;
}

export interface DBKBChunk {
  id: string;
  merchantId: string;
  title: string;
  content: string;
  category?: string;
  tokenCount: number;
  version: number;
  lastIndexedAt?: string;
  createdAt: string;
  vector?: number[] | null;
}

export interface DBAgent {
  id: string;
  merchantId: string;
  name: string;
  role: string;
  industry: string;
  status: 'online' | 'busy' | 'offline';
  memory: string[];
  permissions: string[];
  config: {
    model: string;
    temperature: number;
    systemPrompt: string;
  };
  createdAt: string;
}

export interface DBPendingAgentTask {
  id: string;
  agentId: string;
  merchantId: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  status: 'PENDING' | 'THINKING' | 'COMPLETED' | 'FAILED' | 'RETRYING';
  logs: string[];
  result?: any;
  leasedAt?: string | null;
  retryCount: number;
  toolCalls?: {
    tool: string;
    params: any;
    status: 'pending' | 'success' | 'failed';
  }[];
  model?: string;
  routingDecision?: any;
  createdAt: string;
}

export interface DBPlatformTenant {
  id: string; // matches merchantId
  quotaLimit: number; // max transactions per month
  quotaUsed: number;
  billingStatus: 'paid' | 'unpaid';
  globalSettings: {
    maintenanceMode: boolean;
    allowRegistration: boolean;
  };
}

export interface DBAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  action: string;
  component: string;
  details: string;
}

export interface DBNotification {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | string;
  title: string;
  message: string;
  userId: string;
  username: string;
  component: string;
  target: string;
  tenantId?: string;
  read: boolean;
}

export interface DBOperationalDocument {
  id: string;
  tenantId: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  createdBy: string;
}

export interface DBEvent {
  id: string;
  type: string;
  payload: any;
  source: string;
  component: string;
  status: 'published' | 'consumed' | 'failed';
  publishedAt: string;
  consumedAt?: string;
  consumedBy?: string;
  metadata?: Record<string, any>;
}

// Global schema container
export interface DBInvoice {
  id: string;
  merchantId: string;
  orderId?: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  status: 'draft' | 'issued' | 'paid' | 'void';
  pdfUrl?: string;
  issuedAt: string;
  paidAt?: string;
}

export interface DBSubscription {
  id: string;
  userId?: string;
  merchantId: string;
  planId: 'free' | 'growth' | 'enterprise' | string;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing' | 'expired';
  currentPeriodStart?: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd?: boolean;
  createdAt: string;
}

export interface DBPlatformSettings {
  maintenanceMode: boolean;
  allowRegistration: boolean;
  defaultQuotaLimit: number;
  activeSystemVersion: string;
  supportedPaymentGateways: string[];
  paymentSimulationEnabled: boolean;
  aiConfig: {
    defaultModel: string;
    embeddingModel: string;
    apiKeys: Record<string, string>;
  };
  features: Record<string, boolean>; // Feature flags
  notifications: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    webhookEnabled: boolean;
  };
  security: {
    twoFactorRequired: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
  };
  branding: {
    platformName: string;
    platformLogo: string;
    primaryColor: string;
  };
}

export interface DBConfigRegistryItem {
  id: string;
  module: string;
  key: string;
  category: string;
  type: 'boolean' | 'string' | 'number' | 'json' | 'select' | 'object' | string;
  default_value: any;
  current_value: any;
  tenant_scope: 'global' | 'tenant' | 'user' | 'system' | 'optional';
  description: string;
  uiPath: string;
  required: boolean;
  updated_by: string;
  updated_at: string;
}

export interface DBAppInstallation {
  id: string;
  merchantId: string;
  appId: string;
  status: 'active' | 'paused' | 'pending' | 'failed';
  config: Record<string, any>;
  apiKey: string;
  webhookSecret: string;
  installedAt: string;
  updatedAt: string;
}

export interface DBCampaign {
  id: string;
  merchantId: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'social';
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'paused';
  trigger: {
    type: 'manual' | 'scheduled' | 'behavioral';
    condition?: any;
    schedule?: { startTime: string; frequency: 'once' | 'daily' | 'weekly' | 'monthly' };
  };
  audience: {
    filters: Array<{ field: string; operator: string; value: any }>;
    count: number;
  };
  content: {
    subject?: string;
    body: string;
    cta?: { text: string; url: string };
  };
  performance: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
    revenue: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DBCampaignAnalytics {
  id: string;
  campaignId: string;
  sentCount: number;
  openCount: number;
  clickCount: number;
  conversionCount: number;
  revenue: number;
  timestamp: string;
}

export interface DBChannelConnection {
  id: string;
  merchantId: string;
  channel: 'tiktok' | 'xiaohongshu' | 'douyin' | 'taobao' | 'pinduoduo' | 'wechat' | 'instagram' | 'facebook';
  status: 'connected' | 'disconnected' | 'error';
  accessToken: string;
  refreshToken?: string;
  storeId: string;
  config: Record<string, any>;
  connectedAt: string;
}

export interface DBRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  merchantId: string;
}

export interface DBStaffPermission {
  id: string;
  merchantId: string;
  email: string;
  name: string;
  roles: string[];
  status: 'active' | 'inactive' | 'invited';
}

export interface DBTheme {
  id: string;
  merchantId: string;
  name: string;
  status: 'draft' | 'published' | 'archived';
  config: {
    colors: { primary: string; secondary: string; background: string; text: string };
    fonts: { heading: string; body: string };
    layout: { headerStyle: 'minimal' | 'standard' | 'luxury'; footerEnabled: boolean };
  };
  previewUrl: string;
  publishedAt?: string;
}

export interface DBWebhookReg {
  id: string;
  merchantId: string;
  event: string;
  targetUrl: string;
  active: boolean;
  createdAt: string;
}

export interface DBWebhookLog {
  id: string;
  webhookId: string;
  merchantId: string;
  event: string;
  targetUrl: string;
  payload: string;
  responseStatus: number;
  responseBody: string;
  timestamp: string;
  success: boolean;
}

export interface DBAPIKey {
  id: string;
  merchantId: string;
  name: string;
  apiKey: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt?: string;
}

// === NEW FINANCE & WALLET SCHEMAS ===

export interface DBCurrency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  rate: number;
  isDefault: boolean;
  status: boolean;
}

export interface DBPaymentLink {
  id: string;
  merchantId: string;
  amount: number;
  currency: string;
  description: string;
  url: string;
  status: 'active' | 'inactive' | 'used';
  createdAt: string;
}

export interface DBVirtualCard {
  id: string;
  userId: string;
  merchantId: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardHolder: string;
  balance: number;
  currency: string;
  status: 'active' | 'blocked' | 'cancelled';
  createdAt: string;
}

export interface DBP2POffer {
  id: string;
  userId: string;
  type: 'buy' | 'sell';
  amount: number;
  currency: string;
  rate: number;
  paymentMethod: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface DBWallet {
  id: string;
  userId: string;
  merchantId: string;
  balance: number;
  currency: string;
  earnings: number;
  referralBalance: number;
  createdAt: string;
}

export interface DBGiftCard {
  id: string;
  code: string;
  amount: number;
  currency: string;
  isRedeemed: boolean;
  redeemedBy?: string;
  createdAt: string;
}

export interface DBTransaction {
  id: string;
  userId: string;
  merchantId: string;
  type: 'deposit' | 'withdraw' | 'transfer' | 'payment' | 'earning' | 'referral';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  createdAt: string;
}

export interface DBQuotaAllocation {
  id: string;
  tenantId: string;
  add: number;
  reason: string;
  createdAt: string;
}

export interface DatabaseSchema {
  users: DBUser[];
  sessions: DBSession[];
  merchants: DBMerchant[];
  stores: DBStore[];
  products: DBProduct[];
  carts: DBCart[];
  orders: DBOrder[];
  payments: DBPaymentRecord[];
  finance: DBFinanceRecord[];
  ai_teams: DBAITeam[];
  ai_agents: DBAIAgent[];
  kb_chunks: DBKBChunk[];
  agent_tasks: DBPendingAgentTask[];
  agents: DBAgent[];
  tenants: DBPartialTenantInfo[];
  audit_logs: DBAuditLog[];
  notifications: DBNotification[];
  events: DBEvent[];
  appInstallations: DBAppInstallation[];
  campaigns: DBCampaign[];
  campaignAnalytics: DBCampaignAnalytics[];
  channelConnections: DBChannelConnection[];
  roles: DBRole[];
  staffPermissions: DBStaffPermission[];
  themes: DBTheme[];
  webhookRegistrations: DBWebhookReg[];
  webhookLogs: DBWebhookLog[];
  apiKeys: DBAPIKey[];
  authTokens: DBAuthToken[];
  operationalDocuments: DBOperationalDocument[];
  // NEW FINANCE TABLES
  currencies: DBCurrency[];
  paymentLinks: DBPaymentLink[];
  virtualCards: DBVirtualCard[];
  p2pOffers: DBP2POffer[];
  wallets: DBWallet[];
  giftCards: DBGiftCard[];
  subscriptions: DBSubscription[];
  transactions: DBTransaction[];
  quota_allocations: DBQuotaAllocation[];
  invoices: DBInvoice[];
  platformSettings: DBPlatformSettings;
  config_registry: DBConfigRegistryItem[];
}

export interface DBPartialTenantInfo {
  id: string;
  quotaLimit: number;
  quotaUsed: number;
  billingStatus: 'paid' | 'unpaid';
}

const DB_FILE_PATH = path.resolve('data/modadb.json');

// Initialize base database with production configuration bootstrap values
const INITIAL_DATABASE: DatabaseSchema = {
  users: [],
  sessions: [],
  merchants: [],
  stores: [],
  products: [],
  carts: [],
  orders: [],
  payments: [],
  finance: [],
  ai_teams: [],
  ai_agents: [],
  kb_chunks: [],
  agent_tasks: [],
  agents: [],
  tenants: [],
  audit_logs: [],
  appInstallations: [],
  campaigns: [],
  campaignAnalytics: [],
  channelConnections: [],
  roles: [],
  staffPermissions: [],
  themes: [],
  webhookRegistrations: [],
  webhookLogs: [],
  apiKeys: [],
  authTokens: [],
  operationalDocuments: [],
  currencies: [],
  paymentLinks: [],
  virtualCards: [],
  p2pOffers: [],
  wallets: [],
  giftCards: [],
  subscriptions: [],
  transactions: [],
  notifications: [],
  events: [],
  quota_allocations: [],
  invoices: [],
  platformSettings: {
    maintenanceMode: false,
    allowRegistration: true,
    defaultQuotaLimit: 10000,
    activeSystemVersion: "v3.0.0 Stable Enterprise",
    supportedPaymentGateways: ["Stripe", "Alipay", "WeChatPay", "PayPal"],
    paymentSimulationEnabled: true,
    aiConfig: {
      defaultModel: "gemini-3.5-flash",
      embeddingModel: "gemini-embedding-2-preview",
      apiKeys: {}
    },
    features: {
      "ai_chat": true,
      "order_sync": true,
      "multi_tenant": true
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      webhookEnabled: true
    },
    security: {
      twoFactorRequired: false,
      sessionTimeout: 3600,
      maxLoginAttempts: 5
    },
    branding: {
      platformName: "MODAUI",
      platformLogo: "📦",
      primaryColor: "#1D9BF0"
    }
  },
  config_registry: [
    {
      id: crypto.randomUUID(),
      module: 'platform',
      key: 'platform.maintenanceMode',
      category: 'system',
      type: 'boolean',
      default_value: false,
      current_value: false,
      tenant_scope: 'system',
      description: '控制全局维护模式是否开启',
      uiPath: '/platform/settings',
      required: true,
      updated_by: 'system',
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      module: 'platform',
      key: 'platform.allowRegistration',
      category: 'system',
      type: 'boolean',
      default_value: true,
      current_value: true,
      tenant_scope: 'system',
      description: '控制是否允许新用户注册',
      uiPath: '/platform/settings',
      required: true,
      updated_by: 'system',
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      module: 'platform',
      key: 'platform.defaultQuotaLimit',
      category: 'system',
      type: 'number',
      default_value: 10000,
      current_value: 10000,
      tenant_scope: 'system',
      description: '默认租户配额限制',
      uiPath: '/platform/settings',
      required: true,
      updated_by: 'system',
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      module: 'payment',
      key: 'platform.paymentSimulationEnabled',
      category: 'payment',
      type: 'boolean',
      default_value: true,
      current_value: true,
      tenant_scope: 'system',
      description: '控制支付是否进入仿真模式',
      uiPath: '/platform/settings',
      required: true,
      updated_by: 'system',
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      module: 'ai',
      key: 'platform.aiConfig.defaultModel',
      category: 'ai',
      type: 'string',
      default_value: 'gemini-3.5-flash',
      current_value: 'gemini-3.5-flash',
      tenant_scope: 'system',
      description: '默认 AI 推理模型',
      uiPath: '/platform/settings',
      required: true,
      updated_by: 'system',
      updated_at: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      module: 'security',
      key: 'platform.security.twoFactorRequired',
      category: 'security',
      type: 'boolean',
      default_value: false,
      current_value: false,
      tenant_scope: 'system',
      description: '是否强制开启二次验证',
      uiPath: '/platform/settings',
      required: true,
      updated_by: 'system',
      updated_at: new Date().toISOString()
    }
  ]
};

// Safe atomic file operations
export class ModaDB {
  private static cachedData: DatabaseSchema | null = null;

  private static ensureDirExists() {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private static normalizeDatabase(value: any, defaultValue: any): any {
    if (Array.isArray(defaultValue)) {
      return Array.isArray(value) ? value : defaultValue;
    }

    if (typeof defaultValue !== 'object' || defaultValue === null) {
      return value === undefined ? defaultValue : value;
    }

    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      value = {};
    }

    const normalized: any = { ...value };
    for (const key of Object.keys(defaultValue)) {
      normalized[key] = this.normalizeDatabase(value[key], defaultValue[key]);
    }
    return normalized;
  }

  // Reloads database. Uses memory caching unless refresh is requested.
  public static read(): DatabaseSchema {
    this.ensureDirExists();
    if (this.cachedData) {
      return this.cachedData;
    }

    if (!fs.existsSync(DB_FILE_PATH)) {
      this.write(INITIAL_DATABASE);
      return INITIAL_DATABASE;
    }

    try {
      const content = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const data = JSON.parse(content) as DatabaseSchema;
      const normalized = this.normalizeDatabase(data, INITIAL_DATABASE);
      if (JSON.stringify(normalized) !== JSON.stringify(data)) {
        this.write(normalized);
      }
      this.cachedData = normalized;
      return normalized;
    } catch (e) {
      console.error("Corrupted database. Re-building...", e);
      this.write(INITIAL_DATABASE);
      return INITIAL_DATABASE;
    }
  }

  // Atomically writes target JSON structure to the file system using Temp-Rename pattern
  public static write(data: DatabaseSchema): void {
    this.ensureDirExists();
    const tempPath = `${DB_FILE_PATH}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, DB_FILE_PATH);
    this.cachedData = data;
  }

  // bcrypt helper for real non-mocked secure user registration
  public static hashPassword(password: string): string {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  }

  public static comparePassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }

  private static resolveConfigMetadata(configKey: string) {
    const parts = configKey.split('.');
    const module = parts[1] || 'platform';
    const category = module === 'platform' ? 'system' : module;
    const uiPath = '/platform/settings';
    return { module, category, uiPath };
  }

  public static syncPlatformSettingsToRegistry() {
    const db = this.read();
    const walk = (obj: any, prefix = 'platform') => {
      for (const [key, value] of Object.entries(obj || {})) {
        const currentPath = `${prefix}.${key}`;
        if (value === null || typeof value !== 'object' || Array.isArray(value)) {
          const { module, category, uiPath } = this.resolveConfigMetadata(currentPath);
          this.registerConfig({
            module,
            key: currentPath,
            category,
            type: Array.isArray(value) ? 'array' : typeof value,
            default_value: value,
            current_value: value,
            tenant_scope: 'system',
            description: `Auto-synced config entry for ${currentPath}`,
            uiPath,
            required: true,
            updated_by: 'system'
          });
        } else {
          walk(value, currentPath);
        }
      }
    };
    walk(db.platformSettings, 'platform');
  }

  // Audit logger directly recording to system log
  public static log(userId: string, username: string, action: string, component: string, details: string) {
    const db = this.read();
    const newLog: DBAuditLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      userId,
      username,
      action,
      component,
      details,
    };
    db.audit_logs.unshift(newLog); // Prepend so fresh is always first
    // Limit to last 500 records to maintain speed and avoid storage quotas
    if (db.audit_logs.length > 500) {
      db.audit_logs = db.audit_logs.slice(0, 500);
    }
    this.write(db);
  }

  // Notification helper for real-time platform alerts
  public static notify(userId: string, username: string, title: string, message: string, level: 'info' | 'warning' | 'error' | string = 'info', component: string = 'NOTIFICATION_ENGINE', target: string = 'admin', tenantId?: string) {
    const db = this.read();
    const notification = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      level,
      title,
      message,
      userId,
      username,
      component,
      target,
      tenantId,
      read: false,
    };
    db.notifications.unshift(notification);
    if (db.notifications.length > 500) {
      db.notifications = db.notifications.slice(0, 500);
    }
    this.log(userId, username, `NOTIFICATION_${title.replace(/\s+/g, '_').toUpperCase()}`, component, message);
    this.write(db);
    return notification;
  }

  public static publishEvent(type: string, payload: any, source: string = 'SYSTEM', component: string = 'EVENT_BUS', metadata: Record<string, any> = {}) {
    const db = this.read();
    const event = {
      id: crypto.randomUUID(),
      type,
      payload,
      source,
      component,
      status: 'published' as const,
      publishedAt: new Date().toISOString(),
      metadata,
    };
    db.events.unshift(event);
    if (db.events.length > 500) {
      db.events = db.events.slice(0, 500);
    }
    this.write(db);
    return event;
  }

  public static consumeEvent(eventId: string, consumer: string) {
    const db = this.read();
    const event = db.events.find(evt => evt.id === eventId);
    if (!event) return null;
    event.status = 'consumed';
    event.consumedAt = new Date().toISOString();
    event.consumedBy = consumer;
    this.write(db);
    this.log(consumer, consumer, `EVENT_CONSUMED`, event.component, `Consumed event ${event.type} (${eventId})`);
    return event;
  }

  public static getConfigRegistry(): DBConfigRegistryItem[] {
    return this.read().config_registry;
  }

  public static registerConfig(item: Omit<DBConfigRegistryItem, 'id' | 'updated_at'>) {
    const db = this.read();
    const existing = db.config_registry.find((entry) => entry.key === item.key);
    const now = new Date().toISOString();
    if (existing) {
      Object.assign(existing, item, {
        current_value: item.current_value,
        updated_by: item.updated_by || existing.updated_by,
        updated_at: now
      });
      this.write(db);
      return existing;
    }

    const newEntry: DBConfigRegistryItem = {
      id: crypto.randomUUID(),
      updated_at: now,
      ...item
    };
    db.config_registry.unshift(newEntry);
    this.write(db);
    return newEntry;
  }

  public static auditConfigCoverage() {
    const db = this.read();
    const registryKeys = new Set(db.config_registry.map((entry) => entry.key));

    const flattenSettings = (obj: any, prefix = 'platform'): string[] => {
      if (obj === null || typeof obj !== 'object') {
        return [prefix];
      }
      const results: string[] = [];
      for (const key of Object.keys(obj)) {
        const value = obj[key];
        const currentPath = `${prefix}.${key}`;
        if (value === null || typeof value !== 'object' || Array.isArray(value)) {
          results.push(currentPath);
        } else {
          results.push(...flattenSettings(value, currentPath));
        }
      }
      return results;
    };

    const settingsKeys = new Set(flattenSettings(db.platformSettings, 'platform'));
    const missingRegistry = [...settingsKeys].filter((key) => !registryKeys.has(key));
    const extraRegistry = [...registryKeys].filter((key) => !settingsKeys.has(key));
    const coverage = settingsKeys.size > 0 ? Number(((registryKeys.size / settingsKeys.size) * 100).toFixed(2)) : 0;

    return {
      totalSettings: settingsKeys.size,
      registeredItems: registryKeys.size,
      coverage,
      missingRegistry,
      extraRegistry,
      orphanFeatures: extraRegistry,
      lastUpdated: new Date().toISOString()
    };
  }

  // --- Quota allocation helper: adjust tenant quota and record allocation ---
  public static allocateQuota(tenantId: string, add: number, reason: string) {
    const db = this.read();
    const tenant = db.tenants.find(t => t.id === tenantId);
    const allocation = {
      id: crypto.randomUUID(),
      tenantId,
      add,
      reason,
      createdAt: new Date().toISOString()
    };
    db.quota_allocations.unshift(allocation as DBQuotaAllocation);
    if (tenant) {
      tenant.quotaLimit = Number((tenant.quotaLimit || 0) + add);
    }
    this.log('SYSTEM', 'QUOTA_ENGINE', 'QUOTA_ALLOCATION', 'QUOTA_ENGINE', `Allocated ${add} to tenant ${tenantId}: ${reason}`);
    this.write(db);
    return allocation;
  }

  // --- Subscription creation helper ---
  public static createSubscription(userId: string | undefined, merchantId: string, planId: string) {
    const db = this.read();
    const now = new Date().toISOString();
    const sub: DBSubscription = {
      id: `sub_${crypto.randomUUID().substring(0,8)}`,
      userId: userId as any,
      merchantId,
      planId: planId as any,
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false,
      createdAt: now
    };
    db.subscriptions.push(sub);
    const merchant = db.merchants.find(m => m.id === merchantId);
    if (merchant) merchant.billingPlan = planId as any;
    // create a draft invoice record for the subscription
    const invoice: DBInvoice = {
      id: `inv_${crypto.randomUUID().substring(0,8)}`,
      merchantId,
      subscriptionId: sub.id,
      amount: 0,
      currency: 'CNY',
      status: 'draft',
      issuedAt: now
    };
    db.invoices.unshift(invoice);
    this.log(userId || 'SYSTEM', 'BILLING_SYS', 'SUBSCRIPTION_CREATED', 'BILLING_SYS', `Created subscription ${sub.id} for merchant ${merchantId}`);
    this.write(db);
    return { subscription: sub, invoice };
  }

  // --- Agent task queue helpers ---
  public static enqueueAgentTask(task: Omit<DBPendingAgentTask, 'id' | 'createdAt' | 'logs' | 'retryCount' | 'status'>) {
    const db = this.read();
    const now = new Date().toISOString();
    const newTask: DBPendingAgentTask = {
      id: crypto.randomUUID(),
      agentId: task.agentId,
      merchantId: task.merchantId,
      title: task.title,
      priority: task.priority || 'medium',
      status: 'PENDING',
      logs: [],
      retryCount: 0,
      toolCalls: task.toolCalls || [],
      createdAt: now,
      result: undefined
    };
    db.agent_tasks.unshift(newTask);
    this.publishEvent('agent.task.enqueued', { taskId: newTask.id, merchantId: newTask.merchantId }, 'TASK_QUEUE', 'AGENT_ENGINE', { priority: newTask.priority });
    this.write(db);
    return newTask;
  }

  // Requeue any tasks that were leased but not completed within leaseTimeoutMs
  public static requeueExpiredLeases(leaseTimeoutMs = 120000, maxRetries = 3) {
    const db = this.read();
    const now = Date.now();
    let recovered = 0;
    for (const t of db.agent_tasks) {
      if (t.status === 'THINKING' && t.leasedAt) {
        const leased = new Date(t.leasedAt).getTime();
        if (isNaN(leased) || (now - leased) > leaseTimeoutMs) {
          t.retryCount = (t.retryCount || 0) + 1;
          if (t.retryCount > maxRetries) {
            t.status = 'FAILED';
            t.logs = (t.logs || []).concat([`Moved to FAILED after ${t.retryCount} retries (lease expired).`]);
            this.publishEvent('agent.task.failed', { taskId: t.id, merchantId: t.merchantId }, 'TASK_QUEUE', 'AGENT_ENGINE', { retryCount: t.retryCount });
          } else {
            t.status = 'PENDING';
            t.leasedAt = null;
            t.logs = (t.logs || []).concat([`Lease expired, requeued (retry ${t.retryCount}).`]);
            this.publishEvent('agent.task.requeued', { taskId: t.id, merchantId: t.merchantId }, 'TASK_QUEUE', 'AGENT_ENGINE', { retryCount: t.retryCount });
          }
          recovered++;
        }
      }
    }
    if (recovered > 0) this.write(db);
    return recovered;
  }

  public static dequeueAgentTask(agentId?: string) {
    // Recover any expired leases first (default 2 minutes)
    try { this.requeueExpiredLeases(); } catch (e) { /* ignore */ }

    const db = this.read();
    const idx = db.agent_tasks.findIndex(t => t.status === 'PENDING' && (!agentId || t.agentId === agentId));
    if (idx === -1) return null;
    const task = db.agent_tasks[idx];
    task.status = 'THINKING';
    task.leasedAt = new Date().toISOString();
    this.log('AGENT_WORKER', 'AGENT_ENGINE', 'TASK_DEQUEUED', 'AGENT_ENGINE', `Dequeued task ${task.id} for agent ${task.agentId}`);
    this.write(db);
    return task;
  }

  public static listPendingAgentTasks(merchantId?: string) {
    const db = this.read();
    return db.agent_tasks.filter(t => t.status === 'PENDING' && (!merchantId || t.merchantId === merchantId));
  }

  // --- Lightweight transaction recorder ---
  public static recordTransaction(tx: Omit<DBTransaction, 'id' | 'createdAt'>) {
    const db = this.read();
    const now = new Date().toISOString();
    const newTx: DBTransaction = {
      id: crypto.randomUUID(),
      userId: tx.userId,
      merchantId: tx.merchantId,
      type: tx.type,
      amount: tx.amount,
      currency: tx.currency || 'CNY',
      status: tx.status || 'completed',
      description: tx.description || '',
      createdAt: now
    };
    db.transactions.unshift(newTx);
    this.log(tx.userId || 'SYSTEM', 'FINANCE_ENGINE', 'TRANSACTION_RECORDED', 'FINANCE', `Recorded transaction ${newTx.id} ${newTx.amount}`);
    this.write(db);
    return newTx;
  }

}
