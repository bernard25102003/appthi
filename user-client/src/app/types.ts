export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'locked';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: UserRole;
  status: UserStatus;
}

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category_id: string;
  description: string;
  sold_count: number;
  avg_rating: number;
  review_count: number;
  images: string[];
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'completed' | 'cancelled';
export type PaymentMethod = 'COD' | 'BANK_TRANSFER';

export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface Order {
  id: string;
  user_id: string;
  total_price: number;
  status: OrderStatus;
  payment_method: PaymentMethod;
  name: string;
  phone: string;
  address: string;
  created_at: string;
  items: OrderItem[];
}

export interface Review {
  user_id: string;
  product_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_name?: string;
}

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}
