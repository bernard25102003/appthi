import { Router } from "express";
import * as controller from "./status.controller";

export const statusRouter = Router();

// ── Health Check ──────────────────────────────────────────────────────────
// GET /health
statusRouter.get("/health", controller.getHealth);

// ── Database Status ────────────────────────────────────────────────────────
// GET /db-status (or /api/status/db)
statusRouter.get("/db", controller.getDatabaseStatus);
