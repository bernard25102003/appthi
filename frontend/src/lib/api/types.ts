// ── Shared types matching backend Prisma models ────────────────────────────

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  phone: string | null;
  avatarUrl: string | null;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string | null;
  imageFileId: string | null;
  featured: boolean;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  categoryId: string;
  category?: ApiCategory;
  createdAt: string;
}

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface ApiOrder {
  id: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: string;
  notes: string | null;
  createdAt: string;
  address?: ApiAddress;
  items?: ApiOrderItem[];
}

export interface ApiOrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface ApiAddress {
  id: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
}

export interface ApiReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuthResponse {
  user: ApiUser;
  accessToken: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  ordersByStatus: Record<string, number>;
  recentOrders?: ApiOrder[];
}
