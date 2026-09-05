import { Router } from 'express';
import { db } from '../db';
import {
  requireAdminAuth,
  optionalCustomerAuth,
  AuthenticatedRequest,
  CustomerAuthenticatedRequest,
} from '../auth';
import { OrderStatus } from '../types';

export const orderRouter = Router();

// POST /api/orders - Customer Place Order (No Login Required - Guest Checkout Supported)
orderRouter.post('/', optionalCustomerAuth, (req: CustomerAuthenticatedRequest, res) => {
  let customerId = req.customerUser?.userId;
  let customerUsername = req.customerUser?.username;

  const authHeader = req.headers.authorization;
  const token = (authHeader && authHeader.startsWith('Bearer '))
    ? authHeader.substring(7)
    : (req.headers['x-customer-token'] as string) || req.body.customerToken;

  if (!customerId && token) {
    const session = db.getCustomerSession(token);
    if (session) {
      customerId = session.userId;
      customerUsername = session.username;
    }
  }

  const { customerName, phone, area, address, notes, items } = req.body;

  if (!customerName || !phone || !address || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Please provide all required fields and at least one item.' });
  }

  const result = db.createOrder({
    customerId,
    customerUsername,
    customerName,
    phone,
    area: area || 'Sargodha, Pakistan',
    address,
    notes,
    items,
  });

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  // Sanitize order for customer view (strip buying cost & profit)
  const safeOrder = db.getOrderById(result.order.id, false);
  return res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    order: safeOrder,
  });
});

// GET /api/orders/track/:orderNumber - Customer Track Order by Order Number
orderRouter.get('/track/:orderNumber', (req, res) => {
  const { orderNumber } = req.params;
  const order = db.getOrderById(orderNumber, false);

  if (!order) {
    return res.status(404).json({ error: 'Order not found. Please check your order number.' });
  }

  return res.json(order);
});

// GET /api/orders/my-orders - Customer past saved orders
orderRouter.get('/my-orders', optionalCustomerAuth, (req: CustomerAuthenticatedRequest, res) => {
  let customerId = req.customerUser?.userId;
  let customerUsername = req.customerUser?.username;

  const authHeader = req.headers.authorization;
  const token = (authHeader && authHeader.startsWith('Bearer '))
    ? authHeader.substring(7)
    : (req.headers['x-customer-token'] as string);

  if (!customerId && token) {
    const session = db.getCustomerSession(token);
    if (session) {
      customerId = session.userId;
      customerUsername = session.username;
    }
  }

  const queryPhone = req.query.phone as string;
  const queryUsername = (req.query.username as string) || customerUsername;

  if (customerUsername || customerId) {
    const orders = db.getOrdersForCustomer(customerUsername || customerId || '', queryPhone);
    return res.json(orders);
  }

  if (queryUsername) {
    const orders = db.getOrdersForCustomer(queryUsername, queryPhone);
    return res.json(orders);
  }

  if (queryPhone && queryPhone.trim().length >= 5) {
    const orders = db.getCustomerOrdersByPhone(queryPhone);
    return res.json(orders);
  }

  return res.json([]);
});

// Handler for admin orders retrieval
const getAdminOrders = (req: any, res: any) => {
  const { status, search, page, limit } = req.query;
  let orders = db.getOrders(true);

  if (status && status !== 'ALL') {
    orders = orders.filter((o) => o.status === status);
  }

  if (search) {
    const q = String(search).toLowerCase();
    orders = orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.phone.toLowerCase().includes(q) ||
        o.address.toLowerCase().includes(q)
    );
  }

  if (page || limit) {
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(String(limit), 10) || 20));
    const totalRecords = orders.length;
    const totalPages = Math.ceil(totalRecords / limitNum);
    const paginated = orders.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return res.json({
      orders: paginated,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalRecords,
        limit: limitNum,
      },
    });
  }

  return res.json(orders);
};

// GET /api/orders (admin) and GET /api/orders/admin
orderRouter.get('/', requireAdminAuth, getAdminOrders);
orderRouter.get('/admin', requireAdminAuth, getAdminOrders);

// Handler for status update
const updateStatusHandler = (req: AuthenticatedRequest, res: any) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses: OrderStatus[] = [
    'NEW',
    'CONFIRMED',
    'PREPARING',
    'READY',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status: ${status}` });
  }

  const updated = db.updateOrderStatus(id, status, req.adminUser?.username || 'moiz');
  if (!updated) {
    return res.status(404).json({ error: 'Order not found' });
  }

  return res.json({
    success: true,
    message: `Order status updated to ${status}`,
    order: updated,
  });
};

// Status update endpoints supporting both PATCH and PUT, with/without /admin prefix
orderRouter.patch('/:id/status', requireAdminAuth, updateStatusHandler);
orderRouter.put('/:id/status', requireAdminAuth, updateStatusHandler);
orderRouter.patch('/admin/:id/status', requireAdminAuth, updateStatusHandler);
orderRouter.put('/admin/:id/status', requireAdminAuth, updateStatusHandler);

// GET single order
orderRouter.get('/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const order = db.getOrderById(id, true);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  return res.json(order);
});
