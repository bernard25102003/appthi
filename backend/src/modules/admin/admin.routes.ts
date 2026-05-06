import { Router } from "express";
import { authenticate, requireAdmin } from "../../middlewares/auth.middleware";
import * as controller from "./admin.controller";

export const adminRouter = Router();

// Tất cả admin routes yêu cầu authenticate + requireAdmin
adminRouter.use(authenticate, requireAdmin);

// ── Dashboard ─────────────────────────────────────────────────────────────────
// GET /api/admin/dashboard
adminRouter.get("/dashboard", controller.getDashboard);

// ── Orders ────────────────────────────────────────────────────────────────────
// GET  /api/admin/orders?status=&page=&limit=
adminRouter.get("/orders", controller.getOrders);

// PATCH /api/admin/orders/:id/status
adminRouter.patch("/orders/:id/status", controller.updateOrderStatus);

// ── Products ──────────────────────────────────────────────────────────────────
// GET  /api/admin/products?page=&limit=&category=&search=
adminRouter.get("/products", controller.getProducts);

// PATCH /api/admin/products/:id
adminRouter.patch("/products/:id", controller.updateProduct);

// DELETE /api/admin/products/:id
adminRouter.delete("/products/:id", controller.deleteProduct);

// ── Users ─────────────────────────────────────────────────────────────────────
// GET /api/admin/users?page=&limit=&search=
adminRouter.get("/users", controller.getUsers);

// PATCH /api/admin/users/:id/role
adminRouter.patch("/users/:id/role", controller.updateUserRole);

// ── Categories ────────────────────────────────────────────────────────────────
// GET /api/admin/categories
adminRouter.get("/categories", controller.getCategories);

// ── Promotions ────────────────────────────────────────────────────────────────
// GET  /api/admin/promotions
adminRouter.get("/promotions", controller.getPromotions);

// POST /api/admin/promotions
adminRouter.post("/promotions", controller.createPromotion);

// PATCH /api/admin/promotions/:id
adminRouter.patch("/promotions/:id", controller.updatePromotion);

// DELETE /api/admin/promotions/:id
adminRouter.delete("/promotions/:id", controller.deletePromotion);
