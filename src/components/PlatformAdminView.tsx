import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Cpu, 
  Workflow, 
  LayoutTemplate, 
  Coins, 
  Users, 
  Settings, 
  BarChart3, 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Play, 
  Pause, 
  Lock, 
  Unlock, 
  Radio, 
  Globe, 
  ShieldAlert, 
  Clock, 
  LogOut, 
  Plus, 
  Trash2, 
  Sliders, 
  DollarSign, 
  Key, 
  Layers, 
  Activity, 
  HelpCircle,
  Menu,
  ChevronRight,
  TrendingUp,
  Send,
  Mic,
  Image as ImageIcon,
  Sparkles,
  MessageSquare,
  Terminal
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';
import AuthPanel from './platform-admin/AuthPanel';
import StoreCountCard from './platform-admin/StoreCountCard';

interface PlatformAdminViewProps {
  onBackToLanding: () => void;
  userRole?: 'founder' | 'admin' | 'manager' | 'staff' | 'customer';
  onUpdateRole?: (newRole: 'founder' | 'admin' | 'manager' | 'staff' | 'customer') => void;
  defaultView?: 'platform' | 'system';
  onNavigate?: (action: any) => void;
}

// 24H驻地专家映射表
const activeSpecialistMap: Record<string, {
  name: string;
  role: string;
  emoji: string;
  avatar: string;
  desc: string;
  suggestions: string[];
}> = {
  overview: {
    name: '对账专家 Fiona',
    role: 'AI 全局托管总监',
    emoji: '🧙',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    desc: '负责全局算力分配、多租户订阅费用审计、Token吞吐量与SaaS全局收益健康状况。',
    suggestions: ['查看算力QPS预警', '刷新全局多租户 Session', '导出本日入账分析'],
  },
  company: {
    name: '准入专家 Susan',
    role: 'AI 租户资质审计与合规经理',
    emoji: '👩‍💼',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80',
    desc: '负责多行业租户的资质初审、开户准入审计、顺丰官方配送授权证书即时核验。',
    suggestions: ['一键准入开盘理想家', '驳回蜜雪冰城挂牌申请', '审查到期挂起租户'],
  },
  ai: {
    name: '架构专家 Barton',
    role: 'AI 算力与智体调配总顾问',
    emoji: '🤖',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    desc: '负责 36 专业岗位智体的标准认知权重调整、API 流控策略部署以及 Gemini-3.5 运行率精算。',
    suggestions: ['调增 Aria 设计师权重', '启动流量智能限速模式', '重刷 AI Standard 能力缓存'],
  },
  task: {
    name: '跟单专家 Cyrus',
    role: 'AI 系统工作流与DAG调试大师',
    emoji: '👨‍🎤',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
    desc: '负责 DAG 流程断点纠错追踪、顺丰履单接口 Callback 回调核销以及阻塞队列一键解锁。',
    suggestions: ['模拟单步 DAG 运行', '重放订单 WF-8095 清关', '强制释放已排队事务'],
  },
  template: {
    name: '创意总监 Aria',
    role: 'AI 行业微调模板与Prompt架构总监',
    emoji: '🎨',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80',
    desc: '定制 6 大核心垂直行业微调模板，审查 Prompt 质量、线上橱窗与大促逻辑版本更迭。',
    suggestions: ['预装珠宝极奢保真模板', '验证 2026 最新服装词句', '一键检查餐饮满减机制'],
  },
  finance: {
    name: '财务主管 Fiona',
    role: 'AI 全栈结算与多币种金流官',
    emoji: '🧮',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    desc: '负责 Stripe 与微信支付全球账目平准、API Token 算力费用核扣以及账单对账。',
    suggestions: ['模拟 32K 租赁回调入账', '生成本日多租户毛利报表', '金价极速波动套利平盘'],
  },
  user: {
    name: '风控专家 Jane',
    role: 'AI 多租户身份安全主管',
    emoji: '👮‍♀️',
    avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=150&h=150&q=80',
    desc: '审计超级管理员和租户的登录探针、防御会话持劫异常以及 RBAC 端点权限一致性。',
    suggestions: ['检索 barbrostruck 会话', '拉黑高频无动作 Session', '强刷 RBAC 多租户一致密码'],
  },
  system: {
    name: '网管老兵 Vance',
    role: 'AI 全局加密防火墙哨官',
    emoji: '👨‍🔧',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80',
    desc: '管理 API 密钥池安全水位、即时监控安全防火墙拦截状态以及防御 DDoS 跨站请求。',
    suggestions: ['激活全局 DDoS 防御盾牌', '重刷 Stripe 密钥加密桶', '清空全局系统审计日志'],
  }
};

export default function PlatformAdminView({
  onBackToLanding,
  userRole = 'founder',
  onUpdateRole,
  defaultView = 'platform',
  onNavigate
}: PlatformAdminViewProps) {
  
  // --- NAVIGATION STATE ---
  const [activeTab, setActiveTab] = useState<'overview' | 'company' | 'ai' | 'task' | 'template' | 'finance' | 'user' | 'system'>(
    defaultView === 'system' ? 'system' : 'overview'
  );
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [kbSearch, setKbSearch] = useState<string>('');

  // --- SUB-SECTIONS STATE ---
  const [selectedSubTab, setSelectedSubTab] = useState<string>('all');

  // --- REUSABLE SIMULATION STATES ---
  const [companies, setCompanies] = useState([
    { id: 'MODA_FASHION_01', name: 'ZARA 智能快反服饰', industry: '服装快反', plan: '企业尊享版', status: '运行中', specialistCount: 6, billingCycle: '2026-06' },
    { id: 'PIZZA_HUB_FAST', name: '必胜客极速外卖', industry: '餐饮外卖', plan: '专业高级版', status: '运行中', specialistCount: 6, billingCycle: '2026-06' },
    { id: 'SAKURA_BEAUTY', name: '樱花日系美容院', industry: '美业沙龙', plan: '新手体验版', status: '服务到期', specialistCount: 4, billingCycle: '2026-05' },
    { id: 'PANDASTORE_跨境', name: '熊猫出海百货旗舰', industry: '跨境百货', plan: '企业尊享版', status: '运行中', specialistCount: 6, billingCycle: '2026-06' },
    { id: 'KINGS_FITNESS', name: '国王轻食健身连锁', industry: '运动健身', plan: '专业高级版', status: '运行中', specialistCount: 6, billingCycle: '2026-06' },
    { id: 'GOLDEN_AURA_HK', name: '金福珠宝高定工坊', industry: '高定珠宝', plan: '定制无限版', status: '运行中', specialistCount: 6, billingCycle: '2026-07' },
  ]);

  const [companyAudits, setCompanyAudits] = useState([
    { id: 'AUDIT_101', name: '理想家全屋家居定制', industry: '家居生活', contact: '张运营', time: '10分钟前' },
    { id: 'AUDIT_102', name: '蜜雪冰城智能云店', industry: '餐饮外卖', contact: '李加盟', time: '1小时前' }
  ]);

  const [specialists, setSpecialists] = useState([
    { role: '创意专家 Aria', spec: '自流文案/春季海报/小红书投产', weight: 95, state: '工作中' },
    { role: '供应链采购 Barton', spec: '款式采集/供应商自动竞价对冲', weight: 90, state: '工作中' },
    { role: '物流履约 Cyrus', spec: '顺丰API连线/空运保价极速拦截', weight: 85, state: '待命中' },
    { role: '智慧营销 Nova', spec: '商铺直通车调优/裂变文案自动分发', weight: 88, state: '工作中' },
    { role: '量本财务 Jeff', spec: '实时分摊划扣/Stripe多维度毛利结算', weight: 92, state: '工作中' },
    { role: '客户成功 Claire', spec: '过敏事件先行赔付/24h智能问答', weight: 80, state: '待命中' },
  ]);

  const [activeCapabilities, setActiveCapabilities] = useState({
    geminiFlow: true,
    sfLogistics: true,
    stripeAccounting: true,
    wechatNotify: true,
    autoAdvertising: false
  });

  const [dagStep, setDagStep] = useState<number>(0);
  const [taskLogs, setTaskLogs] = useState<string[]>([
    '【系统初始化】SaaS 总后台智体监听引擎正常绑定。',
    '【心跳包】多租户 WebSocket 通讯正常建立，延迟 8ms。'
  ]);

  const [workflowTasks, setWorkflowTasks] = useState([
    { id: 'WF-8092', name: '自动潮流SPU发布', company: 'ZARA 服饰', status: '已完成', time: '02:50' },
    { id: 'WF-8093', name: '美团外卖自动履单拦截', company: '必胜客外卖', status: '执行中', time: '02:54' },
    { id: 'WF-8094', name: '年度损益账目自动划转', company: '金福珠宝', status: '已排队', time: '02:55' },
    { id: 'WF-8095', name: '跨境清关VAT报表申报', company: '熊猫出海', status: '已失败', time: '02:40' }
  ]);

  const [industryTemplates, setIndustryTemplates] = useState([
    { code: 'clothing', name: '时尚服装快反模板', specialists: 6, nodeType: '高级工作流', rating: '9.8', apps: 420 },
    { code: 'catering', name: '智慧餐饮外卖模板', specialists: 6, nodeType: '本地即开型', rating: '9.6', apps: 310 },
    { code: 'goods', name: '跨境百货大宗模板', specialists: 6, nodeType: '多接口联动型', rating: '9.5', apps: 280 },
    { code: 'beauty', name: '丽人美业沙龙模板', specialists: 5, nodeType: '预约卡券型', rating: '9.4', apps: 195 },
    { code: 'fitness', name: '健身运动轻食模板', specialists: 5, nodeType: '社群裂变型', rating: '9.2', apps: 130 },
    { code: 'jewelry', name: '高定珠宝极奢模板', specialists: 6, nodeType: '全真挂牌型', rating: '9.9', apps: 155 },
    { code: 'home', name: '家居生活整装模板', specialists: 6, nodeType: '大件物流型', rating: '9.3', apps: 88 }
  ]);

  const [billingLogs, setBillingLogs] = useState([
    { id: 'TX-20381', customer: 'ZARA 智能服饰', amount: '￥32,000.00', desc: '企业版年订购 (Stripe)', date: '今天' },
    { id: 'TX-20382', customer: '必胜客外卖', amount: '￥3,500.00', desc: '高级版月订阅 (WeChat)', date: '今天' },
    { id: 'TX-20383', customer: '熊猫出海百货', amount: '￥4,200.00', desc: '算力流量包配额补充', date: '昨天' },
    { id: 'TX-20384', customer: '金福珠宝', amount: '￥118,000.00', desc: '定制高级AI全天候值守保障', date: '本周' }
  ]);

  const [usersList, setUsersList] = useState([
    { email: 'barbrostruck@gmail.com', role: '超级管理员(Owner)', corp: '平台直营运营组', bgLogs: '02:55' },
    { email: 'zara_ops@zara.cn', role: '公司管理员', corp: 'ZARA 智能快反服饰', bgLogs: '02:40' },
    { email: 'pizzahub_owner@pizza.com', role: '租户所有人', corp: '必胜客极速外卖', bgLogs: '02:15' },
    { email: 'beauty_salon@beauty.com', role: '常规协作者', corp: '樱花日系美容院', bgLogs: '昨天' }
  ]);

  const [apiKeys, setApiKeys] = useState([
    { name: 'GEMINI_API_KEY', key: 'sk_gemini_v4_35_secure_f0e15c3', hidden: true, host: 'Google AI Studio' },
    { name: 'STRIPE_SECRET_KEY', key: 'sk_live_51P_secured_merchant_2026', hidden: true, host: 'Stripe Global' },
    { name: 'SF_EXPRESS_APP_ID', key: 'sf_exp_2026_speedy_key', hidden: true, host: '顺丰航空货运官仓' }
  ]);

  const [firewallActive, setFirewallActive] = useState<boolean>(true);
  const [rbacMatrix, setRbacMatrix] = useState<Record<string, Record<string, boolean>>>({
    SUPER_ADMIN: { READ: true, WRITE: true, DESTROY: true },
    TENANT_OWNER: { READ: true, WRITE: true, DESTROY: false },
    AI_SPECIALIST: { READ: true, WRITE: true, DESTROY: false },
    GUEST_CLIENT: { READ: true, WRITE: false, DESTROY: false }
  });

  const [telemetryTime, setTelemetryTime] = useState<string>('');
  const [chartData, setChartData] = useState<Array<{time: string; reqs: number}>>([
    { time: '02:00', reqs: 140 },
    { time: '02:10', reqs: 180 },
    { time: '02:20', reqs: 235 },
    { time: '02:30', reqs: 210 },
    { time: '02:40', reqs: 295 },
    { time: '02:50', reqs: 342 },
    { time: '02:55', reqs: 380 }
  ]);

  // --- AI PARTNERS MEETING CHAT STATE ---
  const [aiMessages, setAiMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    { sender: 'ai', text: '您好！我是平台运维协同智脑。当前总控制台 8 大子系统已无缝接入底层。请问需要执行什么指令？', time: '2026-06-04 03:25' }
  ]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    setTelemetryTime(new Date().toUTCString());
    const timer = setInterval(() => {
      setTelemetryTime(new Date().toUTCString());
    }, 1000);

    const dataTimer = setInterval(() => {
      setChartData(prev => {
        const nextTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        const last = prev[prev.length - 1];
        const change = Math.floor((Math.random() - 0.4) * 45);
        const nextReqs = Math.max(100, Math.min(800, last.reqs + change));
        return [...prev.slice(1), { time: nextTime, reqs: nextReqs }];
      });
    }, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(dataTimer);
    };
  }, []);

  const executeDagStep = () => {
    const steps = [
      '【智能分析阶段】第1步: 解析多租户意向与算力系数 (Aria+Nova) — QPS分发就绪',
      '【对账审核阶段】第2步: 理想家开户资质与Stripe收款链绑定 (Fiona+Susan) — 成功授权',
      '【物流联调阶段】第3步: 顺丰速运一键航空舱位 Callback 配比 (Cyrus) — DELIVERED 200',
      '【清盘对账阶段】第4步: Stripe 年度对账账单结算并刷入 Firestore 审计桶 (Fiona) — SLA 归档'
    ];
    setDagStep(prev => (prev + 1) % 4);
    const now = new Date().toLocaleTimeString();
    setTaskLogs(prev => [`[${now}] ${steps[dagStep]}`, ...prev]);
  };

  const handleAuditAction = (id: string, action: 'approve' | 'reject') => {
    const record = companyAudits.find(a => a.id === id);
    if (!record) return;
    if (action === 'approve') {
      const newCorp = {
        id: `MODA_${Math.floor(Math.random() * 9000 + 1000)}`,
        name: record.name,
        industry: record.industry,
        plan: '专业高级版',
        status: '运行中',
        specialistCount: 6,
        billingCycle: '2026-06'
      };
      setCompanies([...companies, newCorp]);
    }
    setCompanyAudits(companyAudits.filter(a => a.id !== id));
  };

  const toggleRbac = (role: string, right: string) => {
    setRbacMatrix(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [right]: !prev[role][right]
      }
    }));
  };

  const toggleKeyVisibility = (name: string) => {
    setApiKeys(prev => prev.map(k => k.name === name ? { ...k, hidden: !k.hidden } : k));
  };

  // SUGGESTION CLICK TRIGGER LOGIC
  const handleSuggestionClick = (msg: string) => {
    const timeStr = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    const userMsg = { sender: 'user' as const, text: msg, time: timeStr };
    setAiMessages(prev => [...prev, userMsg]);
    
    setTimeout(() => {
      const respTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      const spec = activeSpecialistMap[activeTab];
      let reply = `[${spec.name}] 正在安全执行指令: "${msg}"...\n➔ 直连底层连线：操作已审计并生效。模块状态：GREEN_STABLE.`;
      
      if (msg.includes('32K')) {
        reply = `[Fiona] Stripe 实时计费流解扣检测成功！模拟 32,000.00 元账单已经入账。对账记录 TX-${Math.floor(Math.random()*80000)+10000} 已自动在本地归账。`;
        const nowStr = new Date().toLocaleTimeString();
        setBillingLogs(prev => [{ id: `TX-${Math.floor(Math.random()*80000)+10000}`, customer: 'ZARA 服饰', amount: '￥32,000.00', desc: '模拟计费入账 (专家触发)', date: nowStr }, ...prev]);
      } else if (msg.includes('理想家')) {
        reply = `[Susan] 理想家全屋家居定制 会员身份/开户申请准入审计通过。已为您部署 [🛋️ 家居生活整装模板] 以及 6 大岗位专属智脑。`;
        setCompanies(prev => [...prev, {
          id: `MODA_${Math.floor(Math.random() * 9000 + 1000)}`,
          name: '理想家全屋家居定制',
          industry: '家居生活',
          plan: '专业高级版',
          status: '运行中',
          specialistCount: 6,
          billingCycle: '2026-06'
        }]);
        setCompanyAudits(prev => prev.filter(c => !c.name.includes('理想家')));
      } else if (msg.includes('单步 DAG')) {
        reply = `[Cyrus] 分发执行运行流！当前步进第 ${((dagStep + 1) === 4 ? 4 : (dagStep + 1))} 阶段正常。`;
        executeDagStep();
      } else if (msg.includes('DDoS')) {
        reply = `[Vance] 激活全局 DDoS 防盾并配置硬连接硬熔断。系统审计阻断灵敏度上调。`;
        setFirewallActive(true);
      } else if (msg.includes('Aria')) {
        reply = `[Barton] RIA 创意专家认知权重由 95% 置顶调配至 99%。小红书文案与穿搭海报生成优先占用 GPU 算力通道。`;
        setSpecialists(prev => prev.map(s => s.role.includes('Aria') ? { ...s, weight: 99 } : s));
      } else if (msg.includes('QPS')) {
        reply = `[Fiona] 本季度并发处于绿区安全水位，平均 QPS 保持在 340-380区间，暂无熔断降级必要。`;
      }
      
      setAiMessages(prev => [...prev, { sender: 'ai' as const, text: reply, time: respTime }]);
    }, 700);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const msg = inputText.trim();
    setInputText('');
    handleSuggestionClick(msg);
  };

  const currentSpecialist = activeSpecialistMap[activeTab] || activeSpecialistMap.overview;

  return (
    <div className="min-h-screen bg-[#050507] text-[#E8EAED] font-sans flex flex-col lg:flex-row overflow-x-hidden selection:bg-blue-600 selection:text-white">
      
      {/* 1. LEFT SIDEBAR: NAVIGATION MENU */}
      <aside className={`fixed inset-y-0 left-0 z-50 lg:sticky lg:top-0 h-screen flex flex-col w-64 bg-[#09090B] border-r border-[#2F3336]/60 p-5 shrink-0 transition-transform duration-300 transform ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Logo Container */}
        <div className="flex items-center gap-3 pb-6 border-b border-[#2F3336]/60">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider text-white">操作菜单</h1>
            <p className="text-[9px] text-[#8B949E] font-mono leading-none mt-0.5 uppercase">系统控制台</p>
          </div>
        </div>

        {/* 8 Core Navigation Items */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto scrollbar-none">
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block mb-2 px-3 font-mono">
            主控页面
          </span>
          {[
            { id: 'overview', label: '控制台总览', icon: BarChart3 },
            { id: 'company', label: '企业管理', icon: Building2 },
            { id: 'ai', label: '智体调度', icon: Cpu },
            { id: 'task', label: '任务流水', icon: Workflow },
            { id: 'template', label: '行业模板', icon: LayoutTemplate },
            { id: 'finance', label: '财务记账', icon: Coins },
            { id: 'user', label: '用户账号', icon: Users },
            { id: 'system', label: '系统设置', icon: Settings }
          ].map(item => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition text-left cursor-pointer ${
                  isSelected 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10 font-bold'
                    : 'text-[#8B949E] hover:bg-neutral-900 hover:text-white font-medium'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-white/10 text-white' : 'bg-neutral-800 text-[#8B949E]'}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs">{item.label}</span>
                {item.id === 'finance' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-450 bg-blue-400 animate-pulse ml-auto mr-1" />
                )}
              </button>
            );
          })}

          <div className="h-[1px] bg-[#2F3336]/60 my-3" />
          
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block mb-2 px-3 font-mono">
            智能底座连线
          </span>
          {[
            { label: '智体排班', action: () => onNavigate?.({ step: 'AI_TEAMS' }), icon: '👥' },
            { label: '控制大脑', action: () => onNavigate?.({ step: 'AI_RUNTIME' }), icon: '🧠' },
            { label: '知识底座', action: () => onNavigate?.({ step: 'KNOWLEDGE_BASE' }), icon: '📚' },
            { label: '系统安全', action: () => { setActiveTab('system'); setMobileMenuOpen(false); }, icon: '🔌' }
          ].map((sub, idx) => (
            <button
              key={idx}
              onClick={sub.action}
              className="w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-[#8B949E] hover:bg-neutral-900 hover:text-white transition text-left cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-neutral-800 flex items-center justify-center text-xs shrink-0 select-none">
                {sub.icon}
              </div>
              <span className="text-xs font-semibold leading-none">{sub.label}</span>
            </button>
          ))}

          <div className="h-[1px] bg-[#2F3336]/60 my-3" />
          
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block mb-2 px-3 font-mono">
            视图维度跳转
          </span>
          <div className="grid grid-cols-2 gap-1.5 px-2">
            <button
              onClick={() => onNavigate?.({ step: 'LANDING' })}
              className="flex items-center justify-center gap-1 px-1 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-850 text-[#8B949E] hover:text-white text-[11px] font-bold border border-zinc-800/10 transition cursor-pointer"
            >
              <span>🏠</span>
              <span>官方主页</span>
            </button>
            <button
              onClick={() => onNavigate?.({ step: 'CUSTOMER_STOREFRONT' })}
              className="flex items-center justify-center gap-1 px-1 py-1.5 rounded-lg bg-red-950/15 hover:bg-red-950/35 text-rose-450 hover:text-rose-200 text-[11px] font-bold border border-red-950/20 transition cursor-pointer"
            >
              <span>🛒</span>
              <span>顾客前台</span>
            </button>
            <button
              onClick={() => onNavigate?.({ step: 'DASHBOARD' })}
              className="flex items-center justify-center gap-1 px-1 py-1.5 rounded-lg bg-emerald-950/15 hover:bg-emerald-950/35 text-emerald-450 hover:text-emerald-200 text-[11px] font-bold border border-emerald-950/20 transition cursor-pointer"
            >
              <span>💼</span>
              <span>商家后台</span>
            </button>
            <button
              className="flex items-center justify-center gap-1 px-1 py-1.5 rounded-lg bg-blue-600/15 text-blue-300 text-[11px] font-extrabold border border-blue-500/20 cursor-default select-none"
            >
              <span>💻</span>
              <span>管理后台</span>
            </button>
          </div>
        </nav>

        {/* Sidebar Footer Info */}
        <div className="mt-auto bg-black/40 rounded-xl p-3 border border-[#2F3336]/60 text-[9px] font-mono text-[#8B949E] space-y-1">
          <div className="flex items-center justify-between">
            <span>底座信息:</span>
            <span className="text-blue-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              ONLINE
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>运行时间:</span>
            <span className="text-zinc-350">24H</span>
          </div>
          <div className="flex items-center justify-between">
            <span>底座SLA:</span>
            <span className="text-emerald-400">99.98%</span>
          </div>
        </div>

      </aside>

      {/* Mobile Backdrop Drawer */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* 2. MIDDLE COLUMN: CENTRAL WORKSPACE HUB */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#050507]">
        
        {/* Navigation Dark Header */}
        <header className="bg-[#09090B] border-b border-[#2F3336]/65 py-4 px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xl">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-slate-400 hover:text-white lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-[#8B949E] tracking-wider font-mono">
                <span>管理系统</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-blue-400">
                  {activeTab === 'overview' && '控制台总览'}
                  {activeTab === 'company' && '企业管理'}
                  {activeTab === 'ai' && '智体调度'}
                  {activeTab === 'task' && '任务流水'}
                  {activeTab === 'template' && '行业模板'}
                  {activeTab === 'finance' && '财务记账'}
                  {activeTab === 'user' && '用户账号'}
                  {activeTab === 'system' && '系统设置'}
                </span>
                <span className="mx-2 select-none text-zinc-700">&bull;</span>
                <span className="text-[10px] text-zinc-500">负责人: {currentSpecialist.name.split(' ').pop()}</span>
              </div>
              <h2 className="text-sm font-extrabold text-white mt-0.5 flex items-center gap-1.5 font-sans uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span>MODAUI 统合总后台</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end text-right font-mono text-[9px] text-[#8B949E] leading-tight">
              <span className="text-white font-bold flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-400" />
                {telemetryTime || 'Thu, 04 Jun 2026 02:59 UTC'}
              </span>
              <span>SU_ROLE: {userRole.toUpperCase()}</span>
            </div>
            
            <div className="h-6 w-[1px] bg-[#2F3336]/60 hidden sm:block" />

            {/* Auth Panel */}
            <AuthPanel />

            <button
              onClick={onBackToLanding}
              className="rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-[#2F3336]/60 text-white px-3 py-1.5 text-xs font-bold font-mono transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>返回首页</span>
            </button>
          </div>
        </header>

        {/* MIDDLE CONTENT PANEL */}
        <div className="p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto flex-1 overflow-y-auto scrollbar-none">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >

              {/* ----------------- 1. 总览 / OVERVIEW ----------------- */}
              {activeTab === 'overview' && (
                <div className="space-y-6 animate-fade-in text-[#E8EAED]">
                  
                  {/* Dynamic Sub-header Info */}
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-blue-550 bg-blue-500" />
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-450 font-mono">
                        安全设置 / 接口配置
                      </span>
                    </div>
                  </div>

                  {/* Multi-Nested Sub tabs strip */}
                  <div className="flex border-b border-zinc-800/80 pb-3 gap-6 text-xs text-zinc-400 font-bold overflow-x-auto scrollbar-none">
                    <span className="text-blue-400 cursor-pointer border-b-2 border-blue-500 pb-3 px-2 pr-4 shrink-0 font-sans">金融总览</span>
                    <span className="hover:text-white cursor-pointer pb-3 px-2 shrink-0 font-sans">流量池分配</span>
                    <span className="hover:text-white cursor-pointer pb-3 px-2 shrink-0 font-sans">API流控监测</span>
                    <span className="hover:text-white cursor-pointer pb-3 px-2 shrink-0 font-sans">多活异地热备</span>
                  </div>
                  
                  {/* Metric items overview */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: '总余额 (USD)', val: '0.00', unit: '+12% 较上月同期', color: 'text-emerald-400' },
                      { label: '今日收入', val: '0.00', unit: '+5% 较上月同期', color: 'text-emerald-400' },
                      { label: '累计提现', val: '$45,000.00', unit: '稳定 较上月同期', color: 'text-blue-400', isLarge: true },
                      { label: '在线算力容器', val: companies.length * 6, unit: '主实例 较上月同期', color: 'text-indigo-400' }
                    ].map((m, idx) => (
                      <div key={idx} className="bg-zinc-950 border border-zinc-800/82 p-4 rounded-xl shadow-2xl flex flex-col justify-between hover:border-zinc-700 transition">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                          {m.label}
                        </span>
                        <div className={`text-xl md:text-2xl font-black font-mono tracking-tight my-2.5 ${m.color}`}>
                          {m.val}
                        </div>
                        <span className="text-[9px] text-[#8B949E] font-mono leading-none block font-semibold">
                          {m.unit}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Trends Graph and Core status */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    <div className="lg:col-span-2 bg-[#09090B] rounded-xl border border-zinc-800/80 p-5 shadow-2xl space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                        <div>
                          <h3 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider font-mono">租户并发调度流趋势 (Avg QPS)</h3>
                        </div>
                        <span className="text-[10px] font-bold text-blue-400 bg-blue-950/40 border border-blue-900/30 rounded-full px-2.5 py-1 flex items-center gap-1 font-mono">
                          <TrendingUp className="w-3 h-3" />
                          <span>380 QPS Active</span>
                        </span>
                      </div>

                      <div style={{ width: '100%', height: 210 }}>
                        <ResponsiveContainer>
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="reqGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="time" stroke="#52525b" fontSize={9} tickLine={false} />
                            <Tooltip contentStyle={{ background: '#09090b', borderColor: '#2f3336', fontSize: 11, color: '#e8eaed' }} />
                            <Area type="monotone" dataKey="reqs" stroke="#3b82f6" fillOpacity={1} fill="url(#reqGradient)" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Right column list of servers statuses */}
                    <div className="bg-[#09090B] rounded-xl border border-zinc-800/80 p-5 shadow-2xl space-y-4 flex flex-col justify-between">
                      <div>
                        <div className="pb-3 border-b border-zinc-800/80 flex items-center justify-between">
                          <span className="text-xs font-bold text-[#8B949E] uppercase tracking-widest font-mono">系统统合微服务栈</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        
                        <div className="space-y-2.5 mt-4 text-xs font-mono">
                          {[
                            { name: '多租户网关代理层', desc: '正常分发', code: 'GATEWAY_OK' },
                            { name: 'Gemini-3.5 API 服务层', desc: '100% SLA', code: 'API_STABLE' },
                            { name: '顺丰物流直连 API', desc: '8ms延时', code: 'SF_CONNECTED' },
                            { name: 'Stripe多币对平准池', desc: '就绪在线', code: 'PAY_PROXIED' }
                          ].map((sys, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-zinc-950 border border-zinc-800/60 p-2.5 rounded-lg hover:border-zinc-700 transition">
                              <div>
                                <span className="font-bold text-slate-200 block text-[11px]">{sys.name}</span>
                                <span className="text-[9px] text-[#8B949E] select-none block mt-0.5">{sys.code}</span>
                              </div>
                              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 px-2 py-0.5 rounded">
                                {sys.desc}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* ----------------- 2. 公司中心 / COMPANY CENTER ----------------- */}
              {activeTab === 'company' && (
                <div className="space-y-6 text-[#E8EAED]">
                  
                  {/* Nested title and director info */}
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                        企业名录及准入配置
                      </span>
                    </div>
                  </div>

                  {/* Sub navigations */}
                  <div className="flex border-b border-zinc-800/80 pb-3 gap-6 text-xs text-zinc-400 font-bold overflow-x-auto scrollbar-none">
                    <span 
                      onClick={() => setSelectedSubTab('all')} 
                      className={`cursor-pointer pb-3 px-2 shrink-0 ${selectedSubTab === 'all' ? 'text-blue-400 border-b-2 border-blue-500' : 'hover:text-white'}`}
                    >
                      注册企业主库 ({companies.length})
                    </span>
                    <span 
                      onClick={() => setSelectedSubTab('audits')} 
                      className={`cursor-pointer pb-3 px-2 shrink-0 ${selectedSubTab === 'audits' ? 'text-blue-400 border-b-2 border-blue-500' : 'hover:text-white'}`}
                    >
                      待开立审批单 ({companyAudits.length})
                    </span>
                    <span 
                      onClick={() => setSelectedSubTab('templates')} 
                      className={`cursor-pointer pb-3 px-2 shrink-0 ${selectedSubTab === 'templates' ? 'text-blue-400 border-b-2 border-blue-500' : 'hover:text-white'}`}
                    >
                      行业智脑预置
                    </span>
                    <span 
                      onClick={() => setSelectedSubTab('subscriptions')} 
                      className={`cursor-pointer pb-3 px-2 shrink-0 ${selectedSubTab === 'subscriptions' ? 'text-blue-400 border-b-2 border-blue-500' : 'hover:text-white'}`}
                    >
                      租户结算控制柜
                    </span>
                  </div>

                  {/* Dynamic Render SubTab contents */}
                  {selectedSubTab === 'all' && (
                    <div className="bg-[#09090B] rounded-xl border border-zinc-800/80 p-5 shadow-2xl space-y-4">
                      <div className="overflow-x-auto border border-zinc-800/60 rounded-xl bg-zinc-950/40">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-zinc-950 text-[#8B949E] font-mono border-b border-zinc-800/80">
                              <th className="p-3.5">注册编号</th>
                              <th className="p-3.5">公司名称</th>
                              <th className="p-3.5">关联产业分类</th>
                              <th className="p-3.5">订阅算力套餐</th>
                              <th className="p-3.5">AI专家岗位数</th>
                              <th className="p-3.5">状态</th>
                              <th className="p-3.5 text-right">单兵指令</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-900 text-zinc-300 font-mono">
                            {companies.map(corp => (
                              <tr key={corp.id} className="hover:bg-zinc-900/30 transition">
                                <td className="p-3.5 font-bold text-white">{corp.id}</td>
                                <td className="p-3.5 font-sans font-bold text-white">{corp.name}</td>
                                <td className="p-3.5 text-[#8B949E]">{corp.industry}</td>
                                <td className="p-3.5 text-indigo-400 font-bold">{corp.plan}</td>
                                <td className="p-3.5 text-zinc-400">{corp.specialistCount} 智体值班</td>
                                <td className="p-3.5">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    corp.status === '运行中' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/30' : 'bg-rose-950/50 text-rose-400 border border-rose-900/30'
                                  }`}>
                                    {corp.status}
                                  </span>
                                </td>
                                <td className="p-3.5 text-right">
                                  <button
                                    onClick={() => setCompanies(companies.map(c => c.id === corp.id ? { ...c, status: c.status === '运行中' ? '已挂起' : '运行中' } : c))}
                                    className={`text-[10px] px-2.5 py-1 rounded font-bold cursor-pointer transition ${
                                      corp.status === '运行中' ? 'bg-rose-950/40 text-rose-400 border border-rose-900/30 hover:bg-rose-950' : 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 hover:bg-emerald-950'
                                    }`}
                                  >
                                    {corp.status === '运行中' ? '暂停' : '重启'}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {selectedSubTab === 'audits' && (
                    <div className="bg-[#09090B] rounded-xl border border-zinc-800/80 p-5 shadow-2xl space-y-4">
                      {companyAudits.length === 0 ? (
                        <div className="text-[#8B949E] font-mono text-center py-10 italic">
                          暂无最新待审批企业 [No applicants pending approval]
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {companyAudits.map(item => (
                            <div key={item.id} className="bg-zinc-950 border border-zinc-800/60 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                              <div className="font-mono text-xs">
                                <span className="font-bold text-white block text-[13px]">{item.name}</span>
                                <span className="text-[#8B949E] mt-1.5 block leading-relaxed">
                                  关联垂直大类: <strong className="text-blue-400">{item.industry}</strong> &bull; 申请代理人: <strong>{item.contact}</strong> &bull; 提交时间: <strong>{item.time}</strong>
                                </span>
                              </div>
                              <div className="flex gap-2 shrink-0">
                                <button
                                  onClick={() => handleAuditAction(item.id, 'approve')}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10.5px] font-bold font-mono px-3.5 py-1.5 rounded-lg transition cursor-pointer shadow-md shadow-emerald-500/10"
                                >
                                  核准备案
                                </button>
                                <button
                                  onClick={() => handleAuditAction(item.id, 'reject')}
                                  className="bg-neutral-800 hover:bg-neutral-700 text-[#8B949E] hover:text-white text-[10.5px] font-bold font-mono px-3.5 py-1.5 rounded-lg border border-zinc-700/50 transition cursor-pointer"
                                >
                                  驳回排审
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {selectedSubTab === 'templates' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {industryTemplates.map(item => (
                        <div key={item.code} className="bg-zinc-950 rounded-xl border border-zinc-800/80 p-5 shadow-2xl space-y-4 hover:border-zinc-700 transition">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-white text-[13px]">{item.name}</h4>
                              <span className="text-[10px] font-semibold font-mono text-blue-400 mt-1 block">{item.nodeType}</span>
                            </div>
                            <span className="text-xs bg-amber-950/40 text-amber-400 border border-amber-900/30 font-mono font-bold px-1.5 py-0.5 rounded">
                              ★ {item.rating}
                            </span>
                          </div>
                          
                          <div className="flex justify-between text-[11px] font-mono pt-3 border-t border-zinc-900">
                            <span className="text-zinc-400">专家库: <strong className="text-white">{item.specialists}位</strong></span>
                            <span className="text-[#8B949E]">实例量: <strong className="text-white">{item.apps}</strong></span>
                          </div>

                          <button 
                            onClick={() => handleSuggestionClick(`重新部署 ${item.name} 提示词模板`)}
                            className="w-full bg-[#09090B] border border-zinc-800/80 hover:bg-neutral-900 text-white hover:text-blue-300 rounded-lg text-xs font-bold py-2 font-mono transition cursor-pointer"
                          >
                            刷准微调认知权
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedSubTab === 'subscriptions' && (
                    <div className="bg-[#09090B] rounded-xl border border-zinc-800/80 p-5 shadow-2xl space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                        <h3 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider font-mono">多租户算力包计费阀</h3>
                        <button 
                          onClick={() => alert('已成功与 Stripe CLI 钩子握手，新增套餐在 AGENTS.md 完成声明后即可挂载。')}
                          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-mono px-3.5 py-1.5 rounded-lg transition cursor-pointer"
                        >
                          + 新增算力资费包
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                        {[
                          { name: '新手体验配额 Package Mini', price: '￥119', tokens: '100k/月', disc: '0.90x 算力消耗系数' },
                          { name: '专业高阶配额 Package Pro', price: '￥349', tokens: '800k/月', disc: '0.85x 算力消耗系数' },
                          { name: '无限大宗尊享 Package Ultra', price: '￥1,299', tokens: '无限吞吐量', disc: '0.75x 算力消耗系数' }
                        ].map((pkg, idx) => (
                          <div key={idx} className="bg-zinc-950 border border-zinc-800/60 rounded-xl p-5 space-y-3">
                            <span className="text-[11px] font-bold text-[#8B949E] uppercase block tracking-wider font-mono">{pkg.name}</span>
                            <div className="text-2xl font-mono font-black text-white">
                              {pkg.price} <small className="text-xs font-normal text-zinc-500">/月</small>
                            </div>
                            <div className="text-[10.5px] font-mono text-zinc-400 space-y-1.5 pt-3 border-t border-zinc-900">
                              <div>流量额度上限: <strong className="text-blue-400">{pkg.tokens}</strong></div>
                              <div>扣费比率平准: <strong className="text-emerald-400">{pkg.disc}</strong></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* ----------------- 3. AI中心 / AI CENTER ----------------- */}
              {activeTab === 'ai' && (
                <div className="space-y-6 text-[#E8EAED]">
                  
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                        智能智脑配重控制台
                      </span>
                    </div>
                  </div>

                  {/* Sub Navigations */}
                  <div className="flex border-b border-zinc-800/80 pb-3 gap-6 text-xs text-zinc-400 font-bold overflow-x-auto scrollbar-none">
                    <span className="text-blue-400 cursor-pointer border-b-2 border-blue-500 pb-3 px-2 pr-4 shrink-0 font-sans">智德岗位标准智能</span>
                    <span className="hover:text-white cursor-pointer pb-3 px-2 shrink-0 font-sans">自动限速调优机制</span>
                    <span className="hover:text-white cursor-pointer pb-3 px-2 shrink-0 font-sans font-mono animate-pulse">SLA 熔断状态: STABLE</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left Panel: Specialists */}
                    <div className="bg-[#09090B] rounded-xl border border-zinc-800/80 p-5 shadow-2xl space-y-4 lg:col-span-1">
                      <h3 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider font-mono">注册岗位岗位配重</h3>
                      <div className="space-y-3 font-mono">
                        {specialists.map((sp, idx) => (
                          <div key={idx} className="bg-zinc-950 border border-zinc-800/60 p-3 rounded-lg flex flex-col justify-between">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-white">{sp.role}</span>
                              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/40 border border-[#2F3336]/60 px-1.5 py-0.5 rounded">
                                {sp.state}
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-400 mt-1 leading-normal font-sans">
                              {sp.spec}
                            </p>
                            <div className="flex justify-between items-center text-[9.5px] text-zinc-500 mt-2 border-t border-zinc-900 pt-1.5">
                              <span>认知算力占比:</span>
                              <strong className="text-blue-400">{sp.weight}%</strong>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Panel: Capabilities sliders and metadata */}
                    <div className="bg-[#09090B] rounded-xl border border-zinc-800/80 p-5 shadow-2xl space-y-4 lg:col-span-2">
                      <h3 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider font-mono">API Capability Modules</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        <div className="p-4 bg-zinc-950 border border-zinc-800/60 rounded-xl space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white">Gemini-3.5 智能工作流调度</span>
                            <input
                              type="checkbox"
                              checked={activeCapabilities.geminiFlow}
                              onChange={() => setActiveCapabilities({ ...activeCapabilities, geminiFlow: !activeCapabilities.geminiFlow })}
                              className="accent-blue-500 rounded cursor-pointer w-4 h-4"
                            />
                          </div>
                          <p className="text-[10.5px] text-zinc-400 leading-normal">
                            自动调度多智能间的DAG串行网络，切断退回手动顺序触发。
                          </p>
                        </div>

                        <div className="p-4 bg-zinc-950 border border-zinc-800/60 rounded-xl space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white">顺丰一键航空物流履单 API</span>
                            <input
                              type="checkbox"
                              checked={activeCapabilities.sfLogistics}
                              onChange={() => setActiveCapabilities({ ...activeCapabilities, sfLogistics: !activeCapabilities.sfLogistics })}
                              className="accent-blue-500 rounded cursor-pointer w-4 h-4"
                            />
                          </div>
                          <p className="text-[10.5px] text-zinc-400 leading-normal">
                            SF Express Airway direct broker callback broker listener status.
                          </p>
                        </div>

                        <div className="p-4 bg-zinc-950 border border-zinc-800/60 rounded-xl space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white">Stripe/微信多币结算平准契</span>
                            <input
                              type="checkbox"
                              checked={activeCapabilities.stripeAccounting}
                              onChange={() => setActiveCapabilities({ ...activeCapabilities, stripeAccounting: !activeCapabilities.stripeAccounting })}
                              className="accent-blue-500 rounded cursor-pointer w-4 h-4"
                            />
                          </div>
                          <p className="text-[10.5px] text-zinc-400 leading-normal">
                            支付入账后的算力扣减对账、租户年度账期损益核销。
                          </p>
                        </div>

                        <div className="p-4 bg-zinc-950 border border-zinc-800/60 rounded-xl space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white">竞价直通车智能裂变宣发</span>
                            <input
                              type="checkbox"
                              checked={activeCapabilities.autoAdvertising}
                              onChange={() => setActiveCapabilities({ ...activeCapabilities, autoAdvertising: !activeCapabilities.autoAdvertising })}
                              className="accent-blue-500 rounded cursor-pointer w-4 h-4"
                            />
                          </div>
                          <p className="text-[10.5px] text-zinc-400 leading-normal">
                            在小红书、抖音及大众美团进行智能化广告竞价调优阻。
                          </p>
                        </div>

                      </div>

                      {/* Cost monitoring block */}
                      <div className="bg-zinc-950 rounded-xl p-4 font-mono text-xs text-blue-300 space-y-2.5 border border-zinc-850">
                        <span className="text-zinc-500 uppercase tracking-wider block text-[9px]">算力总成本精调比率</span>
                        <div className="grid grid-cols-3 gap-2 text-center pt-2.5 border-t border-zinc-900 text-[11px]">
                          <div>
                            <span className="text-zinc-500 block">SaaS 总流水月</span>
                            <span className="text-white font-bold">￥157,750</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block">API算力API扣减</span>
                            <span className="text-amber-400 font-bold">￥31,420</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block">算利润率 (Spread)</span>
                            <span className="text-emerald-400 font-bold">80.08% SLA</span>
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>

                </div>
              )}

              {/* ----------------- 4. 任务中心 / TASK CENTER ----------------- */}
              {activeTab === 'task' && (
                <div className="space-y-6 text-[#E8EAED]">
                  
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-450 font-mono">
                        运行断点调试控制器
                      </span>
                    </div>
                  </div>

                  {/* Nested Tab Sub headings */}
                  <div className="flex border-b border-zinc-800/80 pb-3 gap-6 text-xs text-zinc-400 font-bold overflow-x-auto scrollbar-none">
                    <span className="text-blue-400 cursor-pointer border-b-2 border-blue-500 pb-3 px-2 pr-4 shrink-0 font-sans">运行断点调试</span>
                    <span className="hover:text-white cursor-pointer pb-3 px-2 shrink-0 font-sans">DAG协同图例</span>
                    <span className="hover:text-white cursor-pointer pb-3 px-2 shrink-0 font-sans">活跃事务历史堆叠 ({workflowTasks.length})</span>
                  </div>

                  <div className="bg-[#09090B] rounded-xl border border-zinc-800/80 p-5 shadow-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-zinc-800/80 gap-3">
                      <span className="text-xs font-bold text-[#8B949E] uppercase tracking-widest font-mono">
                        单步调试中枢 (Debugger Unit)
                      </span>
                      <button
                        onClick={executeDagStep}
                        className="bg-blue-600 hover:bg-blue-550 text-white text-xs font-bold font-mono px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>单步调试运行 (Debug Step)</span>
                      </button>
                    </div>

                    {/* Step buttons rendering */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center text-xs font-mono pt-1">
                      {[
                        { id: 0, label: '1. 智能意图识别', desc: 'Aria + Nova 调度分发模式' },
                        { id: 1, label: '2. 选品价格核减', desc: 'Barton 智能算力对重' },
                        { id: 2, label: '3. 顺丰物流联调', desc: 'Cyrus 物运调度一键代发' },
                        { id: 3, label: '4. 金留损账分核', desc: 'Fiona 挂号 Stripe 平准' }
                      ].map(item => (
                        <div
                          key={item.id}
                          className={`py-3.5 px-3 rounded-xl border transition-all duration-300 cursor-pointer ${
                            dagStep === item.id 
                              ? 'border-blue-500 bg-blue-950/40 text-blue-300 font-bold shadow-lg shadow-blue-500/10'
                              : 'border-zinc-800/60 bg-zinc-950 text-zinc-500'
                          }`}
                          onClick={() => setDagStep(item.id)}
                        >
                          <div className="text-[12px]">{item.label}</div>
                          <div className={`text-[9px] uppercase font-normal mt-1 leading-normal ${dagStep === item.id ? 'text-blue-400' : 'text-zinc-600'}`}>{item.desc}</div>
                        </div>
                      ))}
                    </div>

                    {/* Mock Console */}
                    <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 h-36 overflow-y-auto font-mono text-[11px] leading-relaxed text-blue-300 space-y-1.5 shadow-inner">
                      {taskLogs.map((log, i) => (
                        <div key={i} className="flex items-start gap-1">
                          <span className="text-zinc-650 select-none">&gt;</span>
                          <span>{log}</span>
                        </div>
                      ))}
                    </div>

                  </div>

                  {/* Task list table */}
                  <div className="bg-[#09090B] rounded-xl border border-zinc-800/80 p-5 shadow-2xl space-y-4">
                    <h4 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider font-mono">当前活跃的 DAG 任务流水</h4>
                    
                    <div className="overflow-x-auto border border-zinc-800/60 rounded-xl bg-zinc-950/40">
                      <table className="w-full text-left text-xs border-collapse font-mono text-zinc-300">
                        <thead>
                          <tr className="bg-zinc-950 text-[#8B949E] border-b border-zinc-800/80">
                            <th className="p-3">任务内部编号</th>
                            <th className="p-3">关联智脑工作流名</th>
                            <th className="p-3">对应租户公司</th>
                            <th className="p-3">调度时耗 / 进度</th>
                            <th className="p-3 text-right">流控状态</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900">
                          {workflowTasks.map(task => (
                            <tr key={task.id} className="hover:bg-zinc-900/20 transition">
                              <td className="p-3 font-semibold text-white">{task.id}</td>
                              <td className="p-3 font-sans font-bold text-white">{task.name}</td>
                              <td className="p-3 font-sans text-zinc-400">{task.company}</td>
                              <td className="p-3 text-zinc-500">审计于 {task.time} UTC</td>
                              <td className="p-3 text-right">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  task.status === '已完成' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/30' :
                                  task.status === '执行中' ? 'bg-blue-950/50 text-blue-400 border border-blue-900/30' :
                                  task.status === '已排队' ? 'bg-amber-950/50 text-amber-400 border border-amber-900/30' : 'bg-rose-950/50 text-rose-400 border border-rose-900/30'
                                }`}>
                                  {task.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* ----------------- 5. 模板中心 / TEMPLATE CENTER ----------------- */}
              {activeTab === 'template' && (
                <div className="space-y-6 text-[#E8EAED]">
                  
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                        行业预置模板市场
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#09090B] rounded-xl border border-[#2F3336]/60 p-5 shadow-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-zinc-900 gap-3">
                      <span className="text-xs font-bold text-[#8B949E] uppercase tracking-wider font-mono">
                        行业定制提示词资产集 (Prompt Registry)
                      </span>
                      <button
                        onClick={() => alert('夏季大促及高奢典当行专属 Prompt 已装载，等待多活节点握手。')}
                        className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold font-mono px-3.5 py-1.5 rounded-lg border border-zinc-700/50 transition cursor-pointer"
                      >
                        + 导入第三方 Prompt 集
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { title: '一键服装快反流微调', type: '行业微调', deployed: '420 家', file: 'aria_designer_v4.prompt' },
                        { title: '跑腿配送闪送顺运一单', type: '物流专项', deployed: '310 家', file: 'sf_instant_v2.json' },
                        { title: '高奢黄金浮动对冲核重', type: '财务智体', deployed: '155 家', file: 'gold_price_hedge.prompt' },
                        { title: '美化丽人高定玫瑰界面', type: '页面视觉', deployed: '195 家', file: 'rose_beauty.theme' }
                      ].map((tpl, i) => (
                        <div key={i} className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-3 hover:border-zinc-700 transition">
                          <span className="text-[10px] font-bold text-blue-400 bg-blue-950/40 border border-blue-900/30 px-1.5 py-0.5 rounded w-fit block font-mono">
                            {tpl.type}
                          </span>
                          <h4 className="font-bold text-white text-xs">{tpl.title}</h4>
                          <span className="text-[10px] text-zinc-500 font-mono block">绑定名: <span className="text-zinc-350">{tpl.file}</span></span>
                          <div className="text-[11px] font-bold text-indigo-400 font-mono pt-2 border-t border-zinc-900">部署量: {tpl.deployed}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* ----------------- 6. 财务中心 / FINANCIAL CENTER ----------------- */}
              {activeTab === 'finance' && (
                <div className="space-y-6 text-[#E8EAED]">
                  
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                        财务平准综合对账大盘
                      </span>
                    </div>
                  </div>

                  <div className="flex border-b border-zinc-800/80 pb-3 gap-6 text-xs text-zinc-400 font-bold overflow-x-auto scrollbar-none">
                    <span className="text-blue-400 cursor-pointer border-b-2 border-blue-500 pb-3 px-2 pr-4 shrink-0 font-sans">财务综合对账</span>
                    <span className="hover:text-white cursor-pointer pb-3 px-2 shrink-0 font-sans">模拟资金回调审计</span>
                    <span className="hover:text-white cursor-pointer pb-3 px-2 shrink-0 font-sans">毛利率预警大盘</span>
                  </div>

                  {/* KPIs */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                    {[
                      { title: '平台结算累计流水', val: '￥1,254,800', change: '+24.5% 本季度比' },
                      { title: '租户季费/年续期在账', val: '￥157,750', change: '共 6 家租赁实例' },
                      { title: '智德算力消耗平准值', val: '￥32,490', change: '100% 对位抵扣' },
                      { title: 'SaaS 净值平准率', val: '79.28%', change: '安全绿线收益区间' }
                    ].map((kpi, i) => (
                      <div key={i} className="bg-zinc-950 border border-zinc-800/80 p-4 rounded-xl shadow-2xl hover:border-zinc-700 transition">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono block">{kpi.title}</span>
                        <div className="text-lg md:text-xl font-mono font-black text-white tracking-tight my-2">{kpi.val}</div>
                        <span className="text-[10px] text-emerald-400 font-bold font-mono">{kpi.change}</span>
                      </div>
                    ))}
                  </div>

                  {/* Ledger logs */}
                  <div className="bg-[#09090B] rounded-xl border border-zinc-800/80 p-5 shadow-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-zinc-900 gap-3">
                      <span className="text-xs font-bold text-[#8B949E] uppercase tracking-wider font-mono">
                        对账记录流控制栈 (Callback ledger)
                      </span>
                      <button
                        onClick={() => handleSuggestionClick('模拟 32K 租赁回调入账')}
                        className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold font-mono px-3.5 py-1.5 border border-zinc-700/50 rounded-lg transition cursor-pointer"
                      >
                        模拟入账 ￥32K
                      </button>
                    </div>

                    <div className="space-y-2">
                      {billingLogs.map((log, idx) => (
                        <div key={idx} className="bg-zinc-950 border border-zinc-850 p-3 rounded-lg flex items-center justify-between font-mono text-xs hover:border-zinc-700 transition text-zinc-300">
                          <div>
                            <span className="text-blue-400">[{log.id}]</span>
                            <span className="font-sans font-bold text-white ml-2">{log.customer}</span>
                            <span className="text-zinc-550 ml-2 font-sans font-semibold text-[10.5px]">({log.desc})</span>
                          </div>
                          <div className="flex gap-4 items-center">
                            <span className="text-emerald-450 font-bold text-right">{log.amount}</span>
                            <span className="text-[10px] text-zinc-500">{log.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* ----------------- 7. 用户中心 / USER CENTER ----------------- */}
              {activeTab === 'user' && (
                <div className="space-y-6 text-[#E8EAED]">
                  
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                        多租户管理员登录审计及安全哨所
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#09090B] rounded-xl border border-zinc-800/80 p-5 shadow-2xl space-y-4">
                    <h3 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider font-mono">租户所有人注册索引及其登录探针 (Audit Pool)</h3>
                    
                    <div className="overflow-x-auto border border-zinc-800/60 rounded-xl bg-zinc-950/40">
                      <table className="w-full text-left text-xs border-collapse font-mono text-zinc-300">
                        <thead>
                          <tr className="bg-zinc-950 text-[#8B949E] border-b border-zinc-800/80 uppercase text-[10px]">
                            <th className="p-3">注册邮箱（账号名）</th>
                            <th className="p-3">平台角色</th>
                            <th className="p-3">所属绑定公司</th>
                            <th className="p-3 text-right">上次接入Session状态</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900">
                          {usersList.map((user, idx) => (
                            <tr key={idx} className="hover:bg-zinc-900/20 transition">
                              <td className="p-3 font-semibold text-white">{user.email}</td>
                              <td className="p-3 font-sans">
                                <span className="bg-blue-950/40 text-blue-400 border border-blue-900/30 font-bold text-[10px] px-2.5 py-0.5 rounded-full font-mono">
                                  {user.role}
                                </span>
                              </td>
                              <td className="p-3 font-semibold text-zinc-400 font-sans">{user.corp}</td>
                              <td className="p-3 text-right text-zinc-500">正常于今日 {user.bgLogs}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* ----------------- 8. 系统中心 / SYSTEM CENTER ----------------- */}
              {activeTab === 'system' && (
                <div className="space-y-6 text-[#E8EAED]">
                  
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                        后台加密安全及防火墙盾牌接管
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                    
                    {/* RBAC */}
                    <div className="bg-[#09090B] rounded-xl border border-zinc-800/80 p-5 shadow-2xl space-y-4 lg:col-span-1">
                      <div>
                        <h4 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider font-mono">RBAC 角色端点一键准入</h4>
                        <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">对四层授权系统的接口读、高危写、以及销毁权限进行即时微调：</p>
                      </div>

                      <div className="overflow-x-auto border border-zinc-800/60 rounded-xl text-xs font-mono">
                        <table className="w-full text-center border-collapse">
                          <thead>
                            <tr className="bg-zinc-950 text-[#8B949E] border-b border-zinc-800/80 text-[9px] uppercase">
                              <th className="p-2 text-left">角色授权</th>
                              <th className="p-2">读缓存</th>
                              <th className="p-2">写API</th>
                              <th className="p-2">销毁</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-900 text-zinc-300">
                            {Object.keys(rbacMatrix).map(role => (
                              <tr key={role} className="hover:bg-zinc-900/30 transition">
                                <td className="p-2 text-left font-bold text-white text-[10px]">{role}</td>
                                <td className="p-2">
                                  <input
                                    type="checkbox"
                                    checked={rbacMatrix[role].READ}
                                    onChange={() => toggleRbac(role, 'READ')}
                                    className="accent-blue-500 rounded cursor-pointer w-3.5 h-3.5"
                                  />
                                </td>
                                <td className="p-2">
                                  <input
                                    type="checkbox"
                                    checked={rbacMatrix[role].WRITE}
                                    onChange={() => toggleRbac(role, 'WRITE')}
                                    className="accent-blue-500 rounded cursor-pointer w-3.5 h-3.5"
                                  />
                                </td>
                                <td className="p-2">
                                  <input
                                    type="checkbox"
                                    checked={rbacMatrix[role].DESTROY}
                                    onChange={() => toggleRbac(role, 'DESTROY')}
                                    className="accent-blue-500 rounded cursor-pointer w-3.5 h-3.5"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* API credentials display and logs */}
                    <div className="bg-[#09090B] rounded-xl border border-zinc-800/80 p-5 shadow-2xl space-y-4 lg:col-span-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-900 gap-3">
                        <div>
                          <h4 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider font-mono">三方凭证池及加密硬水位 (API Keys)</h4>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs font-mono font-semibold">
                          <span className="text-zinc-500">网防 DDoS:</span>
                          <button
                            onClick={() => {
                              const next = !firewallActive;
                              setFirewallActive(next);
                              handleSuggestionClick(next ? '激活全局 DDoS 防御盾牌' : '一键暂时关闭 DDoS 防御');
                            }}
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold transition font-mono cursor-pointer ${
                              firewallActive ? 'bg-emerald-600 border border-emerald-900/20 text-white' : 'bg-rose-600 border border-rose-900/20 text-white'
                            }`}
                          >
                            {firewallActive ? 'SHIELD_ACTIVE' : 'SHIELD_PAUSED'}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {apiKeys.map(key => (
                          <div key={key.name} className="bg-zinc-950 border border-zinc-850 p-3 rounded-lg space-y-2 hover:border-zinc-700 transition">
                            <div className="flex justify-between items-center text-[10.5px] font-mono">
                              <span className="font-bold text-white truncate mr-1">{key.name}</span>
                              <button
                                onClick={() => toggleKeyVisibility(key.name)}
                                className="text-zinc-500 hover:text-white transition cursor-pointer shrink-0"
                              >
                                {key.hidden ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                            <div className="bg-black text-[10px] font-mono text-zinc-500 rounded px-2 py-1 select-all truncate border border-zinc-900">
                              {key.hidden ? '•••••••••••••••••' : key.key}
                            </div>
                            <span className="text-[8px] text-zinc-500 font-semibold uppercase block tracking-wider font-mono">HOST: {key.host}</span>
                          </div>
                        ))}
                      </div>

                      {/* Audit lines */}
                      <div className="bg-black p-3.5 h-20 overflow-y-auto font-mono text-[10px] text-zinc-400 border border-zinc-900 rounded-lg space-y-1">
                        <div className="text-blue-400 font-bold uppercase text-[9px] tracking-wider select-none">【超级操作审计链日志】</div>
                        <div>➔ 03:25: barbrostruck@gmail.com 登录平台超级管理视角成功。</div>
                        {firewallActive && <div className="text-emerald-400">➔ 03:25: 防控盾牌就位，已实时放行 WS 心跳帧，拦截代理劫杀 0 次。</div>}
                      </div>

                    </div>

                  </div>

                </div>
              )}

            </motion.div>
          </AnimatePresence>
          
        </div>
      </main>

      {/* 3. RIGHT SIDEBAR: 24H CO-PILOT DIALOG PANEL (执勤会商室) - Consistent 3-Panel responsive layout */}
      <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-[#2F3336]/60 bg-[#09090B] p-4 shrink-0 flex flex-col justify-between overflow-y-auto overflow-x-hidden min-h-[620px] lg:h-screen lg:sticky lg:top-0 scrollbar-none space-y-4">
        
        {/* Topic Title */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-[#2F3336]/60">
            <MessageSquare className="w-4 h-4 text-[#1D9BF0]" />
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">驻站数字运维伙伴</span>
              <h3 className="text-xs font-black text-white uppercase tracking-wider mt-0.5 leading-none">
                7x24h 执勤全天候会商室
              </h3>
            </div>
          </div>

          {/* Active Specialist Profile Card & Duty Picker */}
          <div className="space-y-3">
            <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider font-mono block">
              当前智体班表 (Click to switch view)
            </span>
            <div className="grid grid-cols-4 gap-1 pb-1">
              {Object.entries(activeSpecialistMap).map(([key, spec]) => {
                const isCurrent = activeTab === key;
                return (
                  <button
                    key={key}
                    title={`${spec.name} (${spec.role})`}
                    onClick={() => {
                      setActiveTab(key as any);
                    }}
                    className={`p-1.5 rounded-lg flex flex-col items-center justify-center transition border cursor-pointer ${
                      isCurrent 
                        ? 'bg-[#1D9BF0]/15 border-[#1D9BF0] text-white font-bold' 
                        : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-zinc-200 hover:border-zinc-800'
                    }`}
                  >
                    <span className="text-sm select-none">{spec.emoji}</span>
                    <span className="text-[8px] font-mono whitespace-nowrap overflow-hidden text-ellipsis w-12 text-center mt-0.5 leading-none">
                      {spec.name.split(' ').pop()}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Specialist Profile Card */}
            <div className="bg-zinc-950 border border-zinc-850 p-3.5 rounded-xl space-y-2.5 shadow-inner">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img 
                    src={currentSpecialist.avatar} 
                    alt={currentSpecialist.name} 
                    className="w-9 h-9 rounded-full border border-zinc-800 object-cover" 
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border border-zinc-950 rounded-full animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white flex items-center gap-1 leading-none">
                    <span>{currentSpecialist.name}</span>
                    <span className="text-[8px] font-mono tracking-tight text-blue-400 font-normal px-1 bg-blue-950/40 rounded border border-blue-900/20">{currentSpecialist.role}</span>
                  </h4>
                  <p className="text-[8px] text-zinc-500 mt-1 font-mono uppercase tracking-widest leading-none">DUTY_TAB: {activeTab.toUpperCase()}</p>
                </div>
              </div>

              <p className="text-[10.5px] text-zinc-400 leading-normal font-sans">
                {currentSpecialist.desc}
              </p>
            </div>

            {/* Dynamic Collaboration Workflow Simulator */}
            <div className="bg-zinc-950/60 border border-zinc-850 p-3 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-widest font-mono">
                  智体协同协作模拟器
                </span>
                <span className="text-[8px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 px-1 py-0.5 rounded leading-none select-none">
                  SIM_ACTIVE
                </span>
              </div>
              
              <button
                type="button"
                onClick={runCoCollaborationSim}
                disabled={isSimulating}
                className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10.5px] font-bold font-mono transition border ${
                  isSimulating
                    ? 'bg-neutral-900 border-neutral-850 text-zinc-500 cursor-not-allowed'
                    : 'bg-[#1D9BF0] hover:bg-blue-500 border-blue-400/10 text-white shadow-md shadow-blue-500/5 cursor-pointer'
                }`}
              >
                <span>{isSimulating ? '🛠️ 模拟大促流水中...' : '🟢 模拟团队多岗位智能协同'}</span>
              </button>
            </div>
          </div>

          {/* Simulated Workspace Flow and dynamic terminal state */}
          <div className="bg-black/35 border border-zinc-850 p-3 rounded-lg h-52 flex flex-col justify-between space-y-2 text-[10px] font-mono">
            <div className="flex-1 overflow-y-auto scrollbar-none space-y-2 shadow-inner">
              {isSimulating ? (
                simLogs.map((log) => (
                  <div key={log.id} className="flex flex-col space-y-0.5 items-start">
                    <span className="text-[8px] text-zinc-500 tracking-wider font-bold mb-0.5 flex items-center gap-1">
                      <span>{log.emoji}</span>
                      <span>{log.sender}</span>
                      <span>&bull;</span>
                      <span>{log.time}</span>
                    </span>
                    <div className={`p-2 rounded text-[10px] max-w-[95%] leading-relaxed border ${
                      log.type === 'aria' 
                        ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-200'
                        : log.type === 'barton'
                        ? 'bg-blue-950/20 border-blue-500/20 text-blue-200'
                        : log.type === 'cyrus'
                        ? 'bg-rose-950/20 border-rose-500/20 text-rose-200'
                        : log.type === 'daphne'
                        ? 'bg-purple-950/20 border-purple-500/20 text-purple-200'
                        : 'bg-zinc-950 text-zinc-300 border-zinc-900'
                    }`}>
                      {log.message}
                    </div>
                  </div>
                ))
              ) : (
                aiMessages.map((msg, i) => (
                  <div key={i} className={`flex flex-col space-y-0.5 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <span className="text-[8px] text-zinc-500 tracking-wider font-semibold mb-0.5">
                      {msg.sender === 'user' ? 'ME (ROOT)' : currentSpecialist.name.split(' ').pop()} &bull; {msg.time}
                    </span>
                    <div className={`p-2 rounded text-[10px] max-w-[90%] leading-relaxed border ${
                      msg.sender === 'user' 
                        ? 'bg-[#1D9BF0]/15 text-blue-250 border-[#1D9BF0]/30' 
                        : 'bg-zinc-950 text-zinc-300 border-zinc-900'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="h-[1px] bg-zinc-900/60 my-1" />
            <div className="flex items-center justify-between text-[8px] text-zinc-500">
              <span className="flex items-center gap-1 font-mono uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                SIM_AUTO_COLLABORATION
              </span>
              <span>SLA: EXCELLENT</span>
            </div>
          </div>

          {/* Suggestions container based on selectedTab */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block font-mono pl-1">
              推荐指令 / SUGGESTIONS
            </span>
            <div className="flex flex-col gap-1">
              {currentSpecialist.suggestions.slice(0, 3).map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(s)}
                  className="w-full text-left text-[10px] font-sans text-zinc-400 hover:text-white hover:bg-neutral-900 p-1.5 rounded border border-zinc-900 hover:border-zinc-800 transition cursor-pointer flex items-center space-x-1.5"
                >
                  <span className="text-[#1D9BF0]">💡</span>
                  <span>{s}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Input area & Premium Copilot toolbar */}
        <div className="pt-2 border-t border-[#2F3336]/60 space-y-2">
          
          {/* Action strip under dialog box */}
          <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-850 flex items-center justify-between">
            <span className="text-[8.5px] font-mono text-zinc-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
              <span>AI 多模态行动工具条 (Copilot)</span>
            </span>
            <div className="flex items-center space-x-1">
              <span className="text-[8px] bg-red-950/20 border border-red-900/10 text-rose-400 px-1 py-0.5 rounded cursor-default select-none">投流</span>
              <span className="text-[8px] bg-blue-950/20 border border-blue-900/10 text-blue-400 px-1 py-0.5 rounded cursor-default select-none">打样</span>
              <span className="text-[8px] bg-emerald-950/20 border border-emerald-900/10 text-emerald-400 px-1 py-0.5 rounded cursor-default select-none font-bold">一揽发</span>
            </div>
          </div>

          <form onSubmit={handleSendMessage} className="flex space-x-1.5">
            <div className="flex-1 bg-zinc-950 rounded-lg flex items-center px-2 py-1.5 border border-zinc-850 focus-within:border-blue-500 transition-all">
              <input
                type="text"
                placeholder={`向 【${currentSpecialist.name.split(' ').pop()}】 提问...`}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                className="w-full bg-transparent text-xs text-white border-none outline-none ring-0 placeholder-zinc-700"
              />
              <button 
                type="button" 
                onClick={() => handleSuggestionClick('上传本日算力分析图片')}
                className="p-1 text-zinc-650 hover:text-zinc-400 transition cursor-pointer"
                title="上传资产或截图"
              >
                <ImageIcon className="w-3.5 h-3.5" />
              </button>
              <button 
                type="button" 
                onClick={() => handleSuggestionClick('发起语音指令平整度校验')}
                className="p-1 text-zinc-650 hover:text-zinc-400 transition cursor-pointer"
                title="语音输入"
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
            </div>
            <button
              type="submit"
              className="bg-[#1D9BF0] hover:bg-blue-500 rounded-lg p-2 flex items-center justify-center text-white transition cursor-pointer shadow-lg shadow-blue-500/10 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>

      </aside>

    </div>
  );
}
