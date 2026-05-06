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
 * GET /api/orders
 * List the authenticated user's own orders
 */
router.get(
  '/',
  authenticate,
  validate(orderQuerySchema, 'query'),
  asyncHandler((req, res) => controller.listMyOrders(req, res)),
);

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

// ─── Admin routes ─────────────────────────────────────────────────────────────

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

export default router;
