import React from 'react';

export interface Manager {
  roleId: string;
  role: string;
  emoji: string;
  name: string;
  desc: string;
  welcome: string;
  specialty: string;
}

export const getManagers = (industryId: string): Manager[] => {
  if (industryId === 'catering') {
    return [
      {
        roleId: 'designer',
        role: 'AI设计师',
        emoji: '🍽️',
        name: '视觉陈列师 Kai',
        desc: '负责门脸品牌设计、线上美团/点评菜单视觉编排和一句话生成高还原度海报。主要负责：店铺 70%、产品 30%。',
        welcome: '我是您的 AI设计师Kai。我负责店铺首页设计、Banner海报排布、视觉美化与一站式宣传图生成。主要对接「店铺页面」！',
        specialty: '海报设计及排版、线上菜单视觉呈现、品牌形象VI'
      },
      {
        roleId: 'product_mgr',
        role: 'AI商品经理',
        emoji: '🍜',
        name: '菜品研发官 Ren',
        desc: '负责菜品新品开发、外卖菜单打样、物料扣率精算与零售定价。主要负责：产品 100%。',
        welcome: '我是您的 AI商品经理Ren。我负责菜品新品研发、SKU属性与录单维护、毛利与采购成本定价。主要对接「产品页面」！',
        specialty: '新品概念配置、零售菜谱溢价评估、采购供应链核算'
      },
      {
        roleId: 'ops_mgr',
        role: 'AI运营经理',
        emoji: '📈',
        name: '门店运营官 Lulu',
        desc: '负责线上接单调度、即时客诉与秒级异常退款拦截、资金合规对账。主要负责：订单、客户与销量/财务分析。',
        welcome: '我是您的 AI运营经理Lulu。我负责全网订单接单调度、客诉拦截与退款处理、进销存异常告警及每晚财务结账复盘。主要对接「订单、客户、分析」页面！',
        specialty: '极客订单履约、多退款拦截安抚、流水一键审计'
      },
      {
        roleId: 'marketing_mgr',
        role: 'AI营销经理',
        emoji: '📣',
        name: '餐饮营销官 Soren',
        desc: '精算营销代金券、霸王餐引流案、探店KOL宣发文案内容撰写。主要负责：营销 100%。',
        welcome: '我是您的 AI营销经理Soren。我负责全网引流活动策划、满减代金券计算投放、探店KOL宣发文案。主要对接「营销页面」！',
        specialty: '满减精算折扣、活动策划与KOL内容、美团大众推广投放'
      }
    ];
  } else if (industryId === 'retail') {
    return [
      {
        roleId: 'designer',
        role: 'AI设计师',
        emoji: '🏪',
        name: '店铺设计师 Dax',
        desc: '负责百货门脸平面设计、网店视觉海报排布和橱窗创意陈列。主要负责：店铺 70%、产品 30%。',
        welcome: '我是您的 AI设计师Dax。我负责百货门脸平面设计、网站Banner排版、橱窗视觉呈现创意渲染。主要对接「店铺页面」！',
        specialty: '线上橱窗陈列、配色方案制定、店头氛围美化二创'
      },
      {
        roleId: 'product_mgr',
        role: 'AI商品经理',
        emoji: '📦',
        name: '选品好手 Barton',
        desc: '精研新型百货分类、新品SPU自动建档、毛利预算核定与零售溢价。主要负责：产品 100%。',
        welcome: '我是您的 AI商品经理Barton。我负责百货商品开发与科学选品定价、SKU多规格管理、上架SPU录单、进销存监控。主要对接「产品页面」！',
        specialty: '百货新品研发、快反库存配比、商品录单与价格打法'
      },
      {
        roleId: 'ops_mgr',
        role: 'AI运营经理',
        emoji: '📈',
        name: '运营专家 Cyrus',
        desc: '主导网店订单发货、顺丰快递官方揽收通知对接、精细CRM客户关怀与销量财务报表。主要负责：订单、客户与销量/财务分析。',
        welcome: '我是您的 AI运营经理Cyrus。我负责百货业务日常订单履约、客诉退款拦截、分销跟单与每日资金大盘审计。主要对接「订单、客户、分析」页面！',
        specialty: '订单极速下发发货、客诉秒级关怀拦截、分销渠道数据结转'
      },
      {
        roleId: 'marketing_mgr',
        role: 'AI营销经理',
        emoji: '📣',
        name: '营销专家 Nova',
        desc: '撰写社媒裂变推介内容、大促销优惠券发放方案、及流量直通车竞价调优。主要负责：营销 100%。',
        welcome: '我是您的 AI营销经理Nova。我负责线上大促优惠券配置、小红书/微群文案创意输出、直通车精准预算调优。主要对接「营销页面」！',
        specialty: '精敏直通车调价竞价、大促满减券派发策略、品牌曝光推播策划'
      }
    ];
  } else {
    // Default: 'fashion' 服装公司
    return [
      {
        roleId: 'designer',
        role: 'AI设计师',
        emoji: '👗',
        name: '时装设计师 Aria',
        desc: '负责服装线上装修、版图搭配、微店页面整体视觉设计与UI风格排布。配置比例：店铺 70%、产品 30%。',
        welcome: '我是您的 AI设计师 Aria。我负责服装页面的视觉陈列、首页海报视觉设计、详情页穿搭排版。主要精力负责「店铺页面」与部分「产品详情」！',
        specialty: '线上橱窗陈列、配色方案制定、海报视觉设计渲染'
      },
      {
        roleId: 'product_mgr',
        role: 'AI商品经理',
        emoji: '👚',
        name: '选品好手 Barton',
        desc: '负责服装面料比对、潮流选品、极速快反打样排单与价格核定。配置比例：产品 100%。',
        welcome: '我是您的 AI商品经理 Barton。我负责服装商品研发选品、规格多SKU/SPU建档上架及毛利定价。全权负责「产品页面」！',
        specialty: '潮流热词选款、快反打样物耗、服装溢价与毛利率策略'
      },
      {
        roleId: 'ops_mgr',
        role: 'AI运营经理',
        emoji: '📈',
        name: '跟单专家 Cyrus',
        desc: '负责分销渠道、SPU库存红线监控、一站式发往顺丰极速托揽与日常退款纠纷。配置比例：订单、客户、分析页面。',
        welcome: '我是您的 AI运营经理 Cyrus。我负责订单一件代发托管、顺丰揽件打单、客户CRM退换退款拦截、资金损益对账。全权管控「订单、客户、分析」页面！',
        specialty: '订单托管揽件、顺丰一件代发对接、每日资金结算周报'
      },
      {
        roleId: 'marketing_mgr',
        role: 'AI营销经理',
        emoji: '📣',
        name: '宣发大咖 Daphne',
        desc: '主导活动策划、全网优惠代金券发放、投放广告ROI精细化调优及博主寄样。配置比例：营销 100%。',
        welcome: '我是您的 AI营销经理 Daphne。我负责活动策划、优惠代金券发放、推广ROI调优与小红书等社媒带货文案输出。全权对接「营销页面」！',
        specialty: '小红书潮流穿搭种草文案、抖音短视起拍脚本、千万粉博主派样'
      }
    ];
  }
};

export const SlsTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#09090B] border border-[#2F3336] p-3 rounded-lg shadow-xl font-mono text-xs text-neutral-200">
        <p className="font-bold mb-1 text-white">{label}</p>
        <p className="text-sky-400">
          销售额: <span className="font-bold">¥{Number(payload[0].value).toFixed(2)}</span>
        </p>
      </div>
    );
  }
  return null;
};

export const ChnTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#09090B] border border-[#2F3336] p-3 rounded-lg shadow-xl font-mono text-xs text-neutral-200">
        <p className="font-bold mb-1 text-white">{label}</p>
        <p className="text-indigo-400">
          获客比率: <span className="font-bold">{payload[0].value}%</span>
        </p>
      </div>
    );
  }
  return null;
};

export const getIndustryDefaultHeadline = (indId: string) => {
  const defaults: Record<string, string> = {
    fashion: '👗 Aria 季风高定系列 · 舒感美学新风尚',
    catering: '☕ Tyson Cafe · 经典美式/手作拿铁特惠',
    retail: '✈️ 全球尖货精选直邮 · 发现品质生活好物',
    beauty: '💄 Coco Salon · 焕活平衡 SPA 与定制深层理疗',
    fitness: '🏋️ Kelly Gym · 尊享周度私教定制与低碳膳食',
    jewelry: '💎 18K足金古法拉丝龙凤金镯 · 匠人高定传承',
    home: '🛋️ 空间美学 · 环保级棉麻主卧全套风格软装'
  };
  return defaults[indId] || defaults.catering;
};
