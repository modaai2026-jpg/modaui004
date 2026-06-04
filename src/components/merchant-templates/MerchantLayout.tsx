import React from 'react';
import MerchantNav from './MerchantNav';

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <MerchantNav />
      <main className="max-w-7xl mx-auto py-6 px-4">{children}</main>
    </div>
  );
}
