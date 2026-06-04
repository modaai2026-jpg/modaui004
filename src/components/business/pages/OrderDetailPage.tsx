import React, { useEffect, useState } from 'react';
import PagePlaceholder from './PagePlaceholder';
import { db, doc, getDoc } from '../../../services/firebase';
import OrderFulfillmentService from '../../../services/order-fulfillment.service';

const OrderDetailPage: React.FC<{ orderId: string }> = ({ orderId }) => {
  const industry = typeof window !== 'undefined' ? (localStorage.getItem('preview_industry_id') || window.location.pathname.split('/')[2] || 'fashion') : 'fashion';
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const ref = doc(db, `${industry}_orders`, orderId);
        const snap = await getDoc(ref as any);
        if (snap.exists()) setOrder({ id: snap.id, ...snap.data() });
      } catch (e) {
        console.error('加载订单详情失败', e);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [industry, orderId]);

  const handleConfirmPayment = async () => {
    try {
      await OrderFulfillmentService.confirmPayment(industry, orderId, { amount: order.total, method: 'manual', reference: 'admin-confirm' });
      alert('支付已确认');
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert('确认支付失败');
    }
  };

  const handleAllocate = async () => {
    try {
      await OrderFulfillmentService.allocateInventory(industry, order.items.map((it: any) => ({ skuId: it.skuId, qty: it.qty })));
      alert('库存已分配');
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert('分配库存失败');
    }
  };

  const handleCreateShipment = async () => {
    try {
      const sh = await OrderFulfillmentService.createShipment(industry, orderId, { carrier: 'SF', trackingNumber: `SF-${Date.now()}` });
      alert(`已创建运单 ${sh.id}`);
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert('创建运单失败');
    }
  };

  if (loading) return <PagePlaceholder title="订单详情">加载中...</PagePlaceholder>;
  if (!order) return <PagePlaceholder title="订单详情">未找到订单</PagePlaceholder>;

  return (
    <PagePlaceholder title={`订单 #${order.id}`}>
      <div className="space-y-4">
        <div>客户: {order.customerId}</div>
        <div>总计: ¥{order.total}</div>
        <div>状态: {order.status} · 支付: {order.paymentStatus}</div>
        <div className="py-2">
          <button className="px-3 py-1 bg-emerald-600 text-white rounded mr-2" onClick={handleConfirmPayment}>确认支付</button>
          <button className="px-3 py-1 bg-orange-600 text-white rounded mr-2" onClick={handleAllocate}>分配库存</button>
          <button className="px-3 py-1 bg-sky-600 text-white rounded" onClick={handleCreateShipment}>创建运单</button>
        </div>
        <div className="pt-4 border-t">原始数据: <pre className="text-xs bg-slate-100 text-black p-2 rounded overflow-auto">{JSON.stringify(order, null, 2)}</pre></div>
      </div>
    </PagePlaceholder>
  );
};

export default OrderDetailPage;
