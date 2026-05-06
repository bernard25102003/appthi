import type { Request, Response, NextFunction } from "express";
import * as service from "./orders.service";
import { createOrderSchema } from "./orders.schema";

export async function createOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;
    const data = createOrderSchema.parse(req.body);
    const order = await service.createOrder(userId, data);
    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
}

export async function getUserOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const orders = await service.getUserOrders(req.user!.sub);
    res.json({ orders });
  } catch (err) {
    next(err);
  }
}

export async function getOrderById(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await service.getOrderById(req.params.id, req.user!.sub);
    res.json({ order });
  } catch (err) {
    next(err);
  }
}

export async function cancelOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await service.cancelOrder(req.params.id, req.user!.sub);
    res.json({ order });
  } catch (err) {
    next(err);
  }
}
