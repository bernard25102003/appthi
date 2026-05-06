import { prisma } from "../../config/prisma";
import { imagekit } from "../../config/imagekit";
import { AppError } from "../../middlewares/error.middleware";

// ── Profile ───────────────────────────────────────────────────────────────────

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatarUrl: true,
      role: true,
      isEmailVerified: true,
      createdAt: true,
    },
  });
  if (!user) throw new AppError(404, "User not found");
  return user;
}

export async function updateProfile(
  userId: string,
  data: {
    name?: string;
    phone?: string;
    avatarUrl?: string;
    avatarFileId?: string;
  }
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, "User not found");

  // If replacing avatar, delete old image from ImageKit
  if (data.avatarFileId && user.avatarFileId && data.avatarFileId !== user.avatarFileId) {
    await imagekit.deleteFile(user.avatarFileId).catch((e) => console.error("ImageKit delete failed:", e));
  }

  return prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, name: true, email: true, phone: true, avatarUrl: true, role: true, isEmailVerified: true },
  });
}

// ── Addresses ─────────────────────────────────────────────────────────────────

export async function getAddresses(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

export async function createAddress(
  userId: string,
  data: {
    label: string;
    fullName: string;
    phone: string;
    street: string;
    ward?: string;
    district: string;
    city: string;
    isDefault?: boolean;
  }
) {
  // If this is the first address or marked as default, unset other defaults
  if (data.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  } else {
    // If no other address exists, set this as default
    const count = await prisma.address.count({ where: { userId } });
    if (count === 0) data = { ...data, isDefault: true };
  }

  return prisma.address.create({ data: { ...data, userId } });
}

export async function updateAddress(
  id: string,
  userId: string,
  data: {
    label?: string;
    fullName?: string;
    phone?: string;
    street?: string;
    ward?: string;
    district?: string;
    city?: string;
    isDefault?: boolean;
  }
) {
  const address = await prisma.address.findFirst({ where: { id, userId } });
  if (!address) throw new AppError(404, "Address not found");

  if (data.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }

  return prisma.address.update({ where: { id }, data });
}

export async function deleteAddress(id: string, userId: string) {
  const address = await prisma.address.findFirst({ where: { id, userId } });
  if (!address) throw new AppError(404, "Address not found");

  await prisma.address.delete({ where: { id } });

  // If deleted address was the default, assign default to most recent remaining
  if (address.isDefault) {
    const remaining = await prisma.address.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    if (remaining) {
      await prisma.address.update({ where: { id: remaining.id }, data: { isDefault: true } });
    }
  }
}
