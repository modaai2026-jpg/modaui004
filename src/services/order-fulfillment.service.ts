import { db, collection, doc, addDoc, updateDoc, getDoc, serverTimestamp, increment } from './firebase';
import { runTransaction, collection as rawCollection, doc as rawDoc, serverTimestamp as rawServerTimestamp } from 'firebase/firestore';

export const OrderFulfillmentService = {
  async createOrder(industryId: string, order: any) {
    const ordersCol = collection(db, `${industryId}_orders`);
    const now = serverTimestamp();
    const orderData = {
      ...order,
      status: 'pending',
      paymentStatus: 'unpaid',
      createdAt: now,
      updatedAt: now
    };
    const ref = await addDoc(ordersCol, orderData);
    return { id: ref.id, ...orderData };
  },

  async confirmPayment(industryId: string, orderId: string, transaction: any) {
    const orderRef = doc(db, `${industryId}_orders`, orderId);
    const orderSnap = await getDoc(orderRef as any);
    if (!orderSnap.exists()) throw new Error('Order not found');
    const orderData = orderSnap.data() as any;

    // Idempotent: 如果已支付则不重复处理
    if (orderData.paymentStatus === 'paid') {
      return true;
    }

    const tx = {
      ...transaction,
      createdAt: serverTimestamp(),
      orderId,
    };
    // write transaction record
    const txCol = collection(db, `${industryId}_transactions`);
    await addDoc(txCol, tx);

    // update order atomically-ish (read-check-update)
    await updateDoc(orderRef, {
      paymentStatus: 'paid',
      status: 'processing',
      updatedAt: serverTimestamp()
    });

    return true;
  },

  async allocateInventory(industryId: string, items: Array<{ skuId: string; qty: number }>) {
    // decrement inventory for each SKU
    for (const it of items) {
      try {
        const skuRef = doc(db, `${industryId}_inventory`, it.skuId);
        const snap = await getDoc(skuRef);
        if (snap.exists()) {
          await updateDoc(skuRef, {
            quantity: increment(-it.qty),
            updatedAt: serverTimestamp()
          });
        }
      } catch (e) {
        console.warn('Inventory allocation issue', e);
      }
    }
    return true;
  },

  async createShipment(industryId: string, orderId: string, shipment: any) {
    const shipmentsCol = collection(db, `${industryId}_shipments`);
    const sh = { ...shipment, orderId, createdAt: serverTimestamp(), status: 'pending' };
    const ref = await addDoc(shipmentsCol, sh);

    // link shipment to order
    const orderRef = doc(db, `${industryId}_orders`, orderId);
    await updateDoc(orderRef, {
      shipmentId: ref.id,
      status: 'shipped',
      updatedAt: serverTimestamp()
    });

    return { id: ref.id, ...sh };
  },

  async createOrderWithAllocation(industryId: string, order: any) {
    // Create order and deduct inventory atomically using transaction
    const result = await runTransaction(db as any, async (tx) => {
      const ordersCol = rawCollection(db as any, `${industryId}_orders`);
      const orderRef = rawDoc(ordersCol);
      const now = rawServerTimestamp();
      const orderData = {
        ...order,
        status: 'pending',
        paymentStatus: 'unpaid',
        createdAt: now,
        updatedAt: now
      };

      // check and reserve inventory
      for (const it of order.items || []) {
        const skuRef = rawDoc(rawCollection(db as any, `${industryId}_inventory`), it.skuId);
        const skuSnap = await tx.get(skuRef);
        if (!skuSnap.exists()) throw new Error(`SKU not found: ${it.skuId}`);
        const qty = skuSnap.data()?.quantity || 0;
        if (qty < it.qty) throw new Error(`Insufficient stock for ${it.skuId}`);
        tx.update(skuRef, { quantity: qty - it.qty, updatedAt: now });
      }

      tx.set(orderRef, orderData);

      // create a transaction record
      const txCol = rawCollection(db as any, `${industryId}_transactions`);
      const txRef = rawDoc(txCol);
      tx.set(txRef, { orderId: orderRef.id, amount: order.total || 0, createdAt: now, note: 'order_create' });

      return { id: orderRef.id, ...orderData };
    });

    return result;
  }
};

export default OrderFulfillmentService;
