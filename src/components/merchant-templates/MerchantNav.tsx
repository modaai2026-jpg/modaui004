import React from 'react';

export default function MerchantNav(): JSX.Element {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto py-4 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-xl font-bold">MODAUI 商家后台</div>
        </div>
        <div className="text-sm text-muted-foreground">行业化后台模板</div>
      </div>
    </header>
  );
}
