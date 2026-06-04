const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const DB_FILE = path.resolve(__dirname, '../data/modadb.json');

function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    throw new Error(`Database file not found: ${DB_FILE}`);
  }
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(raw);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function request(method, url, data = {}, config = {}) {
  const res = await axios({ method, url: `${API_BASE_URL}${url}`, data, ...config, validateStatus: null });
  if (res.status >= 400) {
    throw new Error(`HTTP ${res.status} ${res.statusText} ${url} - ${JSON.stringify(res.data)}`);
  }
  return res.data;
}

async function run() {
  console.log('Realtime Connectivity Audit starting against', API_BASE_URL);
  const suffix = Date.now();
  const adminEmail = `audit-admin+${suffix}@modaui.test`;
  const merchantOwnerEmail = `audit-merchant+${suffix}@modaui.test`;
  const storeTenantEmail = `audit-store+${suffix}@modaui.test`;

  const adminRegistration = await request('post', '/api/auth/register', {
    email: adminEmail,
    password: 'AuditPass123!',
    name: 'Audit Admin',
    role: 'Platform Admin'
  });
  assert(adminRegistration?.success, 'Admin registration failed');
  assert(adminRegistration.sessionId, 'Admin sessionId missing');
  const adminSessionId = adminRegistration.sessionId;
  console.log('PASS: Admin registration created and returned sessionId');

  const db1 = loadDB();
  const userFound = db1.users.find(u => u.email === adminEmail);
  assert(userFound, 'Database did not record new user');
  console.log('PASS: Database recorded new user registration');

  const auditUserLog = db1.audit_logs.find(l => l.action === 'USER_REGISTER' && l.details.includes(adminEmail));
  assert(auditUserLog, 'Audit log did not record USER_REGISTER event');
  console.log('PASS: Audit log contains USER_REGISTER');

  const notificationUser = db1.notifications.find(n => n.title === 'New User Registered' && n.message.includes(adminEmail));
  assert(notificationUser, 'Notification record missing for user registration');
  console.log('PASS: Notification created for user registration');

  const eventUserRegistered = db1.events.find(e => e.type === 'USER_REGISTERED' && e.payload?.email === adminEmail);
  assert(eventUserRegistered, 'Event bus did not record USER_REGISTERED');
  console.log('PASS: Event bus recorded USER_REGISTERED');

  const merchantCreate = await request('post', '/api/merchants', {
    name: `Audit Merchant ${suffix}`,
    ownerId: adminEmail,
    billingPlan: 'growth',
    sessionId: adminSessionId
  });
  assert(merchantCreate?.success, 'Merchant creation failed');
  const merchantId = merchantCreate?.merchant?.id;
  assert(merchantId, 'Merchant ID missing after creation');
  console.log('PASS: Merchant created successfully');

  const db2 = loadDB();
  assert(db2.merchants.some(m => m.id === merchantId), 'Merchant not found in database');
  assert(db2.audit_logs.some(l => l.action === 'MERCHANT_CREATE' && l.details.includes(merchantId)), 'Audit log missing MERCHANT_CREATE');
  assert(db2.notifications.some(n => n.title === 'Merchant Created' && n.tenantId === merchantId), 'Notification missing Merchant Created');
  assert(db2.events.some(e => e.type === 'MERCHANT_CREATED' && e.payload?.merchantId === merchantId), 'Event missing MERCHANT_CREATED');
  console.log('PASS: Merchant creation path recorded DB, audit log, notification and event');

  const storeInit = await request('post', '/api/tenants/initialize', {
    email: storeTenantEmail,
    companyName: `Audit Store ${suffix}`,
    industryId: 'retail',
    strategyId: 'audit_strategy',
    strategyName: 'Audit Store Launch',
    strategyDesc: 'Generates a store and tenant assets for realtime audit.'
  });
  assert(storeInit?.success, 'Store initialize endpoint failed');
  const storeId = storeInit?.store?.id;
  assert(storeId, 'Store ID missing after initialize');
  console.log('PASS: Store initialization created merchant and store');

  const db3 = loadDB();
  assert(db3.stores.some(s => s.id === storeId), 'Store not found in database');
  assert(db3.audit_logs.some(l => l.action === 'STORE_UPDATE' || l.details.includes(storeId)), 'Store create/update audit not found');
  assert(db3.notifications.some(n => n.title === 'Store Created' && n.tenantId === storeInit.merchantId), 'Notification missing Store Created');
  assert(db3.events.some(e => e.type === 'STORE_CREATED' && e.payload?.storeId === storeId), 'Event missing STORE_CREATED');
  console.log('PASS: Store creation path recorded DB, notification and event');

  const productCreate = await request('post', '/api/products', {
    storeId,
    name: `Audit Product A ${suffix}`,
    category: 'Audit',
    price: 49.9,
    inventory: 20
  });
  assert(productCreate?.success, 'Product creation failed');
  const productId = productCreate?.product?.id;
  assert(productId, 'Product ID missing after creation');
  console.log('PASS: Product created successfully');

  const db4 = loadDB();
  assert(db4.products.some(p => p.id === productId), 'Product not found in database');
  assert(db4.notifications.some(n => n.title === 'Product Created' && n.message.includes(productId)), 'Notification missing Product Created');
  assert(db4.events.some(e => e.type === 'PRODUCT_CREATED' && e.payload?.productId === productId), 'Event missing PRODUCT_CREATED');
  console.log('PASS: Product creation path recorded DB, notification and event');

  const orderCreate = await request('post', '/api/orders', {
    userId: userFound.id,
    storeId,
    merchantId: storeInit.merchantId,
    items: [{ productId, quantity: 1, price: 49.9 }],
    totalPrice: 49.9,
    status: 'pending'
  });
  assert(orderCreate?.success, 'Order creation failed');
  const orderId = orderCreate?.order?.id;
  assert(orderId, 'Order ID missing after creation');
  console.log('PASS: Order created successfully');

  const db5 = loadDB();
  assert(db5.orders.some(o => o.id === orderId), 'Order not found in database');
  assert(db5.audit_logs.some(l => l.action === 'ORDER_PLACED' && l.details.includes(orderId)), 'Audit log missing ORDER_PLACED');
  assert(db5.notifications.some(n => n.title === 'New Order' && n.message.includes(orderId)), 'Notification missing New Order');
  assert(db5.events.some(e => e.type === 'ORDER_PLACED' && e.payload?.orderId === orderId), 'Event missing ORDER_PLACED');
  console.log('PASS: Order placement path recorded DB, audit log, notification and event');

  const payment = await request('post', '/api/payments/alipay/checkout', {
    amount: 49.9,
    orderId,
    metadata: { orderId }
  });
  assert(payment?.success, 'Payment checkout failed');
  console.log('PASS: Payment checkout succeeded');

  const db6 = loadDB();
  assert(db6.payments.some(p => p.orderId === orderId && p.status === 'succeeded'), 'Payment record missing or not succeeded');
  assert(db6.audit_logs.some(l => l.component === 'FINANCE' && l.details.includes(orderId)), 'Audit log missing payment callback');
  assert(db6.notifications.some(n => n.title === 'Payment Success' && n.message.includes(orderId)), 'Notification missing Payment Success');
  assert(db6.events.some(e => e.type === 'PAYMENT_SUCCESS' && e.payload?.orderId === orderId), 'Event missing PAYMENT_SUCCESS');
  console.log('PASS: Payment path recorded DB, audit log, notification and event');

  const notificationsResponse = await request('get', '/api/notifications', null, { headers: { authorization: adminSessionId } });
  assert(notificationsResponse.success, 'Notification endpoint failed');
  assert(Array.isArray(notificationsResponse.notifications), 'Notification endpoint did not return array');
  console.log('PASS: Notification endpoint is available for admin');

  const eventsResponse = await request('get', '/api/events?status=published', null, { headers: { authorization: adminSessionId } });
  assert(eventsResponse.success, 'Events endpoint failed');
  assert(Array.isArray(eventsResponse.events), 'Events endpoint did not return array');
  console.log('PASS: Events endpoint is available and returning published events');

  const auditResponse = await request('get', '/api/audit/logs?search=ORDER_PLACED', null, { headers: { authorization: adminSessionId } });
  assert(auditResponse.success, 'Audit logs endpoint failed');
  assert(auditResponse.logs.some(log => log.action === 'ORDER_PLACED'), 'Audit logs endpoint did not surface ORDER_PLACED');
  console.log('PASS: Audit logs endpoint surfaces ORDER_PLACED');

  const storeCountRes = await request('get', `/api/stores/count?merchantId=${storeInit.merchantId}`, null, { headers: { authorization: adminSessionId } });
  assert(storeCountRes.success, 'Stores count endpoint failed');
  assert(typeof storeCountRes.count === 'number' && storeCountRes.count >= 1, 'Store count did not update');
  console.log('PASS: Store count endpoint reflected created store');

  console.log('\n=== REALTIME CONNECTIVITY AUDIT PASSED ===');
}

run().catch((err) => {
  console.error('\n=== REALTIME CONNECTIVITY AUDIT FAILED ===');
  console.error(err.message || err);
  process.exit(1);
});
