// Business-specific Type Definitions (isolated from AI system types)
// Keep these types focused on commerce, orders, CRM and finance

export interface OrderItem {
  productId: string;
  skuId?: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderId: string;
  customerId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'refunded';
  shippingProvider?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt?: string;
  paymentMethod?: string;
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
  status?: 'active' | 'discontinued';
}

export interface SPU {
  id: string;
  name: string;
  category?: string;
  description?: string;
  images?: string[];
  skus?: SKU[];
}

export interface FinancialMetrics {
  date: string;
  revenue: number;
  cost: number;
  grossProfit: number;
  grossMargin: number;
  refunds: number;
}
