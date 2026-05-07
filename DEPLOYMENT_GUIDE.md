# Hướng dẫn Deploy - Backend (Render) + Frontend (Vercel)

## Phần 1: Deploy Backend lên Render với Docker

### 1.1 Chuẩn bị trên Render.com

1. **Tạo tài khoản Render**
   - Truy cập [render.com](https://render.com)
   - Đăng ký/Đăng nhập với GitHub

2. **Tạo PostgreSQL Database**
   - Vào Dashboard → New → PostgreSQL
   - Cấu hình:
     - **Name**: `ecommerce-db`
     - **Region**: `Singapore` (hoặc gần nhất)
     - **PostgreSQL Version**: 16
     - **Plan**: Free (hoặc Starter)
   - Lưu **Internal Database URL** (dạng `postgresql://...`)

3. **Tạo Redis Cache** (Optional, để improve performance)
   - New → Redis
   - Cấu hình tương tự và lưu lại connection URL

### 1.2 Chuẩn bị Repository

1. **Cấu trúc thư mục Backend**
   ```
   backend/
   ├── Dockerfile
   ├── docker-compose.yml
   ├── package.json
   ├── tsconfig.json
   ├── src/
   ├── prisma/
   └── .dockerignore
   ```

2. **Tạo file `.dockerignore`** (nếu chưa có)
   ```
   node_modules
   npm-debug.log
   dist
   .env
   .env.local
   .DS_Store
   logs
   ```

3. **Tạo file `render.yaml`** tại root của backend folder
   ```yaml
   services:
     - type: web
       name: ecommerce-backend
       env: node
       plan: starter
       buildCommand: npm ci && npx prisma generate && npm run build
       startCommand: npx prisma migrate deploy && node dist/main.js
       envVars:
         - key: NODE_ENV
           value: production
         - key: DATABASE_URL
           fromDatabase:
             name: ecommerce-db
             property: connectionString
   databases:
     - name: ecommerce-db
       engine: postgres
       version: 16
   ```

### 1.3 Deploy Backend

**Cách 1: Sử dụng Web Service (Khuyến nghị)**

1. Vào Render Dashboard → New → Web Service
2. Chọn **Public Git repository**
3. Nhập URL GitHub repository của bạn
4. Cấu hình:
   - **Name**: `ecommerce-backend`
   - **Environment**: Docker
   - **Region**: `Singapore`
   - **Branch**: `main` (hoặc branch bạn muốn)
   - **Plan**: Starter ($7/month) hoặc Free

5. **Environment Variables** (quan trọng!):
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   JWT_SECRET=<your-secret-key-min-16-chars>
   JWT_REFRESH_SECRET=<your-refresh-secret-min-16-chars>
   JWT_EXPIRE=7d
   JWT_REFRESH_EXPIRE=30d
   IMAGEKIT_PUBLIC_KEY=<your-imagekit-key>
   IMAGEKIT_PRIVATE_KEY=<your-imagekit-private>
   IMAGEKIT_URL_ENDPOINT=<your-imagekit-endpoint>
   LOG_LEVEL=info
   CORS_ORIGIN=https://yourdomain.vercel.app
   REDIS_URL=<optional-if-using-redis>
   PORT=3000
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX=500
   AUTH_RATE_LIMIT_MAX=20
   ```

6. Click **Create Web Service**

**Cách 2: Deploy từ GitHub Push (tự động)**

1. Push code lên GitHub
2. Render sẽ tự động detect và deploy khi có commit mới

### 1.4 Kiểm tra Backend đã Deploy

- Vào **Dashboard** → chọn service
- Chờ cho đến khi trạng thái: `Live ✓`
- URL Backend: `https://ecommerce-backend-xxxxx.onrender.com`
- Test: Truy cập `https://ecommerce-backend-xxxxx.onrender.com/health`

---

## Phần 2: Deploy Frontend lên Vercel

### 2.1 Chuẩn bị Vercel

1. **Tạo tài khoản Vercel**
   - Truy cập [vercel.com](https://vercel.com)
   - Đăng ký/Đăng nhập với GitHub

2. **Connect GitHub Repository**
   - Chọn **Import Project**
   - Chọn repository của bạn
   - Vercel sẽ tự động detect đó là Vite project

### 2.2 Cấu hình Frontend Deploy

1. **Build Settings**
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install` hoặc `pnpm install`

2. **Environment Variables**
   - Tạo file `.env.production` trong `admin-client/`:
   ```
   VITE_API_URL=https://ecommerce-backend-xxxxx.onrender.com/api
   VITE_API_BASE_URL=https://ecommerce-backend-xxxxx.onrender.com
   ```

3. **Vercel Dashboard Settings**:
   - **Root Directory**: `admin-client/`
   - **Node.js Version**: 20.x (LTS)
   - Thêm Environment Variables:
     ```
     VITE_API_URL=https://ecommerce-backend-xxxxx.onrender.com/api
     VITE_API_BASE_URL=https://ecommerce-backend-xxxxx.onrender.com
     ```

### 2.3 Deploy Frontend

1. Click **Deploy** trên Vercel
2. Chờ build process hoàn tất (~2-5 phút)
3. URL Frontend: `https://yourdomain.vercel.app`

---

## Phần 3: Cấu hình CORS

Cập nhật Backend environment variable:

```
CORS_ORIGIN=https://yourdomain.vercel.app
```

Điều này cho phép frontend truy cập API backend mà không bị CORS error.

---

## Phần 4: Sử dụng Custom Domain (Optional)

### Backend (Render)
1. Vào Settings → Custom Domain
2. Thêm domain của bạn
3. Follow hướng dẫn DNS

### Frontend (Vercel)
1. Vào Project Settings → Domains
2. Thêm custom domain
3. Cập nhật DNS records

---

## Phần 5: Troubleshooting

### Backend không deploy
- Kiểm tra logs: Dashboard → Logs
- Đảm bảo `Dockerfile` đúng
- Kiểm tra environment variables

### Frontend build fail
- Xóa `node_modules` và `pnpm-lock.yaml`
- Chạy `npm install` lại
- Kiểm tra build output

### CORS Error
- Kiểm tra `CORS_ORIGIN` environment variable
- Đảm bảo URL chính xác: `https://yourdomain.vercel.app` (không có trailing slash)

### Database Connection Error
- Kiểm tra `DATABASE_URL` format
- Test connection từ local: `psql <DATABASE_URL>`
- Đảm bảo migration đã chạy: `npx prisma migrate deploy`

---

## Phần 6: Monitoring & Logs

### Render Backend
- **Logs**: Dashboard → Logs (xem real-time)
- **Metrics**: CPU, Memory usage
- **Redeploy**: Có thể manual redeploy từ Dashboard

### Vercel Frontend
- **Build Logs**: Deployments → xem chi tiết build
- **Function Logs**: Analytics → Serverless Functions
- **Real-time Monitoring**: Vercel Analytics

---

## Phần 7: CI/CD Tự động

### Cấu hình tự động deploy khi push code

1. **Backend (Render)**
   - Tự động detect push từ GitHub
   - Tự động build & deploy

2. **Frontend (Vercel)**
   - Tự động detect push từ GitHub
   - Tự động build & deploy

**Tips**: Tránh để sensitive data trong code, luôn dùng environment variables!

---

## Checklist Deploy

- [ ] PostgreSQL database tạo trên Render
- [ ] Redis cache setup (optional)
- [ ] Backend environment variables setup
- [ ] Backend deploy thành công
- [ ] Test backend health endpoint
- [ ] Frontend environment variables setup
- [ ] Frontend deploy thành công
- [ ] CORS_ORIGIN updated
- [ ] Test API connection từ frontend
- [ ] Custom domain setup (optional)
- [ ] Monitoring & logging configured

---

## Links & Resources

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Prisma Migration**: https://www.prisma.io/docs/orm/prisma-migrate/workflows/customizing-migrations
- **Express CORS**: https://expressjs.com/en/resources/middleware/cors.html
