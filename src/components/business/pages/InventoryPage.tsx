import React, { useEffect, useState } from 'react';
import PagePlaceholder from './PagePlaceholder';
import { db, collection, getDocs, updateDoc, doc, addDoc } from '../../../services/firebase';

const InventoryPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const industry = typeof window !== 'undefined' ? (localStorage.getItem('preview_industry_id') || window.location.pathname.split('/')[2] || 'fashion') : 'fashion';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const col = collection(db, `${industry}_inventory`);
        const snaps = await getDocs(col as any);
        const list: any[] = [];
        snaps.forEach((d: any) => list.push({ id: d.id, ...d.data() }));
        setItems(list);
      } catch (e) {
        console.error('加载库存失败', e);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [industry]);

  const adjust = async (id: string, delta: number) => {
    try {
      const ref = doc(db, `${industry}_inventory`, id);
      await updateDoc(ref as any, { quantity: (delta === 0 ? 0 : (delta > 0 ? delta : delta)), updatedAt: new Date() });
      // simple reload
      const col = collection(db, `${industry}_inventory`);
      const snaps = await getDocs(col as any);
      const list: any[] = [];
      snaps.forEach((d: any) => list.push({ id: d.id, ...d.data() }));
      setItems(list);
    } catch (e) {
      console.error('更新库存失败', e);
      alert('更新库存失败');
    }
  };

  const [newSku, setNewSku] = useState('');
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState<number>(0);

  const handleCreateSku = async () => {
    try {
      const col = collection(db, `${industry}_inventory`);
      await addDoc(col as any, { sku: newSku || undefined, name: newName, quantity: newQty, createdAt: new Date() });
      setNewSku(''); setNewName(''); setNewQty(0);
      // reload
      const snaps = await getDocs(col as any);
      const list: any[] = [];
      snaps.forEach((d: any) => list.push({ id: d.id, ...d.data() }));
      setItems(list);
    } catch (e) {
      console.error('新增 SKU 失败', e);
      alert('新增 SKU 失败');
    }
  };

  return (
    <PagePlaceholder title="库存管理">
      {loading && <div>加载中...</div>}
      {!loading && (
        <div>
          <div className="p-4 border rounded bg-white mb-4">
            <div className="font-medium mb-2">新增 SKU</div>
            <div className="flex gap-2">
              <input placeholder="SKU id (可选)" value={newSku} onChange={e => setNewSku(e.target.value)} className="border p-2 rounded" />
              <input placeholder="名称" value={newName} onChange={e => setNewName(e.target.value)} className="border p-2 rounded" />
              <input type="number" placeholder="数量" value={newQty} onChange={e => setNewQty(Number(e.target.value))} className="border p-2 rounded w-28" />
              <button className="px-3 py-1 bg-sky-600 text-white rounded" onClick={handleCreateSku}>新增</button>
            </div>
          </div>
          {items.length === 0 && <div>暂无库存记录。</div>}
          <ul className="space-y-2">
            {items.map(it => (
              <li key={it.id} className="p-3 border rounded bg-white flex justify-between items-center">
                <div>
                  <div className="font-medium">{it.sku || it.id}</div>
                  <div className="text-sm text-slate-600">库存: {it.quantity ?? 0}</div>
                </div>
                <div className="space-x-2">
                  <button className="px-2 py-1 bg-green-600 text-white rounded" onClick={() => adjust(it.id, (it.quantity ?? 0) + 1)}>+1</button>
                  <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={() => adjust(it.id, Math.max(0, (it.quantity ?? 0) - 1))}>-1</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </PagePlaceholder>
  );
};

export default InventoryPage;
