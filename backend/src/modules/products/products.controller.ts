import type { Request, Response, NextFunction } from "express";
import * as service from "./products.service";
import { createProductSchema, updateProductSchema, productQuerySchema } from "./products.schema";

export async function getProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const query = productQuerySchema.parse(req.query);
    const result = await service.getProducts(query);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getProductBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await service.getProductBySlug(req.params.slug);
    res.json({ product });
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createProductSchema.parse(req.body);
    const product = await service.createProduct(data);
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updateProductSchema.parse(req.body);
    const product = await service.updateProduct(req.params.id, data);
    res.json({ product });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    await service.deleteProduct(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
