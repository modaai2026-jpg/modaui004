import React from 'react';
import BusinessDashboard from './BusinessDashboard';
import OrdersPage from './pages/OrdersPage';
import InventoryPage from './pages/InventoryPage';
import ProductsPage from './pages/ProductsPage';
import FinancePage from './pages/FinancePage';
import AdminXFeatureFlags from '../adminx/AdminXFeatureFlags';

function parsePath() {
  if (typeof window === 'undefined') return { industryId: 'fashion', subpath: '' };
  const parts = window.location.pathname.split('/').filter(Boolean);
  // expected ['business', industryId, 'orders', ...]
  const industryId = parts[1] || 'fashion';
  const subpath = parts.slice(2).join('/');
  return { industryId, subpath };
}

const BusinessRouter: React.FC = () => {
  const { industryId, subpath } = parsePath();

  if (!subpath) return <BusinessDashboard industryId={industryId as any} />;

  const first = subpath.split('/')[0];

  switch (first) {
    case 'orders':
      return <OrdersPage />;
    case 'inventory':
      return <InventoryPage />;
    case 'products':
      return <ProductsPage />;
    case 'finance':
      return <FinancePage />;
    case 'adminx':
      return <AdminXFeatureFlags />;
    default:
      return <BusinessDashboard industryId={industryId as any} />;
  }
};

export default BusinessRouter;
