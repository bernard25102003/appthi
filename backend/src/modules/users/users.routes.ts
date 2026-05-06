import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import * as controller from "./users.controller";

export const usersRouter = Router();

// GET  /api/users/profile
usersRouter.get("/profile", authenticate, controller.getProfile);

// PATCH /api/users/profile
usersRouter.patch("/profile", authenticate, controller.updateProfile);

// GET  /api/users/addresses
usersRouter.get("/addresses", authenticate, controller.getAddresses);

// POST /api/users/addresses
usersRouter.post("/addresses", authenticate, controller.createAddress);

// PATCH /api/users/addresses/:id
usersRouter.patch("/addresses/:id", authenticate, controller.updateAddress);

// DELETE /api/users/addresses/:id
usersRouter.delete("/addresses/:id", authenticate, controller.deleteAddress);
