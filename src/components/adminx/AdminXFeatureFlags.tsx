import React, { useEffect, useState } from 'react';
import { db, doc, setDoc, getDoc } from '../../services/firebase';
import industryConfigs from '../../data/industry-backend-configs';

const AdminXFeatureFlags: React.FC = () => {
  const [flags, setFlags] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // load from localStorage as simple persistence fallback
    const cached = localStorage.getItem('adminx_feature_flags');
    if (cached) setFlags(JSON.parse(cached));
    else {
      const init: Record<string, boolean> = {};
      for (const k of Object.keys(industryConfigs)) init[k] = true;
      setFlags(init);
    }
  }, []);

  const toggle = async (key: string) => {
    const next = { ...flags, [key]: !flags[key] };
    setFlags(next);
    localStorage.setItem('adminx_feature_flags', JSON.stringify(next));

    try {
      // persist to a platform document
      const platformRef = doc(db, 'platform_configs', 'industry_backends');
      await setDoc(platformRef, { flags: next }, { merge: true });
    } catch (e) {
      console.warn('Persist platform flags failed', e);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">AdminX · 功能开关</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(industryConfigs).map(([k, cfg]) => (
          <div key={k} className="p-4 border rounded bg-white flex justify-between items-center">
            <div>
              <div className="font-medium">{cfg.name}</div>
              <div className="text-sm text-slate-500">{cfg.description || ''}</div>
            </div>
            <div>
              <label className="inline-flex items-center space-x-2">
                <input type="checkbox" checked={!!flags[k]} onChange={() => toggle(k)} />
                <span className="text-sm">启用</span>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminXFeatureFlags;
