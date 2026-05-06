export const API = {
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    ME: "/auth/me",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },
  PRODUCTS: {
    LIST: "/products",
    DETAIL: (slug: string) => `/products/${slug}`,
    CREATE: "/products",
  },
  CATEGORIES: {
    LIST: "/categories",
  },
  ORDERS: {
    CREATE: "/orders",
    LIST: "/orders",
    DETAIL: (id: string) => `/orders/${id}`,
    CANCEL: (id: string) => `/orders/${id}/cancel`,
  },
  REVIEWS: {
    LIST: (productId: string) => `/reviews/products/${productId}`,
    CREATE: (productId: string) => `/reviews/products/${productId}`,
    UPDATE: (id: string) => `/reviews/${id}`,
    DELETE: (id: string) => `/reviews/${id}`,
  },
  USERS: {
    PROFILE: "/users/profile",
    ADDRESSES: "/users/addresses",
    ADDRESS: (id: string) => `/users/addresses/${id}`,
  },
  PROMOTIONS: {
    VALIDATE: "/promotions/validate",
  },
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    ORDERS: "/admin/orders",
    ORDER_STATUS: (id: string) => `/admin/orders/${id}/status`,
    PRODUCTS: "/admin/products",
    PRODUCT: (id: string) => `/admin/products/${id}`,
    PRODUCT_CREATE: "/products",
    USERS: "/admin/users",
    USER_ROLE: (id: string) => `/admin/users/${id}/role`,
    CATEGORIES: "/admin/categories",
    PROMOTIONS: "/admin/promotions",
    PROMOTION: (id: string) => `/admin/promotions/${id}`,
  },
};
