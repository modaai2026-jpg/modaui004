import React, { useEffect, useState } from 'react';
import PagePlaceholder from './PagePlaceholder';
import { db, collection, getDocs, getDoc, doc } from '../../../services/firebase';
import OrderFulfillmentService from '../../../services/order-fulfillment.service';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastSample, setLastSample] = useState<any | null>(null);
  const industry = typeof window !== 'undefined' ? (localStorage.getItem('preview_industry_id') || window.location.pathname.split('/')[2] || 'fashion') : 'fashion';

  useEffect(() => {
    const load = async () => {
      try {
        const col = collection(db, `${industry}_orders`);
        const snaps = await getDocs(col as any);
        const list: any[] = [];
        snaps.forEach((d: any) => list.push({ id: d.id, ...d.data() }));
        setOrders(list.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)).reverse());
      } catch (e) {
        console.error('加载订单失败', e);
      }
    };
    void load();
  }, [industry]);

  return (
    <PagePlaceholder title="订单管理">
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            className="px-3 py-1 bg-emerald-600 text-white rounded"
            onClick={async () => {
              setError(null);
              const sample = {
                customerId: 'guest-quick',
                items: [{ skuId: 'sku-1', qty: 1, price: 19.9 }],
                total: 19.9,
              };
              setLastSample(sample);
              try {
                const res = await OrderFulfillmentService.createOrderWithAllocation(industry, sample);
                alert(`下单成功：${res.id}`);
                window.location.reload();
              } catch (err: any) {
                console.error('下单失败', err);
                setError(err?.message || String(err));
              }
            }}
          >
            下单并保留库存（示例）
          </button>

          {error && (
            <div className="text-sm text-red-600">
              <div>错误：{error}</div>
              <div className="mt-2">
                <button className="px-2 py-1 bg-yellow-400 rounded mr-2" onClick={async () => {
                  if (!lastSample) return;
                  setError(null);
                  try {
                    const res = await OrderFulfillmentService.createOrderWithAllocation(industry, lastSample);
                    alert(`重试成功：${res.id}`);
                    window.location.reload();
                  } catch (err: any) {
                    setError(err?.message || String(err));
                  }
                }}>重试</button>
              </div>
            </div>
          )}
        </div>
        {orders.length === 0 && <p>暂无订单。</p>}
        <ul className="space-y-2">
          {orders.map(o => (
            <li key={o.id} className="p-3 border rounded bg-white flex justify-between items-center">
              <div>
                <div className="font-medium">订单 #{o.id}</div>
                <div className="text-sm text-slate-600">客户: {o.customerId} · 总计: ¥{o.total}</div>
              </div>
              <div>
                <a href={`/business/${industry}/orders/${o.id}`} className="px-3 py-1 bg-sky-600 text-white rounded">查看</a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </PagePlaceholder>
  );
};

export default OrdersPage;
