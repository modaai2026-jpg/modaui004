import React from 'react';
import OrderManagementView from '../OrderManagementView';

export default function CateringMerchantDashboard(): JSX.Element {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">餐饮行业后台</h1>
      <p className="text-sm text-muted-foreground">餐饮专用后台：订单流、出餐与食材管理</p>
      <div className="mt-6">
        <OrderManagementView />
      </div>
    </div>
  );
}
