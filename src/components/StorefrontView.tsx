import React, { useState, useEffect } from 'react';
import { 
  Smartphone, Palette, Check, Save, Sparkles, Phone, HelpCircle, Eye, 
  MapPin, Sliders, Globe, RefreshCcw, Building, Layout
} from 'lucide-react';
import { db, doc, setDoc, onSnapshot } from '../services/firebase';
import { INDUSTRY_TEMPLATES } from './StorefrontTemplates';

interface VisualTheme {
  id: 'classic' | 'dark' | 'retro' | 'royal' | 'indigo';
  name: string;
  bgHex: string;
  accentHex: string;
  desc: string;
  fontFamily: string;
}

interface StorefrontViewProps {
  tenantId: string;
  industryId: string;
  onAddLog?: (sender: string, emoji: string, message: string, type: 'info' | 'success' | 'warn') => void;
}

const getIndustryDefaultHeadline = (indId: string) => {
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

export default function StorefrontView({ tenantId, industryId, onAddLog }: StorefrontViewProps) {
  // Preconfigured visual themes in strict monochrome / high-contrast premium aesthetics
  const themesList: VisualTheme[] = [
    { id: 'retro', name: 'Midas Gold (法国金奢)', bgHex: '#FAF9F6', accentHex: '#D4AF37', desc: '暖白法式复古高品格，适合美发、奢品及法式餐饮', fontFamily: 'font-serif' },
    { id: 'dark', name: 'Silent Obsidian (静默黑曜)', bgHex: '#09090B', accentHex: '#FFFFFF', desc: '先锋主义与纯黑极冷现代，适合高端服装与数码配饰', fontFamily: 'font-sans' },
    { id: 'classic', name: 'Classic Slate (极简都市)', bgHex: '#F4F4F5', accentHex: '#1D9BF0', desc: '明亮通透的商务现代高级灰，适合全品类百货零售', fontFamily: 'font-sans' },
    { id: 'royal', name: 'Imperial Jade (高定御宝)', bgHex: '#0D1B1E', accentHex: '#10B981', desc: '墨绿金镶奢护经典，适合珠宝文玩及品茶私房配食', fontFamily: 'font-serif' },
    { id: 'indigo', name: 'Indigo Velocity (动感电竞)', bgHex: '#030712', accentHex: '#6366F1', desc: '深海靛蓝高频活力，适合运动户外、私教搏击健身等', fontFamily: 'font-mono' }
  ];

  // Core settings synchronized with Firestore
  const [selectedThemeId, setSelectedThemeId] = useState<'classic' | 'dark' | 'retro' | 'royal' | 'indigo'>('classic');
  const [templateIndex, setTemplateIndex] = useState(0);
  const [storeHeadline, setStoreHeadline] = useState(getIndustryDefaultHeadline(industryId));
  const [phoneContact, setPhoneContact] = useState('400-820-8820');
  const [deliveryType, setDeliveryType] = useState<'takeout' | 'delivery' | 'dine_in'>('delivery');
  const [logoImage, setLogoImage] = useState('💫');
  
  // NEW: Real persistent fields for Task 04
  const [customDomain, setCustomDomain] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [isStoreOnline, setIsStoreOnline] = useState(true);

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Sync settings live - USING MERCHANTS COLLECTION
  useEffect(() => {
    if (!tenantId) {
      setLoading(false);
      return;
    }
    const unsub = onSnapshot(doc(db, 'merchants', tenantId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const store = data.storeConfig || {};
        if (store.theme) setSelectedThemeId(store.theme);
        if (store.templateIndex !== undefined) setTemplateIndex(store.templateIndex);
        if (store.headline) setStoreHeadline(store.headline);
        if (store.phone) setPhoneContact(store.phone);
        if (store.deliveryType) setDeliveryType(store.deliveryType);
        if (store.logo) setLogoImage(store.logo);
        if (store.domain) setCustomDomain(store.domain);
        if (store.seoTitle) setSeoTitle(store.seoTitle);
        if (store.isOnline !== undefined) setIsStoreOnline(store.isOnline);
      }
      setLoading(false);
    }, (err) => {
      console.warn("StorefrontView settings fallback:", err);
      setLoading(false);
    });

    return () => unsub();
  }, [tenantId]);

  // Apply Changes with full save to Firestore
  const handleApplyThemeSettings = async () => {
    if (!tenantId) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'merchants', tenantId), {
        storeConfig: {
          theme: selectedThemeId,
          templateIndex,
          headline: storeHeadline,
          phone: phoneContact,
          deliveryType,
          logo: logoImage,
          domain: customDomain,
          seoTitle: seoTitle,
          isOnline: isStoreOnline,
          updatedAt: new Date().toISOString()
        }
      }, { merge: true });

      if (onAddLog) {
        onAddLog('AI视觉主编', '🏪', `一键应用了网店最新视觉系统【${selectedThemeId.toUpperCase()}】，域名绑定：${customDomain || '默认'}，全量推流并刷新了CDN。`, 'success');
      }
    } catch (err: any) {
      console.error("Failed to save style theme to DB: ", err);
    } finally {
      setIsSaving(false);
    }
  };

  const activeTheme = themesList.find(t => t.id === selectedThemeId) || themesList[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn text-left">
      {/* Left panel: configurations control list */}
      <div className="lg:col-span-8 space-y-6">
        {/* Style Selection panel */}
        <div className="bg-[#09090B] border border-[#2F3336] p-5 rounded-xl space-y-4">
          <div>
            <h3 className="text-white text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Layout className="w-4 h-4 text-emerald-400" />
              <span>高级前端布局选择 (Premium Layout Templates)</span>
            </h3>
            <p className="text-[10px] text-zinc-500 mt-1">选择最适合您行业的专业排版布局，每一套都经过深度视觉优化</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {(INDUSTRY_TEMPLATES[industryId]?.templates || []).map((t, idx) => (
              <div
                key={t.id}
                onClick={() => setTemplateIndex(idx)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 relative overflow-hidden ${
                  templateIndex === idx 
                    ? 'bg-zinc-950 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                    : 'bg-black/60 border-zinc-900 text-neutral-400 hover:border-zinc-700 hover:text-white'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold font-mono tracking-tight">{t.name}</span>
                  {templateIndex === idx && <Check className="w-3 h-3 text-emerald-400" />}
                </div>
                <div className="h-12 bg-zinc-900/50 rounded flex items-center justify-center border border-zinc-800/50">
                   <Layout className="w-4 h-4 opacity-20" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#09090B] border border-[#2F3336] p-5 rounded-xl space-y-4">
          <div>
            <h3 className="text-white text-xs font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-[#1D9BF0]" />
              <span>品牌色彩预设 (Brand Color Presets)</span>
            </h3>
            <p className="text-[10px] text-zinc-500 mt-1">设置前台在线商城的视觉主题色块、排印格式及核心营业参数</p>
          </div>

          {/* Theme card selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {themesList.map((tm) => (
              <div
                key={tm.id}
                onClick={() => setSelectedThemeId(tm.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 relative overflow-hidden ${
                  selectedThemeId === tm.id 
                    ? 'bg-zinc-950 border-white text-white' 
                    : 'bg-black/60 border-zinc-900 text-neutral-400 hover:border-zinc-805 hover:text-white'
                }`}
              >
                {/* Visual miniature dot indicator */}
                <div className="flex h-5 items-center">
                  <div 
                    className="w-4.5 h-4.5 rounded-full border border-neutral-700 flex items-center justify-center font-mono text-[9px]"
                    style={{ backgroundColor: tm.bgHex, color: tm.accentHex }}
                  >
                    {selectedThemeId === tm.id && <span className="text-[7.5px] font-black text-white mix-blend-difference">✔</span>}
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-[11.5px] font-bold font-mono tracking-tight">{tm.name}</h4>
                  <p className="text-[9px] text-[#8B949E] leading-normal">{tm.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Store settings configurations list */}
        <div className="bg-[#09090B] border border-[#2F3336] p-5 rounded-xl space-y-4">
          <span className="text-[9.5px] font-mono uppercase tracking-wider text-zinc-500 block">基础营业信息设置 (Parameters Configuration)</span>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
            <div className="space-y-1.5">
              <label className="text-[9px] text-zinc-400 block font-mono">店铺主标 LOGO 标签 (Emoji Icon / Text)</label>
              <input 
                type="text"
                value={logoImage}
                onChange={e => setLogoImage(e.target.value)}
                className="w-full bg-black border border-[#2F3336] p-2 text-[11px] text-white rounded focus:border-white focus:outline-none"
                placeholder="例如: 👗 / ☕ / 🥐"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] text-zinc-400 block font-mono">店铺专属联系服务电话 (Helpline hotline)</label>
              <input 
                type="text"
                value={phoneContact}
                onChange={e => setPhoneContact(e.target.value)}
                className="w-full bg-black border border-[#2F3336] p-2 text-[11px] text-white rounded focus:border-white focus:outline-none font-mono"
                placeholder="400-820-8820"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[9px] text-zinc-400 block font-mono">主站大堂顶部看板标语 (Headline Hero Title)</label>
              <input 
                type="text"
                value={storeHeadline}
                onChange={e => setStoreHeadline(e.target.value)}
                className="w-full bg-black border border-[#2F3336] p-2 text-[11px] text-white rounded focus:border-white focus:outline-none"
                placeholder="设置在主站轮播大图最瞩目位置的口号标语"
              />
            </div>

            <div className="sm:col-span-2 space-y-3">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block font-mono">
                店铺高级配置
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-[9px] text-zinc-400 font-bold flex items-center gap-1">
                    <Globe className="w-3 h-3" /> 自定义域名
                  </span>
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="shop.example.com"
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-lg py-1.5 px-3 text-[11px] text-white focus:border-[#1D9BF0] outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[9px] text-zinc-400 font-bold flex items-center gap-1">
                    <Sliders className="w-3 h-3" /> SEO 标题
                  </span>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="搜索引擎展示标题"
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-lg py-1.5 px-3 text-[11px] text-white focus:border-[#1D9BF0] outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-900 rounded-lg mt-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isStoreOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`} />
                  <span className="text-[10px] font-bold text-zinc-300">网店运营状态</span>
                </div>
                <button
                  onClick={() => setIsStoreOnline(!isStoreOnline)}
                  className={`px-3 py-1 rounded-full text-[9px] font-bold transition-all ${
                    isStoreOnline ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' : 'bg-rose-950/40 text-rose-400 border border-rose-900/30'
                  }`}
                >
                  {isStoreOnline ? '营业中 (ONLINE)' : '歇业中 (OFFLINE)'}
                </button>
              </div>
            </div>

            <div className="sm:col-span-2 space-y-2.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block font-mono">
                服务与履约 (Service Mode)
              </label>
              <div className="flex flex-wrap gap-2">
                {(['takeout', 'delivery', 'dine_in'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setDeliveryType(mode)}
                    className={`px-4 py-1.5 rounded-lg border text-[10.5px] font-bold transition-all duration-200 cursor-pointer ${
                      deliveryType === mode
                        ? 'bg-[#1D9BF0]/15 border-[#1D9BF0] text-white shadow-lg shadow-blue-500/5'
                        : 'bg-transparent text-zinc-400 border-zinc-900 hover:text-white'
                    }`}
                  >
                    {mode === 'takeout' ? '外卖打包 🥡' : mode === 'delivery' ? '全省配送 🛵' : '现场堂食 🍱'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-900/60 flex justify-end">
            <button
              onClick={handleApplyThemeSettings}
              disabled={isSaving}
              className="bg-white hover:bg-neutral-200 transition-colors text-black font-extrabold text-[10px] py-1.5 px-6 rounded-lg flex items-center space-x-1 cursor-pointer disabled:opacity-45"
            >
              {isSaving ? (
                <>
                  <span className="w-3.5 h-3.5 border border-black/40 border-t-black rounded-full animate-spin" />
                  <span>设置同步中...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>一键发布并启用主题</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right panel: Live Smartphone layout rendering preview */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-[#09090B] border border-[#2F3336] p-5 rounded-xl space-y-4">
          <div className="border-b border-[#2F3336]/60 pb-2 flex justify-between items-center">
            <h4 className="text-white text-xs font-mono uppercase tracking-wider flex items-center space-x-1">
              <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
              <span>实时前台手机预览 (Virtual Mobile Sim)</span>
            </h4>
            <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-[#1D9BF0]/15 text-sky-400">
              iPhone 17
            </span>
          </div>

          {/* Interactive Phone viewport */}
          <div className="w-full bg-[#1c1c1e] p-2.5 rounded-[28px] border-4 border-[#2f2f31] shadow-2xl overflow-hidden relative mx-auto max-w-[250px]">
            {/* Speaker hole miniature */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-12 h-3.5 bg-black rounded-full z-35 flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-zinc-900 rounded-full" />
            </div>

            {/* Virtual Screen contents, matching selected style parameters dynamically */}
            <div 
              className={`w-full rounded-[20px] aspect-[9/18] overflow-hidden flex flex-col justify-between font-sans ${activeTheme.fontFamily}`}
              style={{ backgroundColor: activeTheme.id === 'dark' || activeTheme.id === 'indigo' || activeTheme.id === 'royal' ? '#0A0A0A' : '#FAF9F6' }}
            >
              {/* Phone Status bar */}
              <div 
                className="pt-4 px-3 flex justify-between text-[7px] font-bold tracking-tight bg-transparent"
                style={{ color: activeTheme.id === 'dark' || activeTheme.id === 'indigo' || activeTheme.id === 'royal' ? '#FFFFFF' : '#111111' }}
              >
                <span>9:41</span>
                <span>5G 🔋</span>
              </div>

              {/* Store Mobile Header */}
              <div 
                className="px-4 py-2.5 flex items-center justify-between border-b/5 border-dashed"
                style={{ 
                  borderBottomColor: activeTheme.accentHex + '20',
                  color: activeTheme.id === 'dark' || activeTheme.id === 'indigo' || activeTheme.id === 'royal' ? '#FFFFFF' : '#111111' 
                }}
              >
                <div className="flex items-center space-x-1.5">
                  <span className="text-sm">{logoImage}</span>
                  <span className="text-[10px] font-extrabold tracking-wide uppercase">MODA SPACE</span>
                </div>
                <div 
                  className="w-2.5 h-2.5 rounded-full animate-pulse"
                  style={{ backgroundColor: activeTheme.accentHex }}
                />
              </div>

              {/* Slogan Banner Block */}
              <div className="p-3 mx-2.5 rounded-xl border border-dashed text-center"
                   style={{ 
                     borderColor: activeTheme.accentHex + '50', 
                     backgroundColor: activeTheme.id === 'dark' || activeTheme.id === 'indigo' || activeTheme.id === 'royal' ? '#111111' : '#EFEFEF' 
                   }}
              >
                <p 
                  className="text-[8.5px] leading-relaxed font-bold font-mono text-left"
                  style={{ color: activeTheme.id === 'dark' || activeTheme.id === 'indigo' || activeTheme.id === 'royal' ? '#F4F4F5' : '#1A1A1A' }}
                >
                  {storeHeadline}
                </p>
                <span className="text-[6.5px] block text-left mt-2 text-zinc-500 font-mono tracking-wide">
                  配送支援: {deliveryType === 'delivery' ? '全省顺丰极寒配位' : deliveryType === 'takeout' ? '外卖打包' : '现场就餐扫描'}
                </span>
              </div>

              {/* Simulated Product Card grid */}
              <div className="flex-1 p-3 grid grid-cols-2 gap-2 overflow-y-auto">
                {([
                  { name: '经典主打新品', val: '¥ 129', icon: '🎽' },
                  { name: '高定穿搭尊享', val: '¥ 450', icon: '🧣' }
                ]).map((prod, idx) => (
                  <div 
                    key={idx}
                    className="p-2 rounded-lg text-left space-y-1 relative"
                    style={{ 
                      backgroundColor: activeTheme.id === 'dark' || activeTheme.id === 'indigo' || activeTheme.id === 'royal' ? '#141416' : '#FFFFFF',
                      border: `1px solid ${activeTheme.id === 'dark' || activeTheme.id === 'indigo' || activeTheme.id === 'royal' ? '#27272A' : '#E4E4E7'}`
                    }}
                  >
                    <span className="text-lg block mb-1.5">{prod.icon}</span>
                    <span 
                      className="text-[7.5px] font-bold block truncate"
                      style={{ color: activeTheme.id === 'dark' || activeTheme.id === 'indigo' || activeTheme.id === 'royal' ? '#FFFFFF' : '#1E1E1E' }}
                    >
                      {prod.name}
                    </span>
                    <span 
                      className="text-[8px] font-mono tracking-tight block font-extrabold"
                      style={{ color: activeTheme.accentHex }}
                    >
                      {prod.val}
                    </span>
                  </div>
                ))}
              </div>

              {/* Hotline Contact Footer */}
              <div 
                className="p-3 text-center border-t text-[6px] font-mono"
                style={{ 
                  borderColor: activeTheme.id === 'dark' || activeTheme.id === 'indigo' || activeTheme.id === 'royal' ? '#222' : '#DDD',
                  color: '#8B949E' 
                }}
              >
                <Phone className="w-2 h-2 inline mr-1 text-zinc-500" />
                <span>客服热线: {phoneContact}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
