// MODAUI API Unified Service Layer for Express integration
// Bridging React frontend with standard server-side endpoints

import { auth } from './firebase';
import { 
  SysUser, 
  TenantConfig, 
  SPUProduct, 
  CustomerOrder, 
  BillingTransaction, 
  RAGKnowledgeChunk, 
  SysAuditLog, 
  SystemCronJob 
} from '../types/modaui';

// Helper to extract the tenant ID directly from logged in user email or local session fallback
export const getActiveTenantId = (): string => {
  const userEmail = auth.currentUser?.email || localStorage.getItem('preview_user_email');
  if (userEmail) {
    return userEmail.replace(/[^a-zA-Z0-9]/g, '_');
  }
  return localStorage.getItem('preview_tenant_id') || 'default_tenant';
};

// Generic handle response helper
const handleResponse = async (res: Response) => {
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `HTTP error! status: ${res.status}`);
    }
    return data;
  } else {
    const text = await res.text();
    if (!res.ok) {
      throw new Error(text || `HTTP error! status: ${res.status}`);
    }
    return { success: true, text };
  }
};

// Helper to get authenticated headers
const getAuthHeaders = async (customHeaders: Record<string, string> = {}) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders
  };
  
  if (auth.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    } catch (e) {
      console.warn("Could not get Firebase ID token:", e);
    }
  } else {
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      headers['Authorization'] = sessionId;
    }
  }
  
  return headers;
};

export const apiService = {
  // === Authentications ===
  auth: {
    async register(email: string, password: string, industryId?: string, operatingMode?: string, planId?: string, role?: string) {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, industryId, operatingMode, planId, role })
      });
      return handleResponse(res);
    },

    async login(email: string, password: string) {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      return handleResponse(res);
    },

    async socialLogin(email: string, provider: string, name?: string, avatar?: string) {
      const res = await fetch('/api/auth/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, provider, name, avatar })
      });
      return handleResponse(res);
    },

    async logout(sessionId?: string, refreshToken?: string) {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, refreshToken })
      });
      return handleResponse(res);
    },

    async me(sessionId: string) {
      const res = await fetch('/api/auth/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      return handleResponse(res);
    },

    async refresh(refreshToken: string) {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
      return handleResponse(res);
    },

    async verifyEmail(token: string) {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      return handleResponse(res);
    },

    async requestPasswordReset(email: string) {
      const res = await fetch('/api/auth/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      return handleResponse(res);
    },

    async confirmPasswordReset(token: string, newPassword: string) {
      const res = await fetch('/api/auth/password-reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });
      return handleResponse(res);
    }
  },

  // === Multi-tenants & Merchants Config ===
  merchants: {
    async list() {
      const res = await fetch('/api/merchants', {
        headers: await getAuthHeaders()
      });
      return handleResponse(res);
    },

    async create(newTenant: Partial<TenantConfig>) {
      const res = await fetch('/api/merchants', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ newTenant })
      });
      return handleResponse(res);
    },

    async suspend(tenantId: string, reason: string, suspend = true) {
      const res = await fetch(`/api/merchants/${tenantId}/suspend`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ reason, suspend })
      });
      return handleResponse(res);
    }
  },

  // === Stores Custom configurations ===
  stores: {
    async get(id: string) {
      const res = await fetch(`/api/stores/${id}`, {
        headers: await getAuthHeaders()
      });
      return handleResponse(res);
    },

    async update(id: string, storeData: { name?: string; domain?: string; branding?: { logo?: string; colorTheme?: string; bannerText?: string } }) {
      const res = await fetch(`/api/stores/${id}`, {
        method: 'PUT',
        headers: await getAuthHeaders(),
        body: JSON.stringify(storeData)
      });
      return handleResponse(res);
    }
  },

  // === Cart Service API (Dynamically verified server-backed state) ===
  cart: {
    async get(userId: string) {
      const res = await fetch(`/api/cart?userId=${userId}`, {
        headers: await getAuthHeaders()
      });
      return handleResponse(res);
    },
    async add(userId: string, productId: string, quantity: number) {
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ userId, productId, quantity })
      });
      return handleResponse(res);
    },
    async remove(userId: string, productId: string) {
      const res = await fetch('/api/cart/remove', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ userId, productId })
      });
      return handleResponse(res);
    },
    async updateQuantity(userId: string, productId: string, quantity: number) {
      const res = await fetch('/api/cart/update-quantity', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ userId, productId, quantity })
      });
      return handleResponse(res);
    },
    async applyCoupon(userId: string, coupon: string) {
      const res = await fetch('/api/cart/coupon', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ userId, coupon })
      });
      return handleResponse(res);
    },
    async clear(userId: string) {
      const res = await fetch('/api/cart/clear', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ userId })
      });
      return handleResponse(res);
    }
  },

  // === Platform Tenants Directory & Quotas ===
  tenants: {
    async list() {
      const res = await fetch('/api/tenants', {
        headers: await getAuthHeaders()
      });
      return handleResponse(res);
    },
    async update(id: string, updateData: { quotaLimit?: number; billingStatus?: 'paid' | 'unpaid' }) {
      const res = await fetch(`/api/tenants/${id}`, {
        method: 'PUT',
        headers: await getAuthHeaders(),
        body: JSON.stringify(updateData)
      });
      return handleResponse(res);
    }
  },

  // === Platform Settings Config Center ===
  platformSettings: {
    async get() {
      const res = await fetch('/api/platform/settings', {
        headers: await getAuthHeaders()
      });
      return handleResponse(res);
    },
    async update(settings: any) {
      const res = await fetch('/api/platform/settings', {
        method: 'PUT',
        headers: await getAuthHeaders(),
        body: JSON.stringify(settings)
      });
      return handleResponse(res);
    }
  },
  configRegistry: {
    async list() {
      const res = await fetch('/api/platform/config-registry', {
        headers: await getAuthHeaders()
      });
      return handleResponse(res);
    },
    async register(item: {
      module: string;
      key: string;
      category: string;
      type: string;
      default_value: any;
      current_value: any;
      tenant_scope: string;
      description: string;
      uiPath: string;
      required: boolean;
      updated_by: string;
    }) {
      const res = await fetch('/api/platform/config-registry', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify(item)
      });
      return handleResponse(res);
    },
    async report() {
      const res = await fetch('/api/platform/config-registry/report', {
        headers: await getAuthHeaders()
      });
      return handleResponse(res);
    }
  },

  // === Industry Blueprint Templates Library ===
  templates: {
    async list() {
      const res = await fetch('/api/templates', {
        headers: await getAuthHeaders()
      });
      return handleResponse(res);
    },
    async install(tenantId: string, industryId: string) {
      const res = await fetch('/api/templates/install', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ tenantId, industryId })
      });
      return handleResponse(res);
    }
  },

  // === SPU Products CRUD (Dual synced to Firestore under individual tenant scopes) ===
  products: {
    async list(tenantId: string, industryId: string): Promise<{ success: boolean; products: SPUProduct[] }> {
      const res = await fetch(`/api/products?tenantId=${tenantId}&industryId=${industryId}`);
      return handleResponse(res);
    },

    async create(tenantId: string, industryId: string, product: SPUProduct) {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, industryId, product })
      });
      return handleResponse(res);
    },

    async update(tenantId: string, industryId: string, id: string, product: Partial<SPUProduct>) {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, industryId, product })
      });
      return handleResponse(res);
    },

    async delete(tenantId: string, industryId: string, id: string) {
      const res = await fetch(`/api/products/${id}?tenantId=${tenantId}&industryId=${industryId}`, {
        method: 'DELETE'
      });
      return handleResponse(res);
    }
  },

  // === Consumer Storefront Orders & Logistics ===
  orders: {
    async list(tenantId: string, industryId: string): Promise<{ success: boolean; orders: CustomerOrder[] }> {
      const res = await fetch(`/api/orders?tenantId=${tenantId}&industryId=${industryId}`);
      return handleResponse(res);
    },

    async create(tenantId: string, industryId: string, order: CustomerOrder) {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, industryId, order })
      });
      return handleResponse(res);
    },

    async dispatch(tenantId: string, industryId: string, id: string, trackingNum: string) {
      const res = await fetch(`/api/orders/${id}/dispatch`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, industryId, trackingNum })
      });
      return handleResponse(res);
    },

    async refund(tenantId: string, industryId: string, id: string, amount: number, reason: string) {
      const res = await fetch(`/api/orders/${id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, industryId, amount, reason })
      });
      return handleResponse(res);
    },
    async cancel(tenantId: string, industryId: string, id: string, reason: string) {
      const res = await fetch(`/api/orders/${id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, industryId, reason })
      });
      return handleResponse(res);
    },
    async return(tenantId: string, industryId: string, id: string, reason: string) {
      const res = await fetch(`/api/orders/${id}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, industryId, reason })
      });
      return handleResponse(res);
    }
  },

  // === Payments & Transactions ===
  payments: {
    async stripeCheckout(tenantId: string, amount: number, metadata: any) {
      const res = await fetch('/api/payments/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, amount, ...metadata })
      });
      return handleResponse(res);
    },

    async alipayCheckout(tenantId: string, amount: number, metadata: any) {
      const res = await fetch('/api/payments/alipay/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, amount, ...metadata })
      });
      return handleResponse(res);
    },

    async wechatCheckout(tenantId: string, amount: number, metadata: any) {
      const res = await fetch('/api/payments/wechat/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, amount, ...metadata })
      });
      return handleResponse(res);
    },

    async paypalCheckout(tenantId: string, amount: number, metadata: any) {
      const res = await fetch('/api/payments/paypal/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, amount, ...metadata })
      });
      return handleResponse(res);
    },

    async getLedger(tenantId: string): Promise<{ success: boolean; logs: BillingTransaction[] }> {
      const res = await fetch(`/api/finance/ledger?tenantId=${tenantId}`);
      return handleResponse(res);
    }
  },

  billing: {
    async subscribe(planId: string) {
      const res = await fetch('/api/billing/subscribe', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ planId })
      });
      return handleResponse(res);
    },
    async listSubscriptions() {
      const res = await fetch('/api/billing/subscriptions', {
        headers: await getAuthHeaders()
      });
      return handleResponse(res);
    },
    async listInvoices() {
      const res = await fetch('/api/billing/invoices', {
        headers: await getAuthHeaders()
      });
      return handleResponse(res);
    }
  },

  // === Extended LLM Service Integrations ===
  llm: {
    async openaiGenerate(prompt: string, model = 'gpt-4') {
      const res = await fetch('/api/ai/openai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model })
      });
      return handleResponse(res);
    },

    async ollamaGenerate(prompt: string, model = 'llama2') {
      const res = await fetch('/api/ai/ollama/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model })
      });
      return handleResponse(res);
    },

    async getLangChainAgent() {
      const res = await fetch('/api/ai/langchain/agent');
      return handleResponse(res);
    }
  },

  // === Knowledge RAG Indexing & Vector Search ===
  knowledge: {
    async list(tenantId: string): Promise<{ success: boolean; chunks: RAGKnowledgeChunk[] }> {
      const res = await fetch(`/api/knowledge?tenantId=${tenantId}`);
      return handleResponse(res);
    },

    async add(tenantId: string, title: string, content: string, category: string) {
      const res = await fetch('/api/knowledge/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, title, content, category })
      });
      return handleResponse(res);
    },

    async delete(tenantId: string, id: string) {
      const res = await fetch(`/api/knowledge/${id}?tenantId=${tenantId}`, {
        method: 'DELETE'
      });
      return handleResponse(res);
    }
  },

  // === AI Digital Employee Agents & Tasks Dispatcher ===
  agents: {
    async listTasks(tenantId: string): Promise<{ success: boolean; tasks: SystemCronJob[] }> {
      const res = await fetch(`/api/agents/tasks?tenantId=${tenantId}`);
      return handleResponse(res);
    },

    async execute(tenantId: string, agentId: string, inputMessage: string, rolePrompt: string) {
      const industryId = typeof window !== 'undefined' ? localStorage.getItem('preview_industry_id') || 'fashion' : 'fashion';
      const res = await fetch('/api/agents/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, agentId, inputMessage, rolePrompt, industryId })
      });
      return handleResponse(res);
    },

    async chat(tenantId: string, message: string, info: { employeeName: string; employeeRole: string; industryTagline: string; strategyName?: string; strategyDesc?: string }) {
      const industryId = typeof window !== 'undefined' ? localStorage.getItem('preview_industry_id') || 'fashion' : 'fashion';
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, message, industryId, ...info })
      });
      return handleResponse(res);
    },
    async workerLease(agentId?: string) {
      const res = await fetch('/api/agents/worker/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId })
      });
      return handleResponse(res);
    },

    async workerComplete(taskId: string, result: string, logs?: string[]) {
      const res = await fetch('/api/agents/worker/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, result, logs })
      });
      return handleResponse(res);
    },

    async pendingCount() {
      const res = await fetch('/api/agents/worker/pendingCount');
      return handleResponse(res);
    }
    ,
    async failedTasks() {
      const res = await fetch('/api/agents/worker/failed');
      return handleResponse(res);
    },

    async requeueExpired(leaseTimeoutMs?: number) {
      const res = await fetch('/api/agents/worker/requeue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaseTimeoutMs })
      });
      return handleResponse(res);
    }
  },

  // === Operational Documents & Platform Knowledge ===
  documents: {
    async list(tenantId?: string) {
      const url = tenantId ? `/api/operations/documents?tenantId=${tenantId}` : '/api/operations/documents';
      const res = await fetch(url, {
        headers: await getAuthHeaders()
      });
      return handleResponse(res);
    },
    async create(tenantId: string, title: string, content: string, tags: string[] = []) {
      const res = await fetch('/api/operations/documents', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ tenantId, title, content, tags })
      });
      return handleResponse(res);
    }
  },

  // === System Audit Logs & Global telemetry ===
  auditLogs: {
    async list(tenantId: string, component?: string, severity?: string): Promise<{ success: boolean; logs: SysAuditLog[] }> {
      let url = `/api/audit/logs?tenantId=${tenantId}`;
      if (component) url += `&component=${encodeURIComponent(component)}`;
      if (severity) url += `&severity=${encodeURIComponent(severity)}`;
      const res = await fetch(url, {
        headers: await getAuthHeaders()
      });
      return handleResponse(res);
    },
    async create(tenantId: string, action: string, component: string, details: string, severity: 'info' | 'warn' | 'error' | 'security' = 'info') {
      const res = await fetch('/api/audit/logs', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ tenantId, action, component, details, severity })
      });
      return handleResponse(res);
    }
  },

  // === Dynamic App Store & Extensions ===
  appStore: {
    async list() {
      const res = await fetch('/api/app-store');
      return handleResponse(res);
    },
    async install(tenantId: string, appId: string, config = {}) {
      const res = await fetch(`/api/app-store/${appId}/install`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId: tenantId, config })
      });
      return handleResponse(res);
    },
    async uninstall(tenantId: string, appId: string) {
      const res = await fetch(`/api/app-store/${appId}/uninstall`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId: tenantId })
      });
      return handleResponse(res);
    },
    async listInstallations(tenantId: string) {
      const res = await fetch(`/api/app-installations?tenantId=${tenantId}`);
      return handleResponse(res);
    }
  },

  // === Marketing Automation Campaigns ===
  campaigns: {
    async list(tenantId: string) {
      const res = await fetch(`/api/campaigns?tenantId=${tenantId}`);
      return handleResponse(res);
    },
    async create(tenantId: string, campaignData: any) {
      const res = await fetch('/api/campaigns/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId: tenantId, ...campaignData })
      });
      return handleResponse(res);
    },
    async launch(tenantId: string, campaignId: string) {
      const res = await fetch(`/api/campaigns/${campaignId}/launch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId: tenantId })
      });
      return handleResponse(res);
    },
    async getAnalytics(tenantId: string, campaignId: string) {
      const res = await fetch(`/api/campaigns/${campaignId}/analytics?tenantId=${tenantId}`);
      return handleResponse(res);
    }
  },

  // === Omni-Channel Sales Integrations ===
  channels: {
    async list(tenantId: string) {
      const res = await fetch(`/api/channels?tenantId=${tenantId}`);
      return handleResponse(res);
    },
    async connect(tenantId: string, channel: string, authCode = '') {
      const res = await fetch('/api/channels/tiktok/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId: tenantId, channel, authCode })
      });
      return handleResponse(res);
    },
    async syncProducts(tenantId: string, channels: string[]) {
      const res = await fetch('/api/channels/xiaohongshu/sync-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId: tenantId, channels })
      });
      return handleResponse(res);
    },
    async syncOrders(tenantId: string) {
      const res = await fetch('/api/channels/douyin/sync-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId: tenantId })
      });
      return handleResponse(res);
    }
  },

  // === Role-Based Access Control (RBAC) ===
  rbac: {
    async listRoles(tenantId: string) {
      const res = await fetch(`/api/roles?tenantId=${tenantId}`);
      return handleResponse(res);
    },
    async createRole(tenantId: string, roleData: any) {
      const res = await fetch('/api/roles/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId: tenantId, ...roleData })
      });
      return handleResponse(res);
    },
    async listStaff(tenantId: string) {
      const res = await fetch(`/api/staff?tenantId=${tenantId}`);
      return handleResponse(res);
    },
    async updateStaffRole(tenantId: string, staffId: string, roles: string[]) {
      const res = await fetch(`/api/staff/${staffId}/update-role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId: tenantId, roles })
      });
      return handleResponse(res);
    },
    async inviteStaff(tenantId: string, email: string, name: string, roles: string[]) {
      const res = await fetch('/api/staff/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId: tenantId, email, name, roles })
      });
      return handleResponse(res);
    }
  },

  // === Theme Designer Engine ===
  themes: {
    async list(tenantId: string) {
      const res = await fetch(`/api/themes?tenantId=${tenantId}`);
      return handleResponse(res);
    },
    async update(tenantId: string, themeId: string, config: any) {
      const res = await fetch(`/api/themes/${themeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId: tenantId, config })
      });
      return handleResponse(res);
    },
    async publish(tenantId: string, themeId: string) {
      const res = await fetch(`/api/themes/${themeId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId: tenantId })
      });
      return handleResponse(res);
    }
  },

  // === Custom Webhooks & API Keys Gateway ===
  webhooks: {
    async list(tenantId: string) {
      const res = await fetch(`/api/webhooks?tenantId=${tenantId}`);
      const data = await handleResponse(res);
      // Return registrations array if server wrapped it in { success: true, webhooks: [...] }
      if (data && data.success && Array.isArray(data.webhooks)) {
        return data.webhooks.map((w: any) => ({
          id: w.id,
          event: w.event,
          targetUrl: w.targetUrl,
          secret: `whsec_${w.id}_jwt`,
          createdTime: (w.createdAt || '').substring(0, 16).replace('T', ' ')
        }));
      }
      return data;
    },
    async register(tenantId: string, event: string, targetUrl: string) {
      const res = await fetch('/api/webhooks/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId: tenantId, event, targetUrl })
      });
      return handleResponse(res);
    },
    async delete(tenantId: string, webhookId: string) {
      const res = await fetch(`/api/webhooks/${webhookId}?tenantId=${tenantId}`, {
        method: 'DELETE'
      });
      return handleResponse(res);
    },
    async testDispatch(tenantId: string, event: string) {
      const res = await fetch('/api/webhooks/test-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId: tenantId, event })
      });
      return handleResponse(res);
    },
    async listApiKeys(tenantId: string) {
      const res = await fetch(`/api/settings/api-keys?tenantId=${tenantId}`);
      return handleResponse(res);
    },
    async createApiKey(tenantId: string, name: string) {
      const res = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId: tenantId, name })
      });
      return handleResponse(res);
    }
  },

  apiKeys: {
    async list(tenantId: string) {
      const res = await fetch(`/api/settings/api-keys?tenantId=${tenantId}`);
      const data = await handleResponse(res);
      if (data && data.success && Array.isArray(data.keys)) {
        return data.keys.map((k: any) => ({
          id: k.id,
          token: k.apiKey,
          role: k.name || 'staff',
          rateLimit: k.name === 'admin' ? 120 : k.name === 'manager' ? 60 : 30,
          createdTime: (k.createdAt || '').substring(0, 16).replace('T', ' ')
        }));
      }
      return [];
    },
    async create(tenantId: string, role: string, rateLimit: number) {
      const res = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId: tenantId, name: role })
      });
      const data = await handleResponse(res);
      return { success: true, key: data.key };
    },
    async delete(tenantId: string, keyId: string) {
      const res = await fetch(`/api/settings/api-keys/${keyId}?tenantId=${tenantId}`, {
        method: 'DELETE'
      });
      return handleResponse(res);
    }
  }
};
