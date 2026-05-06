import { Router } from "express";
import { authenticate, requireAdmin } from "../../middlewares/auth.middleware";
import * as controller from "./products.controller";

export const productsRouter = Router();

// GET  /api/products — public
// Query params: ?category=&search=&featured=&page=&limit=&sort=
productsRouter.get("/", controller.getProducts);

// GET  /api/products/:slug — public
productsRouter.get("/:slug", controller.getProductBySlug);

// POST /api/products — admin
productsRouter.post("/", authenticate, requireAdmin, controller.createProduct);

// PATCH /api/products/:id — admin
productsRouter.patch("/:id", authenticate, requireAdmin, controller.updateProduct);

// DELETE /api/products/:id — admin
productsRouter.delete("/:id", authenticate, requireAdmin, controller.deleteProduct);
