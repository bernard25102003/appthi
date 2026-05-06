import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ─── Admin user ──────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ecommerce.com' },
    update: {},
    create: {
      email: 'admin@ecommerce.com',
      password: adminPassword,
      name: 'Administrator',
      phone: '0901234567',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // ─── Sample user ─────────────────────────────────────────────────────────
  const userPassword = await bcrypt.hash('User@123456', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      name: 'Nguyễn Văn A',
      phone: '0912345678',
      address: '123 Đường Lê Lợi, Quận 1, TP.HCM',
      role: 'USER',
      status: 'ACTIVE',
    },
  });
  console.log(`✅ Sample user created: ${user.email}`);

  // ─── Categories ───────────────────────────────────────────────────────────
  const categoriesData = [
    { name: 'Điện thoại', description: 'Điện thoại thông minh và phụ kiện', icon: '📱' },
    { name: 'Laptop', description: 'Máy tính xách tay và phụ kiện', icon: '💻' },
    { name: 'Thời trang', description: 'Quần áo, giày dép và phụ kiện thời trang', icon: '👗' },
    { name: 'Đồ gia dụng', description: 'Thiết bị và đồ dùng gia đình', icon: '🏠' },
    { name: 'Sách', description: 'Sách giáo khoa, tiểu thuyết và nhiều hơn nữa', icon: '📚' },
    { name: 'Thể thao', description: 'Dụng cụ thể thao và tập luyện', icon: '⚽' },
    { name: 'Mỹ phẩm', description: 'Sản phẩm làm đẹp và chăm sóc da', icon: '💄' },
    { name: 'Thực phẩm', description: 'Thực phẩm và đồ uống', icon: '🍎' },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
    categories[cat.name] = created.id;
    console.log(`✅ Category created: ${cat.name}`);
  }

  // ─── Products ─────────────────────────────────────────────────────────────
  const productsData = [
    {
      name: 'iPhone 15 Pro Max 256GB',
      description:
        'iPhone 15 Pro Max với chip A17 Pro mạnh mẽ, camera 48MP chuyên nghiệp, thiết kế titan cao cấp. Màn hình Super Retina XDR 6.7 inch, Dynamic Island thông minh.',
      price: 34990000,
      categoryId: categories['Điện thoại'],
      soldCount: 150,
      avgRating: 4.8,
      reviewCount: 45,
      images: [
        'https://ik.imagekit.io/demo/img/image1.jpeg',
        'https://ik.imagekit.io/demo/img/image2.jpeg',
      ],
    },
    {
      name: 'Samsung Galaxy S24 Ultra',
      description:
        'Samsung Galaxy S24 Ultra với bút S Pen tích hợp, camera 200MP, màn hình Dynamic AMOLED 6.8 inch. Hiệu năng vượt trội với chip Snapdragon 8 Gen 3.',
      price: 31990000,
      categoryId: categories['Điện thoại'],
      soldCount: 120,
      avgRating: 4.7,
      reviewCount: 38,
      images: ['https://ik.imagekit.io/demo/img/image3.jpeg'],
    },
    {
      name: 'MacBook Pro M3 14 inch',
      description:
        'MacBook Pro 14 inch với chip Apple M3, màn hình Liquid Retina XDR, thời lượng pin 22 giờ. Hiệu năng vượt trội cho công việc sáng tạo chuyên nghiệp.',
      price: 52990000,
      categoryId: categories['Laptop'],
      soldCount: 80,
      avgRating: 4.9,
      reviewCount: 25,
      images: ['https://ik.imagekit.io/demo/img/image4.jpeg'],
    },
    {
      name: 'Dell XPS 15 OLED',
      description:
        'Dell XPS 15 với màn hình OLED 3.5K, Intel Core i9, RAM 32GB, SSD 1TB. Thiết kế mỏng nhẹ premium, hiệu năng mạnh mẽ cho lập trình viên và designer.',
      price: 45990000,
      categoryId: categories['Laptop'],
      soldCount: 60,
      avgRating: 4.6,
      reviewCount: 20,
      images: ['https://ik.imagekit.io/demo/img/image5.jpeg'],
    },
    {
      name: 'Áo Polo Nam Premium',
      description:
        'Áo polo nam chất liệu cotton 100% cao cấp, form Regular Fit thoải mái. Thiết kế đơn giản nhưng lịch lãm, phù hợp cho cả đi làm và dạo phố.',
      price: 299000,
      categoryId: categories['Thời trang'],
      soldCount: 500,
      avgRating: 4.5,
      reviewCount: 120,
      images: ['https://ik.imagekit.io/demo/img/image6.jpeg'],
    },
    {
      name: 'Nồi chiên không khí Philips 4.1L',
      description:
        'Nồi chiên không khí Philips HD9200 4.1L, công nghệ Rapid Air giúp món ăn giòn đều mà không cần dầu. Dễ vệ sinh, tiết kiệm điện.',
      price: 1890000,
      categoryId: categories['Đồ gia dụng'],
      soldCount: 300,
      avgRating: 4.7,
      reviewCount: 89,
      images: ['https://ik.imagekit.io/demo/img/image7.jpeg'],
    },
    {
      name: 'Đắc Nhân Tâm - Dale Carnegie',
      description:
        'Cuốn sách bán chạy nhất mọi thời đại về kỹ năng giao tiếp và ảnh hưởng con người. Được dịch sang hơn 30 ngôn ngữ, giúp hàng triệu người thành công.',
      price: 89000,
      categoryId: categories['Sách'],
      soldCount: 1000,
      avgRating: 4.9,
      reviewCount: 250,
      images: ['https://ik.imagekit.io/demo/img/image8.jpeg'],
    },
    {
      name: 'Bóng đá Adidas Champions League',
      description:
        'Bóng đá chính hãng Adidas dùng trong Champions League, chất liệu cao cấp, đường khâu chắc chắn. Size 5 tiêu chuẩn FIFA.',
      price: 750000,
      categoryId: categories['Thể thao'],
      soldCount: 200,
      avgRating: 4.6,
      reviewCount: 65,
      images: ['https://ik.imagekit.io/demo/img/image9.jpeg'],
    },
  ];

  for (const product of productsData) {
    const { images, ...productData } = product;
    const created = await prisma.product.create({
      data: {
        ...productData,
        price: productData.price,
        images: {
          create: images.map((url, index) => ({
            imageUrl: url,
            displayOrder: index,
          })),
        },
      },
    });
    console.log(`✅ Product created: ${created.name}`);
  }

  console.log('\n🎉 Seed completed successfully!');
  console.log('─'.repeat(50));
  console.log('📧 Admin: admin@ecommerce.com / Admin@123456');
  console.log('📧 User:  user@example.com / User@123456');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
