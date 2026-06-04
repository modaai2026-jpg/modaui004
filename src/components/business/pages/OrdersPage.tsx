import React from 'react';
import PagePlaceholder from './PagePlaceholder';
import OrderFulfillmentService from '../../../services/order-fulfillment.service';

const OrdersPage: React.FC = () => {
  // Example: create a sample order on button click
  const handleCreate = async () => {
    try {
      const industry = localStorage.getItem('preview_industry_id') || 'fashion';
      const order = {
        customerId: 'guest-1',
        items: [{ skuId: 'sku-1', qty: 1, price: 19.9 }],
        total: 19.9,
      };
      await OrderFulfillmentService.createOrder(industry, order);
      alert('已创建示例订单（请查看 Firestore）');
    } catch (e) {
      console.error(e);
      alert('创建订单失败，请查看控制台');
    }
  };

  return (
    <PagePlaceholder title="订单管理">
      <div className="space-y-4">
        <p>订单列表占位。可使用服务创建示例订单。</p>
        <button className="px-4 py-2 bg-sky-600 text-white rounded" onClick={handleCreate}>创建示例订单</button>
      </div>
    </PagePlaceholder>
  );
};

export default OrdersPage;
