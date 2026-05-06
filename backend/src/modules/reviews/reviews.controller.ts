import type { Request, Response, NextFunction } from "express";
import * as service from "./reviews.service";
import { createReviewSchema, updateReviewSchema } from "./reviews.schema";

export async function getProductReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const reviews = await service.getProductReviews(req.params.productId);
    res.json({ reviews });
  } catch (err) {
    next(err);
  }
}

export async function createReview(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;
    const { productId } = req.params;
    const data = createReviewSchema.parse(req.body);
    const review = await service.createReview(userId, productId, data);
    res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
}

export async function updateReview(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updateReviewSchema.parse(req.body);
    const review = await service.updateReview(req.params.id, req.user!.sub, data);
    res.json({ review });
  } catch (err) {
    next(err);
  }
}

export async function deleteReview(req: Request, res: Response, next: NextFunction) {
  try {
    await service.deleteReview(req.params.id, req.user!.sub);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
