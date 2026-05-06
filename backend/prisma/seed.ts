import { PrismaClient, Role, DiscountType } from "@prisma/client";
import bcrypt from "bcryptjs";
import slugify from "slugify";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Categories ────────────────────────────────────────────────────────────
  const categoryData = [
    { name: "Burger", sortOrder: 1 },
    { name: "Pizza", sortOrder: 2 },
    { name: "Chicken", sortOrder: 3 },
    { name: "Salad", sortOrder: 4 },
    { name: "Dessert", sortOrder: 5 },
    { name: "Drinks", sortOrder: 6 },
  ];

  const categories = await Promise.all(
    categoryData.map((c) =>
      prisma.category.upsert({
        where: { slug: slugify(c.name, { lower: true }) },
        update: {},
        create: {
          name: c.name,
          slug: slugify(c.name, { lower: true }),
          sortOrder: c.sortOrder,
          isActive: true,
        },
      })
    )
  );
  console.log(`✅  ${categories.length} categories seeded`);

  const catMap = Object.fromEntries(categories.map((c) => [c.name, c.id]));

  // ── Products ──────────────────────────────────────────────────────────────
  const productData = [
    {
      name: "Classic Burger",
      description: "Juicy beef patty with lettuce, tomato, and special sauce",
      price: 89000,
      category: "Burger",
      imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
      rating: 4.5,
      reviewCount: 128,
      isFeatured: true,
    },
    {
      name: "Cheese Pizza",
      description: "Traditional Italian pizza with mozzarella and tomato sauce",
      price: 129000,
      category: "Pizza",
      imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
      rating: 4.8,
      reviewCount: 256,
      isFeatured: true,
    },
    {
      name: "Crispy Chicken",
      description: "Golden fried chicken with herbs and spices",
      price: 79000,
      category: "Chicken",
      imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400",
      rating: 4.6,
      reviewCount: 189,
      isFeatured: false,
    },
    {
      name: "Caesar Salad",
      description: "Fresh romaine lettuce with parmesan and croutons",
      price: 59000,
      category: "Salad",
      imageUrl: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400",
      rating: 4.3,
      reviewCount: 92,
      isFeatured: false,
    },
    {
      name: "Chocolate Cake",
      description: "Rich chocolate layer cake with fudge frosting",
      price: 49000,
      category: "Dessert",
      imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
      rating: 4.9,
      reviewCount: 312,
      isFeatured: true,
    },
    {
      name: "Cola",
      description: "Refreshing carbonated soft drink",
      price: 19000,
      category: "Drinks",
      imageUrl: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400",
      rating: 4.2,
      reviewCount: 456,
      isFeatured: false,
    },
    {
      name: "Double Cheeseburger",
      description: "Two beef patties with double cheese and bacon",
      price: 119000,
      category: "Burger",
      imageUrl: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400",
      rating: 4.7,
      reviewCount: 203,
      isFeatured: true,
    },
    {
      name: "Pepperoni Pizza",
      description: "Classic pizza topped with spicy pepperoni slices",
      price: 149000,
      category: "Pizza",
      imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400",
      rating: 4.8,
      reviewCount: 287,
      isFeatured: false,
    },
  ];

  const products = await Promise.all(
    productData.map((p) => {
      const slug = slugify(p.name, { lower: true, strict: true });
      return prisma.product.upsert({
        where: { slug },
        update: {},
        create: {
          name: p.name,
          slug,
          description: p.description,
          price: p.price,
          categoryId: catMap[p.category],
          imageUrl: p.imageUrl,
          rating: p.rating,
          reviewCount: p.reviewCount,
          isFeatured: p.isFeatured,
          isActive: true,
        },
      });
    })
  );
  console.log(`✅  ${products.length} products seeded`);

  // ── Users ─────────────────────────────────────────────────────────────────
  const adminPasswordHash = await bcrypt.hash("Admin@123456", 10);
  const userPasswordHash = await bcrypt.hash("User@123456", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@fastfood.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@fastfood.com",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      isEmailVerified: true,
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: "john@example.com" },
    update: {},
    create: {
      name: "John Doe",
      email: "john@example.com",
      passwordHash: userPasswordHash,
      phone: "0901234567",
      role: Role.USER,
      isEmailVerified: true,
    },
  });

  console.log(`✅  Users seeded (admin: ${admin.email}, user: ${user1.email})`);

  // ── Promotions ────────────────────────────────────────────────────────────
  await prisma.promotion.upsert({
    where: { code: "WELCOME20" },
    update: {},
    create: {
      code: "WELCOME20",
      description: "Giảm 20% cho đơn hàng đầu tiên",
      discountType: DiscountType.PERCENT,
      discountValue: 20,
      minOrderValue: 100000,
      maxDiscount: 50000,
      usageLimit: 100,
      isActive: true,
    },
  });

  await prisma.promotion.upsert({
    where: { code: "FREESHIP" },
    update: {},
    create: {
      code: "FREESHIP",
      description: "Miễn phí giao hàng",
      discountType: DiscountType.FIXED,
      discountValue: 20000,
      minOrderValue: 50000,
      isActive: true,
    },
  });

  console.log("✅  Promotions seeded");
  console.log("\n🎉 Seed completed successfully!");
  console.log("   Admin credentials: admin@fastfood.com / Admin@123456");
  console.log("   User credentials:  john@example.com  / User@123456");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
