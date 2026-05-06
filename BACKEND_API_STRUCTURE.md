# Backend API Structure - Comprehensive Guide

## Overview
Complete documentation of all API endpoints, their request/response schemas, controller functions, and service layer logic.

**Total Endpoints:** 47
**Base URL:** `/api`

---

## 1. AUTH Module (`/api/auth`)
Authentication and user registration/login management.

### Endpoints

#### 1.1 Register
- **Route:** `POST /api/auth/register`
- **Auth:** ❌ Public (Rate limited)
- **Description:** Register a new user account
- **Request Schema:**
  ```zod
  {
    name: string (1-100 chars, required)
    email: string (valid email, required)
    password: string (min 8 chars, max 100, required)
    phone?: string (optional)
  }
  ```
- **Response:**
  ```json
  {
    "user": {
      "id": string,
      "name": string,
      "email": string,
      "role": "USER",
      "isEmailVerified": false,
      "createdAt": ISO8601,
      "avatarUrl": string | null
    },
    "accessToken": string (JWT),
    "refreshToken": string (HttpOnly cookie)
  }
  ```
- **Controller:** `register()` - Validates schema, calls service, sets refresh token cookie, returns user + access token
- **Service:** `register()` - Checks email uniqueness, hashes password, creates user, generates email verification token, sends verification email, creates JWT tokens

#### 1.2 Login
- **Route:** `POST /api/auth/login`
- **Auth:** ❌ Public (Rate limited)
- **Description:** Login with email and password
- **Request Schema:**
  ```zod
  {
    email: string (valid email, required)
    password: string (min 1 char, required)
  }
  ```
- **Response:**
  ```json
  {
    "user": {
      "id": string,
      "name": string,
      "email": string,
      "role": "USER" | "ADMIN",
      "isEmailVerified": boolean,
      "avatarUrl": string | null
    },
    "accessToken": string (JWT)
  }
  ```
- **Controller:** `login()` - Validates credentials, calls service, sets refresh cookie, returns tokens
- **Service:** `login()` - Validates email/password against bcrypt hash, creates access + refresh tokens

#### 1.3 Logout
- **Route:** `POST /api/auth/logout`
- **Auth:** ✅ Authenticated
- **Description:** Logout user (invalidates refresh tokens)
- **Request:** Empty body
- **Response:** `{ "message": "Logged out successfully" }`
- **Controller:** `logout()` - Extracts refresh token from cookie, calls service, clears cookie
- **Service:** `logout()` - Deletes refresh token from database

#### 1.4 Refresh Token
- **Route:** `POST /api/auth/refresh`
- **Auth:** ❌ Public (uses refresh token cookie)
- **Description:** Get new access token using refresh token
- **Request:** No body (uses cookie: `refreshToken`)
- **Response:**
  ```json
  {
    "accessToken": string (new JWT),
    "refreshToken": string (new HttpOnly cookie)
  }
  ```
- **Controller:** `refresh()` - Extracts refresh token from cookie, validates, calls service
- **Service:** `refresh()` - Validates token hasn't expired, implements token rotation (deletes old, creates new pair)
- **Note:** Implements token rotation for security

#### 1.5 Get Current User
- **Route:** `GET /api/auth/me`
- **Auth:** ✅ Authenticated (JWT)
- **Description:** Get currently logged-in user's profile
- **Request:** No body
- **Response:**
  ```json
  {
    "user": {
      "id": string,
      "name": string,
      "email": string,
      "phone": string | null,
      "avatarUrl": string | null,
      "role": "USER" | "ADMIN",
      "isEmailVerified": boolean,
      "createdAt": ISO8601
    }
  }
  ```
- **Controller:** `getMe()` - Calls service with user ID from JWT
- **Service:** `getProfile()` - Fetches user from database

#### 1.6 Forgot Password
- **Route:** `POST /api/auth/forgot-password`
- **Auth:** ❌ Public (Rate limited)
- **Description:** Request password reset email
- **Request Schema:**
  ```zod
  {
    email: string (valid email, required)
  }
  ```
- **Response:** `{ "message": "If that email exists, a reset link has been sent." }`
- **Controller:** `forgotPassword()` - Validates schema, calls service
- **Service:** `forgotPassword()` - Creates password reset token with 1h expiry, sends email (always returns success to prevent user enumeration)

#### 1.7 Reset Password
- **Route:** `POST /api/auth/reset-password`
- **Auth:** ❌ Public (Rate limited)
- **Description:** Reset password with token from forgot-password email
- **Request Schema:**
  ```zod
  {
    token: string (required)
    password: string (min 8 chars, max 100, required)
  }
  ```
- **Response:** `{ "message": "Password reset successfully" }`
- **Controller:** `resetPassword()` - Validates schema, calls service
- **Service:** `resetPassword()` - Validates token, hashes new password, updates user, marks token as used

#### 1.8 Verify Email
- **Route:** `GET /api/auth/verify-email/:token`
- **Auth:** ❌ Public
- **Description:** Verify email address via link from registration email
- **Request:** Token in URL
- **Response:** Redirects or JSON confirmation
- **Controller:** `verifyEmail()` - Extracts token, calls service
- **Service:** `verifyEmail()` - Validates token, marks email as verified, deletes token

---

## 2. USERS Module (`/api/users`)
User profile and address management (authenticated).

### Endpoints

#### 2.1 Get Profile
- **Route:** `GET /api/users/profile`
- **Auth:** ✅ Authenticated
- **Description:** Get own user profile
- **Response:**
  ```json
  {
    "user": {
      "id": string,
      "name": string,
      "email": string,
      "phone": string | null,
      "avatarUrl": string | null,
      "role": "USER" | "ADMIN",
      "isEmailVerified": boolean,
      "createdAt": ISO8601
    }
  }
  ```
- **Controller:** `getProfile()` - Calls service with user ID
- **Service:** `getProfile()` - Fetches user by ID

#### 2.2 Update Profile
- **Route:** `PATCH /api/users/profile`
- **Auth:** ✅ Authenticated
- **Description:** Update own profile (name, phone, avatar)
- **Request Schema:**
  ```zod
  {
    name?: string (1-100 chars)
    phone?: string
    avatarUrl?: string (valid URL)
    avatarFileId?: string (ImageKit file ID)
  }
  ```
- **Response:** Updated user object
- **Controller:** `updateProfile()` - Validates schema, calls service
- **Service:** `updateProfile()` - If replacing avatar, deletes old image from ImageKit, updates user

#### 2.3 Get Addresses
- **Route:** `GET /api/users/addresses`
- **Auth:** ✅ Authenticated
- **Description:** Get all user addresses
- **Response:**
  ```json
  {
    "addresses": [
      {
        "id": string,
        "label": string,
        "fullName": string,
        "phone": string,
        "street": string,
        "ward": string | null,
        "district": string,
        "city": string,
        "isDefault": boolean,
        "createdAt": ISO8601
      }
    ]
  }
  ```
- **Controller:** `getAddresses()` - Calls service
- **Service:** `getAddresses()` - Fetches all user addresses, sorted by default first, then by creation date

#### 2.4 Create Address
- **Route:** `POST /api/users/addresses`
- **Auth:** ✅ Authenticated
- **Description:** Add new address
- **Request Schema:**
  ```zod
  {
    label: string (1-50 chars, required) // e.g., "Home", "Office"
    fullName: string (1-100 chars, required)
    phone: string (required)
    street: string (required)
    ward?: string
    district: string (required)
    city: string (required)
    isDefault?: boolean (default: false)
  }
  ```
- **Response:** Created address object
- **Status Code:** 201
- **Controller:** `createAddress()` - Validates schema, calls service
- **Service:** `createAddress()` - If marked as default, unsets other addresses as default; if first address or no default set, automatically makes it default

#### 2.5 Update Address
- **Route:** `PATCH /api/users/addresses/:id`
- **Auth:** ✅ Authenticated
- **Description:** Update an address
- **Request Schema:** (all fields optional)
  ```zod
  Same as create, but all optional (partial)
  ```
- **Response:** Updated address object
- **Controller:** `updateAddress()` - Validates schema, calls service with address ID
- **Service:** `updateAddress()` - Verifies ownership, handles default flag logic

#### 2.6 Delete Address
- **Route:** `DELETE /api/users/addresses/:id`
- **Auth:** ✅ Authenticated
- **Description:** Delete an address
- **Response:** 204 No Content
- **Controller:** `deleteAddress()` - Calls service with address ID
- **Service:** `deleteAddress()` - Verifies ownership, deletes address

---

## 3. PRODUCTS Module (`/api/products`)
Product catalog with filtering and search.

### Endpoints

#### 3.1 Get Products (Public)
- **Route:** `GET /api/products`
- **Auth:** ❌ Public
- **Description:** List products with filtering, search, pagination, sorting
- **Query Parameters:**
  ```zod
  {
    category?: string (slug)
    search?: string
    featured?: boolean (as string "true"/"false")
    page: number (default: 1, min 1)
    limit: number (default: 12, max 100)
    sort?: "newest" | "price_asc" | "price_desc" | "rating"
  }
  ```
- **Response:**
  ```json
  {
    "products": [
      {
        "id": string,
        "name": string,
        "slug": string,
        "description": string | null,
        "price": number,
        "stock": number,
        "imageUrl": string | null,
        "isFeatured": boolean,
        "isActive": boolean,
        "rating": number,
        "reviewCount": number,
        "createdAt": ISO8601,
        "category": {
          "id": string,
          "name": string,
          "slug": string
        }
      }
    ],
    "pagination": {
      "total": number,
      "page": number,
      "limit": number,
      "totalPages": number
    }
  }
  ```
- **Controller:** `getProducts()` - Parses query, calls service
- **Service:** `getProducts()` - Filters by category/search/featured, applies sorting, handles pagination (using Prisma transactions)

#### 3.2 Get Product by Slug (Public)
- **Route:** `GET /api/products/:slug`
- **Auth:** ❌ Public
- **Description:** Get single product details by slug
- **Response:**
  ```json
  {
    "product": {
      "id": string,
      "name": string,
      "slug": string,
      "description": string,
      "price": number,
      "stock": number,
      "imageUrl": string | null,
      "isFeatured": boolean,
      "isActive": boolean,
      "rating": number,
      "reviewCount": number,
      "category": { /* ... */ }
    }
  }
  ```
- **Controller:** `getProductBySlug()` - Calls service
- **Service:** `getProductBySlug()` - Fetches by slug, filters only active products
- **Error:** 404 if not found

#### 3.3 Create Product (Admin)
- **Route:** `POST /api/products`
- **Auth:** ✅ Admin required
- **Description:** Create new product
- **Request Schema:**
  ```zod
  {
    name: string (1-200 chars, required)
    slug?: string (lowercase alphanumeric + hyphens, auto-generated from name)
    description?: string
    price: number (positive integer, required)
    categoryId: string (required)
    imageUrl?: string (valid URL)
    imageFileId?: string (ImageKit file ID)
    stock?: number (default: 999)
    isFeatured?: boolean (default: false)
    isActive?: boolean (default: true)
  }
  ```
- **Response:** Created product object
- **Status Code:** 201
- **Controller:** `createProduct()` - Validates schema, calls service
- **Service:** `createProduct()` - Validates category exists, auto-generates slug if not provided using slugify

#### 3.4 Update Product (Admin)
- **Route:** `PATCH /api/products/:id`
- **Auth:** ✅ Admin required
- **Description:** Update product
- **Request Schema:** (all fields optional)
  ```zod
  Same as create, all optional
  ```
- **Response:** Updated product object
- **Controller:** `updateProduct()` - Validates schema, calls service
- **Service:** `updateProduct()` - Updates product, validates category if provided

#### 3.5 Delete Product (Admin)
- **Route:** `DELETE /api/products/:id`
- **Auth:** ✅ Admin required
- **Description:** Delete product
- **Response:** 204 No Content
- **Controller:** `deleteProduct()` - Calls service
- **Service:** `deleteProduct()` - Deletes image from ImageKit if exists, deletes product

---

## 4. CATEGORIES Module (`/api/categories`)
Product categories management.

### Endpoints

#### 4.1 Get Categories (Public)
- **Route:** `GET /api/categories`
- **Auth:** ❌ Public
- **Description:** List all active categories
- **Response:**
  ```json
  {
    "categories": [
      {
        "id": string,
        "name": string,
        "slug": string,
        "imageUrl": string | null,
        "sortOrder": number,
        "isActive": boolean,
        "createdAt": ISO8601
      }
    ]
  }
  ```
- **Controller:** `getCategories()` - Calls service
- **Service:** `getCategories()` - Fetches active categories sorted by sortOrder

#### 4.2 Get Category by Slug (Public)
- **Route:** `GET /api/categories/:slug`
- **Auth:** ❌ Public
- **Description:** Get single category
- **Response:**
  ```json
  {
    "category": { /* category object */ }
  }
  ```
- **Controller:** `getCategoryBySlug()` - Calls service
- **Service:** `getCategoryBySlug()` - Fetches by slug
- **Error:** 404 if not found

#### 4.3 Create Category (Admin)
- **Route:** `POST /api/categories`
- **Auth:** ✅ Admin required
- **Description:** Create new category
- **Request Schema:**
  ```zod
  {
    name: string (1-100 chars, required)
    slug?: string (lowercase alphanumeric + hyphens, auto-generated)
    imageUrl?: string (valid URL)
    sortOrder?: number (default: 0)
    isActive?: boolean (default: true)
  }
  ```
- **Response:** Created category object
- **Status Code:** 201
- **Controller:** `createCategory()` - Validates schema, calls service
- **Service:** `createCategory()` - Auto-generates slug if not provided

#### 4.4 Update Category (Admin)
- **Route:** `PATCH /api/categories/:id`
- **Auth:** ✅ Admin required
- **Description:** Update category
- **Request Schema:** (all optional)
  ```zod
  Same as create, all optional
  ```
- **Response:** Updated category object
- **Controller:** `updateCategory()` - Validates schema, calls service
- **Service:** `updateCategory()` - Updates category, auto-generates slug if name changed

#### 4.5 Delete Category (Admin)
- **Route:** `DELETE /api/categories/:id`
- **Auth:** ✅ Admin required
- **Description:** Delete category
- **Response:** 204 No Content
- **Controller:** `deleteCategory()` - Calls service
- **Service:** `deleteCategory()` - Checks if category has products (error 409 if so), deletes category
- **Validation:** Cannot delete if category has products

---

## 5. ORDERS Module (`/api/orders`)
Order management for authenticated users.

### Endpoints

#### 5.1 Create Order
- **Route:** `POST /api/orders`
- **Auth:** ✅ Authenticated
- **Description:** Place a new order
- **Request Schema:**
  ```zod
  {
    addressId: string (required)
    items: Array of {
      productId: string (required)
      quantity: number (positive integer, required)
    }[] (min 1 item)
    promotionCode?: string
    paymentMethod: "COD" | "ONLINE" (required)
    note?: string (max 500 chars)
  }
  ```
- **Response:**
  ```json
  {
    "order": {
      "id": string,
      "orderNumber": string (format: "ORD-YYYYMMDD-HEX"),
      "userId": string,
      "addressId": string,
      "status": "PENDING",
      "paymentMethod": "COD" | "ONLINE",
      "subtotal": number,
      "shippingFee": number,
      "discountAmount": number,
      "total": number,
      "items": [
        {
          "productId": string,
          "productName": string,
          "productImage": string | null,
          "quantity": number,
          "unitPrice": number
        }
      ],
      "promotionCode": string | null,
      "note": string | null,
      "createdAt": ISO8601
    }
  }
  ```
- **Status Code:** 201
- **Controller:** `createOrder()` - Validates schema, calls service with user ID
- **Service:** `createOrder()` - 
  - Validates address belongs to user
  - Fetches and validates all products (must exist and be active)
  - Calculates subtotal (shipping fee always 20,000 VND)
  - Applies promotion if provided (validates code, checks expiry, usage limit, min order value)
  - Calculates discount (PERCENT or FIXED type)
  - Creates order in transaction
  - Sends confirmation email with formatted currency

#### 5.2 Get User Orders
- **Route:** `GET /api/orders`
- **Auth:** ✅ Authenticated
- **Description:** Get all orders for current user
- **Response:**
  ```json
  {
    "orders": [
      { /* order objects */ }
    ]
  }
  ```
- **Controller:** `getUserOrders()` - Calls service with user ID
- **Service:** `getUserOrders()` - Fetches all user orders with items

#### 5.3 Get Order by ID
- **Route:** `GET /api/orders/:id`
- **Auth:** ✅ Authenticated
- **Description:** Get single order (user can only see own orders)
- **Response:** Single order object
- **Controller:** `getOrderById()` - Calls service with order ID and user ID
- **Service:** `getOrderById()` - Fetches order, verifies ownership
- **Error:** 404 if not found or not owned by user

#### 5.4 Cancel Order
- **Route:** `POST /api/orders/:id/cancel`
- **Auth:** ✅ Authenticated
- **Description:** Cancel order (only if status is PENDING)
- **Response:** Updated order with status CANCELLED
- **Controller:** `cancelOrder()` - Calls service with order ID and user ID
- **Service:** `cancelOrder()` - Verifies ownership, checks status is PENDING, updates to CANCELLED
- **Validation:** Only PENDING orders can be cancelled

---

## 6. REVIEWS Module (`/api/reviews`)
Product reviews and ratings.

### Endpoints

#### 6.1 Get Product Reviews (Public)
- **Route:** `GET /api/reviews/products/:productId`
- **Auth:** ❌ Public
- **Description:** Get all reviews for a product
- **Response:**
  ```json
  {
    "reviews": [
      {
        "id": string,
        "userId": string,
        "productId": string,
        "orderId": string,
        "rating": 1-5,
        "comment": string | null,
        "createdAt": ISO8601,
        "user": {
          "id": string,
          "name": string,
          "avatarUrl": string | null
        }
      }
    ]
  }
  ```
- **Controller:** `getProductReviews()` - Calls service
- **Service:** `getProductReviews()` - Validates product exists, fetches reviews sorted by newest first

#### 6.2 Create Review (Authenticated)
- **Route:** `POST /api/reviews/products/:productId`
- **Auth:** ✅ Authenticated + must have purchased product
- **Description:** Create review for product
- **Request Schema:**
  ```zod
  {
    rating: number (1-5, required)
    comment?: string (max 1000 chars)
  }
  ```
- **Response:** Created review object
- **Status Code:** 201
- **Controller:** `createReview()` - Validates schema, calls service
- **Service:** `createReview()` - 
  - Validates product exists
  - Checks user has a DELIVERED order containing this product
  - Prevents duplicate reviews (user can only review once per product)
  - Creates review
  - Recalculates product rating and review count

#### 6.3 Update Review (Authenticated)
- **Route:** `PATCH /api/reviews/:id`
- **Auth:** ✅ Authenticated (user can only update own reviews)
- **Description:** Update own review
- **Request Schema:**
  ```zod
  {
    rating?: number (1-5)
    comment?: string (max 1000 chars)
  }
  ```
- **Response:** Updated review object
- **Controller:** `updateReview()` - Validates schema, calls service
- **Service:** `updateReview()` - Verifies ownership, updates review, recalculates product rating

#### 6.4 Delete Review (Authenticated)
- **Route:** `DELETE /api/reviews/:id`
- **Auth:** ✅ Authenticated (user can only delete own reviews)
- **Description:** Delete own review
- **Response:** 204 No Content
- **Controller:** `deleteReview()` - Calls service
- **Service:** `deleteReview()` - Verifies ownership, deletes review, recalculates product rating

---

## 7. PROMOTIONS Module (`/api/promotions`)
Promotion code validation (public endpoint).

### Endpoints

#### 7.1 Validate Promotion Code
- **Route:** `POST /api/promotions/validate`
- **Auth:** ❌ Public
- **Description:** Check if promotion code is valid and calculate discount
- **Request Schema:**
  ```zod
  {
    code: string (required)
    orderValue: number (positive integer, required)
  }
  ```
- **Response:**
  ```json
  {
    "promotion": {
      "id": string,
      "code": string,
      "description": string | null,
      "discountType": "PERCENT" | "FIXED",
      "discountValue": number,
      "discountAmount": number (calculated based on orderValue)
    }
  }
  ```
- **Validation:**
  - Checks code exists and is active
  - Checks expiry date
  - Checks usage limit not reached
  - Checks order value meets minimum
  - Calculates discount amount (PERCENT: applies maxDiscount cap if present, FIXED: direct value)
- **Error Handling:** 404 if not found, 400 if expired/limit reached/below min value

---

## 8. UPLOAD Module (`/api/upload`)
Image upload management via ImageKit.

### Endpoints

#### 8.1 Get Upload Authentication
- **Route:** `GET /api/upload/auth`
- **Auth:** ✅ Authenticated
- **Description:** Get ImageKit authentication parameters for client-side upload
- **Response:**
  ```json
  {
    "signature": string (HMAC signature),
    "expire": number (Unix timestamp),
    "token": string (upload token),
    "publicKey": string (ImageKit public key)
  }
  ```
- **Controller:** `uploadRouter` handler - Directly returns ImageKit auth params
- **Service:** Uses ImageKit SDK `getAuthenticationParameters()`
- **Purpose:** Enables authenticated client-side direct uploads to ImageKit without passing through backend

---

## 9. ADMIN Module (`/api/admin`)
Admin-only dashboard and management endpoints.

**All admin routes require:** ✅ Authentication + Admin role

### Endpoints

#### 9.1 Get Dashboard
- **Route:** `GET /api/admin/dashboard`
- **Auth:** ✅ Admin required
- **Description:** Get dashboard overview with key metrics
- **Response:**
  ```json
  {
    "revenue": {
      "total": number,
      "today": number,
      "thisMonth": number
    },
    "ordersByStatus": {
      "PENDING": number,
      "CONFIRMED": number,
      "PREPARING": number,
      "DELIVERING": number,
      "DELIVERED": number,
      "CANCELLED": number
    },
    "totalUsers": number,
    "topProducts": [
      {
        "productId": string,
        "productName": string,
        "_sum": { "quantity": number }
      }
    ] (top 5),
    "recentOrders": [
      {
        "id": string,
        "orderNumber": string,
        "status": string,
        "total": number,
        "createdAt": ISO8601,
        "user": {
          "id": string,
          "name": string,
          "email": string
        }
      }
    ] (10 most recent)
  }
  ```
- **Controller:** `getDashboard()` - Calls service
- **Service:** `getDashboard()` - Uses Prisma transactions to fetch:
  - Total revenue from DELIVERED orders
  - Today's revenue (from start of day)
  - This month's revenue (from start of month)
  - Total user count
  - Top 5 best-selling products by quantity
  - 10 most recent orders
  - Order counts by status (6 separate queries)

#### 9.2 Get Orders (Admin List)
- **Route:** `GET /api/admin/orders`
- **Auth:** ✅ Admin required
- **Description:** List all orders with filtering and pagination
- **Query Parameters:**
  ```zod
  {
    status?: "PENDING" | "CONFIRMED" | "PREPARING" | "DELIVERING" | "DELIVERED" | "CANCELLED"
    page: number (default: 1)
    limit: number (default: 20, max 100)
  }
  ```
- **Response:**
  ```json
  {
    "orders": [
      {
        "id": string,
        "orderNumber": string,
        "status": string,
        "total": number,
        "items": [{ /* order items */ }],
        "user": {
          "id": string,
          "name": string,
          "email": string
        }
      }
    ],
    "pagination": {
      "total": number,
      "page": number,
      "limit": number,
      "totalPages": number
    }
  }
  ```
- **Controller:** `getOrders()` - Parses query, calls service
- **Service:** `getOrders()` - Filters by status if provided, returns paginated results

#### 9.3 Update Order Status (Admin)
- **Route:** `PATCH /api/admin/orders/:id/status`
- **Auth:** ✅ Admin required
- **Description:** Change order status
- **Request Schema:**
  ```zod
  {
    status: "PENDING" | "CONFIRMED" | "PREPARING" | "DELIVERING" | "DELIVERED" | "CANCELLED"
  }
  ```
- **Response:** Updated order object
- **Controller:** `updateOrderStatus()` - Validates schema, calls service
- **Service:** `updateOrderStatus()` - Validates order exists, updates status

#### 9.4 Get Products (Admin List)
- **Route:** `GET /api/admin/products`
- **Auth:** ✅ Admin required
- **Description:** List all products (including inactive) with filtering
- **Query Parameters:**
  ```zod
  {
    page: number (default: 1)
    limit: number (default: 20, max 100)
    category?: string (slug)
    search?: string
    isActive?: boolean (as string "true"/"false")
  }
  ```
- **Response:** Similar to public products list but includes all products
- **Controller:** `getProducts()` - Parses query, calls service
- **Service:** `getAdminProducts()` - Filters by category/search/active status, returns paginated results

#### 9.5 Update Product (Admin)
- **Route:** `PATCH /api/admin/products/:id`
- **Auth:** ✅ Admin required
- **Description:** Update product
- **Request:** Same as products module update
- **Response:** Updated product object
- **Controller:** `updateProduct()` - Validates schema, calls service
- **Service:** `adminUpdateProduct()` - Updates product

#### 9.6 Delete Product (Admin)
- **Route:** `DELETE /api/admin/products/:id`
- **Auth:** ✅ Admin required
- **Description:** Delete product (deletes from ImageKit if image exists)
- **Response:** 204 No Content
- **Controller:** `deleteProduct()` - Calls service
- **Service:** `adminDeleteProduct()` - Deletes image from ImageKit, deletes product

#### 9.7 Get Users (Admin List)
- **Route:** `GET /api/admin/users`
- **Auth:** ✅ Admin required
- **Description:** List all users with pagination and search
- **Query Parameters:**
  ```zod
  {
    page: number (default: 1)
    limit: number (default: 20, max 100)
    search?: string (searches name and email)
  }
  ```
- **Response:**
  ```json
  {
    "users": [
      {
        "id": string,
        "name": string,
        "email": string,
        "phone": string | null,
        "role": "USER" | "ADMIN",
        "isEmailVerified": boolean,
        "avatarUrl": string | null,
        "createdAt": ISO8601
      }
    ],
    "pagination": {
      "total": number,
      "page": number,
      "limit": number,
      "totalPages": number
    }
  }
  ```
- **Controller:** `getUsers()` - Parses query, calls service
- **Service:** `getUsers()` - Filters by name/email search, returns paginated results

#### 9.8 Update User Role (Admin)
- **Route:** `PATCH /api/admin/users/:id/role`
- **Auth:** ✅ Admin required
- **Description:** Change user role (promote/demote)
- **Request Schema:**
  ```zod
  {
    role: "USER" | "ADMIN"
  }
  ```
- **Response:**
  ```json
  {
    "user": {
      "id": string,
      "name": string,
      "email": string,
      "role": "USER" | "ADMIN"
    }
  }
  ```
- **Controller:** `updateUserRole()` - Validates schema, calls service
- **Service:** `updateUserRole()` - Validates user exists, updates role

#### 9.9 Get Categories (Admin List)
- **Route:** `GET /api/admin/categories`
- **Auth:** ✅ Admin required
- **Description:** List all categories (including inactive)
- **Response:**
  ```json
  {
    "categories": [ /* all categories */ ]
  }
  ```
- **Controller:** `getCategories()` - Calls service
- **Service:** `getAdminCategories()` - Fetches all categories sorted by sortOrder

#### 9.10 Get Promotions (Admin List)
- **Route:** `GET /api/admin/promotions`
- **Auth:** ✅ Admin required
- **Description:** List all promotions
- **Response:**
  ```json
  {
    "promotions": [
      {
        "id": string,
        "code": string,
        "description": string | null,
        "discountType": "PERCENT" | "FIXED",
        "discountValue": number,
        "minOrderValue": number,
        "maxDiscount": number | null,
        "usageLimit": number | null,
        "usedCount": number,
        "isActive": boolean,
        "expiresAt": ISO8601 | null,
        "createdAt": ISO8601
      }
    ]
  }
  ```
- **Controller:** `getPromotions()` - Calls service
- **Service:** `getPromotions()` - Fetches all promotions sorted by newest first

#### 9.11 Create Promotion (Admin)
- **Route:** `POST /api/admin/promotions`
- **Auth:** ✅ Admin required
- **Description:** Create new promotion code
- **Request Schema:**
  ```zod
  {
    code: string (1-32 chars, auto-converted to uppercase, required)
    description?: string
    discountType: "PERCENT" | "FIXED" (required)
    discountValue: number (positive integer, required)
    minOrderValue?: number (default: 0)
    maxDiscount?: number (for PERCENT type)
    usageLimit?: number
    isActive?: boolean (default: true)
    expiresAt?: ISO8601 datetime
  }
  ```
- **Response:** Created promotion object
- **Status Code:** 201
- **Controller:** `createPromotion()` - Validates schema, calls service
- **Service:** `createPromotion()` - Creates promotion in database

#### 9.12 Update Promotion (Admin)
- **Route:** `PATCH /api/admin/promotions/:id`
- **Auth:** ✅ Admin required
- **Description:** Update promotion
- **Request Schema:** (all optional)
  ```zod
  Same as create, all fields optional
  ```
- **Response:** Updated promotion object
- **Controller:** `updatePromotion()` - Validates schema, calls service
- **Service:** `updatePromotion()` - Validates promotion exists, updates

#### 9.13 Delete Promotion (Admin)
- **Route:** `DELETE /api/admin/promotions/:id`
- **Auth:** ✅ Admin required
- **Description:** Delete promotion
- **Response:** 204 No Content
- **Controller:** `deletePromotion()` - Calls service
- **Service:** `deletePromotion()` - Validates exists, deletes

---

## Authentication & Security

### Auth Middleware
- **Header:** `Authorization: Bearer <accessToken>`
- **JWT Claims:** `{ sub: userId, role: "USER" | "ADMIN" }`
- **Access Token Expiry:** Configurable via `JWT_ACCESS_EXPIRES_IN` env var

### Rate Limiting
- **General Rate Limit:** `RATE_LIMIT_MAX` requests per `RATE_LIMIT_WINDOW_MS`
- **Auth Rate Limit:** `AUTH_RATE_LIMIT_MAX` requests per `RATE_LIMIT_WINDOW_MS` (stricter)
- **Applied to:** `/auth/register`, `/auth/login`, `/auth/forgot-password`, `/auth/reset-password`

### Token Management
- **Refresh Token:** 7-day expiry, stored in HttpOnly cookies
- **Token Rotation:** Implemented on refresh - old token deleted, new pair issued
- **Cookie Options:** HttpOnly, Secure (in production), SameSite: Strict

### Role-Based Access Control
- **USER role:** Standard user permissions
- **ADMIN role:** Full admin panel access
- **Middleware:** `authenticate` for JWT validation, `requireAdmin` for role check

---

## Error Handling

### Standard Error Responses
```json
{
  "error": "Error message",
  "statusCode": 400
}
```

### Common Error Codes
- **400 Bad Request:** Validation failed, business logic error
- **401 Unauthorized:** No auth token or invalid token
- **403 Forbidden:** Insufficient permissions or not owner
- **404 Not Found:** Resource not found
- **409 Conflict:** Resource already exists or constraint violation
- **429 Too Many Requests:** Rate limit exceeded
- **500 Internal Server Error:** Server error

---

## Request/Response Patterns

### Pagination
```json
{
  "pagination": {
    "total": number,
    "page": number,
    "limit": number,
    "totalPages": number
  }
}
```

### Authentication Response
```json
{
  "user": { /* user object */ },
  "accessToken": "jwt.token.here",
  "refreshToken": "raw.token" (in HttpOnly cookie)
}
```

### List Response
```json
{
  "items": [ /* array */ ],
  "pagination": { /* pagination */ }
}
```

### Single Resource Response
```json
{
  "resource": { /* object */ }
}
```

---

## Database Models Referenced

### Key Models
- **User:** id, name, email, passwordHash, phone, avatarUrl, avatarFileId, role, isEmailVerified, createdAt
- **Product:** id, name, slug, description, price, stock, imageUrl, imageFileId, isFeatured, isActive, rating, reviewCount, categoryId, createdAt
- **Category:** id, name, slug, imageUrl, sortOrder, isActive, createdAt
- **Order:** id, orderNumber, userId, addressId, status, paymentMethod, subtotal, shippingFee, discountAmount, total, promotionId, note, createdAt
- **OrderItem:** id, orderId, productId, productName, productImage, quantity, unitPrice
- **Address:** id, userId, label, fullName, phone, street, ward, district, city, isDefault, createdAt
- **Review:** id, userId, productId, orderId, rating, comment, createdAt
- **Promotion:** id, code, description, discountType, discountValue, minOrderValue, maxDiscount, usageLimit, usedCount, isActive, expiresAt, createdAt
- **RefreshToken:** id, userId, token, expiresAt, createdAt
- **EmailVerification:** id, userId, token, expiresAt, createdAt
- **PasswordReset:** id, userId, token, expiresAt, used, createdAt

---

## Summary Statistics

| Module | Endpoints | Public | Authenticated | Admin |
|--------|-----------|--------|---------------|----- |
| Auth | 8 | 6* | 1 | 0 |
| Users | 6 | 0 | 6 | 0 |
| Products | 5 | 2 | 0 | 3 |
| Categories | 5 | 2 | 0 | 3 |
| Orders | 4 | 0 | 4 | 0 |
| Reviews | 4 | 1 | 3 | 0 |
| Promotions | 1 | 1 | 0 | 0 |
| Upload | 1 | 0 | 1 | 0 |
| Admin | 13 | 0 | 0 | 13 |
| **TOTAL** | **47** | **12** | **15** | **19** |

*Auth endpoints have special rate limiting; logout requires authentication but uses stored refresh token

