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
  Video,
  HelpCircle,
  BookOpen,
  Menu,
  ChevronRight,
  TrendingUp,
  Send,
  Mic,
  Image as ImageIcon,
  Sparkles,
  MessageSquare,
  Terminal,
  Database,
  Github,
  MessageCircle,
  Smartphone,
  Chrome,
  Zap,
  File,
  HardDrive,
  ShieldCheck,
  List,
  Server,
  Eye,
  Code,
  Loader2,
  Check,
  CreditCard,
  Wallet,
  ShoppingBag,
  Heart,
  Headphones,
  Layout,
  Globe2
} from 'lucide-react';
import { db } from '../services/firebase';
import { apiService } from '../services/api';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';
import AuthPanel from './platform-admin/AuthPanel';
import StoreCountCard from './platform-admin/StoreCountCard';
import TenantManagement from './platform-admin/TenantManagement';
import PlatformFinance from './platform-admin/PlatformFinance';
import BillingSubscriptionPanel from './BillingSubscriptionPanel';
import PlatformAnalytics from './platform-admin/PlatformAnalytics';
import InfrastructureServices from './platform-admin/InfrastructureServices';
import OperationsDevOps from './platform-admin/OperationsDevOps';
import SystemSettings from './platform-admin/SystemSettings';
import AppStoreManagement from './platform-admin/AppStoreManagement';
import ThemeStore from './platform-admin/ThemeStore';
import CustomerSupport from './platform-admin/CustomerSupport';
import LVAView from './platform-admin/LVAView';
import ECCAgentConsole from './ECCAgentConsole';
import MarkItDownHub from './MarkItDownHub';
import { generateWithOllama } from '../services/ollama.service';

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
    name: 'Fiona',
    role: '全局托管',
    emoji: '🧙',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    desc: '监控算力分配与系统收益。',
    suggestions: ['算力预警', '刷新会话', '本日分析'],
  },
  company: {
    name: 'Susan',
    role: '租户审计',
    emoji: '👩‍💼',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80',
    desc: '负责企业准入与资质审核。',
    suggestions: ['一键准入', '驳回申请', '到期检查'],
  },
  ai: {
    name: 'Barton',
    role: '智体调度',
    emoji: '🤖',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    desc: '调整智体权重与接口流控。',
    suggestions: ['调整权重', '智能限速', '刷新能力'],
  },
  task: {
    name: 'Cyrus',
    role: '流水调试',
    emoji: '👨‍🎤',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
    desc: '追踪流程断点与接口回调。',
    suggestions: ['单步运行', '重放订单', '释放队列'],
  },
  template: {
    name: 'Aria',
    role: '行业模板',
    emoji: '🎨',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80',
    desc: '管理行业微调与指令模板。',
    suggestions: ['预装模板', '验证指令', '检查机制'],
  },
  finance: {
    name: 'Fiona',
    role: '财务金流',
    emoji: '🧮',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    desc: '处理支付对账与费用核扣。',
    suggestions: ['模拟入账', '损益报表', '平盘分析'],
  },
  user: {
    name: 'Jane',
    role: '安全风控',
    emoji: '👮‍♀️',
    avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=150&h=150&q=80',
    desc: '审计登录安全与权限一致。',
    suggestions: ['检索会话', '拉黑账号', '刷新权限'],
  },
  database: {
    name: 'Vance',
    role: '本地存储',
    emoji: '🗄️',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80',
    desc: '同步本地数据与备份回滚。',
    suggestions: ['浏览库', '刷新缓存', '数据回滚'],
  },
  knowledge: {
    name: 'Nova',
    role: '知识库',
    emoji: '📚',
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&h=150&q=80',
    desc: '管理行业知识与产品档案。',
    suggestions: ['更新知识', '导入档案', '优化营销'],
  },
  infra: {
    name: 'Vance',
    role: '基础底层',
    emoji: '🔌',
    avatar: 'https://images.unsplash.com/photo-1550439062-609e1531270e?auto=format&fit=crop&w=150&h=150&q=80',
    desc: '监控 API 流量与服务架构。',
    suggestions: ['检查流量', '同步日志', '清理缓存'],
  },
  system: {
    name: 'Vance',
    role: '安全防护',
    emoji: '👨‍🔧',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80',
    desc: '管理密钥池与防火墙状态。',
    suggestions: ['激活防护', '重刷密钥', '清空日志'],
  },
  settings: {
    name: 'Vance',
    role: '全域总控',
    emoji: '⚙️',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80',
    desc: '管理平台全局参数、支付网关与 AI 策略。',
    suggestions: ['功能注册', '支付开关', '通知配置'],
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
  const [activeTab, setActiveTab] = useState<'overview' | 'company' | 'ai' | 'ecc' | 'task' | 'template' | 'finance' | 'user' | 'support' | 'lva' | 'system' | 'database' | 'knowledge' | 'infra' | 'settings' | 'app_store' | 'theme' | 'ops'>(
    defaultView === 'system' ? 'system' : 'overview'
  );
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [kbSearch, setKbSearch] = useState<string>('');

  // --- PLATFORM SETTINGS STATE ---
  const [platformSettings, setPlatformSettings] = useState<any>({
    ai: {
      provider: 'ollama',
      model: 'llama3.1:8b',
      endpoint: 'http://localhost:11434',
      apiKey: '••••••••••••••••'
    },
    payment: {
      stripe: true,
      alipay: true,
      wechat: true,
      paypal: false,
      testMode: true
    },
    features: {
      allowRegistration: true,
      maintenanceMode: false,
      aiAutoDispatch: true
    },
    notifications: {
      email: true,
      webhook: true,
      sms: false
    },
    security: {
      twoFactorRequired: false,
      sessionTimeout: 3600,
      maxLoginAttempts: 5
    }
  });
  const [configRegistry, setConfigRegistry] = useState<any[]>([]);
  const [configReport, setConfigReport] = useState<any>(null);
  const [isSettingsLoading, setIsSettingsLoading] = useState(false);

  const loadPlatformSettings = async () => {
    setIsSettingsLoading(true);
    try {
      const data = await apiService.platformSettings.get();
      if (data.settings) {
        setPlatformSettings(data.settings);
      }
    } catch (e) {
      console.error('Failed to load platform settings:', e);
    } finally {
      setIsSettingsLoading(false);
    }
  };

  const loadConfigRegistry = async () => {
    try {
      const [registryData, reportData] = await Promise.all([
        apiService.configRegistry.list(),
        apiService.configRegistry.report()
      ]);
      if (registryData.registry) setConfigRegistry(registryData.registry);
      if (reportData.report) setConfigReport(reportData.report);
    } catch (e) {
      console.error('Failed to load config registry:', e);
    }
  };

  useEffect(() => {
    loadPlatformSettings();
    loadConfigRegistry();
  }, []);

  useEffect(() => {
    if (activeTab === 'settings') {
      loadPlatformSettings();
      loadConfigRegistry();
    }
  }, [activeTab]);

  const saveSettings = async (category: string, data: any) => {
    const newSettings = { ...platformSettings, [category]: data };
    setPlatformSettings(newSettings);
    try {
      await apiService.platformSettings.update(newSettings);
      await loadConfigRegistry();
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  };

  // --- OLLAMA STATE ---
  const [ollamaStatus, setOllamaStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [ollamaModels, setOllamaModels] = useState<any[]>([]);

  useEffect(() => {
    const checkOllama = async () => {
      try {
        const res = await fetch('http://localhost:11434/api/tags');
        if (res.ok) {
          const data = await res.json();
          setOllamaStatus('connected');
          setOllamaModels(data.models || []);
        } else {
          setOllamaStatus('disconnected');
        }
      } catch (e) {
        setOllamaStatus('disconnected');
      }
    };
    checkOllama();
  }, []);
  // --- SUB-SECTIONS STATE ---
   const [selectedSubTab, setSelectedSubTab] = useState<string>('all');
   const [selectedIndustry, setSelectedIndustry] = useState<string>('fashion');
  const [kbCategory, setKbCategory] = useState<string>('all');
  const [infraSubTab, setInfraSubTab] = useState<'rbac' | 'api' | 'infrastructure' | 'firewall' | 'queue' | 'bucket'>('rbac');

  const [operationDocs, setOperationDocs] = useState<any[]>([]);
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [docTags, setDocTags] = useState('');
  const [tenantList, setTenantList] = useState<any[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('MODA_FASHION_01');
  const [tenantQuotaInput, setTenantQuotaInput] = useState<number>(0);
  const [auditMessage, setAuditMessage] = useState('');
  const [opLoading, setOpLoading] = useState(false);
  const [opMessage, setOpMessage] = useState('等待操作...');
  const [templateInstallIndustry, setTemplateInstallIndustry] = useState<'fashion' | 'catering' | 'beauty' | 'fitness' | 'jewelry' | 'retail'>('fashion');
  const [docSaveStatus, setDocSaveStatus] = useState<string>('');

  const loadOperationData = async () => {
    setOpLoading(true);
    try {
      const [docsRes, tenantsRes] = await Promise.all([
        apiService.documents.list(),
        apiService.tenants.list()
      ]);

      if (docsRes?.documents) {
        setOperationDocs(docsRes.documents);
      }

      const tenants = tenantsRes?.tenants || tenantsRes?.merchants || [];
      setTenantList(tenants);
      if (tenants.length > 0) {
        const defaultId = tenants[0].id || tenants[0].merchantId || tenants[0].name;
        setSelectedTenantId(defaultId);
        setTenantQuotaInput(Number(tenants[0].quotaLimit || tenants[0].quota || 0));
      }
    } catch (e) {
      console.error('Failed to load operations data:', e);
    } finally {
      setOpLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'ops') {
      loadOperationData();
    }
  }, [activeTab]);

  const createOperationalDocument = async () => {
    if (!docTitle.trim() || !docContent.trim()) {
      setDocSaveStatus('文档标题和内容不能为空');
      return;
    }
    setOpLoading(true);
    try {
      const tenantId = selectedTenantId || 'default_tenant';
      const response = await apiService.documents.create(tenantId, docTitle.trim(), docContent.trim(), docTags.split(',').map(tag => tag.trim()).filter(Boolean));
      if (response?.document) {
        setOperationDocs(prev => [response.document, ...prev]);
        setDocTitle('');
        setDocContent('');
        setDocTags('');
        setDocSaveStatus('运营文档已保存并入库');
        setOpMessage(`已为商户 ${tenantId} 写入新文档：${response.document.title}`);
      }
    } catch (e) {
      console.error('Failed to save document:', e);
      setDocSaveStatus('保存失败，请重试');
    } finally {
      setOpLoading(false);
    }
  };

  const handleInstallTemplate = async () => {
    if (!selectedTenantId) return;
    setOpLoading(true);
    try {
      await apiService.templates.install(selectedTenantId, templateInstallIndustry);
      setOpMessage(`已为 ${selectedTenantId} 预装行业模板：${templateInstallIndustry}`);
    } catch (e) {
      console.error('Failed to install template:', e);
      setOpMessage('模板安装失败，请检查权限');
    } finally {
      setOpLoading(false);
    }
  };

  const handleSyncOrders = async () => {
    if (!selectedTenantId) return;
    setOpLoading(true);
    try {
      await apiService.channels.syncOrders(selectedTenantId);
      setOpMessage(`已触发 ${selectedTenantId} 的渠道订单同步`);
    } catch (e) {
      console.error('Order sync failed:', e);
      setOpMessage('渠道订单同步失败，请重试');
    } finally {
      setOpLoading(false);
    }
  };

  const handleSuspendTenant = async (tenantId: string, suspend = true) => {
    setOpLoading(true);
    try {
      await apiService.merchants.suspend(tenantId, `Platform admin ${suspend ? 'initiated suspension' : 'reactivation'}`, suspend);
      setTenantList(prev => prev.map(t => t.id === tenantId ? { ...t, status: suspend ? 'suspended' : 'active' } : t));
      setCompanies(prev => prev.map(c => c.id === tenantId ? { ...c, status: suspend ? '已挂起' : '运行中' } : c));
      setOpMessage(suspend ? `已挂起商户 ${tenantId}` : `已恢复商户 ${tenantId}`);
    } catch (e) {
      console.error('Suspend failed:', e);
      setOpMessage('商户状态更新失败');
    } finally {
      setOpLoading(false);
    }
  };

  const handleUpdateTenantQuota = async () => {
    if (!selectedTenantId) return;
    setOpLoading(true);
    try {
      await apiService.tenants.update(selectedTenantId, { quotaLimit: tenantQuotaInput });
      setTenantList(prev => prev.map(t => t.id === selectedTenantId ? { ...t, quotaLimit: tenantQuotaInput } : t));
      setOpMessage(`租户 ${selectedTenantId} 的配额已更新为 ${tenantQuotaInput}`);
    } catch (e) {
      console.error('Quota update failed:', e);
      setOpMessage('租户配额更新失败，请重试');
    } finally {
      setOpLoading(false);
    }
  };

  const handleCreateAuditLog = async () => {
    if (!selectedTenantId) {
      setAuditMessage('请先选择租户');
      return;
    }
    setOpLoading(true);
    try {
      const logResult = await apiService.auditLogs.create(selectedTenantId, 'TENANT_ADMIN_REVIEW', 'PLATFORM_ADMIN', `Admin review action executed for tenant ${selectedTenantId}`);
      if (logResult?.log) {
        setAuditMessage(`已记录审计日志：${logResult.log.action}`);
      } else {
        setAuditMessage('审计日志已提交');
      }
    } catch (e) {
      console.error('Audit log creation failed:', e);
      setAuditMessage('审计日志提交失败');
    } finally {
      setOpLoading(false);
    }
  };

  const refreshTenantData = async () => {
    await loadOperationData();
    setOpMessage('租户与文档数据已刷新');
  };

  // --- INDUSTRY TEAMS DATA (Consolidated from AITeamsView) ---
  const industryTeams = [
    {
      id: 'fashion',
      name: '服装团队',
      emoji: '👗',
      tagline: '潮流预测、成本核算、一件发货。',
      color: 'from-sky-500/20 to-indigo-500/10 border-sky-500/30',
      roster: [
        { role: '设计师', name: 'Aria', emoji: '🎨', desc: '负责视觉陈列与海报设计。', status: 'active', specialty: ['橱窗搭配', '品牌设计'], cognitiveWeight: 'GPT-4o', promptsCount: 14 },
        { role: '采购经理', name: 'Barton', emoji: '👚', desc: '负责款式采购与上架。', status: 'active', specialty: ['趋势抓取', '精算体系'], cognitiveWeight: 'Gemini Pro', promptsCount: 8 },
        { role: '运营经理', name: 'Cyrus', emoji: '📈', desc: '负责物流揽件与库存监控。', status: 'active', specialty: ['物流履约', '库存告警'], cognitiveWeight: 'Claude 3.5', promptsCount: 19 },
        { role: '营销经理', name: 'Daphne', emoji: '📣', desc: '负责文案输出与视频脚本。', status: 'active', specialty: ['种草文案', '短视频'], cognitiveWeight: 'DeepSeek', promptsCount: 22 },
        { role: '财务主管', name: 'Fiona', emoji: '🧮', desc: '负责对账与损益核算。', status: 'active', specialty: ['资金核销', '损耗精算'], cognitiveWeight: 'DeepSeek-R1', promptsCount: 15 },
        { role: '客服主管', name: 'Claire', emoji: '💬', desc: '负责售后接待与退款解决。', status: 'active', specialty: ['响应安抚', '阻退解决'], cognitiveWeight: 'GPT-4o-mini', promptsCount: 20 }
      ]
    },
    {
      id: 'catering',
      name: '餐饮团队',
      emoji: '🍛',
      tagline: '外卖调度、满减核算、探店推广。',
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30',
      roster: [
        { role: '菜单顾问', name: 'Kai', emoji: '🍽️', desc: '负责网店视觉与海报。', status: 'active', specialty: ['菜单陈列', 'VI排版'], cognitiveWeight: 'Gemini Flash', promptsCount: 11 },
        { role: '采购经理', name: 'Ren', emoji: '🍜', desc: '负责新品研发与配方。', status: 'active', specialty: ['菜谱研发', '溢价建议'], cognitiveWeight: 'Gemini Pro', promptsCount: 6 },
        { role: '运营经理', name: 'Lulu', emoji: '📈', desc: '负责派单调度与售后。', status: 'active', specialty: ['派单呼叫', '资金对账'], cognitiveWeight: 'GPT-4o-mini', promptsCount: 15 },
        { role: '营销经理', name: 'Soren', emoji: '📣', desc: '负责营销活动与神券。', status: 'active', specialty: ['神券预算', '社群宣发'], cognitiveWeight: 'DeepSeek-R1', promptsCount: 25 },
        { role: '财务主管', name: 'Ken', emoji: '💰', desc: '负责账期对冲与核算。', status: 'active', specialty: ['账期审计', '食材统计'], cognitiveWeight: 'DeepSeek-V3', promptsCount: 12 },
        { role: '客服主管', name: 'Mia', emoji: '📞', desc: '负责出餐关怀与赔付。', status: 'active', specialty: ['危机处理', '专属券'], cognitiveWeight: 'GPT-4o-mini', promptsCount: 18 }
      ]
    },
    {
      id: 'retail',
      name: '零售团队',
      emoji: '🏪',
      tagline: '选品定价、官方配送、推广竞价。',
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30',
      roster: [
        { role: '选品顾问', name: 'Dax', emoji: '🏪', desc: '负责门面布局与陈列。', status: 'active', specialty: ['风格适配', '一键换色'], cognitiveWeight: 'Gemini Flash', promptsCount: 9 },
        { role: '采购经理', name: 'Barton', emoji: '📦', desc: '负责百货开发与熔断。', status: 'active', specialty: ['质量监控', '规格定价'], cognitiveWeight: 'Claude 3.5', promptsCount: 12 },
        { role: '运营经理', name: 'Cyrus', emoji: '📈', desc: '负责一单代发与跟踪。', status: 'active', specialty: ['包裹监控', '货代审计'], cognitiveWeight: 'GPT-4o', promptsCount: 20 },
        { role: '营销经理', name: 'Nova', emoji: '📣', desc: '负责折扣策划与竞价。', status: 'active', specialty: ['自动竞价', '裂变文案'], cognitiveWeight: 'DeepSeek-V3', promptsCount: 21 },
        { role: '财务主管', name: 'Henry', emoji: '🏦', desc: '负责税务结算与审计。', status: 'active', specialty: ['税务合规', '多币种损益'], cognitiveWeight: 'DeepSeek-R1', promptsCount: 16 },
        { role: '客服主管', name: 'Holly', emoji: '🗣️', desc: '负责参数解答与查询。', status: 'active', specialty: ['信息秒查', '多语沟通'], cognitiveWeight: 'GPT-4o-mini', promptsCount: 17 }
      ]
    }
  ];

  // --- KNOWLEDGE BASE DATA (Consolidated from KnowledgeBaseView) ---
  const [kbFiles, setKbFiles] = useState([
    { id: 'f1', name: '2026年服装电商小红书种草推广高点击率词汇黄金配方.docx', category: 'marketing', fileSize: '240 KB', uploadedAt: '2026-06-02 23:45', tokens: 15400 },
    { id: 'f2', name: '摩登精品12大核心SKU面料精梳棉高支参数配方.pdf', category: 'product', fileSize: '1.2 MB', uploadedAt: '2026-06-02 23:30', tokens: 42000 },
    { id: 'f3', name: '顺丰大兴一级保仓航空快递协议托运与退赔政策.pdf', category: 'operating', fileSize: '480 KB', uploadedAt: '2026-06-02 23:15', tokens: 18900 },
    { id: 'f4', name: '2026年度多商铺损益分析与支付宝对账审计流程.pdf', category: 'corporate', fileSize: '850 KB', uploadedAt: '2026-06-02 21:00', tokens: 28400 },
    { id: 'f5', name: '餐饮行业美团大众外卖折扣代金满减神券精算模版.xlsx', category: 'industry', fileSize: '180 KB', uploadedAt: '2026-06-02 18:30', tokens: 9200 }
  ]);

  const kbCategories = [
    { id: 'all', name: '全部知识库', count: kbFiles.length },
    { id: 'industry', name: '行业知识库', count: kbFiles.filter(f => f.category === 'industry').length },
    { id: 'product', name: '产品知识库', count: kbFiles.filter(f => f.category === 'product').length },
    { id: 'operating', name: '运营知识库', count: kbFiles.filter(f => f.category === 'operating').length },
    { id: 'marketing', name: '营销知识库', count: kbFiles.filter(f => f.category === 'marketing').length },
    { id: 'corporate', name: '企业知识库', count: kbFiles.filter(f => f.category === 'corporate').length }
  ];

  // --- INFRA LAYER DATA (Consolidated from SystemBaseView) ---
  const [swaggerResponse, setSwaggerResponse] = useState<string>('【空闲中】等待执行 API 调用请求校验测试...');
  const [isCallingAPI, setIsCallingAPI] = useState(false);
  
  const handleTestAPIEndpoint = (endpoint: string) => {
    setIsCallingAPI(true);
    setSwaggerResponse(`【调用中】POST ${endpoint} 对接握手建立。进行 RBAC 鉴权比对中...`);
    setTimeout(() => {
      setIsCallingAPI(false);
      setSwaggerResponse(`【校验完成】200 OK
Response Payload:
{
  "status": "success",
  "requestId": "req_sh_92a9b${Math.floor(Math.random() * 90000) + 10000}cfff",
  "timestamp": "2026-06-02 23:53:50 UTC",
  "data": {
    "authChecked": true,
    "userRole": "AI_AGENT_AUTONOMOUS",
    "allocatedHost": "https://pay.modaui.com/api/v1",
    "envPort": 3000
  }
}`);
    }, 1200);
  };

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
    ollamaLocal: true,
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
    { code: 'fashion', name: '时尚服装快反模板', specialists: 6, nodeType: '高级工作流', rating: '9.8', apps: 420, templates: ['Vogue Luxe', 'Street Trend', 'Eco Minimal'] },
    { code: 'catering', name: '智慧餐饮外卖模板', specialists: 6, nodeType: '本地即开型', rating: '9.6', apps: 310, templates: ['Michelin Dark', 'Insta-Bistro', 'Editorial Story'] },
    { code: 'retail', name: '跨境百货大宗模板', specialists: 6, nodeType: '多接口联动型', rating: '9.5', apps: 280, templates: ['Global Market', 'Editorial Curated', 'Street Drop'] },
    { code: 'beauty', name: '丽人美业沙龙模板', specialists: 5, nodeType: '预约卡券型', rating: '9.4', apps: 195, templates: ['Zen Spa', 'Glamour Studio', 'Luxury Clinic'] },
    { code: 'fitness', name: '健身运动轻食模板', specialists: 5, nodeType: '社群裂变型', rating: '9.2', apps: 130, templates: ['Iron Core', 'Flow Yoga', 'Tech Wellness'] },
    { code: 'jewelry', name: '高定珠宝极奢模板', specialists: 6, nodeType: '全真挂牌型', rating: '9.9', apps: 155, templates: ['Royal Heritage', 'Modern Carat', 'Editorial Showcase'] },
    { code: 'home', name: '家居生活整装模板', specialists: 6, nodeType: '大件物流型', rating: '9.3', apps: 88, templates: ['Nordic Loft', 'Urban Chic', 'Modern Estate'] }
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

  const [agents, setAgents] = useState<any[]>([
     { 
       id: 'ag1', 
       name: 'Aria', 
       role: '设计师', 
       avatar: '🎨', 
       status: 'IDLE', 
       model: 'GPT-4o', 
       tokensUsed: 1200, 
       temperature: 0.7, 
       activeThreads: 0, 
       memorySlots: 12, 
       workspaceFiles: ['layout_canvas_cfg.json'], 
       activeTask: '待命' 
     },
     { 
       id: 'ag2', 
       name: 'Barton', 
       role: '采购经理', 
       avatar: '👚', 
       status: 'EXECUTING', 
       model: 'Gemini Pro', 
       tokensUsed: 2500, 
       temperature: 0.4, 
       activeThreads: 2, 
       memorySlots: 8, 
       workspaceFiles: ['supplier_contracts.db'], 
       activeTask: '正在同步供应商库存' 
     },
     { 
       id: 'ag3', 
       name: 'Cyrus', 
       role: '运营经理', 
       avatar: '📈', 
       status: 'IDLE', 
       model: 'Claude 3.5', 
       tokensUsed: 800, 
       temperature: 0.5, 
       activeThreads: 0, 
       memorySlots: 16, 
       workspaceFiles: ['roi_lever_optimizer.py'], 
       activeTask: '待命' 
     }
   ]);

  const [logs, setLogs] = useState<string[]>([]);
  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 49)]);
    setTaskLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 49)]);
  };

  const [firewallActive, setFirewallActive] = useState<boolean>(true);
  const [rbacMatrix, setRbacMatrix] = useState<Record<string, Record<string, boolean>>>({
    admin: { all: true },
    founder: { merchant_manage: true, store_manage: true, product_manage: true, order_manage: true, finance_read: true },
    manager: { store_manage: true, product_manage: true, order_manage: true },
    staff: { order_manage: true, product_read: true },
    customer: { shop_view: true, cart_manage: true, order_create: true }
  });

  useEffect(() => {
    const loadRbac = async () => {
      try {
        const docSnap = await getDoc(doc(db!, 'system', 'rbac_config'));
        if (docSnap.exists() && docSnap.data().matrix) {
          setRbacMatrix(docSnap.data().matrix);
        }
      } catch (e) {
        console.error("Failed to load RBAC from cloud:", e);
      }
    };
    loadRbac();
  }, []);

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
  const [databaseJson, setDatabaseJson] = useState<any>(null);
  const [isLoadingDb, setIsLoadingDb] = useState(false);

  // Fetch local database content
  const fetchDatabase = async () => {
    setIsLoadingDb(true);
    try {
      const sessionId = localStorage.getItem('platform_admin_session') || '';
      const resp = await fetch('/api/admin/db', {
        headers: { 'Authorization': sessionId }
      });
      const result = await resp.json();
      if (result.success) {
        setDatabaseJson(result.data);
      }
    } catch (e) {
      console.error("Failed to fetch database:", e);
    } finally {
      setIsLoadingDb(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'database') {
      fetchDatabase();
    }
  }, [activeTab]);

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

  const toggleRbac = async (role: string, right: string) => {
    const newValue = !rbacMatrix[role][right];
    const newMatrix = {
      ...rbacMatrix,
      [role]: {
        ...rbacMatrix[role],
        [right]: newValue
      }
    };
    setRbacMatrix(newMatrix);
    
    // PERSIST TO FIRESTORE
    try {
      await setDoc(doc(db!, 'system', 'rbac_config'), {
        matrix: newMatrix,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.error("Failed to sync RBAC to cloud:", e);
    }
  };

  const toggleKeyVisibility = (name: string) => {
    setApiKeys(prev => prev.map(k => k.name === name ? { ...k, hidden: !k.hidden } : k));
  };

  // Missing functions found in linter errors
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSpawning, setIsSpawning] = useState(false);
  const [spawnKeyword, setSpawnKeyword] = useState('');
  const [spawnedAI, setSpawnedAI] = useState<any>(null);
  const [simLogs, setSimLogs] = useState<any[]>([]);
  
  // --- AI SPAWNING LOGIC ---
  const handleSpawnAI = async () => {
    if (!spawnKeyword.trim()) return;
    setIsSpawning(true);
    setSpawnedAI(null);
    
    try {
      const prompt = `Generate a JSON object for a professional AI specialist based on the keyword: "${spawnKeyword}". 
      Return ONLY valid JSON with fields: name (Chinese), role (Chinese), emoji, desc (short Chinese), specialty (array of 3 skills), cognitiveWeight (e.g. GPT-4o, Llama3). 
      Make it professional for an enterprise operations system.`;
      
      const response = await generateWithOllama(prompt, "llama3.1:8b");
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const aiData = JSON.parse(jsonMatch[0]);
        setSpawnedAI(aiData);
      }
    } catch (e) {
      console.error("Spawn Error:", e);
      setSpawnedAI({
        name: "智脑助手",
        role: "通用执行官",
        emoji: "🤖",
        desc: "本地算力响应异常，已切换至基础智体模型。",
        specialty: ["任务处理", "逻辑推理", "基础问答"],
        cognitiveWeight: "Local-Base"
      });
    } finally {
      setIsSpawning(false);
    }
  };

  const runCoCollaborationSim = () => {
    setIsSimulating(true);
    const now = new Date().toLocaleTimeString();
    setSimLogs([
      { id: 1, emoji: '🎨', sender: 'Aria', time: now, type: 'aria', message: '正在解析多租户行业意向，准备生成文案资产...' },
      { id: 2, emoji: '📦', sender: 'Barton', time: now, type: 'barton', message: '已锁定供应商库存，正在执行自动竞价逻辑。' }
    ]);
    
    setTimeout(() => {
      const nextTime = new Date().toLocaleTimeString();
      setSimLogs(prev => [
        ...prev,
        { id: 3, emoji: '🚀', sender: 'System', time: nextTime, type: 'system', message: '协作成功！所有智体已就位并完成流水同步。' }
      ]);
      setIsSimulating(false);
    }, 2500);
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
            主控
          </span>
          {[
            { id: 'overview', label: '控制台', icon: BarChart3 },
            { id: 'company', label: '企业管理', icon: Building2 },
            { id: 'ops', label: '运营文档', icon: Terminal },
            { id: 'ai', label: '智体调度', icon: Cpu },
            { id: 'ecc', label: 'ECC 智控', icon: ShieldCheck },
            { id: 'task', label: '任务流水', icon: Workflow },
            { id: 'template', label: '行业模板', icon: LayoutTemplate },
            { id: 'app_store', label: '应用市场', icon: ShoppingBag },
            { id: 'theme', label: '主题商店', icon: Layout },
            { id: 'lva', label: '视频智体', icon: Video },
            { id: 'knowledge', label: '知识库', icon: BookOpen },
            { id: 'finance', label: '财务记账', icon: Coins },
            { id: 'user', label: '用户账号', icon: Users },
            { id: 'support', label: '客户支持', icon: Headphones },
            { id: 'database', label: '数据库', icon: Database },
            { id: 'infra', label: '系统底层', icon: Activity },
            { id: 'settings', label: '全局设置', icon: Sliders },
            { id: 'system', label: '系统安全', icon: Lock }
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
                  {activeTab === 'overview' && '控制台'}
                  {activeTab === 'company' && '企业管理'}
                  {activeTab === 'ops' && '运营文档'}
                  {activeTab === 'ai' && '智体调度'}
                  {activeTab === 'task' && '任务流水'}
                  {activeTab === 'template' && '行业模板'}
                  {activeTab === 'finance' && '财务记账'}
                  {activeTab === 'user' && '用户账号'}
                  {activeTab === 'system' && '系统设置'}
                </span>
                <span className="mx-2 select-none text-zinc-700">&bull;</span>
                <span className="text-[10px] text-zinc-500">执勤: {currentSpecialist.name}</span>
              </div>
              <h2 className="text-sm font-extrabold text-white mt-0.5 flex items-center gap-1.5 font-sans uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span>MODAUI 总后台</span>
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
                <div className="space-y-6">
                  <StoreCountCard />
                  <PlatformAnalytics />
                </div>
              )}

              {/* ----------------- 2. 公司中心 / COMPANY CENTER ----------------- */}
              {activeTab === 'company' && (
                <TenantManagement 
                  shops={companies.map(c => ({
                    id: c.id,
                    name: c.name,
                    industry: c.industry.includes('服装') ? 'fashion' : 
                             c.industry.includes('餐饮') ? 'catering' : 
                             c.industry.includes('百货') ? 'retail' : 
                             c.industry.includes('美业') ? 'beauty' : 
                             c.industry.includes('健身') ? 'fitness' : 'jewelry',
                    founderEmail: 'admin@modaui.com',
                    planLevel: c.plan.includes('企业') ? 'Enterprise' : c.plan.includes('专业') ? 'Pro' : 'Trial',
                    dailyTokens: 50000,
                    cpuQuota: '2.0 Cores',
                    totalSalesSimulated: 0,
                    status: c.status === '运行中' ? 'active' : 'suspended'
                  })) as any}
                  onUpdateShops={(newShops) => {
                    setCompanies(newShops.map(s => ({
                      id: s.id,
                      name: s.name,
                      industry: s.industry === 'fashion' ? '服装快反' : 
                               s.industry === 'catering' ? '餐饮外卖' : 
                               s.industry === 'retail' ? '跨境百货' : 
                               s.industry === 'beauty' ? '美业沙龙' : 
                               s.industry === 'fitness' ? '运动健身' : '高定珠宝',
                      plan: s.planLevel === 'Enterprise' ? '企业尊享版' : s.planLevel === 'Pro' ? '专业高级版' : '新手体验版',
                      status: s.status === 'active' ? '运行中' : '已挂起',
                      specialistCount: 6,
                      billingCycle: '2026-06'
                    })));
                  }}
                />
              )}

              {activeTab === 'ops' && (
                <div className="space-y-6">
                  <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-white">运营控制面板</h3>
                          <p className="text-sm text-neutral-400">管理租户、渠道同步、行业模板和运营文档。</p>
                        </div>
                        <button
                          onClick={refreshTenantData}
                          className="text-xs uppercase tracking-[0.18em] px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 transition"
                        >
                          刷新数据
                        </button>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-3xl bg-[#08080A] border border-[#2F3336] p-4">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-xs uppercase tracking-[0.18em] text-slate-500">租户总览</span>
                            <span className="text-xs text-slate-400">{tenantList.length} 个租户</span>
                          </div>
                          <div className="space-y-3">
                            {tenantList.slice(0, 4).map(tenant => (
                              <div key={tenant.id} className="flex items-center justify-between gap-3 text-sm text-slate-200">
                                <div>
                                  <div className="font-semibold">{tenant.name || tenant.id}</div>
                                  <div className="text-xs text-slate-500">{tenant.billingStatus || tenant.status || 'active'}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleSuspendTenant(tenant.id, tenant.status !== 'suspended')}
                                    className="text-xs text-rose-300 hover:text-white"
                                  >{tenant.status === 'suspended' ? '恢复' : '挂起'}</button>
                                  <button
                                    onClick={() => {
                                      setSelectedTenantId(tenant.id);
                                      setTenantQuotaInput(Number(tenant.quotaLimit || tenant.quota || 0));
                                    }}
                                    className="text-xs text-slate-400 hover:text-white"
                                  >选中</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="rounded-3xl bg-[#08080A] border border-[#2F3336] p-4">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-xs uppercase tracking-[0.18em] text-slate-500">当前激活租户</span>
                            <span className="text-xs text-slate-400">{selectedTenantId || '未选择'}</span>
                          </div>
                          <select
                            value={selectedTenantId}
                            onChange={(e) => setSelectedTenantId(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                          >
                            {tenantList.map((tenant) => (
                              <option key={tenant.id} value={tenant.id}>{tenant.name || tenant.id}</option>
                            ))}
                          </select>
                        </div>
                        <div className="rounded-3xl bg-[#08080A] border border-[#2F3336] p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs uppercase tracking-[0.18em] text-slate-500">租户配额调整</span>
                            <span className="text-xs text-slate-400">当前: {tenantQuotaInput}</span>
                          </div>
                          <input
                            type="number"
                            value={tenantQuotaInput}
                            onChange={(e) => setTenantQuotaInput(Number(e.target.value))}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                            placeholder="输入新的配额"
                          />
                          <button
                            onClick={handleUpdateTenantQuota}
                            className="mt-3 w-full rounded-3xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition"
                          >{opLoading ? '提交中...' : '更新租户配额'}</button>
                          <p className="mt-3 text-xs text-slate-400">{auditMessage || '租户配额变更将在平台账务系统中生效。'}</p>
                        </div>
                      </div>

                      <div className="grid gap-4 lg:grid-cols-3">
                        <button
                          onClick={handleInstallTemplate}
                          className="rounded-3xl border border-blue-500/30 bg-blue-600/10 text-blue-200 px-4 py-3 text-sm font-semibold hover:bg-blue-600/15 transition"
                        >
                          预装行业模板
                        </button>
                        <button
                          onClick={handleSyncOrders}
                          className="rounded-3xl border border-emerald-500/30 bg-emerald-600/10 text-emerald-200 px-4 py-3 text-sm font-semibold hover:bg-emerald-600/15 transition"
                        >渠道订单同步</button>
                        <button
                          onClick={handleCreateAuditLog}
                          className="rounded-3xl border border-slate-500/30 bg-slate-700/10 text-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-700/20 transition"
                        >发布变更审计</button>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-3xl bg-[#08080A] border border-[#2F3336] p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs uppercase tracking-[0.18em] text-slate-500">模板行业</span>
                          </div>
                          <select
                            value={templateInstallIndustry}
                            onChange={(e) => setTemplateInstallIndustry(e.target.value as any)}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                          >
                            <option value="fashion">服装</option>
                            <option value="catering">餐饮</option>
                            <option value="beauty">美业</option>
                            <option value="fitness">健身</option>
                            <option value="jewelry">珠宝</option>
                            <option value="retail">百货</option>
                          </select>
                        </div>
                        <div className="rounded-3xl bg-[#08080A] border border-[#2F3336] p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs uppercase tracking-[0.18em] text-slate-500">当前操作</span>
                          </div>
                          <p className="text-sm text-slate-200 min-h-[64px]">{opMessage}</p>
                        </div>
                        <div className="rounded-3xl bg-[#08080A] border border-[#2F3336] p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs uppercase tracking-[0.18em] text-slate-500">租户配额</span>
                          </div>
                          <div className="space-y-3">
                            <p className="text-sm text-slate-400">选中租户的当前配额可在此处调整并写入平台计费系统。</p>
                            <input
                              type="number"
                              value={tenantQuotaInput}
                              onChange={(e) => setTenantQuotaInput(Number(e.target.value))}
                              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                              placeholder="输入新的配额"
                            />
                            <button
                              onClick={handleUpdateTenantQuota}
                              className="rounded-3xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition"
                            >{opLoading ? '提交中...' : '更新租户配额'}</button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="rounded-3xl bg-[#08080A] border border-[#2F3336] p-6">
                        <h3 className="text-lg font-bold text-white">运营文档写入</h3>
                        <p className="text-sm text-slate-400">将关键运维说明、租户流程和AI调度文档写入平台数据库。</p>
                        <div className="mt-5 space-y-4">
                          <input
                            type="text"
                            value={docTitle}
                            onChange={(e) => setDocTitle(e.target.value)}
                            placeholder="文档标题"
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                          />
                          <textarea
                            value={docContent}
                            onChange={(e) => setDocContent(e.target.value)}
                            rows={6}
                            placeholder="文档内容..."
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                          />
                          <input
                            type="text"
                            value={docTags}
                            onChange={(e) => setDocTags(e.target.value)}
                            placeholder="标签, 例如: 审计, 订单, 模板"
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                          />
                          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                            <span className="text-xs text-slate-400">{docSaveStatus}</span>
                            <button
                              onClick={createOperationalDocument}
                              className="rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition"
                            >{opLoading ? '保存中...' : '保存文档'}</button>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-3xl bg-[#08080A] border border-[#2F3336] p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-white">最近运营文档</h3>
                            <p className="text-sm text-slate-400">直接读取并展示已入库的文档记录。</p>
                          </div>
                          <button
                            onClick={refreshTenantData}
                            className="text-xs uppercase tracking-[0.18em] px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 transition"
                          >刷新列表</button>
                        </div>
                        <div className="space-y-3">
                          {operationDocs.slice(0, 5).map((doc) => (
                            <div key={doc.id} className="rounded-2xl border border-[#2F3336] p-4 bg-[#070708]">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <h4 className="text-sm font-semibold text-white">{doc.title}</h4>
                                  <p className="text-xs text-slate-500">{doc.createdBy} · {new Date(doc.createdAt).toLocaleString()}</p>
                                </div>
                                <span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-400">{doc.tenantId}</span>
                              </div>
                              <p className="mt-3 text-sm text-slate-300 line-clamp-3">{doc.content}</p>
                            </div>
                          ))}
                          {!operationDocs.length && (
                            <div className="text-sm text-slate-500">暂无运营文档，使用上方表单创建第一条。</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------- 3. 智体调度 / AI DISPATCH ----------------- */}
              {activeTab === 'ai' && (
                <div className="space-y-6 text-[#E8EAED]">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                        智体总控
                      </span>
                    </div>
                    <button 
                      onClick={() => setActiveTab('ecc')}
                      className="text-[10px] bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded font-bold hover:bg-indigo-600/30 transition"
                    >
                      进入 ECC 智控中心
                    </button>
                  </div>
                  
                  <ECCAgentConsole 
                    agents={agents}
                    onAddLog={addLog}
                    onUpdateAgentTask={(id, newTask) => {
                      setAgents(prev => prev.map(a => a.id === id ? { ...a, activeTask: newTask } : a));
                    }}
                  />
                </div>
              )}

              {/* ----------------- 3.5 ECC 智控 / ECC CONSOLE ----------------- */}
              {activeTab === 'ecc' && (
                <ECCAgentConsole 
                  agents={agents}
                  onAddLog={addLog}
                  onUpdateAgentTask={(id, newTask) => {
                    setAgents(prev => prev.map(a => a.id === id ? { ...a, activeTask: newTask } : a));
                  }}
                />
              )}

              {/* ----------------- 4. 任务流水 / TASK WORKFLOW ----------------- */}
              {activeTab === 'task' && (
                <OperationsDevOps />
              )}

              {/* ----------------- 5. 行业模板 / INDUSTRY TEMPLATES ----------------- */}
              {activeTab === 'template' && (
                <AppStoreManagement />
              )}

              {/* ----------------- 5.5 应用市场 / APP STORE ----------------- */}
              {activeTab === 'app_store' && (
                <AppStoreManagement />
              )}

              {/* ----------------- 5.6 主题商店 / THEME STORE ----------------- */}
              {activeTab === 'theme' && (
                <ThemeStore />
              )}

              {/* ----------------- 5.7 客户支持 / CUSTOMER SUPPORT ----------------- */}
              {activeTab === 'support' && (
                <CustomerSupport />
              )}

              {/* ----------------- 5.8 LVA 视频智体 / LVA VIDEO AGENT ----------------- */}
              {activeTab === 'lva' && (
                <LVAView />
              )}

              {/* ----------------- 6. 财务中心 / FINANCIAL CENTER ----------------- */}
              {activeTab === 'finance' && (
                <>
                  <BillingSubscriptionPanel tenantId={selectedTenantId} onAddLog={addLog} />
                  <PlatformFinance />
                </>
              )}

              {/* ----------------- 7. 用户中心 / USER CENTER ----------------- */}
              {activeTab === 'user' && (
                <div className="space-y-6 text-[#E8EAED]">
                  
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                        账号审计
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#09090B] rounded-xl border border-zinc-800/80 p-5 shadow-2xl space-y-4">
                    <h3 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider font-mono">账号索引</h3>
                    
                    <div className="overflow-x-auto border border-zinc-800/60 rounded-xl bg-zinc-950/40">
                      <table className="w-full text-left text-xs border-collapse font-mono text-zinc-300">
                        <thead>
                          <tr className="bg-zinc-950 text-[#8B949E] border-b border-zinc-800/80 uppercase text-[10px]">
                            <th className="p-3">账号</th>
                            <th className="p-3">角色</th>
                            <th className="p-3">公司</th>
                            <th className="p-3 text-right">上次接入</th>
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
                              <td className="p-3 text-right text-zinc-500">{user.bgLogs}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* ----------------- 9. 数据库 / DATABASE CENTER ----------------- */}
              {activeTab === 'database' && (
                <div className="space-y-6 text-[#E8EAED]">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                        数据库
                      </span>
                    </div>
                    <button
                      onClick={fetchDatabase}
                      disabled={isLoadingDb}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold font-mono px-3 py-1 rounded-lg transition disabled:opacity-50"
                    >
                      {isLoadingDb ? '刷新中...' : '同步'}
                    </button>
                  </div>

                  <div className="bg-[#09090B] rounded-xl border border-zinc-800/80 p-5 shadow-2xl overflow-hidden flex flex-col h-[600px]">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider font-mono flex items-center gap-2">
                        <Database className="w-3.5 h-3.5" />
                        JSON 视图
                      </h3>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        {databaseJson ? 'CONNECTED' : 'DISCONNECTED'}
                      </div>
                    </div>

                    <div className="flex-1 bg-black/50 border border-zinc-850 rounded-xl p-4 overflow-auto font-mono text-xs text-blue-300 scrollbar-thin">
                      {isLoadingDb ? (
                        <div className="h-full flex items-center justify-center text-zinc-500 italic">
                          拉取中...
                        </div>
                      ) : databaseJson ? (
                        <pre className="whitespace-pre-wrap break-all leading-relaxed">
                          {JSON.stringify(databaseJson, null, 2)}
                        </pre>
                      ) : (
                        <div className="h-full flex items-center justify-center text-rose-500 italic">
                          失败。
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------- 5. 知识中心 / KNOWLEDGE CENTER ----------------- */}
              {activeTab === 'knowledge' && (
                <div className="space-y-6 text-[#E8EAED]">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                        知识库
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Categories */}
                    <div className="lg:col-span-1 space-y-4">
                      <div className="bg-[#09090B] rounded-xl border border-zinc-800/80 p-5 shadow-2xl space-y-4">
                        <h3 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider font-mono">分类</h3>
                        <div className="space-y-1">
                          {kbCategories.map((cat) => (
                            <button
                              key={cat.id}
                              onClick={() => setKbCategory(cat.id)}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all cursor-pointer ${
                                kbCategory === cat.id
                                  ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30'
                                  : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
                              }`}
                            >
                              <span>{cat.name}</span>
                              <span className="text-[10px] font-mono opacity-60">{cat.count}</span>
                            </button>
                          ))}
                        </div>
                        <button className="w-full py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-[10px] font-bold text-zinc-400 hover:border-emerald-500/50 transition-colors flex items-center justify-center gap-2">
                          <Plus className="w-3 h-3" />
                          <span>新增</span>
                        </button>
                      </div>
                    </div>

                    {/* Files List */}
                    <div className="lg:col-span-3 space-y-4">
                      <div className="bg-[#09090B] rounded-xl border border-zinc-800/80 p-5 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
                          <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                            <input
                              type="text"
                              placeholder="搜索..."
                              value={kbSearch}
                              onChange={(e) => setKbSearch(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 pl-9 pr-4 text-xs focus:border-emerald-500 outline-none transition-all"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button className="bg-zinc-900 hover:bg-zinc-800 text-[10px] text-zinc-300 font-bold px-3 py-2 rounded-xl border border-zinc-800 transition flex items-center gap-2">
                              <HardDrive className="w-3 h-3" />
                              <span>同步</span>
                            </button>
                            <button className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-4 py-2 rounded-xl transition shadow-lg shadow-emerald-600/10 flex items-center gap-2">
                              <Plus className="w-3.5 h-3.5" />
                              <span>上传</span>
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {kbFiles
                            .filter(f => kbCategory === 'all' || f.category === kbCategory)
                            .filter(f => f.name.toLowerCase().includes(kbSearch.toLowerCase()))
                            .map((file) => (
                              <div key={file.id} className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-lg bg-emerald-950/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <File className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">{file.name}</h4>
                                    <div className="flex items-center gap-3 mt-1 text-[9px] text-zinc-500 font-mono">
                                      <span className="uppercase px-1.5 py-0.5 bg-zinc-900 rounded border border-zinc-800">{file.category}</span>
                                      <span>{file.fileSize}</span>
                                      <span>{file.uploadedAt}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg border border-zinc-800 transition"><Eye className="w-3.5 h-3.5" /></button>
                                  <button className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg border border-zinc-800 transition"><Settings className="w-3.5 h-3.5" /></button>
                                  <button className="p-2 bg-zinc-900 hover:bg-rose-950/30 text-zinc-400 hover:text-rose-400 rounded-lg border border-zinc-800 hover:border-rose-900/30 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------- 5.5 全局设置 / PLATFORM SETTINGS ----------------- */}
              {activeTab === 'settings' && (
                <div className="space-y-6 text-[#E8EAED]">
                   <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                        平台设置中心
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono">V3.0 Enterprise Admin</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* AI Engine Config */}
                    <div className="bg-[#09090B] rounded-xl border border-zinc-800/80 p-5 shadow-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider font-mono">AI 运行引擎</h3>
                        <div className="px-2 py-0.5 rounded bg-blue-950/30 text-blue-400 text-[9px] border border-blue-900/30">
                          {platformSettings.ai.provider.toUpperCase()}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-500">模型提供商</label>
                          <select 
                            value={platformSettings.ai.provider}
                            onChange={(e) => saveSettings('ai', { ...platformSettings.ai, provider: e.target.value })}
                            className="w-full bg-neutral-900 border border-zinc-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none"
                          >
                            <option value="ollama">Ollama (Local)</option>
                            <option value="openai">OpenAI (SaaS)</option>
                            <option value="anthropic">Anthropic (Claude)</option>
                            <option value="gemini">Google Gemini</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-500">API 端点 / 模型 ID</label>
                          <input 
                            type="text"
                            value={platformSettings.ai.model}
                            onChange={(e) => saveSettings('ai', { ...platformSettings.ai, model: e.target.value })}
                            className="w-full bg-neutral-900 border border-zinc-800 rounded px-2 py-1.5 text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Payment Gateways */}
                    <div className="bg-[#09090B] rounded-xl border border-zinc-800/80 p-5 shadow-2xl space-y-4">
                      <h3 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider font-mono">支付网关管理</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: 'stripe', label: 'Stripe Global', icon: CreditCard },
                          { id: 'alipay', label: '支付宝支付', icon: Wallet },
                          { id: 'wechat', label: '微信支付', icon: Smartphone },
                          { id: 'paypal', label: 'PayPal', icon: DollarSign }
                        ].map(gate => (
                          <div key={gate.id} className="flex items-center justify-between p-2 rounded bg-neutral-900 border border-zinc-800">
                            <div className="flex items-center gap-2">
                              <gate.icon className="w-3 h-3 text-zinc-500" />
                              <span className="text-[10px] font-bold">{gate.label}</span>
                            </div>
                            <button 
                              onClick={() => saveSettings('payment', { ...platformSettings.payment, [gate.id]: !platformSettings.payment[gate.id as keyof typeof platformSettings.payment] })}
                              className={`w-8 h-4 rounded-full relative transition-colors ${platformSettings.payment[gate.id as keyof typeof platformSettings.payment] ? 'bg-blue-600' : 'bg-zinc-800'}`}
                            >
                              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${platformSettings.payment[gate.id as keyof typeof platformSettings.payment] ? (platformSettings.payment[gate.id as keyof typeof platformSettings.payment] ? 'right-0.5' : 'left-0.5') : 'left-0.5'}`} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="pt-2 flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          checked={platformSettings.payment.testMode} 
                          onChange={(e) => saveSettings('payment', { ...platformSettings.payment, testMode: e.target.checked })}
                          className="w-3 h-3 rounded bg-zinc-900 border-zinc-800"
                        />
                        <label className="text-[9px] text-zinc-500 font-mono">开启沙盒测试模式 (Sandbox Mode)</label>
                      </div>
                    </div>

                    {/* Feature Toggles */}
                    <div className="bg-[#09090B] rounded-xl border border-zinc-800/80 p-5 shadow-2xl space-y-4">
                      <h3 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider font-mono">功能模块注册</h3>
                      <div className="space-y-2">
                        {[
                          { id: 'allowRegistration', label: '允许新租户注册', desc: '开启后外部用户可访问注册入口' },
                          { id: 'maintenanceMode', label: '系统维护模式', desc: '开启后全站展示维护页面' },
                          { id: 'aiAutoDispatch', label: 'AI 自动派单', desc: '开启后 AI 将自动处理未处理订单' }
                        ].map(feature => (
                          <div key={feature.id} className="flex items-center justify-between py-1.5 border-b border-zinc-800/40 last:border-0">
                            <div>
                              <h4 className="text-[10px] font-bold text-white">{feature.label}</h4>
                              <p className="text-[8px] text-zinc-500">{feature.desc}</p>
                            </div>
                            <button 
                              onClick={() => saveSettings('features', { ...platformSettings.features, [feature.id]: !platformSettings.features[feature.id as keyof typeof platformSettings.features] })}
                              className={`w-10 h-5 rounded-full relative transition-colors ${platformSettings.features[feature.id as keyof typeof platformSettings.features] ? 'bg-emerald-600' : 'bg-zinc-800'}`}
                            >
                              <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${platformSettings.features[feature.id as keyof typeof platformSettings.features] ? 'right-1' : 'left-1'}`} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Configuration Registry */}
                    <div className="bg-[#09090B] rounded-xl border border-zinc-800/80 p-5 shadow-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider font-mono">配置治理中心</h3>
                          <p className="text-[9px] text-zinc-500">自动同步平台设置到配置注册表，并提供覆盖率审计。</p>
                        </div>
                        <button
                          onClick={loadConfigRegistry}
                          className="text-[10px] text-blue-400 hover:text-blue-300 transition"
                        >
                          刷新注册表
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-3 text-[10px]">
                        <div className="flex items-center justify-between rounded-lg bg-zinc-950 border border-zinc-800 p-3">
                          <span>注册项数量</span>
                          <strong>{configRegistry.length}</strong>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-zinc-950 border border-zinc-800 p-3">
                          <span>覆盖率</span>
                          <strong>{configReport?.coverage ?? 'N/A'}%</strong>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-zinc-950 border border-zinc-800 p-3">
                          <span>缺失项</span>
                          <strong>{configReport?.missingRegistry?.length ?? 0}</strong>
                        </div>
                      </div>

                      <div className="space-y-3 pt-3">
                        {configRegistry.slice(0, 5).map((item) => (
                          <div key={item.key} className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-[11px] font-bold text-white">{item.key}</p>
                                <p className="text-[9px] text-zinc-500">{item.description}</p>
                              </div>
                              <span className="text-[10px] text-zinc-400">{item.type}</span>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-[9px] text-zinc-500">
                              <span>当前值: {String(item.current_value)}</span>
                              <span>默认: {String(item.default_value)}</span>
                            </div>
                          </div>
                        ))}
                        {configRegistry.length > 5 && (
                          <div className="text-[9px] text-zinc-500">仅展示前 5 条。更多项请在后端审计页面查看。</div>
                        )}
                      </div>
                    </div>

                    {/* Notifications */}
                    <div className="bg-[#09090B] rounded-xl border border-zinc-800/80 p-5 shadow-2xl space-y-4">
                      <h3 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider font-mono">全局通知配置</h3>
                      <div className="space-y-3">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded bg-blue-950/20 text-blue-400">
                                <Send className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-[10px] font-bold">邮件通知服务</span>
                            </div>
                            <button className="text-[9px] text-blue-400 hover:underline">配置 SMTP</button>
                         </div>
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded bg-purple-950/20 text-purple-400">
                                <Zap className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-[10px] font-bold">Webhook 实时推送</span>
                            </div>
                            <button className="text-[9px] text-purple-400 hover:underline">管理终端</button>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------- 6. 系统底层 / INFRA LAYER ----------------- */}
              {(activeTab === 'infra' || activeTab === 'system') && (
                <div className="space-y-6 text-[#E8EAED]">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                        系统底层
                      </span>
                    </div>
                  </div>

                  {/* Sub-tabs for Infra */}
                  <div className="flex border-b border-zinc-800/80 pb-3 gap-6 text-xs text-zinc-400 font-bold overflow-x-auto scrollbar-none">
                    {[
                      { id: 'rbac', label: '权限矩阵', icon: ShieldCheck },
                      { id: 'api', label: '接口调试', icon: Code },
                      { id: 'infrastructure', label: '基础设施', icon: Zap },
                      { id: 'firewall', label: '防火墙', icon: ShieldAlert },
                      { id: 'queue', label: '队列监测', icon: Server },
                      { id: 'bucket', label: '文件存储', icon: HardDrive }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setInfraSubTab(tab.id as any)}
                        className={`flex items-center gap-2 pb-3 px-2 transition-all cursor-pointer whitespace-nowrap ${
                          infraSubTab === tab.id ? 'text-rose-500 border-b-2 border-rose-500' : 'hover:text-white'
                        }`}
                      >
                        <tab.icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {/* RBAC Matrix */}
                    {infraSubTab === 'rbac' && (
                      <div className="bg-[#09090B] rounded-xl border border-zinc-800/80 p-5 shadow-2xl space-y-4">
                        <h3 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider font-mono">权限表</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-[10px] font-mono border-collapse">
                            <thead>
                              <tr className="text-zinc-500 border-b border-zinc-800">
                                <th className="p-3">角色 ID</th>
                                <th className="p-3">权限矩阵 (PERMISSIONS MATRIX)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-900">
                              {Object.entries(rbacMatrix).map(([role, rights]) => (
                                <tr key={role} className="hover:bg-white/5 group">
                                  <td className="p-3 font-bold text-zinc-300 group-hover:text-blue-400 transition-colors uppercase">{role}</td>
                                  <td className="p-3">
                                    <div className="flex flex-wrap gap-2">
                                      {Object.entries(rights).map(([right, active]) => (
                                        <button 
                                          key={right}
                                          onClick={() => toggleRbac(role, right)}
                                          className={`px-2 py-1 rounded-md text-[9px] font-bold transition-all border ${
                                            active 
                                              ? 'bg-blue-950/30 text-blue-400 border-blue-900/30 shadow-[0_0_10px_rgba(59,130,246,0.1)]' 
                                              : 'bg-zinc-900 text-zinc-600 border-zinc-800 opacity-50'
                                          }`}
                                        >
                                          {right}
                                        </button>
                                      ))}
                                      {/* Add new permission button */}
                                      <button
                                        onClick={() => {
                                          const newPerm = prompt('输入新权限键名 (e.g. system_write):');
                                          if (newPerm) toggleRbac(role, newPerm);
                                        }}
                                        className="px-2 py-1 rounded-md text-[9px] font-bold bg-zinc-900 text-zinc-500 border border-dashed border-zinc-700 hover:border-zinc-500 hover:text-zinc-300 transition-all"
                                      >
                                        + 新增
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* API Gateway (Swagger Style) */}
                    {infraSubTab === 'api' && (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 space-y-4">
                          <div className="bg-[#09090B] rounded-xl border border-zinc-800/80 p-5 shadow-2xl space-y-4">
                            <h3 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider font-mono">接口测试</h3>
                            <div className="space-y-2">
                              {[
                                { method: 'GET', path: '/api/v1/health', name: '健康检查' },
                                { method: 'POST', path: '/api/v1/auth/login', name: '身份鉴权' },
                                { method: 'GET', path: '/api/v1/agents/roster', name: '智体名单' },
                                { method: 'POST', path: '/api/v1/billing/ledger', name: '流水审计' },
                                { method: 'DELETE', path: '/api/v1/tenant/purge', name: '租户清除' }
                              ].map((api, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleTestAPIEndpoint(api.path)}
                                  className="w-full p-3 bg-zinc-950 border border-zinc-900 rounded-xl hover:border-rose-500/50 transition flex items-center justify-between group"
                                >
                                  <div className="text-left">
                                    <div className="flex items-center gap-2">
                                      <span className={`text-[8px] font-bold px-1 py-0.5 rounded ${
                                        api.method === 'GET' ? 'bg-emerald-950 text-emerald-400' :
                                        api.method === 'POST' ? 'bg-blue-950 text-blue-400' : 'bg-rose-950 text-rose-400'
                                      }`}>{api.method}</span>
                                      <span className="text-[10px] font-mono text-zinc-300">{api.path}</span>
                                    </div>
                                    <div className="text-[9px] text-zinc-500 mt-1">{api.name}</div>
                                  </div>
                                  <Play className="w-3 h-3 text-zinc-700 group-hover:text-rose-400 transition-colors" />
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="lg:col-span-2">
                          <div className="bg-black rounded-xl border border-zinc-800/80 p-5 shadow-2xl h-full flex flex-col">
                            <h3 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider font-mono mb-4">响应日志</h3>
                            <div className="flex-1 bg-zinc-950/50 p-4 rounded-xl font-mono text-[10px] text-emerald-400 overflow-auto border border-zinc-900">
                              {isCallingAPI ? (
                                <div className="flex flex-col items-center justify-center h-full space-y-3">
                                  <div className="w-6 h-6 border-2 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
                                  <span className="text-zinc-500 italic">发起中...</span>
                                </div>
                              ) : (
                                <pre className="whitespace-pre-wrap">{swaggerResponse}</pre>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Infrastructure Services */}
                    {infraSubTab === 'infrastructure' && (
                      <InfrastructureServices />
                    )}

                    {/* WAF Firewall */}
                    {infraSubTab === 'firewall' && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-[#09090B] rounded-xl border border-zinc-800/80 p-5 shadow-2xl space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider font-mono">流量监测</h3>
                            <button 
                              onClick={() => setFirewallActive(!firewallActive)}
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full border transition-colors ${firewallActive ? 'bg-emerald-950 text-emerald-400 border-emerald-900/30' : 'bg-rose-950 text-rose-400 border-rose-900/30'}`}
                            >
                              {firewallActive ? 'ACTIVE' : 'OFF'}
                            </button>
                          </div>
                          <div className="h-48 relative flex items-end gap-1 px-2 pt-4">
                            <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] [background-size:20px_20px]" />
                            {chartData.map((d, i) => (
                              <motion.div 
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${(d.reqs / 800) * 100}%` }}
                                className={`flex-1 min-w-[4px] rounded-t-sm ${d.reqs > 500 ? 'bg-rose-500' : 'bg-emerald-500'} opacity-80`}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="bg-[#09090B] rounded-xl border border-zinc-800/80 p-5 shadow-2xl space-y-4">
                          <h3 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider font-mono">防护规则</h3>
                          <div className="space-y-2">
                            {[
                              { rule: 'SQL_PROTECT', state: 'ON', threat: '高' },
                              { rule: 'XSS_FILTER', state: 'ON', threat: '中' },
                              { rule: 'DDOS_LIMIT', state: 'ON', threat: '极高' },
                              { rule: 'GEO_BLOCK', state: 'OFF', threat: '低' },
                              { rule: 'BOT_BLOCK', state: 'ON', threat: '中' }
                            ].map((rule, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-900 rounded-xl">
                                <div className="flex items-center gap-3">
                                  <div className={`w-2 h-2 rounded-full ${rule.state === 'ON' ? 'bg-emerald-500' : 'bg-zinc-700'}`} />
                                  <span className="text-[11px] font-mono text-zinc-300">{rule.rule}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                                    rule.threat === '极高' ? 'bg-rose-950 text-rose-400' :
                                    rule.threat === '高' ? 'bg-orange-950 text-orange-400' : 'bg-blue-950 text-blue-400'
                                  }`}>{rule.threat}</span>
                                  <span className="text-[10px] font-bold text-zinc-600">{rule.state}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Websocket Queues */}
                    {infraSubTab === 'queue' && (
                      <div className="bg-[#09090B] rounded-xl border border-zinc-800/80 p-5 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider font-mono">排队管线</h3>
                          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900/30">SOCKET: 4,821</span>
                        </div>
                        <div className="space-y-1.5 max-h-96 overflow-y-auto custom-scrollbar font-mono text-[10px]">
                          {[...Array(10)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-2.5 bg-zinc-950 rounded-lg border border-zinc-900 hover:border-zinc-800 transition">
                              <div className="flex gap-4 items-center">
                                <span className="text-zinc-700">[{new Date().toLocaleTimeString()}]</span>
                                <span className="text-blue-400">PUB/SUB</span>
                                <span className="text-zinc-300">topic: {Math.floor(Math.random() * 1000)}</span>
                                <span className="text-zinc-500 italic truncate max-w-md">Payload: {"{action: 'sync'}"}</span>
                              </div>
                              <span className="text-emerald-500 font-bold">ACK ✓</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* File Buckets */}
                    {infraSubTab === 'bucket' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                          { name: 'public-assets', size: '12.4 GB', files: 1420, icon: ImageIcon },
                          { name: 'tenant-backups', size: '48.2 GB', files: 85, icon: Database },
                          { name: 'agent-memories', size: '2.8 GB', files: 5240, icon: Cpu }
                        ].map((bucket, idx) => (
                          <div key={idx} className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl space-y-4 hover:border-rose-500/50 transition group cursor-pointer">
                            <div className="flex justify-between items-start">
                              <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:text-rose-400 transition-colors">
                                <bucket.icon className="w-6 h-6" />
                              </div>
                              <div className="text-right">
                                <div className="text-xs font-black text-white">{bucket.size}</div>
                                <div className="text-[10px] text-zinc-500 font-mono">{bucket.files}</div>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-zinc-300 truncate">{bucket.name}</h4>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
          
        </div>
      </main>

      {/* 3. RIGHT SIDEBAR: 执勤会商室 */}
      <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-[#2F3336]/60 bg-[#09090B] p-4 shrink-0 flex flex-col justify-between overflow-y-auto overflow-x-hidden min-h-[620px] lg:h-screen lg:sticky lg:top-0 scrollbar-none space-y-4">
        
        {/* Topic Title */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-[#2F3336]/60">
            <MessageSquare className="w-4 h-4 text-[#1D9BF0]" />
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">数字运维</span>
              <h3 className="text-xs font-black text-white uppercase tracking-wider mt-0.5 leading-none">
                执勤室
              </h3>
            </div>
          </div>

          {/* Active Specialist Profile Card & Duty Picker */}
          <div className="space-y-3">
            <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider font-mono block">
              执勤班表
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
                      {spec.name}
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
                  <p className="text-[8px] text-zinc-500 mt-1 font-mono uppercase tracking-widest leading-none">TAB: {activeTab.toUpperCase()}</p>
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
                  协同模拟器
                </span>
                <span className="text-[8px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 px-1 py-0.5 rounded leading-none select-none">
                  ACTIVE
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
                <span>{isSimulating ? '🛠️ 模拟中...' : '🟢 启动协同模拟'}</span>
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
                      {msg.sender === 'user' ? 'ME' : currentSpecialist.name} &bull; {msg.time}
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
                COLLABORATION
              </span>
              <span>SLA: EXCELLENT</span>
            </div>
          </div>

          {/* Suggestions container based on selectedTab */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block font-mono pl-1">
              建议指令
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
              <span>助手</span>
            </span>
            <div className="flex items-center space-x-1">
              <span className="text-[8px] bg-red-950/20 border border-red-900/10 text-rose-400 px-1 py-0.5 rounded cursor-default select-none">投流</span>
              <span className="text-[8px] bg-blue-950/20 border border-blue-900/10 text-blue-400 px-1 py-0.5 rounded cursor-default select-none">打样</span>
              <span className="text-[8px] bg-emerald-950/20 border border-emerald-900/10 text-emerald-400 px-1 py-0.5 rounded cursor-default select-none font-bold">发货</span>
            </div>
          </div>

          <form onSubmit={handleSendMessage} className="flex space-x-1.5">
            <div className="flex-1 bg-zinc-950 rounded-lg flex items-center px-2 py-1.5 border border-zinc-850 focus-within:border-blue-500 transition-all">
              <input
                type="text"
                placeholder={`向 【${currentSpecialist.name}】 提问...`}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                className="w-full bg-transparent text-xs text-white border-none outline-none ring-0 placeholder-zinc-700"
              />
              <button 
                type="button" 
                onClick={() => handleSuggestionClick('上传分析')}
                className="p-1 text-zinc-650 hover:text-zinc-400 transition cursor-pointer"
                title="上传"
              >
                <ImageIcon className="w-3.5 h-3.5" />
              </button>
              <button 
                type="button" 
                onClick={() => handleSuggestionClick('语音指令')}
                className="p-1 text-zinc-650 hover:text-zinc-400 transition cursor-pointer"
                title="语音"
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
