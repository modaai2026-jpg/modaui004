import { IndustryData } from '../types';

export const DEFAULT_CATEGORIES = ['爆款推荐', '本季新品', '限时折扣', '招牌单品'];

export const DEFAULT_SUPPLIERS = [
  { id: 'sup1', name: '大同高定面料源头基地', contact: '梁经理', phone: '13812345678', category: '针织纺织类', status: '合作中' },
  { id: 'sup2', name: '云滇有机茶山庄园', contact: '罗庄主', phone: '18998765432', category: '餐饮原料类', status: '优质服务商' },
  { id: 'sup3', name: '万通精品包材制造集团', contact: '肖厂长', phone: '15566667777', category: '包装辅助材料', status: '合作中' }
];

export const DEFAULT_PURCHASE_ORDERS = [
  { id: 'PO20260601', supplierName: '云滇有机茶山庄园', productName: '极品高山乌龙茶胚', qty: 200, amount: 4800, date: '2026-06-01', status: '已发货' },
  { id: 'PO20260602', supplierName: '大同高定面料源头基地', productName: '100%精梳长绒棉布匹', qty: 50, amount: 12500, date: '2026-06-02', status: '等待付款' }
];

export const DEFAULT_DRAFT_ORDERS = [
  { id: 'DR1001', customerName: '张敏捷 (大客户渠道)', items: '首发重磅卫衣 x10', total: 2990, date: '2026-06-03', status: '待审核' },
  { id: 'DR1002', customerName: '李思聪 (企业定制专区)', items: '定制印花礼盒 x50', total: 8500, date: '2026-06-03', status: '草稿' }
];

export const DEFAULT_COUPONS = [
  { code: 'VIP888', discount: 12, desc: 'VIP全店通用直减 ¥12', minSpend: 100, active: true },
  { code: 'MODA666', discount: 20, desc: '公司开业百万红包 ¥20', minSpend: 150, active: true },
  { code: 'WELCOME5', discount: 5, desc: '新人关注即送 ¥5 无门槛', minSpend: 0, active: true }
];

export const DEFAULT_CUSTOMER_TAGS = ['白金会员', '高频消遣', '沉睡客群', '首购新客', '餐饮狂热粉'];

export const DEFAULT_SKU_VARIANTS = [
  { name: '尺寸: M | 颜色: 玄黑', price: 199, stock: 45 },
  { name: '尺寸: L | 颜色: 玄黑', price: 199, stock: 60 },
  { name: '尺寸: M | 颜色: 霜白', price: 219, stock: 30 },
  { name: '尺寸: L | 颜色: 霜白', price: 219, stock: 55 }
];

export const DEFAULT_B2B_CUSTOMERS = [
  { id: 'b2b-01', company: '望京SOHO联合办公集团', contact: '沈总', creditLimit: 50000, usedCredit: 12000, termDays: 30 },
  { id: 'b2b-02', company: '爱琴海美业连锁机构', contact: '王经理', creditLimit: 20000, usedCredit: 4500, termDays: 15 }
];

export const MEMBER_AVATARS: Record<string, string> = {
  'Aria': '/src/assets/images/fashion_designer_aria_1780453654705.png',
  'Barton': '/src/assets/images/fashion_buyer_barton_1780453671012.png',
  'Kai': '/src/assets/images/catering_chef_kai_1780453688255.png',
  'Lulu': '/src/assets/images/catering_ops_lulu_1780453703816.png',
};

export const getIndustryDefaultProducts = (industryId: string) => {
  if (industryId === 'catering') {
    return [
      { id: 'p1', name: '冰美式', price: 18, stock: 120, image: '🥤', category: '咖啡', desc: '清爽顺滑，经典之选，100%阿拉比卡咖啡豆。', sales: 0, rating: '100%', specs: { sizes: ['中杯 ¥18', '大杯 ¥22', '超大杯 ¥26'], labels: '标准/少冰/去冰' } },
      { id: 'p2', name: '拿铁咖啡', price: 28, stock: 85, image: '☕', category: '咖啡', desc: '经典比例，奶香浓郁，自然甘甜，丝滑口感。', sales: 0, rating: '100%', specs: { sizes: ['中杯 ¥28', '大杯 ¥32', '超大杯 ¥36'], labels: '常温/少冰/去冰' } },
      { id: 'p3', name: '生椰拿铁', price: 28, stock: 140, image: '🥥', category: '咖啡', desc: '椰香浓郁，口感顺滑，香甜醇厚，一口惊艳。', sales: 0, rating: '100%', specs: { sizes: ['中杯 ¥28', '大杯 ¥32', '超大杯 ¥36'], labels: '推荐冰饮' } }
    ];
  }
  return [
    { id: 'p1', name: '法式单排扣羊毛经典风衣', price: 680, stock: 120, image: '👗', category: '外套', desc: '100%美利奴高支全羊毛面料，利落意式手工剪裁', sales: 0 }
  ];
};
