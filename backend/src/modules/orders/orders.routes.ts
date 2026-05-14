import { Router } from 'express';
import { OrdersController } from './orders.controller';
import { authenticate, requireAdmin } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../utils/asyncHandler';
import { createOrderSchema, updateOrderStatusSchema, orderQuerySchema } from '../../utils/validators';

const router = Router();
const controller = new OrdersController();

// ─── User routes (authenticated) ─────────────────────────────────────────────

/**
 * POST /api/orders
 * Create a new order from cart items
 */
router.post(
  '/',
  authenticate,
  validate(createOrderSchema),
  asyncHandler((req, res) => controller.createOrder(req, res)),
);

/**
 * POST /api/orders/vnpay/create-payment-url
 * Create order and return VNPAY payment URL
 */
router.post(
  '/vnpay/create-payment-url',
  authenticate,
  validate(createOrderSchema),
  asyncHandler((req, res) => controller.createVnpayPayment(req, res)),
);

/**
 * GET /api/orders/vnpay/verify-return
 * Verify VNPAY return data
 */
router.get(
  '/vnpay/verify-return',
  asyncHandler((req, res) => controller.verifyVnpayReturn(req, res)),
);

/**
 * GET /api/orders
 * List the authenticated user's own orders
 */
router.get(
  '/',
  authenticate,
  validate(orderQuerySchema, 'query'),
  asyncHandler((req, res) => controller.listMyOrders(req, res)),
);

// ─── Admin routes (must come before /:orderId to avoid shadowing) ─────────────

/**
 * GET /api/orders/admin/all
 * List all orders with optional filters (admin only)
 */
router.get(
  '/admin/all',
  authenticate,
  requireAdmin,
  validate(orderQuerySchema, 'query'),
  asyncHandler((req, res) => controller.listAllOrders(req, res)),
);

/**
 * GET /api/orders/admin/:orderId
 * Get any order detail (admin only)
 */
router.get(
  '/admin/:orderId',
  authenticate,
  requireAdmin,
  asyncHandler((req, res) => controller.getOrderById(req, res)),
);

/**
 * PATCH /api/orders/admin/:orderId/status
 * Update order status (admin only) — enforces the state machine
 */
router.patch(
  '/admin/:orderId/status',
  authenticate,
  requireAdmin,
  validate(updateOrderStatusSchema),
  asyncHandler((req, res) => controller.updateOrderStatus(req, res)),
);

// ─── User parameterised routes ────────────────────────────────────────────────

/**
 * GET /api/orders/:orderId
 * Get a specific order for the authenticated user
 */
router.get(
  '/:orderId',
  authenticate,
  asyncHandler((req, res) => controller.getMyOrderById(req, res)),
);

/**
 * PATCH /api/orders/:orderId/cancel
 * Cancel a PENDING order (user can only cancel their own PENDING orders)
 */
router.patch(
  '/:orderId/cancel',
  authenticate,
  asyncHandler((req, res) => controller.cancelMyOrder(req, res)),
);

// ─── DEBUG: Check VNPAY Configuration (TEMPORARY) ───────────────────────────

/**
 * GET /api/orders/debug/vnpay-config
 * Debug endpoint to check VNPAY configuration
 * Remove this after fixing payment issues
 */
router.get(
  '/debug/vnpay-config',
  asyncHandler(async (_req, res) => {
    const { env } = await import('../../config/env');
    res.json({
      DEBUG_INFO: 'This endpoint is for debugging only and should be removed after fixing VNPAY issues',
      VNPAY_TMN_CODE: env.VNPAY_TMN_CODE ? '✅ SET' : '❌ MISSING',
      VNPAY_HASH_SECRET: env.VNPAY_HASH_SECRET ? '✅ SET' : '❌ MISSING',
      VNPAY_EXPIRE_DURATION: `${env.VNPAY_EXPIRE_DURATION} minutes`,
      VNPAY_URL: env.VNPAY_URL,
      VNPAY_RETURN_URL: env.VNPAY_RETURN_URL,
      NODE_ENV: env.NODE_ENV,
      SERVER_TIME: new Date().toISOString(),
      SERVER_TIMESTAMP: Date.now(),
      TIMEZONE: process.env.TZ || 'not set (default: UTC)',
    });
  }),
);

/**
 * GET /api/orders/debug/vnpay-params
 * Debug endpoint to simulate VNPAY payment URL generation
 * Pass ?amount=100000&orderNumber=TEST001 to test
 * Remove this after fixing payment issues
 */
router.get(
  '/debug/vnpay-params',
  asyncHandler(async (req, res) => {
    const { OrdersService } = await import('./orders.service');
    
    try {
      const amount = req.query.amount ? String(req.query.amount) : '100000';
      const orderNumber = req.query.orderNumber ? String(req.query.orderNumber) : 'TEST001';
      
      const service = new OrdersService();
      
      // Simulate payment URL generation
      const mockOrder = {
        id: 'debug-test-id',
        orderNumber,
        totalPrice: new (await import('@prisma/client')).Prisma.Decimal(parseInt(amount) / 100),
      };
      
      // @ts-ignore - accessing private method for debugging
      const paymentUrl = service.buildVnpayPaymentUrl(mockOrder, '127.0.0.1');
      
      // Parse URL to show parameters
      const url = new URL(paymentUrl, 'http://dummy.com');
      const params: Record<string, string> = {};
      url.searchParams.forEach((value, key) => {
        params[key] = value;
      });
      
      res.json({
        DEBUG_INFO: 'Simulated VNPAY payment URL generation',
        fullPaymentUrl: paymentUrl,
        parameters: params,
        note: 'This endpoint is for debugging - remove after fixing VNPAY issues',
      });
    } catch (error: any) {
      res.status(400).json({
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
    }
  }),
);

export default router;
