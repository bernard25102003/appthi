import { Router } from "express";
import rateLimit from "express-rate-limit";
import { env } from "../../config/env";
import { authenticate } from "../../middlewares/auth.middleware";
import * as controller from "./auth.controller";

export const authRouter = Router();

const authLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  message: { error: "Too many requests, please try again later" },
});

// POST /api/auth/register
authRouter.post("/register", authLimiter, controller.register);

// POST /api/auth/login
authRouter.post("/login", authLimiter, controller.login);

// POST /api/auth/logout
authRouter.post("/logout", controller.logout);

// POST /api/auth/refresh — lấy access token mới bằng refresh token cookie
authRouter.post("/refresh", controller.refresh);

// GET /api/auth/me — lấy thông tin user hiện tại
authRouter.get("/me", authenticate, controller.getMe);

// POST /api/auth/forgot-password
authRouter.post("/forgot-password", authLimiter, controller.forgotPassword);

// POST /api/auth/reset-password
authRouter.post("/reset-password", authLimiter, controller.resetPassword);

// GET /api/auth/verify-email/:token
authRouter.get("/verify-email/:token", controller.verifyEmail);
