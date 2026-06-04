import React from 'react';
import OrderManagementView from '../OrderManagementView';

export default function FashionMerchantDashboard(): JSX.Element {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">服装行业后台</h1>
      <p className="text-sm text-muted-foreground">专注服装行业的 KPI 与工具</p>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1 bg-white p-4 rounded shadow">SKU 热销排行 / 库存告警（占位）</div>
        <div className="col-span-1 bg-white p-4 rounded shadow"><OrderManagementView /></div>
      </div>
    </div>
  );
}
