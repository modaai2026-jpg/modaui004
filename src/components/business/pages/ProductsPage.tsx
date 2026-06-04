import React, { useEffect, useState } from 'react';
import PagePlaceholder from './PagePlaceholder';
import { db, collection, getDocs, addDoc, deleteDoc, updateDoc, doc } from '../../../services/firebase';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const industry = typeof window !== 'undefined' ? (localStorage.getItem('preview_industry_id') || window.location.pathname.split('/')[2] || 'fashion') : 'fashion';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const col = collection(db, `${industry}_products`);
        const snaps = await getDocs(col as any);
        const list: any[] = [];
        snaps.forEach((d: any) => list.push({ id: d.id, ...d.data() }));
        setProducts(list);
      } catch (e) {
        console.error('加载商品失败', e);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [industry]);

  const handleAdd = async () => {
    try {
      const col = collection(db, `${industry}_products`);
      await addDoc(col as any, { name, price, createdAt: new Date() });
      setName(''); setPrice(0);
      const snaps = await getDocs(col as any);
      const list: any[] = [];
      snaps.forEach((d: any) => list.push({ id: d.id, ...d.data() }));
      setProducts(list);
    } catch (e) {
      console.error('新增商品失败', e);
      alert('新增商品失败');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除该商品？')) return;
    try {
      const ref = doc(db, `${industry}_products`, id);
      await deleteDoc(ref as any);
      setProducts(products.filter(p => p.id !== id));
    } catch (e) {
      console.error('删除失败', e);
      alert('删除失败');
    }
  };

  const handleEdit = async (id: string, field: string, value: any) => {
    try {
      const ref = doc(db, `${industry}_products`, id);
      await updateDoc(ref as any, { [field]: value, updatedAt: new Date() });
      setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
    } catch (e) {
      console.error('更新失败', e);
      alert('更新失败');
    }
  };

  return (
    <PagePlaceholder title="商品管理">
      {loading && <div>加载中...</div>}
      {!loading && (
        <div className="space-y-4">
          <div className="p-4 border rounded bg-white">
            <div className="mb-2 font-medium">新增商品</div>
            <div className="flex gap-2">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="商品名" className="border p-2 rounded" />
              <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} placeholder="价格" className="border p-2 rounded w-28" />
              <button className="px-3 py-1 bg-sky-600 text-white rounded" onClick={handleAdd}>新增</button>
            </div>
          </div>

          <ul className="space-y-2">
            {products.map(p => (
              <li key={p.id} className="p-3 border rounded bg-white flex justify-between items-center">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-slate-600">¥{p.price}</div>
                </div>
                <div className="space-x-2">
                  <button className="px-3 py-1 bg-gray-200 rounded" onClick={() => {
                    const newName = prompt('修改商品名', p.name);
                    if (newName !== null) handleEdit(p.id, 'name', newName);
                  }}>编辑</button>
                  <button className="px-3 py-1 bg-red-500 text-white rounded" onClick={() => handleDelete(p.id)}>删除</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </PagePlaceholder>
  );
};

export default ProductsPage;
