import slugify from "slugify";
import { prisma } from "../../config/prisma";
import { AppError } from "../../middlewares/error.middleware";

function makeSlug(name: string): string {
  return slugify(name, { lower: true, strict: true });
}

export async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getCategoryBySlug(slug: string) {
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) throw new AppError(404, "Category not found");
  return category;
}

export async function createCategory(data: {
  name: string;
  slug?: string;
  imageUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}) {
  const slug = data.slug ?? makeSlug(data.name);
  return prisma.category.create({
    data: { ...data, slug },
  });
}

export async function updateCategory(
  id: string,
  data: {
    name?: string;
    slug?: string;
    imageUrl?: string;
    sortOrder?: number;
    isActive?: boolean;
  }
) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new AppError(404, "Category not found");

  const slug = data.slug ?? (data.name ? makeSlug(data.name) : undefined);

  return prisma.category.update({
    where: { id },
    data: { ...data, ...(slug ? { slug } : {}) },
  });
}

export async function deleteCategory(id: string) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new AppError(404, "Category not found");

  const hasProducts = await prisma.product.count({ where: { categoryId: id } });
  if (hasProducts > 0) throw new AppError(409, "Cannot delete category with products");

  await prisma.category.delete({ where: { id } });
}
