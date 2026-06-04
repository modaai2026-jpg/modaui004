import { describe, it, expect, vi } from 'vitest';

// We'll mock 'firebase/firestore' to replace runTransaction and helpers

const makeMockFirestore = (skuQtyMap: Record<string, number>) => {
  return {
    runTransaction: async (_db: any, callback: any) => {
      // simple tx mock
      const tx = {
        async get(ref: any) {
          // ref will be formatted as `${col}/${id}` by our mocked doc
          const parts = String(ref).split('/');
          const id = parts[parts.length - 1];
          const qty = skuQtyMap[id];
          return {
            exists: () => typeof qty !== 'undefined',
            data: () => ({ quantity: qty })
          };
        },
        update(_ref: any, _data: any) { /* noop */ },
        set(_ref: any, _data: any) { /* noop */ }
      };
      return await callback(tx);
    },
    collection(_db: any, name: string) { return name; },
    doc(_col: any, id: string) { return `${_col}/${id}`; },
    serverTimestamp() { return 'now'; }
  };
};

describe('OrderFulfillmentService transaction behavior', () => {
  it('succeeds when inventory is sufficient', async () => {
    const mockFs = makeMockFirestore({ 'sku-1': 5 });
    vi.doMock('firebase/firestore', () => mockFs);

    const svc = await import('../services/order-fulfillment.service');
    const res = await svc.default.createOrderWithAllocation('test', { items: [{ skuId: 'sku-1', qty: 1 }], total: 10 });
    expect(res).toHaveProperty('id');

    vi.dontMock('firebase/firestore');
  });

  it('fails when inventory is insufficient', async () => {
    const mockFs = makeMockFirestore({ 'sku-1': 0 });
    vi.doMock('firebase/firestore', () => mockFs);

    const svc = await import('../services/order-fulfillment.service');
    await expect(svc.default.createOrderWithAllocation('test', { items: [{ skuId: 'sku-1', qty: 2 }], total: 20 })).rejects.toThrow(/Insufficient stock/);

    vi.dontMock('firebase/firestore');
  });
});
