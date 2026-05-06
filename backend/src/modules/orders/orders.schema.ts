import { z } from "zod";

export const createOrderSchema = z.object({
  addressId: z.string().min(1, "Address is required"),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "At least one item is required"),
  promotionCode: z.string().optional(),
  paymentMethod: z.enum(["COD", "ONLINE"]),
  note: z.string().max(500).optional(),
});
