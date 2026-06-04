// MODAUI Unified Enterprise System Type System
// Aligned with Google Firestore Schema and SaaS Multi-tenant Architecture

export interface SysUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'admin' | 'merchant' | 'auditor' | 'customer';
  vipTier: 'basic' | 'pro' | 'enterprise';
  createdAt: string;
}

export interface TenantConfig {
  tenantId: string;
  merchantName: string;
  industryId: string;
  operatingMode: 'manual' | 'assistance' | 'full_auto';
  selectedPlan: string;
  setupCompleted: boolean;
  onboardingStep: number;
  stripeAccountId?: string;
  walletBalance: number;
  dailyTokenLimit: number;
  dailyTokenConsumed: number;
  createdAt: string;
}

export interface SPUProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  image: string;
  category: string;
  desc: string;
  sales: number;
  rating: string;
  specs: {
    sizes: string[];
    labels: string;
  };
  vectorMatched?: boolean;
}

export interface CustomerOrder {
  id: string;
  time: string; // HH:mm:ss for day-charts
  location: string; // Table number, shipping address, or room seat
  desc: string; // e.g., "亚麻黑袍 x 1, 纯白打底 x 2"
  price: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'refunded' | 'cancelled';
  type: 'takeout' | 'dine_in' | 'delivery';
  customerName: string;
  phone: string;
  tracking: string; // Logistic express tracking number (SF Air express tracker format target)
}

export interface BillingTransaction {
  id: string;
  orderId?: string;
  amount: number;
  clientName: string;
  time: string; // YYYY-MM-DD HH:mm:ss
  method: 'Stripe' | 'Alipay' | 'WeChatPay' | 'PayPal';
  type: 'order_payment' | 'saas_subscription' | 'api_overage';
  status: 'pending' | 'settled' | 'refunded';
  tokenConsumed: number;
  description: string;
}

export interface RAGKnowledgeChunk {
  id: string;
  title: string;
  content: string;
  category: 'industry' | 'product' | 'marketing' | 'corporate';
  tokenCount: number;
  vectorSimScore?: number;
  createdAt: string;
}

export interface SysAuditLog {
  id: string;
  timestamp: string;
  tenantId: string;
  username: string;
  role: string;
  component: string;
  action: string;
  details: string;
  severity: 'info' | 'warn' | 'error' | 'security';
}

export interface SystemCronJob {
  id: string;
  name: string;
  cronExpr: string;
  task: string;
  priority: 'URGENT' | 'NORMAL' | 'DEFERRED';
  assignee: string; // Agent name, e.g., "Soren (运营综合)"
  status: 'idle' | 'running' | 'paused';
  failureCount: number;
  lastRun: string;
}

// === FINANCE & WALLET MODULE TYPES ===

export interface CurrencyInfo {
  id: string;
  code: string;
  name: string;
  symbol: string;
  rate: number;
  status: boolean;
}

export interface PaymentLinkInfo {
  id: string;
  amount: number;
  currency: string;
  description: string;
  url: string;
  status: 'active' | 'inactive';
}

export interface VirtualCardInfo {
  id: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardHolder: string;
  balance: number;
  currency: string;
  status: 'active' | 'blocked';
}

export interface P2POfferInfo {
  id: string;
  type: 'buy' | 'sell';
  amount: number;
  currency: string;
  rate: number;
  paymentMethod: string;
}

export interface WalletOverview {
  balance: number;
  currency: string;
  earnings: number;
  referralBalance: number;
  recentTransactions: BillingTransaction[];
}

