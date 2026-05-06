import type { Request, Response, NextFunction } from "express";
import * as service from "./categories.service";
import { createCategorySchema, updateCategorySchema } from "./categories.schema";

export async function getCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await service.getCategories();
    res.json({ categories });
  } catch (err) {
    next(err);
  }
}

export async function getCategoryBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await service.getCategoryBySlug(req.params.slug);
    res.json({ category });
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createCategorySchema.parse(req.body);
    const category = await service.createCategory(data);
    res.status(201).json({ category });
  } catch (err) {
    next(err);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updateCategorySchema.parse(req.body);
    const category = await service.updateCategory(req.params.id, data);
    res.json({ category });
  } catch (err) {
    next(err);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    await service.deleteCategory(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
