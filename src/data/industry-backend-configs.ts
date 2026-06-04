import type { IndustryBackendConfig } from '../types/business.types';

export const INDUSTRY_BACKEND_CONFIGS: Record<string, IndustryBackendConfig> = {
  fashion: {
    industryId: 'fashion',
    industryName: '服装',
    enabled: true,
    defaultColors: { primary: '#1f2937', secondary: '#f97316', accent: '#ef4444' },
    menuItems: [
      { id: 'sales', label: '销售概览', icon: 'BarChart3', path: '/business/fashion/sales', component: 'FashionSalesOverview', enabled: true },
      { id: 'products', label: '选品管理', icon: 'ShoppingBag', path: '/business/fashion/products', component: 'FashionProductMgmt', enabled: true },
      { id: 'inventory', label: '库存管理', icon: 'Box', path: '/business/fashion/inventory', component: 'FashionInventory', enabled: true },
      { id: 'orders', label: '订单物流', icon: 'Package', path: '/business/fashion/orders', component: 'FashionOrders', enabled: true },
      { id: 'finance', label: '财务对账', icon: 'CreditCard', path: '/business/fashion/finance', component: 'FashionFinance', enabled: true },
    ],
    dashboardWidgets: [],
  },
  catering: {
    industryId: 'catering',
    industryName: '餐饮',
    enabled: true,
    defaultColors: { primary: '#065f46', secondary: '#f59e0b', accent: '#ef4444' },
    menuItems: [
      { id: 'sales', label: '销售概览', icon: 'BarChart3', path: '/business/catering/sales', component: 'CateringSalesOverview', enabled: true },
      { id: 'menu', label: '菜单管理', icon: 'Utensils', path: '/business/catering/menu', component: 'CateringMenuMgmt', enabled: true },
      { id: 'delivery', label: '外卖配送', icon: 'Truck', path: '/business/catering/delivery', component: 'CateringDelivery', enabled: true },
      { id: 'orders', label: '订单管理', icon: 'ListChecks', path: '/business/catering/orders', component: 'CateringOrders', enabled: true },
      { id: 'reviews', label: '评价管理', icon: 'Star', path: '/business/catering/reviews', component: 'CateringReviews', enabled: true },
    ],
    dashboardWidgets: [],
  },
  retail: {
    industryId: 'retail',
    industryName: '零售',
    enabled: true,
    defaultColors: { primary: '#0f172a', secondary: '#06b6d4', accent: '#7c3aed' },
    menuItems: [
      { id: 'sales', label: '销售概览', icon: 'BarChart3', path: '/business/retail/sales', component: 'RetailSalesOverview', enabled: true },
      { id: 'sku', label: 'SKU 管理', icon: 'Boxes', path: '/business/retail/sku', component: 'RetailSKU', enabled: true },
      { id: 'inventory', label: '库存', icon: 'Warehouse', path: '/business/retail/inventory', component: 'RetailInventory', enabled: true },
      { id: 'supply', label: '供应链', icon: 'Truck', path: '/business/retail/supply', component: 'RetailSupply', enabled: true },
    ],
    dashboardWidgets: [],
  },
  beauty: {
    industryId: 'beauty',
    industryName: '美业',
    enabled: true,
    defaultColors: { primary: '#6b21a8', secondary: '#f472b6', accent: '#f59e0b' },
    menuItems: [
      { id: 'sales', label: '销售概览', icon: 'BarChart3', path: '/business/beauty/sales', component: 'BeautySalesOverview', enabled: true },
      { id: 'services', label: '服务项目', icon: 'Scissors', path: '/business/beauty/services', component: 'BeautyServices', enabled: true },
      { id: 'appointments', label: '预约排班', icon: 'Calendar', path: '/business/beauty/appointments', component: 'BeautyAppointments', enabled: true },
      { id: 'members', label: '会员管理', icon: 'Users', path: '/business/beauty/members', component: 'BeautyMembers', enabled: true },
    ],
    dashboardWidgets: [],
  },
  hotel: {
    industryId: 'hotel',
    industryName: '酒店',
    enabled: true,
    defaultColors: { primary: '#0b3d91', secondary: '#00a3ff', accent: '#ff7a00' },
    menuItems: [
      { id: 'overview', label: '入住概览', icon: 'Hotel', path: '/business/hotel/overview', component: 'HotelOverview', enabled: true },
      { id: 'rooms', label: '房间管理', icon: 'Door', path: '/business/hotel/rooms', component: 'HotelRooms', enabled: true },
      { id: 'bookings', label: '预订日历', icon: 'Calendar', path: '/business/hotel/bookings', component: 'HotelBookings', enabled: true },
      { id: 'cleaning', label: '清洁派单', icon: 'Broom', path: '/business/hotel/cleaning', component: 'HotelCleaning', enabled: true },
    ],
    dashboardWidgets: [],
  },
  influencer: {
    industryId: 'influencer',
    industryName: '网红',
    enabled: true,
    defaultColors: { primary: '#d946ef', secondary: '#06b6d4', accent: '#f97316' },
    menuItems: [
      { id: 'streams', label: '直播间', icon: 'Video', path: '/business/influencer/streams', component: 'InfluencerStreams', enabled: true },
      { id: 'products', label: '选品库', icon: 'Tag', path: '/business/influencer/products', component: 'InfluencerProducts', enabled: true },
      { id: 'fans', label: '粉丝管理', icon: 'Users', path: '/business/influencer/fans', component: 'InfluencerFans', enabled: true },
      { id: 'finance', label: '分账与结算', icon: 'CreditCard', path: '/business/influencer/finance', component: 'InfluencerFinance', enabled: true },
    ],
    dashboardWidgets: [],
  },
};

export default INDUSTRY_BACKEND_CONFIGS;
