import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { AppError } from "../../middlewares/error.middleware";
import type { Request, Response, NextFunction } from "express";

export const promotionsRouter = Router();

const validateSchema = z.object({
  code: z.string().min(1),
  orderValue: z.number().int().positive(),
});

// POST /api/promotions/validate — kiểm tra mã giảm giá
// Body: { code: string, orderValue: number }
promotionsRouter.post("/validate", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, orderValue } = validateSchema.parse(req.body);

    const promo = await prisma.promotion.findUnique({ where: { code: code.toUpperCase() } });

    if (!promo || !promo.isActive) throw new AppError(404, "Invalid or expired promotion code");
    if (promo.expiresAt && promo.expiresAt < new Date()) throw new AppError(400, "Promotion code has expired");
    if (promo.usageLimit !== null && promo.usedCount >= promo.usageLimit)
      throw new AppError(400, "Promotion code usage limit reached");
    if (orderValue < promo.minOrderValue)
      throw new AppError(400, `Minimum order value is ${promo.minOrderValue}`);

    let discountAmount: number;
    if (promo.discountType === "PERCENT") {
      discountAmount = Math.floor((orderValue * promo.discountValue) / 100);
      if (promo.maxDiscount !== null) discountAmount = Math.min(discountAmount, promo.maxDiscount);
    } else {
      discountAmount = promo.discountValue;
    }

    res.json({
      promotion: {
        id: promo.id,
        code: promo.code,
        description: promo.description,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        discountAmount,
      },
    });
  } catch (err) {
    next(err);
  }
});
