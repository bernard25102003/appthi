# 🔗 Backend-Frontend Integration Checklist

**Current State**: Frontend uses mock data only - NO backend integration  
**Goal**: Connect all frontend pages to working backend APIs  
**Estimated Time**: 3-4 days  
**Priority**: 🔴 CRITICAL

---

## 1️⃣ API Client Setup (Start Here!)

### 1.1 Install Dependencies
```bash
cd frontend
npm install axios
# or
npm install fetch-api  # if prefer fetch over axios
```

### 1.2 Create API Client File
**Create**: `frontend/src/lib/api/client.ts`

```typescript
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const client: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Include cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle token refresh & errors
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshRes = await axios.post(`${API_BASE_URL}/auth/refresh`);
        const newToken = refreshRes.data.token;
        localStorage.setItem('authToken', newToken);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return client(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        localStorage.removeItem('authToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export default client;
```

### 1.3 Create API Endpoints Object
**Create**: `frontend/src/lib/api/endpoints.ts`

```typescript
// Define all API endpoints for type safety
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id: string) => `/products/${id}`,
    CREATE: '/products',
    UPDATE: (id: string) => `/products/${id}`,
    DELETE: (id: string) => `/products/${id}`,
  },
  CATEGORIES: {
    LIST: '/categories',
    DETAIL: (id: string) => `/categories/${id}`,
  },
  ORDERS: {
    CREATE: '/orders',
    LIST: '/orders',
    DETAIL: (id: string) => `/orders/${id}`,
    CANCEL: (id: string) => `/orders/${id}/cancel`,
  },
  REVIEWS: {
    LIST: (productId: string) => `/products/${productId}/reviews`,
    CREATE: '/reviews',
    UPDATE: (id: string) => `/reviews/${id}`,
    DELETE: (id: string) => `/reviews/${id}`,
  },
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    ADDRESSES: '/users/addresses',
    ADDRESS_CREATE: '/users/addresses',
    ADDRESS_UPDATE: (id: string) => `/users/addresses/${id}`,
    ADDRESS_DELETE: (id: string) => `/users/addresses/${id}`,
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    PRODUCTS: '/admin/products',
    ORDERS: '/admin/orders',
    USERS: '/admin/users',
    PROMOTIONS: '/admin/promotions',
  },
};
```

### 1.4 Setup Environment Variables
**Create/Update**: `frontend/.env.development`
```
VITE_API_BASE_URL=http://localhost:3000/api
```

**Create**: `frontend/.env.production`
```
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

---

## 2️⃣ Update Auth Context

**File to modify**: `frontend/src/contexts/AuthContext.tsx`

### Current Implementation
```typescript
❌ Uses bcryptjs to validate password against localStorage
❌ No JWT tokens
❌ No backend calls
❌ No refresh token mechanism
```

### What Needs to Change

```typescript
import client from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  // ... other fields
}

export const AuthContext = createContext<{
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}>(/* ... */);

// Inside AuthProvider:
const login = async (email: string, password: string) => {
  setIsLoading(true);
  try {
    const res = await client.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
    const { token, user } = res.data;
    
    // Store token
    localStorage.setItem('authToken', token);
    
    // Set user in context
    setUser(user);
  } finally {
    setIsLoading(false);
  }
};

const register = async (name: string, email: string, password: string) => {
  setIsLoading(true);
  try {
    const res = await client.post(API_ENDPOINTS.AUTH.REGISTER, { 
      name, 
      email, 
      password 
    });
    const { token, user } = res.data;
    
    // Auto-login after register
    localStorage.setItem('authToken', token);
    setUser(user);
  } finally {
    setIsLoading(false);
  }
};

const logout = async () => {
  try {
    await client.post(API_ENDPOINTS.AUTH.LOGOUT);
  } finally {
    localStorage.removeItem('authToken');
    setUser(null);
  }
};

// On mount - check if user is logged in
useEffect(() => {
  const checkAuth = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    
    try {
      const res = await client.get(API_ENDPOINTS.AUTH.ME);
      setUser(res.data.user);
    } catch {
      // Token invalid - remove it
      localStorage.removeItem('authToken');
    }
  };
  
  checkAuth();
}, []);
```

**Tasks:**
- [ ] Replace login() implementation with API call
- [ ] Replace register() implementation with API call
- [ ] Replace logout() implementation with API call
- [ ] Add useEffect to check auth on mount
- [ ] Update token storage mechanism
- [ ] Update user state from API response
- [ ] Remove bcryptjs from AuthContext
- [ ] Add error handling with try/catch

---

## 3️⃣ Update Pages to Use Real Data

### 3.1 Home Page
**File**: `frontend/src/app/pages/Home.tsx`

**Current**: Uses mockData.ts
**Change**: Fetch from GET /api/products

```typescript
import { useEffect, useState } from 'react';
import client from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setIsLoading(true);
        const res = await client.get(API_ENDPOINTS.PRODUCTS.LIST, {
          params: { limit: 6, featured: true }
        });
        setProducts(res.data.products);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div>
      {/* Hero section */}
      {/* Product grid - use products state instead of mockData */}
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

**Tasks:**
- [ ] Remove mockData import
- [ ] Add useState for products, loading, error
- [ ] Add useEffect to fetch data
- [ ] Update JSX to use products state
- [ ] Add loading & error UI

### 3.2 Products Page
**File**: `frontend/src/app/pages/Products.tsx`

**Current**: Uses mockData for filtering
**Change**: Fetch from GET /api/products with query params

```typescript
const [searchParams] = useSearchParams();
const category = searchParams.get('category');
const priceRange = searchParams.get('price');

useEffect(() => {
  const fetchProducts = async () => {
    try {
      const params: any = {};
      if (category) params.categoryId = category;
      if (priceRange) {
        const [min, max] = priceRange.split('-');
        params.minPrice = min;
        params.maxPrice = max;
      }

      const res = await client.get(API_ENDPOINTS.PRODUCTS.LIST, { params });
      setProducts(res.data.products);
      setTotal(res.data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    }
  };

  fetchProducts();
}, [category, priceRange]);
```

**Tasks:**
- [ ] Remove mockData import
- [ ] Add useSearchParams hook
- [ ] Build query params from URL search params
- [ ] Fetch from API with filters
- [ ] Update pagination to use API results
- [ ] Add loading/error states

### 3.3 Product Detail Page
**File**: `frontend/src/app/pages/ProductDetail.tsx`

**Changes needed:**
- Fetch single product: GET /api/products/:id
- Fetch reviews: GET /api/products/:id/reviews
- Fetch ratings/ratings calculated on backend

```typescript
const { id } = useParams();

useEffect(() => {
  if (!id) return;

  const fetchData = async () => {
    try {
      const [productRes, reviewsRes] = await Promise.all([
        client.get(API_ENDPOINTS.PRODUCTS.DETAIL(id)),
        client.get(API_ENDPOINTS.REVIEWS.LIST(id)),
      ]);
      
      setProduct(productRes.data);
      setReviews(reviewsRes.data.reviews);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product');
    }
  };

  fetchData();
}, [id]);
```

**Tasks:**
- [ ] Fetch product from API
- [ ] Fetch reviews from API
- [ ] Update ratings from API data
- [ ] Keep "Add to Cart" working (uses CartContext)
- [ ] Add loading/error states

### 3.4 Checkout Page
**File**: `frontend/src/app/pages/Checkout.tsx`

**Current**: Shows success message but doesn't create order
**Change**: Call POST /api/orders to create real order

```typescript
const handleSubmit = async (formData: CheckoutFormData) => {
  try {
    setIsLoading(true);

    // Prepare order data
    const orderData = {
      customerName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      postalCode: formData.postalCode,
      paymentMethod: formData.paymentMethod,
      items: cart.items.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
      totalPrice: cart.totalPrice,
      shippingFee: cart.shippingFee,
    };

    // Create order on backend
    const res = await client.post(API_ENDPOINTS.ORDERS.CREATE, orderData);
    const orderId = res.data.orderId;

    // Clear cart
    clearCart();

    // Redirect to confirmation
    navigate(`/order-confirmation/${orderId}`);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to create order');
  } finally {
    setIsLoading(false);
  }
};
```

**Tasks:**
- [ ] Replace mock success message with real API call
- [ ] Create order with cart items + form data
- [ ] Handle success: show order ID, clear cart, redirect
- [ ] Handle error: show error message
- [ ] Add loading state during submission
- [ ] Create order confirmation page with order details

### 3.5 Account Page (Order History)
**File**: `frontend/src/app/pages/Account.tsx`

**Current**: Shows hardcoded orders
**Change**: Fetch user's real orders from GET /api/orders

```typescript
useEffect(() => {
  if (!user) return;

  const fetchOrders = async () => {
    try {
      const res = await client.get(API_ENDPOINTS.ORDERS.LIST);
      setOrders(res.data.orders);
    } catch (err) {
      setError('Failed to load orders');
    }
  };

  fetchOrders();
}, [user]);
```

**Tasks:**
- [ ] Fetch user's orders on mount
- [ ] Display real order data
- [ ] Show order status from API
- [ ] Add loading/error states
- [ ] Add ability to view order details

### 3.6 Categories Filter
**File**: `frontend/src/app/pages/Products.tsx` (categories section)

**Change**: Fetch categories from GET /api/categories

```typescript
useEffect(() => {
  const fetchCategories = async () => {
    try {
      const res = await client.get(API_ENDPOINTS.CATEGORIES.LIST);
      setCategories(res.data.categories);
    } catch (err) {
      console.error('Failed to load categories');
    }
  };

  fetchCategories();
}, []);
```

---

## 4️⃣ Update Admin Pages

### 4.1 Admin Products Page
**File**: `frontend/src/app/pages/admin/AdminProducts.tsx`

```typescript
// Fetch products on mount
useEffect(() => {
  const fetch = async () => {
    try {
      const res = await client.get(API_ENDPOINTS.ADMIN.PRODUCTS);
      setProducts(res.data.products);
    } catch (err) {
      setError('Failed to load products');
    }
  };
  fetch();
}, []);

// Add product
const handleAdd = async (data) => {
  try {
    const res = await client.post(API_ENDPOINTS.ADMIN.PRODUCTS, data);
    setProducts([...products, res.data.product]);
    showToast('Product added successfully');
  } catch (err) {
    showToast('Failed to add product', 'error');
  }
};

// Update product
const handleUpdate = async (id, data) => {
  try {
    await client.put(API_ENDPOINTS.ADMIN.PRODUCTS + `/${id}`, data);
    // Refresh products list
    const res = await client.get(API_ENDPOINTS.ADMIN.PRODUCTS);
    setProducts(res.data.products);
    showToast('Product updated successfully');
  } catch (err) {
    showToast('Failed to update product', 'error');
  }
};

// Delete product
const handleDelete = async (id) => {
  if (!confirm('Are you sure?')) return;
  
  try {
    await client.delete(API_ENDPOINTS.ADMIN.PRODUCTS + `/${id}`);
    setProducts(products.filter(p => p.id !== id));
    showToast('Product deleted successfully');
  } catch (err) {
    showToast('Failed to delete product', 'error');
  }
};
```

**Tasks:**
- [ ] Fetch products from backend on mount
- [ ] Implement add: POST /api/admin/products
- [ ] Implement update: PUT /api/admin/products/:id
- [ ] Implement delete: DELETE /api/admin/products/:id
- [ ] Add loading/error states to each operation
- [ ] Add confirmation before delete
- [ ] Show toast notifications for success/error
- [ ] Refresh list after mutation

### 4.2 Admin Orders Page
**Similar to products page but for orders:**

**Tasks:**
- [ ] Fetch orders from GET /api/admin/orders
- [ ] Implement status update: PUT /api/admin/orders/:id
- [ ] Add loading states
- [ ] Add success/error notifications
- [ ] Refresh list after update

### 4.3 Admin Users Page
**File**: `frontend/src/app/pages/admin/AdminUsers.tsx`

**Tasks:**
- [ ] Fetch users from GET /api/admin/users
- [ ] Add filters (role, status)
- [ ] Add search functionality
- [ ] Add loading states

### 4.4 Admin Dashboard
**File**: `frontend/src/app/pages/admin/AdminDashboard.tsx`

```typescript
useEffect(() => {
  const fetch = async () => {
    try {
      const res = await client.get(API_ENDPOINTS.ADMIN.DASHBOARD);
      setStats(res.data);
    } catch (err) {
      setError('Failed to load dashboard');
    }
  };
  fetch();
}, []);
```

**Tasks:**
- [ ] Fetch dashboard stats from backend
- [ ] Update charts with real data
- [ ] Add date range filter
- [ ] Add loading state

---

## 5️⃣ Add Error Handling & Loading States

### 5.1 Create Error Boundary
**Create**: `frontend/src/components/ErrorBoundary.tsx`

```typescript
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('Error caught:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="bg-blue-600 text-white px-6 py-2 rounded"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 5.2 Wrap App with ErrorBoundary
**Update**: `frontend/src/app/App.tsx`

```typescript
import ErrorBoundary from '@/components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
```

### 5.3 Add Toast Component
**Create**: `frontend/src/components/Toast.tsx`

```typescript
import { useEffect, useState } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  return { toasts, showToast };
};
```

**Tasks:**
- [ ] Create toast component
- [ ] Add toast provider to App
- [ ] Use toast in error handling
- [ ] Show success messages after operations

---

## ✅ Testing Checklist

Before deploying:

### Auth Flow
- [ ] Register new user → call POST /api/auth/register
- [ ] Token stored in localStorage
- [ ] Login → call POST /api/auth/login
- [ ] Can access protected routes
- [ ] Logout → call POST /api/auth/logout
- [ ] Redirected to login

### Shopping Flow
- [ ] Browse products → GET /api/products working
- [ ] View product detail → GET /api/products/:id working
- [ ] Filter by category → query params working
- [ ] Add to cart → CartContext working
- [ ] View cart → shows items
- [ ] Checkout → POST /api/orders creates order
- [ ] Order confirmation → shows order ID from response

### Admin Flow
- [ ] Can access admin dashboard
- [ ] Dashboard stats loaded from backend
- [ ] Can add product → POST /api/admin/products
- [ ] Can edit product → PUT /api/admin/products/:id
- [ ] Can delete product → DELETE /api/admin/products/:id
- [ ] Product list updates after operations
- [ ] Similar for orders and users

### Error Handling
- [ ] Show error message on API failure
- [ ] Show loading spinner while fetching
- [ ] Toast notifications for success/error
- [ ] Error boundary catches component errors
- [ ] Network error handled gracefully
- [ ] 401 error triggers logout & redirect

---

## 📊 Integration Progress Template

Use this to track your progress:

```
PHASE 1: API CLIENT SETUP
- [ ] Client file created with interceptors
- [ ] Environment variables configured
- [ ] Endpoints defined
- [ ] Token handling implemented

PHASE 2: AUTHENTICATION
- [ ] AuthContext updated to use real endpoints
- [ ] Login working
- [ ] Register working
- [ ] Logout working
- [ ] Auth check on mount working

PHASE 3: PRODUCTS & CATEGORIES
- [ ] Home page fetches featured products
- [ ] Products page fetches products with filters
- [ ] Product detail fetches single product
- [ ] Categories fetched and used in filters
- [ ] Reviews fetched and displayed

PHASE 4: CHECKOUT & ORDERS
- [ ] Checkout creates real order
- [ ] Order confirmation shows order ID
- [ ] Order history shows user's orders
- [ ] Order status displays correctly

PHASE 5: ADMIN FEATURES
- [ ] Admin dashboard fetches real data
- [ ] Admin products CRUD working
- [ ] Admin orders management working
- [ ] Admin users management working

PHASE 6: ERROR HANDLING
- [ ] Error boundary component working
- [ ] Loading states added to all pages
- [ ] Error messages displayed
- [ ] Toast notifications working
- [ ] API interceptor handles errors

Testing Complete! Ready for deployment.
```

