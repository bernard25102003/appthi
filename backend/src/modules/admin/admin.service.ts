import { prisma } from "../../config/prisma";
import { imagekit } from "../../config/imagekit";
import { AppError } from "../../middlewares/error.middleware";
import type { OrderStatus, Prisma } from "@prisma/client";

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function getDashboard() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const orderStatuses = ["PENDING", "CONFIRMED", "PREPARING", "DELIVERING", "DELIVERED", "CANCELLED"] as const;

  const [
    totalRevenue,
    todayRevenue,
    monthRevenue,
    totalUsers,
    topProducts,
    recentOrders,
    ...statusCounts
  ] = await prisma.$transaction([
    // Total revenue from delivered orders
    prisma.order.aggregate({
      where: { status: "DELIVERED" },
      _sum: { total: true },
    }),
    // Today revenue
    prisma.order.aggregate({
      where: { status: "DELIVERED", createdAt: { gte: startOfToday } },
      _sum: { total: true },
    }),
    // This month revenue
    prisma.order.aggregate({
      where: { status: "DELIVERED", createdAt: { gte: startOfMonth } },
      _sum: { total: true },
    }),
    // Total users
    prisma.user.count(),
    // Top 5 selling products
    prisma.orderItem.groupBy({
      by: ["productId", "productName"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    // Recent 10 orders
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    // Status counts (one query per status)
    ...orderStatuses.map((s) => prisma.order.count({ where: { status: s } })),
  ]);

  const ordersByStatus = Object.fromEntries(
    orderStatuses.map((s, i) => [s, statusCounts[i] as number])
  );

  return {
    revenue: {
      total: totalRevenue._sum.total ?? 0,
      today: todayRevenue._sum.total ?? 0,
      thisMonth: monthRevenue._sum.total ?? 0,
    },
    ordersByStatus,
    totalUsers,
    topProducts,
    recentOrders,
  };
}

// ── Orders ────────────────────────────────────────────────────────────────────

export async function getOrders(query: { status?: OrderStatus; page: number; limit: number }) {
  const { status, page, limit } = query;
  const where: Prisma.OrderWhereInput = {};
  if (status) where.status = status;

  const [total, orders] = await prisma.$transaction([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: true,
      },
    }),
  ]);

  return { orders, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw new AppError(404, "Order not found");
  return prisma.order.update({ where: { id }, data: { status } });
}

// ── Products ──────────────────────────────────────────────────────────────────

export async function getAdminProducts(query: {
  page: number;
  limit: number;
  category?: string;
  search?: string;
  isActive?: boolean;
}) {
  const { page, limit, category, search, isActive } = query;

  const where: Prisma.ProductWhereInput = {};
  if (category) where.category = { slug: category };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (isActive !== undefined) where.isActive = isActive;

  const [total, products] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { category: { select: { id: true, name: true, slug: true } } },
    }),
  ]);

  return { products, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

export async function adminUpdateProduct(id: string, data: Prisma.ProductUpdateInput) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError(404, "Product not found");
  return prisma.product.update({ where: { id }, data });
}

export async function adminDeleteProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError(404, "Product not found");

  if (product.imageFileId) {
    await imagekit.deleteFile(product.imageFileId).catch((e) => console.error("ImageKit delete failed:", e));
  }

  await prisma.product.delete({ where: { id } });
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function getUsers(query: { page: number; limit: number; search?: string }) {
  const { page, limit, search } = query;
  const where: Prisma.UserWhereInput = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [total, users] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isEmailVerified: true,
        avatarUrl: true,
        createdAt: true,
      },
    }),
  ]);

  return { users, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

export async function updateUserRole(id: string, role: "USER" | "ADMIN") {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError(404, "User not found");
  return prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });
}

// ── Promotions ────────────────────────────────────────────────────────────────

export async function getPromotions() {
  return prisma.promotion.findMany({ orderBy: { createdAt: "desc" } });
}

export async function createPromotion(data: {
  code: string;
  description?: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  isActive?: boolean;
  expiresAt?: Date;
}) {
  return prisma.promotion.create({ data });
}

export async function updatePromotion(id: string, data: Prisma.PromotionUpdateInput) {
  const promo = await prisma.promotion.findUnique({ where: { id } });
  if (!promo) throw new AppError(404, "Promotion not found");
  return prisma.promotion.update({ where: { id }, data });
}

export async function deletePromotion(id: string) {
  const promo = await prisma.promotion.findUnique({ where: { id } });
  if (!promo) throw new AppError(404, "Promotion not found");
  await prisma.promotion.delete({ where: { id } });
}

// ── Categories ────────────────────────────────────────────────────────────────

export async function getAdminCategories() {
  return prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
}
