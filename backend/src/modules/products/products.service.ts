import slugify from "slugify";
import { prisma } from "../../config/prisma";
import { imagekit } from "../../config/imagekit";
import { AppError } from "../../middlewares/error.middleware";
import type { Prisma } from "@prisma/client";

function makeSlug(name: string): string {
  return slugify(name, { lower: true, strict: true });
}

export async function getProducts(query: {
  category?: string;
  search?: string;
  featured?: boolean;
  page: number;
  limit: number;
  sort?: string;
}) {
  const { category, search, featured, page, limit, sort } = query;

  const where: Prisma.ProductWhereInput = { isActive: true };

  if (category) where.category = { slug: category };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (featured !== undefined) where.isFeatured = featured;

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price_asc"
      ? { price: "asc" }
      : sort === "price_desc"
        ? { price: "desc" }
        : sort === "rating"
          ? { rating: "desc" }
          : { createdAt: "desc" };

  const [total, products] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: { category: { select: { id: true, name: true, slug: true } } },
    }),
  ]);

  return {
    products,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, isActive: true },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });
  if (!product) throw new AppError(404, "Product not found");
  return product;
}

export async function createProduct(data: {
  name: string;
  slug?: string;
  description?: string;
  price: number;
  categoryId: string;
  imageUrl?: string;
  imageFileId?: string;
  stock?: number;
  isFeatured?: boolean;
  isActive?: boolean;
}) {
  const categoryExists = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!categoryExists) throw new AppError(404, "Category not found");

  const slug = data.slug ?? makeSlug(data.name);
  return prisma.product.create({ data: { ...data, slug } });
}

export async function updateProduct(
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    price?: number;
    categoryId?: string;
    imageUrl?: string;
    imageFileId?: string;
    stock?: number;
    isFeatured?: boolean;
    isActive?: boolean;
  }
) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError(404, "Product not found");

  if (data.categoryId) {
    const cat = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!cat) throw new AppError(404, "Category not found");
  }

  // If replacing image, delete old one from ImageKit
  if (data.imageFileId && product.imageFileId && data.imageFileId !== product.imageFileId) {
    await imagekit.deleteFile(product.imageFileId).catch((e) => console.error("ImageKit delete failed:", e));
  }

  const slug = data.slug ?? (data.name ? makeSlug(data.name) : undefined);

  return prisma.product.update({
    where: { id },
    data: { ...data, ...(slug ? { slug } : {}) },
  });
}

export async function deleteProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError(404, "Product not found");

  // Delete image from ImageKit if exists
  if (product.imageFileId) {
    await imagekit.deleteFile(product.imageFileId).catch((e) => console.error("ImageKit delete failed:", e));
  }

  await prisma.product.delete({ where: { id } });
}
