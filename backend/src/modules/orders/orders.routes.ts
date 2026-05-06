import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import * as controller from "./orders.controller";

export const ordersRouter = Router();

// POST /api/orders — đặt hàng (yêu cầu login)
ordersRouter.post("/", authenticate, controller.createOrder);

// GET /api/orders — lịch sử đơn của user hiện tại
ordersRouter.get("/", authenticate, controller.getUserOrders);

// GET /api/orders/:id — chi tiết đơn (chỉ được xem đơn của mình)
ordersRouter.get("/:id", authenticate, controller.getOrderById);

// POST /api/orders/:id/cancel — hủy đơn (chỉ khi PENDING)
ordersRouter.post("/:id/cancel", authenticate, controller.cancelOrder);
