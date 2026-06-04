import React from 'react';
import useIndustryBackend from '../../hooks/useIndustryBackend';
import type { IndustryType } from '../../types/business.types';

interface Props {
  industryId: IndustryType;
}

const BusinessDashboard: React.FC<Props> = ({ industryId }) => {
  const { config } = useIndustryBackend(industryId);

  if (!config) return <div>未找到行业后台配置</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">{config.industryName} 后台</h2>
      <div className="grid grid-cols-4 gap-4">
        <aside className="col-span-1">
          <ul>
            {config.menuItems.map((m) => (
              <li key={m.id} className="py-2">
                <a href={m.path} className="text-sm text-gray-700">
                  {m.label}
                </a>
              </li>
            ))}
          </ul>
        </aside>
        <main className="col-span-3">
          <div className="p-4 bg-white rounded shadow">请选择左侧菜单项查看功能</div>
        </main>
      </div>
    </div>
  );
};

export default BusinessDashboard;
