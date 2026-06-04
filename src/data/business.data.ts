// Business module constants and configs (separate from AI team data)
export const BUSINESS_MODULES = {
  ORDER_STATUSES: ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded'],
  SHIPPING_CARRIERS: ['SF', 'ZTO', 'RTO', '顺丰', '中通', '圆通'],
  VIP_TIERS: ['bronze', 'silver', 'gold', 'platinum'],
  PAYMENT_CHANNELS: ['wechat', 'alipay', 'stripe', 'paypal'],
  DEFAULT_CURRENCY: 'CNY'
};
