import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { imagekit } from "../../config/imagekit";

export const uploadRouter = Router();

// GET /api/upload/auth — lấy ImageKit auth signature cho client-side upload
// Client dùng signature này để upload trực tiếp lên ImageKit (không qua server)
uploadRouter.get("/auth", authenticate, (_req, res) => {
  try {
    const authParams = imagekit.getAuthenticationParameters();
    res.json(authParams);
  } catch {
    res.status(500).json({ error: "Failed to generate upload signature" });
  }
});
