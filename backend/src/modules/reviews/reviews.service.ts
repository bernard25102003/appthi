import { prisma } from "../../config/prisma";
import { AppError } from "../../middlewares/error.middleware";

async function recalculateProductRating(productId: string) {
  const agg = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { id: true },
  });
  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: agg._avg.rating ?? 0,
      reviewCount: agg._count.id,
    },
  });
}

export async function getProductReviews(productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError(404, "Product not found");

  return prisma.review.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
    },
  });
}

export async function createReview(
  userId: string,
  productId: string,
  data: { rating: number; comment?: string }
) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new AppError(404, "Product not found");

  // Check if user has a DELIVERED order containing this product
  const deliveredOrder = await prisma.order.findFirst({
    where: {
      userId,
      status: "DELIVERED",
      items: { some: { productId } },
    },
    select: { id: true },
  });

  if (!deliveredOrder) {
    throw new AppError(403, "You can only review products from delivered orders");
  }

  // Check for duplicate review
  const existing = await prisma.review.findUnique({
    where: { userId_productId: { userId, productId } },
  });
  if (existing) throw new AppError(409, "You have already reviewed this product");

  const review = await prisma.review.create({
    data: {
      userId,
      productId,
      orderId: deliveredOrder.id,
      rating: data.rating,
      comment: data.comment ?? null,
    },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  });

  await recalculateProductRating(productId);

  return review;
}

export async function updateReview(
  id: string,
  userId: string,
  data: { rating?: number; comment?: string }
) {
  const review = await prisma.review.findFirst({ where: { id, userId } });
  if (!review) throw new AppError(404, "Review not found");

  const updated = await prisma.review.update({
    where: { id },
    data,
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  });

  await recalculateProductRating(review.productId);

  return updated;
}

export async function deleteReview(id: string, userId: string) {
  const review = await prisma.review.findFirst({ where: { id, userId } });
  if (!review) throw new AppError(404, "Review not found");

  await prisma.review.delete({ where: { id } });
  await recalculateProductRating(review.productId);
}
