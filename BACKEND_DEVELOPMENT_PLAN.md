# Kế Hoạch Phát Triển Backend - E-Commerce Platform

**Tài liệu:** Chuẩn hóa kế hoạch xây dựng Backend Database  
**Ngày tạo:** May 7, 2026  
**Phạm vi:** 5 Phase, mỗi phase ~120,000 tokens (tương đương ~20,000-25,000 dòng code)  
**Công nghệ chính:** Node.js/Express, PostgreSQL, Prisma ORM, JWT, Docker

---

## 📋 Tổng Quan Kiến Trúc

### Stack Công Nghệ Đề Xuất
- **Runtime:** Node.js 18+ (TypeScript)
- **Framework:** Express.js
- **Database:** PostgreSQL 14+
- **ORM:** Prisma 5+
- **Authentication:** JWT + bcrypt
- **File Upload:** ImageKit SDK
- **Validation:** Zod/Joi
- **Caching:** Redis (optional)
- **Testing:** Jest + Supertest
- **Logging:** Winston
- **API Doc:** Swagger/OpenAPI

### Cấu Trúc Thư Mục Backend
```
backend/
├── src/
│   ├── config/              # Configuration files
│   ├── middleware/          # Express middlewares
│   ├── modules/             # Feature modules
│   │   ├── auth/
│   │   ├── users/
│   │   ├── categories/
│   │   ├── products/
│   │   ├── orders/
│   │   ├── reviews/
│   │   └── cart/
│   ├── utils/               # Utilities (validators, helpers)
│   ├── types/               # TypeScript interfaces
│   ├── decorators/          # Custom decorators
│   └── main.ts
├── prisma/
│   ├── schema.prisma        # Data model
│   └── migrations/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docker/
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔷 PHASE 1: Database Setup & Core Infrastructure (120,000 tokens)

### Mục Tiêu
- Thiết lập project backend hoàn chỉnh
- Cấu hình Prisma + PostgreSQL
- Thiết kế schema database tối ưu
- Setup pipeline CI/CD cơ bản

### Chi Tiết Công Việc

#### 1.1 Project Initialization (15,000 tokens)
**Deliverables:**
- [ ] Tạo Node.js project với TypeScript
- [ ] Cấu hình package.json (dependencies: express, prisma, dotenv, cors, helmet)
- [ ] Setup tsconfig.json với strict mode
- [ ] Cấu hình eslint + prettier
- [ ] Setup .env.example với các biến cần thiết
- [ ] Docker Compose setup (PostgreSQL + PgAdmin)
- [ ] README hướng dẫn local setup

**Dependencies chính:**
```json
{
  "express": "^4.18.2",
  "prisma": "^5.0.0",
  "@prisma/client": "^5.0.0",
  "typescript": "^5.1.6",
  "dotenv": "^16.3.1",
  "cors": "^2.8.5",
  "helmet": "^7.0.0",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "zod": "^3.22.4",
  "winston": "^3.10.0"
}
```

**Environment Variables:**
```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
IMAGEKIT_PUBLIC_KEY=xxx
IMAGEKIT_PRIVATE_KEY=xxx
IMAGEKIT_URL_ENDPOINT=xxx
```

#### 1.2 Database Schema Design (45,000 tokens)
**Deliverables:**
- [ ] Prisma schema với 7 models chính
- [ ] Relationships mapping (1-to-many, many-to-many)
- [ ] Indexes optimization
- [ ] Constraints & validation
- [ ] Enum types (UserRole, OrderStatus, PaymentMethod)
- [ ] Migration initialization

**Schema Models:**

```prisma
// 1. Users Model
model User {
  id                String      @id @default(cuid())
  email             String      @unique
  password          String
  name              String
  phone             String?
  address           String?
  role              UserRole    @default(USER)
  status            UserStatus  @default(ACTIVE)
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  orders            Order[]
  reviews           Review[]
  
  @@index([email])
  @@index([role])
}

// 2. Categories Model
model Category {
  id                String      @id @default(cuid())
  name              String      @unique
  description       String?
  icon              String?
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  products          Product[]
  
  @@index([name])
}

// 3. Products Model
model Product {
  id                String      @id @default(cuid())
  name              String
  description       String      @db.Text
  price             Decimal     @db.Decimal(10, 2)
  categoryId        String
  soldCount         Int         @default(0)
  avgRating         Decimal     @default(0) @db.Decimal(3, 2)
  reviewCount       Int         @default(0)
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  category          Category    @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  images            ProductImage[]
  orderItems        OrderItem[]
  reviews           Review[]
  
  @@index([categoryId])
  @@index([soldCount])
  @@index([avgRating])
  @@index([name])
}

// 4. Product Images Model
model ProductImage {
  id                String      @id @default(cuid())
  productId         String
  imageUrl          String
  thumbnailUrl      String?
  displayOrder      Int         @default(0)
  createdAt         DateTime    @default(now())
  
  product           Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  @@index([productId])
}

// 5. Orders Model
model Order {
  id                String      @id @default(cuid())
  userId            String
  orderNumber       String      @unique
  status            OrderStatus @default(PENDING)
  totalPrice        Decimal     @db.Decimal(10, 2)
  paymentMethod     PaymentMethod
  recipientName     String
  recipientPhone    String
  recipientAddress  String
  notes             String?
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  confirmedAt       DateTime?
  shippingAt        DateTime?
  completedAt       DateTime?
  cancelledAt       DateTime?
  
  user              User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  items             OrderItem[]
  
  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

// 6. Order Items Model (Snapshot of product state)
model OrderItem {
  id                String      @id @default(cuid())
  orderId           String
  productId         String
  productName       String
  productPrice      Decimal     @db.Decimal(10, 2)
  productImage      String?
  quantity          Int
  subtotal          Decimal     @db.Decimal(10, 2)
  
  order             Order       @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product           Product     @relation(fields: [productId], references: [id], onDelete: SetNull)
  
  @@index([orderId])
}

// 7. Reviews Model
model Review {
  id                String      @id @default(cuid())
  productId         String
  userId            String
  rating            Int         // 1-5
  title             String?
  content           String      @db.Text
  verified          Boolean     @default(false) // true if user has completed order
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  product           Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
  user              User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([productId, userId]) // One review per user per product
  @@index([productId])
  @@index([rating])
}

// Enums
enum UserRole {
  USER
  ADMIN
}

enum UserStatus {
  ACTIVE
  LOCKED
}

enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPING
  COMPLETED
  CANCELLED
}

enum PaymentMethod {
  COD
  BANK_TRANSFER
}
```

**Constraints & Validations:**
- Foreign keys cascade on delete
- Unique constraints: User.email, Category.name, Order.orderNumber, Review(productId+userId)
- NOT NULL constraints trên các field bắt buộc
- Decimal(10,2) cho giá cả, Decimal(3,2) cho rating
- Integer constraints: rating (1-5), quantity (>0), reviewCount, soldCount (>=0)

**Database Indexes:**
```sql
-- Performance optimization indexes
CREATE INDEX idx_products_category_soldcount_avgrating 
  ON products(category_id, sold_count DESC, avg_rating DESC);
CREATE INDEX idx_orders_user_status 
  ON orders(user_id, status);
CREATE INDEX idx_reviews_product 
  ON reviews(product_id);
CREATE INDEX idx_orderitems_order 
  ON order_items(order_id);
```

#### 1.3 Core Infrastructure & Utilities (30,000 tokens)
**Deliverables:**
- [ ] Express app setup với middleware
- [ ] Error handling middleware (centralized)
- [ ] Validation layer (Zod schemas)
- [ ] Response standardization
- [ ] Type definitions
- [ ] Logger configuration (Winston)
- [ ] Environment config
- [ ] Prisma client singleton

**Error Handler:**
```typescript
// types/error.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string
  ) {
    super(message);
  }
}

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}
```

**Response Standardization:**
```typescript
// types/response.ts
export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  timestamp: string;
}

// middleware/responseHandler.ts - Wrap all responses
export const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    code: 'SUCCESS',
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

export const sendError = (res, error: ApiError) => {
  res.status(error.statusCode).json({
    success: false,
    code: error.code,
    message: error.message,
    timestamp: new Date().toISOString()
  });
};
```

**Validation Layer:**
```typescript
// utils/validators.ts - Zod schemas
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 chars'),
  name: z.string().min(2, 'Name required'),
  phone: z.string().optional(),
  address: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export const createProductSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  price: z.number().positive(),
  categoryId: z.string().cuid(),
  images: z.array(z.string().url()).optional()
});

// Middleware to validate
export const validate = (schema: z.ZodSchema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (err: any) {
      throw new ApiError(400, err.errors[0].message, ErrorCode.VALIDATION_ERROR);
    }
  };
};
```

#### 1.4 Initial Migrations & Seeding (20,000 tokens)
**Deliverables:**
- [ ] Prisma migration setup
- [ ] Initial schema migration
- [ ] Seed script (categories + sample products)
- [ ] Migration documentation
- [ ] Database initialization workflow

**Seed Data Script:**
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed categories
  const electronics = await prisma.category.create({
    data: { name: 'Electronics', description: 'Electronic devices' }
  });
  
  const fashion = await prisma.category.create({
    data: { name: 'Fashion', description: 'Fashion items' }
  });
  
  // Seed sample products
  await prisma.product.create({
    data: {
      name: 'iPhone 15',
      description: 'Latest Apple smartphone',
      price: 999.99,
      categoryId: electronics.id,
      images: {
        create: [
          { imageUrl: 'https://example.com/iphone1.jpg', displayOrder: 0 }
        ]
      }
    }
  });
  
  console.log('Seed completed');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
```

#### 1.5 Testing Infrastructure (10,000 tokens)
**Deliverables:**
- [ ] Jest configuration
- [ ] Database test setup (test DB isolation)
- [ ] Mock factories
- [ ] Test utilities

### Timeline & Milestone
- **Duration:** 1.5 - 2 weeks
- **Checkpoint:** Database schema approved + local setup working + CI/CD pipeline running
- **Risk:** Database design changes, environment setup complexity
- **Success Criteria:**
  - ✅ Local development environment fully functional
  - ✅ All migrations apply cleanly
  - ✅ Seed data loads successfully
  - ✅ Prisma client connects properly
  - ✅ ESLint + tests pass

---

## 🔷 PHASE 2: Authentication & User Management (120,000 tokens)

### Mục Tiêu
- Implement authentication system hoàn chỉnh
- User management dengan role-based access
- Security layers (bcrypt, JWT, rate limiting)
- Admin user management endpoints

### Chi Tiết Công Việc

#### 2.1 Authentication Service (50,000 tokens)
**Deliverables:**
- [ ] Register endpoint with validation
- [ ] Login endpoint with JWT generation
- [ ] Refresh token mechanism
- [ ] Password hashing (bcrypt)
- [ ] JWT verification middleware
- [ ] Logout logic (optional: token blacklist)

**Implementation:**

```typescript
// modules/auth/auth.service.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  async register(email: string, password: string, name: string, phone?: string, address?: string) {
    // Check if email exists
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ApiError(409, 'Email already registered', ErrorCode.CONFLICT);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        address,
        role: 'USER',
        status: 'ACTIVE'
      }
    });

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user.id);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken
    };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      throw new ApiError(401, 'Invalid credentials', ErrorCode.UNAUTHORIZED);
    }

    // Check if user is locked
    if (user.status === 'LOCKED') {
      throw new ApiError(403, 'User account is locked', ErrorCode.FORBIDDEN);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid credentials', ErrorCode.UNAUTHORIZED);
    }

    const { accessToken, refreshToken } = this.generateTokens(user.id);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken
    };
  }

  async refreshToken(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { userId: string };
      const user = await this.prisma.user.findUnique({ where: { id: decoded.userId } });
      
      if (!user || user.status === 'LOCKED') {
        throw new ApiError(401, 'Invalid token', ErrorCode.UNAUTHORIZED);
      }

      const { accessToken, refreshToken } = this.generateTokens(user.id);
      return { accessToken, refreshToken };
    } catch (err) {
      throw new ApiError(401, 'Invalid refresh token', ErrorCode.UNAUTHORIZED);
    }
  }

  private generateTokens(userId: string) {
    const accessToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    const refreshToken = jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '30d' }
    );

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: any) {
    const { password, ...rest } = user;
    return rest;
  }
}
```

**Auth Routes:**
```typescript
// modules/auth/auth.routes.ts
import express from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../utils/validators';

const router = express.Router();
const authController = new AuthController();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authMiddleware, authController.logout);

export default router;
```

#### 2.2 Authentication Middleware & JWT Verification (25,000 tokens)
**Deliverables:**
- [ ] JWT extraction middleware
- [ ] Token verification
- [ ] Role-based access control (RBAC)
- [ ] Request context enrichment
- [ ] Token expiration handling

**Implementation:**

```typescript
// middleware/auth.middleware.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { ApiError, ErrorCode } from '../types/error';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: { id: string; role: string; status: string };
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractTokenFromHeader(req);
    if (!token) {
      throw new ApiError(401, 'No token provided', ErrorCode.UNAUTHORIZED);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    next(new ApiError(401, 'Invalid token', ErrorCode.UNAUTHORIZED));
  }
};

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.userId) {
    return next(new ApiError(401, 'Not authenticated', ErrorCode.UNAUTHORIZED));
  }

  // Fetch user to check role
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  
  if (user?.role !== 'ADMIN') {
    return next(new ApiError(403, 'Admin access required', ErrorCode.FORBIDDEN));
  }

  if (user.status === 'LOCKED') {
    return next(new ApiError(403, 'User account is locked', ErrorCode.FORBIDDEN));
  }

  req.user = user;
  next();
};

function extractTokenFromHeader(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.substring(7);
}
```

**RBAC Implementation:**
```typescript
// middleware/rbac.middleware.ts
export const requireRole = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.userId) {
      return next(new ApiError(401, 'Not authenticated', ErrorCode.UNAUTHORIZED));
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user || !roles.includes(user.role)) {
      return next(new ApiError(403, 'Insufficient permissions', ErrorCode.FORBIDDEN));
    }

    req.user = user;
    next();
  };
};
```

#### 2.3 User Management Endpoints (30,000 tokens)
**Deliverables:**
- [ ] Get profile endpoint
- [ ] Update profile endpoint
- [ ] Admin: List users (with pagination)
- [ ] Admin: Lock/unlock user
- [ ] Admin: Delete user
- [ ] Change password endpoint

**Endpoints:**

```typescript
// modules/users/users.controller.ts
export class UsersController {
  
  // GET /users/profile - Get current user profile
  async getProfile(req: Request, res: Response) {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true, phone: true, address: true, role: true, status: true }
    });

    if (!user) {
      throw new ApiError(404, 'User not found', ErrorCode.NOT_FOUND);
    }

    sendSuccess(res, user, 'Profile retrieved');
  }

  // PUT /users/profile - Update profile
  async updateProfile(req: Request, res: Response) {
    const { name, phone, address } = req.body;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { name, phone, address },
      select: { id: true, email: true, name: true, phone: true, address: true }
    });

    sendSuccess(res, user, 'Profile updated');
  }

  // PUT /users/:userId/change-password
  async changePassword(req: Request, res: Response) {
    const { currentPassword, newPassword } = req.body;
    const userId = req.params.userId;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    const isPasswordValid = await bcrypt.compare(currentPassword, user!.password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Current password is incorrect', ErrorCode.UNAUTHORIZED);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    sendSuccess(res, null, 'Password changed successfully');
  }

  // ADMIN: GET /admin/users - List users
  async listUsers(req: Request, res: Response) {
    const { page = 1, limit = 20, role, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (role) where.role = role;
    if (status) where.status = status;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        select: { id: true, email: true, name: true, role: true, status: true, createdAt: true }
      }),
      prisma.user.count({ where })
    ]);

    sendSuccess(res, {
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / Number(limit)) }
    }, 'Users retrieved');
  }

  // ADMIN: PATCH /admin/users/:userId/lock
  async lockUser(req: Request, res: Response) {
    await prisma.user.update({
      where: { id: req.params.userId },
      data: { status: 'LOCKED' }
    });

    sendSuccess(res, null, 'User locked');
  }

  // ADMIN: PATCH /admin/users/:userId/unlock
  async unlockUser(req: Request, res: Response) {
    await prisma.user.update({
      where: { id: req.params.userId },
      data: { status: 'ACTIVE' }
    });

    sendSuccess(res, null, 'User unlocked');
  }

  // ADMIN: DELETE /admin/users/:userId
  async deleteUser(req: Request, res: Response) {
    await prisma.user.delete({
      where: { id: req.params.userId }
    });

    sendSuccess(res, null, 'User deleted');
  }
}
```

#### 2.4 Security & Rate Limiting (15,000 tokens)
**Deliverables:**
- [ ] Rate limiting middleware
- [ ] Password strength validation
- [ ] Input sanitization
- [ ] CORS configuration
- [ ] Helmet security headers
- [ ] Account lockout logic

```typescript
// middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false
});
```

### Timeline & Milestone
- **Duration:** 2 - 2.5 weeks
- **Checkpoint:** Auth system tested + JWT tokens working + RBAC enforced
- **Risk:** Token expiration edge cases, password reset flows
- **Success Criteria:**
  - ✅ Register/Login flows working
  - ✅ JWT tokens generate and verify correctly
  - ✅ Role-based access control enforced
  - ✅ Password security in place
  - ✅ Authentication tests passing (>80% coverage)

---

## 🔷 PHASE 3: Category & Product Management (120,000 tokens)

### Mục Tiêu
- CRUD operations cho categories
- CRUD operations cho products
- Image upload integration (ImageKit)
- Product search, filter, sort functionality
- Aggregation queries (sold_count, ratings)

### Chi Tiết Công Việc

#### 3.1 Category Management Service (25,000 tokens)
**Deliverables:**
- [ ] Create category (admin only)
- [ ] Update category
- [ ] Delete category (cascade to products)
- [ ] List categories
- [ ] Get category detail

**Implementation:**

```typescript
// modules/categories/categories.service.ts
export class CategoryService {
  constructor(private prisma: PrismaClient) {}

  async createCategory(data: { name: string; description?: string; icon?: string }) {
    // Validate uniqueness
    const existing = await this.prisma.category.findUnique({ where: { name: data.name } });
    if (existing) {
      throw new ApiError(409, 'Category name already exists', ErrorCode.CONFLICT);
    }

    return this.prisma.category.create({ data });
  }

  async updateCategory(id: string, data: Partial<{ name: string; description: string; icon: string }>) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'Category not found', ErrorCode.NOT_FOUND);
    }

    // Check name uniqueness if updating
    if (data.name && data.name !== existing.name) {
      const duplicate = await this.prisma.category.findUnique({ where: { name: data.name } });
      if (duplicate) {
        throw new ApiError(409, 'Category name already exists', ErrorCode.CONFLICT);
      }
    }

    return this.prisma.category.update({ where: { id }, data });
  }

  async deleteCategory(id: string) {
    // Check if category has products
    const productCount = await this.prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      throw new ApiError(400, 'Cannot delete category with products', ErrorCode.VALIDATION_ERROR);
    }

    return this.prisma.category.delete({ where: { id } });
  }

  async listCategories() {
    return this.prisma.category.findMany({
      include: { _count: { select: { products: true } } }
    });
  }

  async getCategoryDetail(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } }
    });

    if (!category) {
      throw new ApiError(404, 'Category not found', ErrorCode.NOT_FOUND);
    }

    return category;
  }
}
```

#### 3.2 Product CRUD & Management (50,000 tokens)
**Deliverables:**
- [ ] Create product with images
- [ ] Update product details
- [ ] Delete product
- [ ] Get product list with pagination
- [ ] Get product detail with aggregations
- [ ] Product validation schema

**Implementation:**

```typescript
// modules/products/products.service.ts
export class ProductService {
  constructor(private prisma: PrismaClient) {}

  async createProduct(data: {
    name: string;
    description: string;
    price: number;
    categoryId: string;
    images?: string[];
  }) {
    // Validate category exists
    const category = await this.prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) {
      throw new ApiError(404, 'Category not found', ErrorCode.NOT_FOUND);
    }

    // Create product with images
    return this.prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: new Prisma.Decimal(data.price),
        categoryId: data.categoryId,
        images: {
          create: (data.images || []).map((url, index) => ({
            imageUrl: url,
            displayOrder: index
          }))
        }
      },
      include: { images: true }
    });
  }

  async updateProduct(id: string, data: Partial<any>) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new ApiError(404, 'Product not found', ErrorCode.NOT_FOUND);
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price ? new Prisma.Decimal(data.price) : undefined,
        categoryId: data.categoryId
      },
      include: { images: true, reviews: true }
    });

    return updated;
  }

  async deleteProduct(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new ApiError(404, 'Product not found', ErrorCode.NOT_FOUND);
    }

    // Delete related images from ImageKit first (if needed)
    // ...

    return this.prisma.product.delete({ where: { id } });
  }

  async listProducts(filters: {
    page?: number;
    limit?: number;
    categoryId?: string;
    search?: string;
    sortBy?: 'price' | 'sold' | 'rating' | 'newest';
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (filters.sortBy === 'price') {
      orderBy = { price: filters.sortOrder === 'asc' ? 'asc' : 'desc' };
    } else if (filters.sortBy === 'sold') {
      orderBy = { soldCount: filters.sortOrder === 'asc' ? 'asc' : 'desc' };
    } else if (filters.sortBy === 'rating') {
      orderBy = { avgRating: filters.sortOrder === 'asc' ? 'asc' : 'desc' };
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: true,
          images: { orderBy: { displayOrder: 'asc' }, take: 1 },
          _count: { select: { reviews: true } }
        }
      }),
      this.prisma.product.count({ where })
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getProductDetail(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: { displayOrder: 'asc' } },
        reviews: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: { select: { reviews: true } }
      }
    });

    if (!product) {
      throw new ApiError(404, 'Product not found', ErrorCode.NOT_FOUND);
    }

    return {
      ...product,
      reviewCount: product._count.reviews
    };
  }
}
```

#### 3.3 Image Upload & ImageKit Integration (30,000 tokens)
**Deliverables:**
- [ ] ImageKit service setup
- [ ] Image upload endpoint
- [ ] Bulk image upload for products
- [ ] Image deletion
- [ ] Thumbnail generation
- [ ] Error handling for image operations

**Implementation:**

```typescript
// services/imagekit.service.ts
import ImageKit from 'imagekit';

export class ImageKitService {
  private imagekit: ImageKit;

  constructor() {
    this.imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!
    });
  }

  async uploadImage(file: Express.Multer.File, folder: string = 'products') {
    try {
      const result = await this.imagekit.upload({
        file: file.buffer,
        fileName: `${Date.now()}-${file.originalname}`,
        folder,
        customMetadata: {
          uploadedAt: new Date().toISOString()
        }
      });

      return {
        url: result.url,
        fileId: result.fileId,
        thumbnailUrl: this.generateThumbnailUrl(result.url)
      };
    } catch (error) {
      throw new ApiError(500, 'Image upload failed', ErrorCode.INTERNAL_ERROR);
    }
  }

  async deleteImage(fileId: string) {
    try {
      await this.imagekit.deleteFile(fileId);
      return true;
    } catch (error) {
      throw new ApiError(500, 'Image deletion failed', ErrorCode.INTERNAL_ERROR);
    }
  }

  private generateThumbnailUrl(originalUrl: string): string {
    return originalUrl.replace(/\.(jpg|jpeg|png)$/i, '.jpg') + 
           '?tr=w:200,h:200,c:at,g:auto,q:80';
  }
}
```

**Upload Endpoint:**

```typescript
// modules/products/products.controller.ts
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export class ProductsController {
  constructor(private productService: ProductService, private imagekitService: ImageKitService) {}

  async uploadProductImages(req: Request, res: Response) {
    if (!req.files || req.files.length === 0) {
      throw new ApiError(400, 'No files uploaded', ErrorCode.VALIDATION_ERROR);
    }

    const uploadedImages = await Promise.all(
      (req.files as Express.Multer.File[]).map(file =>
        this.imagekitService.uploadImage(file, 'products')
      )
    );

    sendSuccess(res, { images: uploadedImages }, 'Images uploaded successfully', 201);
  }

  async addProductImages(req: Request, res: Response) {
    const { productId } = req.params;

    const product = await this.productService.getProduct(productId);
    if (!product) {
      throw new ApiError(404, 'Product not found', ErrorCode.NOT_FOUND);
    }

    const uploadedImages = await Promise.all(
      (req.files as Express.Multer.File[]).map(file =>
        this.imagekitService.uploadImage(file, 'products')
      )
    );

    // Save image metadata to DB
    const productImages = await Promise.all(
      uploadedImages.map((img, idx) =>
        this.prisma.productImage.create({
          data: {
            productId,
            imageUrl: img.url,
            thumbnailUrl: img.thumbnailUrl,
            displayOrder: idx
          }
        })
      )
    );

    sendSuccess(res, { images: productImages }, 'Product images added', 201);
  }
}
```

#### 3.4 Product Aggregations & Analytics (15,000 tokens)
**Deliverables:**
- [ ] sold_count aggregation on order completion
- [ ] avg_rating + reviewCount calculation
- [ ] Category statistics
- [ ] Top products query
- [ ] Bulk update aggregations

```typescript
// services/aggregation.service.ts
export class AggregationService {
  async updateProductAggregations(productId: string) {
    // Calculate sold_count from order_items
    const soldCount = await this.prisma.orderItem.count({
      where: { productId }
    });

    // Calculate ratings from reviews
    const reviews = await this.prisma.review.findMany({
      where: { productId },
      select: { rating: true }
    });

    const avgRating = reviews.length > 0
      ? new Prisma.Decimal(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
      : new Prisma.Decimal(0);

    // Update product
    await this.prisma.product.update({
      where: { productId },
      data: {
        soldCount,
        avgRating,
        reviewCount: reviews.length
      }
    });
  }

  async getCategoryStats(categoryId: string) {
    return this.prisma.product.aggregate({
      where: { categoryId },
      _count: true,
      _avg: { price: true, avgRating: true },
      _sum: { soldCount: true }
    });
  }

  async getTopProducts(limit: number = 10) {
    return this.prisma.product.findMany({
      orderBy: [
        { avgRating: 'desc' },
        { reviewCount: 'desc' },
        { soldCount: 'desc' }
      ],
      take: limit,
      include: { images: { take: 1 } }
    });
  }
}
```

### Timeline & Milestone
- **Duration:** 2 - 2.5 weeks
- **Checkpoint:** Product CRUD working + ImageKit integration tested + Search/filter functional
- **Risk:** ImageKit quota limits, image optimization, storage costs
- **Success Criteria:**
  - ✅ Product CRUD operations fully functional
  - ✅ Image upload/delete working smoothly
  - ✅ Search and filter queries performant
  - ✅ Aggregations calculate correctly
  - ✅ Category management working

---

## 🔷 PHASE 4: Cart & Order Management (120,000 tokens)

### Mục Tiêu
- Stateless cart logic
- Order creation with item snapshots
- Order state machine enforcement
- Order side effects (sold_count updates)
- Idempotency guarantees
- Admin order management

### Chi Tiết Công Việc

#### 4.1 Cart Service (Stateless Logic) (35,000 tokens)
**Deliverables:**
- [ ] Cart add/remove/update items (client-side state, server validates)
- [ ] Cart validation (product exists, current price)
- [ ] Cart total calculation
- [ ] Cart-to-order conversion
- [ ] Cart item schema validation

**Implementation:**

```typescript
// modules/cart/cart.service.ts
export class CartService {
  constructor(private prisma: PrismaClient) {}

  async validateCart(items: CartItem[]) {
    const validatedItems: CartItem[] = [];

    for (const item of items) {
      // Check product exists
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
        select: { id: true, price: true, name: true }
      });

      if (!product) {
        throw new ApiError(
          404,
          `Product ${item.productId} not found`,
          ErrorCode.NOT_FOUND
        );
      }

      // Validate quantity
      if (item.quantity <= 0) {
        throw new ApiError(
          400,
          'Quantity must be greater than 0',
          ErrorCode.VALIDATION_ERROR
        );
      }

      validatedItems.push({
        ...item,
        price: product.price,
        subtotal: new Prisma.Decimal(product.price.toString()).mul(item.quantity)
      });
    }

    return {
      items: validatedItems,
      totalPrice: validatedItems.reduce((sum, item) => sum + Number(item.subtotal), 0)
    };
  }

  async calculateTotal(items: CartItem[]): Promise<Decimal> {
    let total = new Prisma.Decimal(0);

    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
        select: { price: true }
      });

      if (product) {
        total = total.add(new Prisma.Decimal(product.price).mul(item.quantity));
      }
    }

    return total;
  }
}

interface CartItem {
  productId: string;
  quantity: number;
  price?: Decimal;
  subtotal?: Decimal;
}
```

**Cart Validation Schema:**

```typescript
// utils/validators.ts
export const cartSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().cuid('Invalid product ID'),
      quantity: z.number().int().positive('Quantity must be positive')
    })
  ).min(1, 'Cart must have at least one item')
});
```

#### 4.2 Order Service & State Machine (50,000 tokens)
**Deliverables:**
- [ ] Create order with order items snapshot
- [ ] Order state transitions (pending → confirmed → shipping → completed)
- [ ] State validation (reject invalid transitions)
- [ ] Update order status (admin)
- [ ] Order detail retrieval with items
- [ ] Idempotency keys

**Implementation:**

```typescript
// modules/orders/orders.service.ts
export class OrderService {
  constructor(private prisma: PrismaClient) {}

  async createOrder(userId: string, data: CreateOrderDto) {
    // Validate cart
    const cartService = new CartService(this.prisma);
    const { items: validatedItems, totalPrice } = await cartService.validateCart(data.items);

    // Validate payment method
    const validPaymentMethods = ['COD', 'BANK_TRANSFER'];
    if (!validPaymentMethods.includes(data.paymentMethod)) {
      throw new ApiError(400, 'Invalid payment method', ErrorCode.VALIDATION_ERROR);
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Use transaction to ensure consistency
    const order = await this.prisma.$transaction(async (tx) => {
      return tx.order.create({
        data: {
          userId,
          orderNumber,
          status: 'PENDING',
          totalPrice: new Prisma.Decimal(totalPrice),
          paymentMethod: data.paymentMethod,
          recipientName: data.recipientName,
          recipientPhone: data.recipientPhone,
          recipientAddress: data.recipientAddress,
          notes: data.notes,
          items: {
            create: validatedItems.map((item) => ({
              productId: item.productId,
              productName: item.productName || '',
              productPrice: new Prisma.Decimal(item.price),
              productImage: item.productImage,
              quantity: item.quantity,
              subtotal: new Prisma.Decimal(item.subtotal)
            }))
          }
        },
        include: { items: true }
      });
    });

    return order;
  }

  async updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new ApiError(404, 'Order not found', ErrorCode.NOT_FOUND);
    }

    // Validate state transition
    this.validateStateTransition(order.status as OrderStatus, newStatus);

    // Update status with timestamp
    const updateData: any = { status: newStatus };

    if (newStatus === 'CONFIRMED') {
      updateData.confirmedAt = new Date();
    } else if (newStatus === 'SHIPPING') {
      updateData.shippingAt = new Date();
    } else if (newStatus === 'COMPLETED') {
      updateData.completedAt = new Date();
    } else if (newStatus === 'CANCELLED') {
      updateData.cancelledAt = new Date();
    }

    // Use transaction if transitioning to COMPLETED (side effects)
    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.order.update({
        where: { id: orderId },
        data: updateData,
        include: { items: true }
      });

      // Side effect: Increment product sold_count if completed
      if (newStatus === 'COMPLETED') {
        for (const item of result.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { soldCount: { increment: item.quantity } }
          });

          // Recalculate aggregations for this product
          await this.recalculateProductStats(item.productId, tx);
        }
      }

      return result;
    });

    return updated;
  }

  private validateStateTransition(currentStatus: OrderStatus, newStatus: OrderStatus) {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['SHIPPING', 'CANCELLED'],
      SHIPPING: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: []
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new ApiError(
        400,
        `Cannot transition from ${currentStatus} to ${newStatus}`,
        ErrorCode.VALIDATION_ERROR
      );
    }
  }

  async getOrderDetail(orderId: string, userId?: string) {
    const where: any = { id: orderId };
    if (userId) where.userId = userId; // If user requests their own order

    const order = await this.prisma.order.findUnique({
      where,
      include: {
        items: { include: { product: { select: { id: true, name: true } } } },
        user: { select: { name: true, email: true } }
      }
    });

    if (!order) {
      throw new ApiError(404, 'Order not found', ErrorCode.NOT_FOUND);
    }

    return order;
  }

  private async recalculateProductStats(productId: string, tx: any) {
    const reviews = await tx.review.findMany({
      where: { productId },
      select: { rating: true }
    });

    const avgRating = reviews.length > 0
      ? new Prisma.Decimal(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
      : new Prisma.Decimal(0);

    await tx.product.update({
      where: { id: productId },
      data: { avgRating, reviewCount: reviews.length }
    });
  }
}

interface CreateOrderDto {
  items: CartItem[];
  paymentMethod: 'COD' | 'BANK_TRANSFER';
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  notes?: string;
}
```

**Order Endpoints:**

```typescript
// modules/orders/orders.controller.ts
export class OrdersController {
  constructor(private orderService: OrderService) {}

  // POST /orders - Create order
  async createOrder(req: Request, res: Response) {
    const order = await this.orderService.createOrder(req.userId!, req.body);
    sendSuccess(res, order, 'Order created successfully', 201);
  }

  // GET /orders/:orderId - Get order detail (user)
  async getOrderDetail(req: Request, res: Response) {
    const order = await this.orderService.getOrderDetail(req.params.orderId, req.userId);
    sendSuccess(res, order, 'Order retrieved');
  }

  // GET /orders - List user orders
  async listUserOrders(req: Request, res: Response) {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { userId: req.userId };
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: Number(limit),
        include: { items: true },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.order.count({ where })
    ]);

    sendSuccess(res, {
      orders,
      pagination: { page, limit, total }
    });
  }

  // ADMIN: PATCH /admin/orders/:orderId/status
  async updateOrderStatus(req: Request, res: Response) {
    const { status } = req.body;
    const order = await this.orderService.updateOrderStatus(req.params.orderId, status);
    sendSuccess(res, order, 'Order status updated');
  }

  // ADMIN: GET /admin/orders - List all orders
  async listAllOrders(req: Request, res: Response) {
    const { page = 1, limit = 20, status, userId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: Number(limit),
        include: { items: true, user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.order.count({ where })
    ]);

    sendSuccess(res, {
      orders,
      pagination: { page, limit, total }
    });
  }
}
```

#### 4.3 Idempotency & Concurrency Control (20,000 tokens)
**Deliverables:**
- [ ] Idempotency key middleware
- [ ] Duplicate order prevention
- [ ] Optimistic/Pessimistic locking
- [ ] Transaction isolation

```typescript
// middleware/idempotency.middleware.ts
const idempotencyStore = new Map<string, any>();

export const idempotencyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.method !== 'POST') {
    return next();
  }

  const idempotencyKey = req.headers['idempotency-key'] as string;

  if (!idempotencyKey) {
    throw new ApiError(400, 'Idempotency-Key header required', ErrorCode.VALIDATION_ERROR);
  }

  // Check if request already processed
  if (idempotencyStore.has(idempotencyKey)) {
    const cachedResponse = idempotencyStore.get(idempotencyKey);
    return res.status(200).json(cachedResponse);
  }

  // Wrap res.json to cache response
  const originalJson = res.json;
  res.json = function (body) {
    idempotencyStore.set(idempotencyKey, body);
    // Cleanup after 24 hours
    setTimeout(() => idempotencyStore.delete(idempotencyKey), 24 * 60 * 60 * 1000);
    return originalJson.call(this, body);
  };

  next();
};
```

#### 4.4 Order Validation & Error Handling (15,000 tokens)
**Deliverables:**
- [ ] Order creation validation schema
- [ ] Status transition validation
- [ ] Payment method validation
- [ ] Address validation
- [ ] Error message standardization

```typescript
export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().cuid(),
      quantity: z.number().int().positive(),
      productName: z.string().optional(),
      productImage: z.string().optional()
    })
  ).min(1),
  paymentMethod: z.enum(['COD', 'BANK_TRANSFER']),
  recipientName: z.string().min(2),
  recipientPhone: z.string().min(10),
  recipientAddress: z.string().min(10),
  notes: z.string().optional()
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED'])
});
```

### Timeline & Milestone
- **Duration:** 2 - 2.5 weeks
- **Checkpoint:** Order CRUD working + State machine enforced + Transactions implemented
- **Risk:** Race conditions, transaction complexity, idempotency testing
- **Success Criteria:**
  - ✅ Order creation functional
  - ✅ State transitions validated
  - ✅ Side effects (sold_count) working
  - ✅ Idempotency tested
  - ✅ Concurrency handled safely

---

## 🔷 PHASE 5: Review System, Caching & Deployment (120,000 tokens)

### Mục Tiêu
- Review service with verification
- Caching layer (Redis)
- Logging & monitoring
- API documentation
- Testing suite
- Deployment setup

### Chi Tiết Công Việc

#### 5.1 Review Service (30,000 tokens)
**Deliverables:**
- [ ] Create review (verified purchase only)
- [ ] Update review (owner only)
- [ ] Delete review (owner or admin)
- [ ] List reviews with pagination
- [ ] Review aggregation (avg_rating, count)
- [ ] Prevent duplicate reviews

```typescript
// modules/reviews/reviews.service.ts
export class ReviewService {
  constructor(private prisma: PrismaClient) {}

  async createReview(userId: string, data: CreateReviewDto) {
    // Verify user has completed order with this product
    const completedOrder = await this.prisma.order.findFirst({
      where: {
        userId,
        status: 'COMPLETED',
        items: { some: { productId: data.productId } }
      }
    });

    if (!completedOrder) {
      throw new ApiError(
        403,
        'You can only review products from completed orders',
        ErrorCode.FORBIDDEN
      );
    }

    // Check if already reviewed
    const existing = await this.prisma.review.findUnique({
      where: { productId_userId: { productId: data.productId, userId } }
    });

    if (existing) {
      throw new ApiError(409, 'You have already reviewed this product', ErrorCode.CONFLICT);
    }

    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      throw new ApiError(400, 'Rating must be between 1 and 5', ErrorCode.VALIDATION_ERROR);
    }

    return this.prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          productId: data.productId,
          userId,
          rating: data.rating,
          title: data.title,
          content: data.content,
          verified: true
        },
        include: { user: { select: { name: true } } }
      });

      // Update product aggregations
      await this.updateProductRatings(data.productId, tx);

      return review;
    });
  }

  async updateReview(reviewId: string, userId: string, data: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });

    if (!review) {
      throw new ApiError(404, 'Review not found', ErrorCode.NOT_FOUND);
    }

    if (review.userId !== userId) {
      throw new ApiError(403, 'You can only edit your own reviews', ErrorCode.FORBIDDEN);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.review.update({
        where: { id: reviewId },
        data: {
          rating: data.rating,
          title: data.title,
          content: data.content
        },
        include: { user: { select: { name: true } } }
      });

      // Recalculate ratings
      await this.updateProductRatings(result.productId, tx);

      return result;
    });

    return updated;
  }

  async deleteReview(reviewId: string, userId: string, isAdmin: boolean = false) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });

    if (!review) {
      throw new ApiError(404, 'Review not found', ErrorCode.NOT_FOUND);
    }

    if (review.userId !== userId && !isAdmin) {
      throw new ApiError(403, 'Insufficient permissions', ErrorCode.FORBIDDEN);
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.review.delete({ where: { id: reviewId } });
      await this.updateProductRatings(review.productId, tx);
    });
  }

  async listProductReviews(productId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { productId },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.review.count({ where: { productId } })
    ]);

    return { reviews, pagination: { page, limit, total } };
  }

  private async updateProductRatings(productId: string, tx: any) {
    const reviews = await tx.review.findMany({
      where: { productId },
      select: { rating: true }
    });

    const avgRating = reviews.length > 0
      ? new Prisma.Decimal(
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toDecimalPlaces(2)
      : new Prisma.Decimal(0);

    await tx.product.update({
      where: { id: productId },
      data: {
        avgRating,
        reviewCount: reviews.length
      }
    });
  }
}

interface CreateReviewDto {
  productId: string;
  rating: number;
  title?: string;
  content: string;
}

interface UpdateReviewDto {
  rating?: number;
  title?: string;
  content?: string;
}
```

#### 5.2 Caching Layer (25,000 tokens)
**Deliverables:**
- [ ] Redis setup & configuration
- [ ] Cache middleware
- [ ] Cache invalidation strategy
- [ ] Cache keys standardization
- [ ] TTL configuration

```typescript
// services/cache.service.ts
import Redis from 'ioredis';

export class CacheService {
  private redis: Redis;
  private ttls = {
    PRODUCT_LIST: 5 * 60, // 5 minutes
    PRODUCT_DETAIL: 10 * 60,
    CATEGORY_LIST: 30 * 60, // 30 minutes
    USER_PROFILE: 60 * 60, // 1 hour
    ORDER_DETAIL: 24 * 60 * 60 // 24 hours
  };

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set<T>(key: string, value: T, ttl?: number) {
    await this.redis.setex(
      key,
      ttl || 300,
      JSON.stringify(value)
    );
  }

  async invalidate(pattern: string) {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  getProductListKey(categoryId?: string, page: number = 1) {
    return `products:list:${categoryId || 'all'}:${page}`;
  }

  getProductDetailKey(productId: string) {
    return `product:${productId}`;
  }

  getCategoryListKey() {
    return 'categories:list';
  }

  getUserProfileKey(userId: string) {
    return `user:${userId}:profile`;
  }
}

// middleware/cache.middleware.ts
export const cacheMiddleware = (redisKey: string, ttl: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const cacheService = new CacheService();
    const cached = await cacheService.get(redisKey);

    if (cached) {
      return res.json({ ...cached, fromCache: true });
    }

    const originalJson = res.json;
    res.json = function (body) {
      cacheService.set(redisKey, body, ttl);
      return originalJson.call(this, body);
    };

    next();
  };
};
```

**Cache Invalidation on Mutations:**

```typescript
// After product creation/update
await cacheService.invalidate('products:list:*');
await cacheService.invalidate(`product:${productId}`);

// After review creation
await cacheService.invalidate(`product:${productId}`);
```

#### 5.3 Logging & Monitoring (20,000 tokens)
**Deliverables:**
- [ ] Winston logger setup
- [ ] Request logging middleware
- [ ] Error logging
- [ ] Audit logging for admin actions
- [ ] Performance monitoring

```typescript
// services/logger.service.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'ecommerce-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// middleware/logging.middleware.ts
export const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      userId: req.userId
    });
  });

  next();
};

// Audit logging
export const auditLog = (userId: string, action: string, resource: string, details: any) => {
  logger.info({
    type: 'AUDIT',
    userId,
    action,
    resource,
    details,
    timestamp: new Date().toISOString()
  });
};
```

#### 5.4 Testing Suite (25,000 tokens)
**Deliverables:**
- [ ] Unit tests (services)
- [ ] Integration tests (API endpoints)
- [ ] E2E tests (user flows)
- [ ] Test coverage reports
- [ ] Database test isolation

```typescript
// tests/unit/users.service.test.ts
import { describe, it, expect, beforeEach } from '@jest/globals';
import { UserService } from '../../src/modules/users/users.service';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService(prismaMock);
  });

  it('should register a new user', async () => {
    const user = await userService.register({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    });

    expect(user).toHaveProperty('id');
    expect(user.email).toBe('test@example.com');
  });

  it('should throw error if email exists', async () => {
    await expect(
      userService.register({
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test'
      })
    ).rejects.toThrow('Email already registered');
  });
});

// tests/integration/orders.test.ts
import request from 'supertest';
import app from '../../src/main';

describe('Orders API', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Setup: Register and login user
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'password' });
    
    authToken = loginRes.body.data.accessToken;
    userId = loginRes.body.data.user.id;
  });

  it('should create an order', async () => {
    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        items: [{ productId: 'prod123', quantity: 2 }],
        paymentMethod: 'COD',
        recipientName: 'John Doe',
        recipientPhone: '0123456789',
        recipientAddress: '123 Main St'
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.status).toBe('PENDING');
  });

  it('should not allow invalid state transition', async () => {
    // Create an order
    const createRes = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({...});

    const orderId = createRes.body.data.id;

    // Try invalid transition: PENDING -> COMPLETED
    const res = await request(app)
      .patch(`/admin/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'COMPLETED' });

    expect(res.status).toBe(400);
  });
});
```

**Jest Configuration:**

```json
{
  "testEnvironment": "node",
  "testPathIgnorePatterns": ["/node_modules/", "/dist/"],
  "collectCoverageFrom": [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/main.ts"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 70,
      "functions": 70,
      "lines": 70,
      "statements": 70
    }
  }
}
```

#### 5.5 API Documentation & OpenAPI (15,000 tokens)
**Deliverables:**
- [ ] Swagger/OpenAPI setup
- [ ] Endpoint documentation
- [ ] Request/response examples
- [ ] Error documentation
- [ ] Authentication documentation

```typescript
// config/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce API',
      version: '1.0.0',
      description: 'RESTful API for e-commerce platform'
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Development' },
      { url: 'https://api.example.com', description: 'Production' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/modules/**/*.routes.ts']
};

const specs = swaggerJsdoc(options);
export default specs;

// Usage in main.ts
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
```

**Endpoint Documentation Example:**

```typescript
/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid request
 */
```

#### 5.6 Deployment & DevOps (5,000 tokens)
**Deliverables:**
- [ ] Docker image & docker-compose
- [ ] Environment configurations
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Database migrations deployment
- [ ] Health check endpoint

**Dockerfile:**

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

**docker-compose.yml:**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ecommerce
      POSTGRES_PASSWORD: password
      POSTGRES_DB: ecommerce_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  api:
    build: .
    environment:
      DATABASE_URL: postgresql://ecommerce:password@postgres:5432/ecommerce_db
      REDIS_HOST: redis
      JWT_SECRET: your_secret_key
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
```

**GitHub Actions CI/CD:**

```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --coverage
      - run: npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          # Deploy commands
```

### Timeline & Milestone
- **Duration:** 2 - 2.5 weeks
- **Checkpoint:** Full test coverage + Documentation complete + Deployment ready
- **Risk:** Redis complexity, test maintenance, deployment automation
- **Success Criteria:**
  - ✅ Review system functional
  - ✅ Caching improving performance
  - ✅ >70% test coverage
  - ✅ API documentation complete
  - ✅ Deployment pipeline automated
  - ✅ All endpoints documented in Swagger

---

## 📊 Summary & Timeline

### Total Effort Breakdown
| Phase | Focus | Duration | Tokens |
|-------|-------|----------|--------|
| 1 | Database & Infrastructure | 1.5-2 weeks | 120,000 |
| 2 | Authentication & Users | 2-2.5 weeks | 120,000 |
| 3 | Categories & Products | 2-2.5 weeks | 120,000 |
| 4 | Cart & Orders | 2-2.5 weeks | 120,000 |
| 5 | Reviews, Caching & Deployment | 2-2.5 weeks | 120,000 |
| **Total** | **Full Backend** | **10-12.5 weeks** | **600,000** |

### Development Roadmap
```
Week 1-2:   Phase 1 - Setup & Database Design ✓
Week 2-4:   Phase 2 - Auth & User Management ✓
Week 4-6:   Phase 3 - Products & Categories ✓
Week 6-8:   Phase 4 - Orders & Cart System ✓
Week 8-10:  Phase 5 - Reviews, Cache & Deployment ✓
Week 10-12: Buffer + Bug fixes & Optimization
```

### Risk Assessment & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Database schema changes | High | Design review before implementation |
| Image storage costs | Medium | Implement image optimization, size limits |
| Transaction complexity | High | Comprehensive integration testing |
| Performance degradation | Medium | Implement caching from Phase 5 early |
| Deployment complexity | Medium | Docker/CI-CD setup in Phase 1 |

### Prerequisites for Start
- [ ] PostgreSQL 14+ installed and running
- [ ] Node.js 18+ environment
- [ ] ImageKit account setup (API keys)
- [ ] Redis installation (optional but recommended)
- [ ] Docker & Docker Compose (for deployment)
- [ ] GitHub repository setup
- [ ] Team familiar with Express.js, Prisma, TypeScript

### Key Decision Points
1. **Session vs JWT:** Using JWT for stateless auth (scalable)
2. **Caching strategy:** Redis for product/category caching, query optimization
3. **Image hosting:** ImageKit for CDN + optimization
4. **Testing approach:** Jest + Supertest for unit/integration tests
5. **Deployment:** Docker + GitHub Actions for CI/CD automation

---

## 📝 Notes & Best Practices

### Code Organization
- Keep services focused on business logic
- Use dependency injection for testability
- Middleware for cross-cutting concerns
- Separate validation from business logic

### Security Best Practices
- Hash passwords with bcrypt (12 rounds minimum)
- JWT tokens with short expiration (7 days)
- Rate limiting on auth endpoints
- Input sanitization via Zod
- CORS configuration for allowed origins
- Helmet for HTTP headers security

### Performance Optimization
- Pagination on all list endpoints
- Database indexes on frequently queried fields
- Cache invalidation strategy
- Connection pooling for database
- Image optimization & CDN usage

### Monitoring & Observability
- Request logging with Winston
- Error tracking & alerts
- Performance metrics
- Audit logs for admin actions
- Health check endpoints

---

**Document Version:** 1.0  
**Last Updated:** May 7, 2026  
**Status:** Ready for Development  
**Approval:** Pending
