import React from 'react';

export default function FinancialDashboard(): JSX.Element {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold">财务看板</h2>
      <p className="text-sm text-muted-foreground">占位：营收曲线、成本分摊、利润率趋势、支付渠道汇总</p>
      <div className="mt-4">图表占位</div>
    </div>
  );
}
