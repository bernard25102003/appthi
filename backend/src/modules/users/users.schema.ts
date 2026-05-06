import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  avatarFileId: z.string().optional(),
});

export const createAddressSchema = z.object({
  label: z.string().min(1).max(50),
  fullName: z.string().min(1).max(100),
  phone: z.string().min(1),
  street: z.string().min(1),
  ward: z.string().optional(),
  district: z.string().min(1),
  city: z.string().min(1),
  isDefault: z.boolean().default(false),
});

export const updateAddressSchema = createAddressSchema.partial();
