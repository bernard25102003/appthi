import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import * as controller from "./reviews.controller";

export const reviewsRouter = Router();

// GET /api/reviews/products/:productId — public
reviewsRouter.get("/products/:productId", controller.getProductReviews);

// POST /api/reviews/products/:productId — yêu cầu login + đã mua
reviewsRouter.post("/products/:productId", authenticate, controller.createReview);

// PATCH /api/reviews/:id — chỉnh sửa review của mình
reviewsRouter.patch("/:id", authenticate, controller.updateReview);

// DELETE /api/reviews/:id — xóa review của mình
reviewsRouter.delete("/:id", authenticate, controller.deleteReview);
