export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  featured: boolean;
}

export interface Order {
  id: number;
  userId: number;
  items: {
    productId: number;
    productName: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: "pending" | "processing" | "delivered" | "cancelled";
  paymentMethod: "cod" | "online";
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
}

export const categories = [
  "Burger",
  "Pizza",
  "Chicken",
  "Salad",
  "Dessert",
  "Drinks",
];

export const products: Product[] = [
  {
    id: 1,
    name: "Classic Burger",
    description: "Juicy beef patty with lettuce, tomato, and special sauce",
    price: 89000,
    category: "Burger",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
    rating: 4.5,
    reviews: 128,
    featured: true,
  },
  {
    id: 2,
    name: "Cheese Pizza",
    description: "Traditional Italian pizza with mozzarella and tomato sauce",
    price: 129000,
    category: "Pizza",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
    rating: 4.8,
    reviews: 256,
    featured: true,
  },
  {
    id: 3,
    name: "Crispy Chicken",
    description: "Golden fried chicken with herbs and spices",
    price: 79000,
    category: "Chicken",
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400",
    rating: 4.6,
    reviews: 189,
    featured: false,
  },
  {
    id: 4,
    name: "Caesar Salad",
    description: "Fresh romaine lettuce with parmesan and croutons",
    price: 59000,
    category: "Salad",
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400",
    rating: 4.3,
    reviews: 92,
    featured: false,
  },
  {
    id: 5,
    name: "Chocolate Cake",
    description: "Rich chocolate layer cake with fudge frosting",
    price: 49000,
    category: "Dessert",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
    rating: 4.9,
    reviews: 312,
    featured: true,
  },
  {
    id: 6,
    name: "Cola",
    description: "Refreshing carbonated soft drink",
    price: 19000,
    category: "Drinks",
    image: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400",
    rating: 4.2,
    reviews: 456,
    featured: false,
  },
  {
    id: 7,
    name: "Double Cheeseburger",
    description: "Two beef patties with double cheese and bacon",
    price: 119000,
    category: "Burger",
    image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400",
    rating: 4.7,
    reviews: 203,
    featured: true,
  },
  {
    id: 8,
    name: "Pepperoni Pizza",
    description: "Classic pizza topped with spicy pepperoni slices",
    price: 149000,
    category: "Pizza",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400",
    rating: 4.8,
    reviews: 287,
    featured: false,
  },
];

export const orders: Order[] = [
  {
    id: 1001,
    userId: 1,
    items: [
      { productId: 1, productName: "Classic Burger", quantity: 2, price: 89000 },
      { productId: 6, productName: "Cola", quantity: 2, price: 19000 },
    ],
    total: 216000,
    status: "delivered",
    paymentMethod: "cod",
    createdAt: "2026-05-01T10:30:00",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    customerPhone: "0901234567",
    shippingAddress: "123 Main St, District 1, Ho Chi Minh City",
  },
  {
    id: 1002,
    userId: 1,
    items: [
      { productId: 2, productName: "Cheese Pizza", quantity: 1, price: 129000 },
      { productId: 5, productName: "Chocolate Cake", quantity: 1, price: 49000 },
    ],
    total: 178000,
    status: "processing",
    paymentMethod: "online",
    createdAt: "2026-05-05T14:20:00",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    customerPhone: "0901234567",
    shippingAddress: "123 Main St, District 1, Ho Chi Minh City",
  },
];

export const promotions = [
  {
    id: 1,
    title: "50% OFF First Order",
    description: "Get 50% discount on your first order above 200,000đ",
    code: "FIRST50",
  },
  {
    id: 2,
    title: "Free Delivery",
    description: "Free shipping for orders over 150,000đ",
    code: "FREESHIP",
  },
  {
    id: 3,
    title: "Combo Deal",
    description: "Buy 2 burgers, get 1 drink free",
    code: "COMBO2",
  },
];
