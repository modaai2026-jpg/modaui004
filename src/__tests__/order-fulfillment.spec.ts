import { describe, it, expect } from 'vitest';
import OrderFulfillmentService from '../services/order-fulfillment.service';

describe('OrderFulfillmentService basic shape', () => {
  it('exposes createOrderWithAllocation', () => {
    expect(typeof OrderFulfillmentService.createOrderWithAllocation).toBe('function');
  });

  it('exposes createOrder, confirmPayment and allocateInventory', () => {
    expect(typeof OrderFulfillmentService.createOrder).toBe('function');
    expect(typeof OrderFulfillmentService.confirmPayment).toBe('function');
    expect(typeof OrderFulfillmentService.allocateInventory).toBe('function');
  });
});
