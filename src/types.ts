export type FlowStep = 
  | 'LANDING' 
  | 'CHOOSE_INDUSTRY' 
  | 'LOGIN' 
  | 'SELECT_MODE' 
  | 'ONBOARDING' 
  | 'DASHBOARD'
  | 'CUSTOMER_STOREFRONT'
  | 'AI_TEAMS'
  | 'AI_RUNTIME'
  | 'KNOWLEDGE_BASE'
  | 'PLATFORM_ADMIN';

export interface Industry {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  desc: string;
}

export interface TeamMember {
  role: string;
  emoji: string;
  name: string;
  desc: string;
  status: 'offline' | 'recruiting' | 'active' | 'sleeping';
  tasks: string[];
}

export interface IndustryData {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  bgColor: string;
  team: TeamMember[];
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
}

export interface OperatingStrategy {
  id: string;
  name: string;
  tag: string;
  desc: string;
  intensity: 'low' | 'medium' | 'high';
}

export interface TaskLog {
  id: string;
  timestamp: string;
  sender: string;
  emoji: string;
  message: string;
  type: 'info' | 'success' | 'alert' | 'warn' | 'error';
}

export interface ChatMessage {
  id: string;
  sender: string;
  role: string;
  emoji: string;
  message: string;
  timestamp: string;
  isUser: boolean;
  actionDetected?: {
    type: string;
    title: string;
    success: boolean;
    param1?: string;
    param2?: string;
  };
  generatedPoster?: {
    title: string;
    subtitle: string;
    theme: string;
    image: string;
    isDeployed: boolean;
  };
  generatedCopywriting?: {
    title: string;
    body: string;
    tags: string[];
    rating: number;
    emotionalScore: number;
    tone: 'classic' | 'hype' | 'intellectual';
  };
  generatedPrediction?: {
    name: string;
    price: number;
    markup: number;
    cost: number;
    predictedROI: number;
    isUploaded: boolean;
  };
  analyzedImage?: {
    name: string;
    detectedSPUs: string[];
    colorPalette: string[];
    suggestedPrice: number;
    textIdea: string;
    imageBase64: string;
  };
}

// --- E-commerce / Financial Types ---
export interface Order {
  id: string;
  orderId: string;
  customerId: string;
  items: Array<{ productId: string; skuId?: string; quantity: number; unitPrice: number }>;
  quantity: number;
  unitPrice?: number;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'refunded';
  shippingProvider?: 'SF' | 'ZTO' | 'RTO' | '顺丰' | '中通' | '圆通' | string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
  paymentMethod?: 'wechat' | 'alipay' | 'stripe' | 'paypal' | string;
  paymentStatus?: 'unpaid' | 'paid' | 'refunded';
}

export interface Customer {
  id: string;
  email: string;
  phone?: string;
  name: string;
  totalSpent: number;
  orderCount: number;
  lastOrderDate?: string;
  loyaltyPoints: number;
  vipLevel?: 'bronze' | 'silver' | 'gold' | 'platinum';
  tags: string[];
}

export interface SKU {
  id: string;
  spuId: string;
  sku: string;
  name: string;
  image?: string;
  color?: string;
  size?: string;
  inventory: number;
  price: number;
  cost?: number;
  barcode?: string;
  status: 'active' | 'discontinued';
  createdAt?: string;
}

export interface SPU {
  id: string;
  name: string;
  category?: string;
  description?: string;
  images?: string[];
  skus?: SKU[];
  rating?: number;
  salesCount?: number;
}

export interface FinancialMetrics {
  date: string;
  revenue: number;
  cost: number;
  grossProfit: number;
  grossMargin: number;
  refunds: number;
}
