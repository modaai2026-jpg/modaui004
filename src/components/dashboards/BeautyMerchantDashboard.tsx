import React from 'react';
import OrderManagementView from '../OrderManagementView';

export default function BeautyMerchantDashboard(): JSX.Element {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">美业后台</h1>
      <p className="text-sm text-muted-foreground">美业专用：预约、疗程与会员管理</p>
      <div className="mt-6">
        <OrderManagementView />
      </div>
    </div>
  );
}
