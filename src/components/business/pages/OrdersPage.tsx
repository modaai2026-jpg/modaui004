import React, { useEffect, useState } from 'react';
import PagePlaceholder from './PagePlaceholder';
import { db, collection, getDocs, getDoc, doc } from '../../../services/firebase';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
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
