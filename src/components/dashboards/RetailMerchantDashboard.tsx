import React from 'react';
import OrderManagementView from '../OrderManagementView';

export default function RetailMerchantDashboard(): JSX.Element {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">百货零售后台</h1>
      <p className="text-sm text-muted-foreground">零售行业专用：多渠道聚合与供销对接</p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">渠道销量 / 上架工具（占位）</div>
        <div className="bg-white p-4 rounded shadow"><OrderManagementView /></div>
      </div>
    </div>
  );
}
