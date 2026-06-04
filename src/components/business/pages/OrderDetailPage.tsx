import React, { useEffect, useState } from 'react';
import PagePlaceholder from './PagePlaceholder';
import { db, doc, getDoc } from '../../../services/firebase';
import OrderFulfillmentService from '../../../services/order-fulfillment.service';

const OrderDetailPage: React.FC<{ orderId: string }> = ({ orderId }) => {
  const industry = typeof window !== 'undefined' ? (localStorage.getItem('preview_industry_id') || window.location.pathname.split('/')[2] || 'fashion') : 'fashion';
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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
    setActionError(null);
    setActionLoading('confirmPayment');
    try {
      await OrderFulfillmentService.confirmPayment(industry, orderId, { amount: order.total, method: 'manual', reference: 'admin-confirm' });
      setActionLoading(null);
      setTimeout(() => window.location.reload(), 700);
    } catch (e: any) {
      console.error(e);
      setActionLoading(null);
      setActionError(e?.message || '确认支付失败');
    }
  };

  const handleAllocate = async () => {
    setActionError(null);
    setActionLoading('allocateInventory');
    try {
      await OrderFulfillmentService.allocateInventory(industry, order.items.map((it: any) => ({ skuId: it.skuId, qty: it.qty })));
      setActionLoading(null);
      setTimeout(() => window.location.reload(), 700);
    } catch (e: any) {
      console.error(e);
      setActionLoading(null);
      setActionError(e?.message || '分配库存失败');
    }
  };

  const handleCreateShipment = async () => {
    setActionError(null);
    setActionLoading('createShipment');
    try {
      const sh = await OrderFulfillmentService.createShipment(industry, orderId, { carrier: 'SF', trackingNumber: `SF-${Date.now()}` });
      setActionLoading(null);
      alert(`已创建运单 ${sh.id}`);
      setTimeout(() => window.location.reload(), 700);
    } catch (e: any) {
      console.error(e);
      setActionLoading(null);
      setActionError(e?.message || '创建运单失败');
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
          <button className="px-3 py-1 bg-emerald-600 text-white rounded mr-2" onClick={handleConfirmPayment} disabled={!!actionLoading}>{actionLoading === 'confirmPayment' ? '处理中...' : '确认支付'}</button>
          <button className="px-3 py-1 bg-orange-600 text-white rounded mr-2" onClick={handleAllocate} disabled={!!actionLoading}>{actionLoading === 'allocateInventory' ? '处理中...' : '分配库存'}</button>
          <button className="px-3 py-1 bg-sky-600 text-white rounded" onClick={handleCreateShipment} disabled={!!actionLoading}>{actionLoading === 'createShipment' ? '处理中...' : '创建运单'}</button>
        </div>
        {actionError && <div className="text-sm text-red-600">操作失败：{actionError}</div>}
        <div className="pt-4 border-t">原始数据: <pre className="text-xs bg-slate-100 text-black p-2 rounded overflow-auto">{JSON.stringify(order, null, 2)}</pre></div>
      </div>
    </PagePlaceholder>
  );
};

export default OrderDetailPage;
