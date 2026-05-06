import { Router } from "express";
import { authenticate, requireAdmin } from "../../middlewares/auth.middleware";
import * as controller from "./categories.controller";

export const categoriesRouter = Router();

// GET  /api/categories — public
categoriesRouter.get("/", controller.getCategories);

// GET /api/categories/:slug — public
categoriesRouter.get("/:slug", controller.getCategoryBySlug);

// POST /api/categories — admin
categoriesRouter.post("/", authenticate, requireAdmin, controller.createCategory);

// PATCH /api/categories/:id — admin
categoriesRouter.patch("/:id", authenticate, requireAdmin, controller.updateCategory);

// DELETE /api/categories/:id — admin
categoriesRouter.delete("/:id", authenticate, requireAdmin, controller.deleteCategory);
