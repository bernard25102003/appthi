import { type Request, type Response, type NextFunction } from "express";
import { prisma } from "../../config/prisma";

export async function getHealth(_req: Request, res: Response) {
  try {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to check health",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function getDatabaseStatus(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Execute a simple query to check database connectivity
    const result = await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "connected",
      database: "ok",
      timestamp: new Date().toISOString(),
      query_result: result,
    });
  } catch (error) {
    next(error);
  }
}
