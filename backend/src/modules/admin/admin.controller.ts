import type { Request, Response, NextFunction } from "express";
import * as service from "./admin.service";
import {
  adminOrderQuerySchema,
  adminProductQuerySchema,
  adminUsersQuerySchema,
  updateOrderStatusSchema,
  updateUserRoleSchema,
  createPromotionSchema,
  updatePromotionSchema,
} from "./admin.schema";
import { updateProductSchema } from "../products/products.schema";

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function getDashboard(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.getDashboard();
    res.json(data);
  } catch (err) {
    next(err);
  }
}

// ── Orders ────────────────────────────────────────────────────────────────────

export async function getOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const query = adminOrderQuerySchema.parse(req.query);
    const result = await service.getOrders(query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function updateOrderStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = updateOrderStatusSchema.parse(req.body);
    const order = await service.updateOrderStatus(req.params.id, status);
    res.json({ order });
  } catch (err) {
    next(err);
  }
}

// ── Products ──────────────────────────────────────────────────────────────────

export async function getProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const query = adminProductQuerySchema.parse(req.query);
    const result = await service.getAdminProducts(query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updateProductSchema.parse(req.body);
    const product = await service.adminUpdateProduct(req.params.id, data);
    res.json({ product });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    await service.adminDeleteProduct(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const query = adminUsersQuerySchema.parse(req.query);
    const result = await service.getUsers(query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function updateUserRole(req: Request, res: Response, next: NextFunction) {
  try {
    const { role } = updateUserRoleSchema.parse(req.body);
    const user = await service.updateUserRole(req.params.id, role);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

// ── Categories ────────────────────────────────────────────────────────────────

export async function getCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await service.getAdminCategories();
    res.json({ categories });
  } catch (err) {
    next(err);
  }
}

// ── Promotions ────────────────────────────────────────────────────────────────

export async function getPromotions(_req: Request, res: Response, next: NextFunction) {
  try {
    const promotions = await service.getPromotions();
    res.json({ promotions });
  } catch (err) {
    next(err);
  }
}

export async function createPromotion(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createPromotionSchema.parse(req.body);
    const promotion = await service.createPromotion(data);
    res.status(201).json({ promotion });
  } catch (err) {
    next(err);
  }
}

export async function updatePromotion(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updatePromotionSchema.parse(req.body);
    const promotion = await service.updatePromotion(req.params.id, data);
    res.json({ promotion });
  } catch (err) {
    next(err);
  }
}

export async function deletePromotion(req: Request, res: Response, next: NextFunction) {
  try {
    await service.deletePromotion(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
