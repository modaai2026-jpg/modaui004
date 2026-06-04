/**
 * ===== Business System Types (独立业务系统，不混入 AI 系统) =====
 * 这个文件定义所有行业后台通用的类型
 * 严格与 AI 系统类型分离
 */

// ===== 行业类型 =====
export type IndustryType = 'fashion' | 'catering' | 'retail' | 'beauty' | 'hotel' | 'influencer';

// ===== 后台菜单项 =====
export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  component: string;
  badge?: number;
  enabled: boolean;
}

// ===== 后台仪表板小部件 =====
export interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'list' | 'table';
  size: 'small' | 'medium' | 'large';
  data?: any;
  enabled: boolean;
}

// ===== 行业后台配置 =====
export interface IndustryBackendConfig {
  industryId: IndustryType;
  industryName: string;
  menuItems: MenuItem[];
  dashboardWidgets: DashboardWidget[];
  defaultColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  enabled: boolean;
}

// ===== 订单相关 =====
export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  sku?: string;
}

export interface Order {
  id: string;
  orderId: string;
  customerId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'refunded';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  paymentMethod: 'wechat' | 'alipay' | 'stripe' | 'paypal';
  shippingAddress?: string;
  shippingCarrier?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

// ===== 客户相关 =====
export interface Customer {
  id: string;
  email: string;
  phone?: string;
  name: string;
  avatar?: string;
  totalSpent: number;
  orderCount: number;
  lastOrderDate?: string;
  vipLevel: 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';
  tags: string[];
  createdAt: string;
  notes?: string;
}

// ===== 产品相关 =====
export interface SKU {
  id: string;
  spuId: string;
  sku: string;
  name: string;
  image: string;
  attributes: Record<string, any>;
  inventory: number;
  price: number;
  cost: number;
  status: 'active' | 'discontinued';
  createdAt: string;
}

export interface SPU {
  id: string;
  name: string;
  category: string;
  description: string;
  images: string[];
  skus: SKU[];
  rating: number;
  salesCount: number;
  createdAt: string;
}

// ===== 财务相关 =====
export interface Transaction {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  channel: string;
  status: 'completed' | 'failed' | 'refunded';
  createdAt: string;
}

export interface CostBreakdown {
  productCost: number;
  shippingCost: number;
  platformFee: number;
  otherCosts: number;
  totalCost: number;
}

export interface FinancialMetrics {
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  grossMargin: number;
  netProfit: number;
  netMargin: number;
  date: string;
}

// ===== 库存相关 =====
export interface InventoryLog {
  id: string;
  skuId: string;
  changeType: 'in' | 'out' | 'adjustment' | 'return';
  quantity: number;
  reason: string;
  createdAt: string;
}

export interface InventoryForecast {
  skuId: string;
  currentStock: number;
  predictedDemand: number[];
  recommendedRestockQty: number;
  recommendedRestockDate: string;
}

// ===== 物流相关 =====
export interface Shipment {
  id: string;
  orderId: string;
  carrier: 'SF' | 'ZTO' | 'RTO' | '顺丰' | '中通' | '圆通';
  waybillNo: string;
  status: 'pending' | 'picked' | 'shipped' | 'in_transit' | 'delivered' | 'failed';
  shippingAddress: string;
  shippedAt?: string;
  deliveredAt?: string;
  trackingEvents: TrackingEvent[];
}

export interface TrackingEvent {
  timestamp: string;
  status: string;
  location: string;
  detail: string;
}

// ===== 营销相关 =====
export interface Campaign {
  id: string;
  name: string;
  type: 'discount' | 'coupon' | 'flash_sale' | 'bundle';
  description: string;
  startDate: string;
  endDate: string;
  targetAudience: string;
  budget?: number;
  status: 'draft' | 'active' | 'paused' | 'ended';
  metrics?: CampaignMetrics;
}

export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  roi: number;
}

// ===== 行业特定类型 =====

// 服装
export interface FashionProduct extends SPU {
  season?: string;
  style?: string;
  material?: string;
}

// 餐饮
export interface MenuItem_Catering {
  id: string;
  name: string;
  description: string;
  category: 'appetizer' | 'main' | 'dessert' | 'beverage';
  price: number;
  cost: number;
  image: string;
  available: boolean;
  preparationTime: number;
}

export interface DiningOrder extends Order {
  tableNumber?: string;
  dining_type: 'dine_in' | 'takeout' | 'delivery';
}

// 美业
export interface BeautyService {
  id: string;
  name: string;
  category: string;
  duration: number; // 分钟
  price: number;
  cost: number;
  staffRequired: number;
}

export interface ServiceAppointment {
  id: string;
  customerId: string;
  serviceId: string;
  staffId: string;
  appointmentTime: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  totalPrice: number;
}

export interface StaffSchedule {
  id: string;
  staffId: string;
  date: string;
  shifts: {
    start: string;
    end: string;
    appointments: ServiceAppointment[];
  }[];
}

// 酒店
export interface RoomType {
  id: string;
  name: string;
  description: string;
  capacity: number;
  basePrice: number;
  images: string[];
}

export interface Room {
  id: string;
  roomNumber: string;
  roomTypeId: string;
  status: 'available' | 'occupied' | 'maintenance' | 'dirty';
  currentGuestId?: string;
  lastCleanedAt?: string;
}

export interface HotelBooking extends Order {
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  guestName: string;
  guestPhone: string;
  specialRequests?: string;
}

// 零售
export interface RetailProduct extends SPU {
  supplier?: string;
  minStockLevel?: number;
  maxStockLevel?: number;
}

// 电商网红
export interface LivestreamSession {
  id: string;
  hostId: string;
  startTime: string;
  endTime?: string;
  title: string;
  status: 'scheduled' | 'live' | 'ended';
  viewers: number;
  gmv: number;
  products: string[]; // product IDs
}

export interface InfluencerMetrics {
  followersCount: number;
  engagementRate: number;
  avgViewsPerStream: number;
  totalGMV: number;
  conversionRate: number;
}

// ===== 通用分析指标 =====
export interface DailyMetrics {
  date: string;
  ordersCount: number;
  revenue: number;
  averageOrderValue: number;
  newCustomers: number;
  returningCustomers: number;
  conversionRate: number;
}

export interface MonthlyReport {
  month: string;
  metrics: DailyMetrics[];
  summary: {
    totalOrders: number;
    totalRevenue: number;
    totalCustomers: number;
    averageOrderValue: number;
  };
}

