import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Settings, X, Save, RotateCcw, ToggleRight, Type, Hash, Code,
  ChevronDown, Check, AlertCircle
} from 'lucide-react';
import {
  ConfigCategory,
  ConfigItem,
  configRegistry,
  ConfigRegistry
} from '../services/config-registry.service';

interface PlatformSettingsCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PlatformSettingsCenter({ isOpen, onClose }: PlatformSettingsCenterProps) {
  const [selectedCategory, setSelectedCategory] = useState<ConfigCategory>('feature');
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [changes, setChanges] = useState<Map<string, any>>(new Map());
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadConfigs(selectedCategory);
    }
  }, [isOpen, selectedCategory]);

  const loadConfigs = (category: ConfigCategory) => {
    const items = configRegistry.getByCategory(category);
    setConfigs(items);
    setChanges(new Map());
  };

  const handleConfigChange = (key: string, value: any) => {
    const newChanges = new Map(changes);
    const config = configs.find(c => c.key === key);

    if (config && config.value === value) {
      newChanges.delete(key);
    } else {
      newChanges.set(key, value);
    }

    setChanges(newChanges);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // 保存所有更改
      let successCount = 0;
      changes.forEach((value, key) => {
        const success = configRegistry.set(key, value);
        if (success) successCount++;
      });

      setMessage({
        type: 'success',
        text: `已保存 ${successCount} 个配置`
      });

      setChanges(new Map());
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      setMessage({
        type: 'error',
        text: `保存失败: ${(e as Error).message}`
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    configRegistry.resetToDefaults();
    loadConfigs(selectedCategory);
    setMessage({
      type: 'success',
      text: '已重置为默认值'
    });
    setTimeout(() => setMessage(null), 3000);
  };

  const categories: ConfigCategory[] = ['feature', 'payment', 'notification', 'workflow', 'agent', 'security', 'quota'];

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-neutral-950 border border-[#2F3336] rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2F3336]">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-[#1D9BF0]" />
            <h2 className="text-lg font-bold text-white">平台设置中心</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-900 rounded transition-colors"
          >
            <X className="w-5 h-5 text-[#8B949E]" />
          </button>
        </div>

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`px-4 py-3 flex items-center gap-2 text-sm ${
              message.type === 'success'
                ? 'bg-green-500/10 text-green-400 border-b border-green-500/20'
                : 'bg-red-500/10 text-red-400 border-b border-red-500/20'
            }`}
          >
            <Check className="w-4 h-4" />
            {message.text}
          </motion.div>
        )}

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 border-r border-[#2F3336] bg-neutral-900/50 overflow-y-auto">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors border-l-2 ${
                  selectedCategory === category
                    ? 'bg-[#1D9BF0]/10 text-[#1D9BF0] border-[#1D9BF0]'
                    : 'text-[#8B949E] border-transparent hover:text-white'
                }`}
              >
                {getCategoryLabel(category)}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-4">
              {configs.map((config) => (
                <ConfigItemRenderer
                  key={config.key}
                  config={config}
                  value={changes.has(config.key) ? changes.get(config.key) : config.value}
                  onChange={(value) => handleConfigChange(config.key, value)}
                />
              ))}

              {configs.length === 0 && (
                <div className="text-center py-8 text-[#8B949E]">
                  <p className="text-sm">此分类暂无配置</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#2F3336] p-4 flex items-center justify-between gap-3">
          <div className="text-xs text-[#8B949E]">
            {changes.size > 0 ?`有 ${changes.size} 个未保存的变更` : '未修改'}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-xs font-medium text-[#8B949E] hover:text-white border border-[#2F3336] rounded-lg transition-colors hover:bg-neutral-900"
            >
              <RotateCcw className="w-4 h-4 inline mr-1" />
              重置
            </button>
            <button
              onClick={handleSave}
              disabled={changes.size === 0 || saving}
              className="px-4 py-2 text-xs font-medium text-white bg-[#1D9BF0] hover:bg-[#38BDF8] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? '保存中...' : '保存更改'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ConfigItemRenderer({
  config,
  value,
  onChange
}: {
  config: ConfigItem;
  value: any;
  onChange: (value: any) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 bg-neutral-900 border border-[#2F3336] rounded-lg"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-white">{config.label}</h4>
            {!config.editable && (
              <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">
                只读
              </span>
            )}
            {config.requiresRestart && (
              <span className="text-[10px] px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded">
                需要重启
              </span>
            )}
          </div>
          <p className="text-xs text-[#8B949E] mt-1">{config.description}</p>
        </div>

        <ConfigInput
          config={config}
          value={value}
          onChange={onChange}
          disabled={!config.editable}
        />
      </div>
    </motion.div>
  );
}

function ConfigInput({
  config,
  value,
  onChange,
  disabled
}: {
  config: ConfigItem;
  value: any;
  onChange: (value: any) => void;
  disabled: boolean;
}) {
  switch (config.type) {
    case 'boolean':
      return (
        <button
          onClick={() => onChange(!value)}
          disabled={disabled}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            value
              ? 'bg-green-500 text-white'
              : 'bg-neutral-800 text-[#8B949E]'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
        >
          <ToggleRight className="w-4 h-4 inline mr-1" />
          {value ? '启用' : '禁用'}
        </button>
      );

    case 'number':
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className="w-32 px-2 py-1.5 bg-neutral-800 border border-[#2F3336] rounded text-xs text-white focus:outline-none focus:border-[#1D9BF0] disabled:opacity-50"
        />
      );

    case 'string':
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-48 px-2 py-1.5 bg-neutral-800 border border-[#2F3336] rounded text-xs text-white focus:outline-none focus:border-[#1D9BF0] disabled:opacity-50"
        />
      );

    case 'select':
      return (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-40 px-2 py-1.5 bg-neutral-800 border border-[#2F3336] rounded text-xs text-white focus:outline-none focus:border-[#1D9BF0] disabled:opacity-50"
        >
          {config.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );

    case 'json':
      return (
        <textarea
          value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
          onChange={(e) => {
            try {
              onChange(JSON.parse(e.target.value));
            } catch (e) {
              // Keep as string if parsing fails
              onChange(e.target.value);
            }
          }}
          disabled={disabled}
          className="w-48 h-24 px-2 py-1.5 bg-neutral-800 border border-[#2F3336] rounded text-xs text-white font-mono focus:outline-none focus:border-[#1D9BF0] disabled:opacity-50 resize-none"
        />
      );

    default:
      return null;
  }
}

function getCategoryLabel(category: ConfigCategory): string {
  const labels: Record<ConfigCategory, string> = {
    feature: '功能开关',
    payment: '支付配置',
    notification: '通知配置',
    workflow: '工作流配置',
    agent: 'Agent 配置',
    security: '安全配置',
    quota: '配额配置'
  };
  return labels[category];
}

export default PlatformSettingsCenter;

