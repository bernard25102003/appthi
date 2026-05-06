# 🚀 Backend Deployment Guide - Render

## Bước 1: Chuẩn Bị Trước Deploy

### 1.1 Kiểm tra Build & Start Script
```bash
# Kiểm tra build có lỗi không
npm run build

# Kiểm tra start script hoạt động
npm start
```
✅ **Status**: Đã kiểm tra ✓

### 1.2 Xác nhận Các File Cần Thiết
- [x] `package.json` - Với `build` & `start` scripts
- [x] `tsconfig.build.json` - Config TypeScript cho production
- [x] `.env.example` - Template environment variables
- [x] `.gitignore` - Để loại trừ dist, node_modules, .env

✅ **Status**: Đã có ✓

---

## Bước 2: Tạo Database trên Render (PostgreSQL)

### Option A: Sử dụng Supabase (Hiện tại)
Database đã có: `db.zuojqiqfgvasemjlznyk.supabase.co`

**Cần kiểm tra**: 
- Supabase có allow external connections không?
- Database pool settings có correct không?

### Option B: Tạo PostgreSQL trên Render (Nên dùng)

1. **Login Render Dashboard**: https://dashboard.render.com
2. **New → PostgreSQL**
   - Database name: `fastfood_prod`
   - Region: Singapore (gần nhất với client)
   - Plans: Standard
3. **Copy connection string** → Dùng cho Render env var

---

## Bước 3: Tạo Web Service trên Render

### 3.1 Connect Repository
1. **New → Web Service**
2. **Connect GitHub/GitLab repository**
   - Repository: `appthi`
   - Root Directory: `backend` ✓

### 3.2 Cấu Hình Build

| Setting | Value |
|---------|-------|
| **Runtime** | Node 20 |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Auto-Deploy** | ON (nếu muốn tự động deploy khi push) |

### 3.3 Cấu Hình Environment Variables

Thêm các env vars trong Render dashboard:

```bash
# Database - từ Render PostgreSQL hoặc Supabase
DATABASE_URL=postgresql://user:password@host:5432/fastfood_prod?pgbouncer=true
DIRECT_URL=postgresql://user:password@host:5432/fastfood_prod

# Server
PORT=4000
NODE_ENV=production
CLIENT_URL=https://your-frontend-domain.com
API_URL=https://api-backend-name.render.com

# JWT Secrets (⚠️ Generate new ones!)
JWT_ACCESS_SECRET=<long-random-string-min-32-chars>
JWT_REFRESH_SECRET=<long-random-string-min-32-chars>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ImageKit
IMAGEKIT_PUBLIC_KEY=<your-public-key>
IMAGEKIT_PRIVATE_KEY=<your-private-key>
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id

# Email Service (Brevo/Sendinblue)
BREVO_API_KEY=<your-api-key>
BREVO_SENDER_NAME=FastFood
BREVO_SENDER_EMAIL=noreply@your-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=10
```

⚠️ **QUAN TRỌNG**: Không commit `.env` file! Render sẽ load từ dashboard.

---

## Bước 4: Database Migration Trên Render

Sau deploy lần đầu, cần chạy migrations:

### Option A: Render Build Hooks (Khuyên dùng)
Trong `render.yaml` hoặc dashboard:
```yaml
hooks:
  preRelease:
    - "npx prisma migrate deploy"
```

### Option B: Chạy Thủ Công
1. SSH vào Render instance
2. Chạy: `npx prisma migrate deploy`
3. (Optional) Chạy seed: `npm run db:seed`

---

## Bước 5: Kiểm Tra Sau Deploy

### Health Check
```bash
curl https://your-backend-name.render.com/health
# Response: {"status":"ok","timestamp":"2025-05-06T..."}
```

### Kiểm Tra Logs
- Render Dashboard → Logs tab
- Tìm: "Server running on" message

### Test Endpoints
```bash
# Test CORS
curl -H "Origin: https://your-frontend.com" \
     https://your-backend-name.render.com/health

# Test một endpoint
curl https://your-backend-name.render.com/api/categories
```

---

## Bước 6: Cấu Hình Frontend

Update `frontend/src/lib/api/endpoints.ts`:

```typescript
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-backend-name.render.com/api'
  : 'http://localhost:4000/api'
```

---

## ⚠️ Quan Trọng - Security Checklist

- [ ] ✓ Helmet enabled (CORS, XSS, CSP headers)
- [ ] ✓ Rate limiting active
- [ ] ✓ JWT_ACCESS_SECRET & JWT_REFRESH_SECRET đã thay đổi (min 32 chars)
- [ ] ✓ Database credentials không committed
- [ ] ✓ NODE_ENV = production
- [ ] ✓ DIRECT_URL khác DATABASE_URL (cho Prisma migrations)
- [ ] ✓ ImageKit keys lưu trữ an toàn
- [ ] ✓ Email sender domain verified (BREVO)

---

## 🔧 Render Spec Yêu Cầu

| Requirement | Status | Notes |
|-----------|--------|-------|
| Node.js 20+ | ✅ | Defined in `package.json` engines |
| Build output | ✅ | TypeScript → JavaScript in `dist/` |
| Listen on $PORT | ✅ | `app.listen(env.PORT)` |
| Graceful shutdown | ✅ | SIGTERM/SIGINT handlers |
| Health endpoint | ✅ | GET `/health` endpoint |
| Build caching | ✅ | Render auto-caches node_modules |

---

## 🚀 Quick Deploy Checklist

1. [ ] Push code to GitHub (without `.env`)
2. [ ] Create PostgreSQL on Render OR verify Supabase external access
3. [ ] Create Web Service on Render
4. [ ] Add environment variables
5. [ ] Set build command: `npm install && npm run build`
6. [ ] Set start command: `npm start`
7. [ ] Deploy 🚀
8. [ ] Run migrations (if needed)
9. [ ] Test health endpoint
10. [ ] Update frontend API_BASE_URL
11. [ ] Update CORS whitelist if needed
12. [ ] Monitor logs for errors

---

## 📝 Ghi Chú

- **Auto-deploy**: Render sẽ tự động re-deploy khi push to GitHub
- **Build time**: ~2-3 phút (TypeScript compilation)
- **Cold start**: Lần đầu tiên request có thể chậm 10-20s
- **Pricing**: Render free tier có limited resources, nên upgrade nếu traffic cao
- **Backup database**: Render free tier không có auto-backup. Setup manual backups!

---

## 🆘 Troubleshooting

### Build Failed: "Cannot find module"
→ Kiểm tra `tsconfig.build.json` include paths

### Deploy fails with port error
→ Render tự động set PORT env var. Kiểm tra `env.PORT` có read từ environment không

### Database connection timeout
→ Check firewall rules, IP whitelist, connection string format

### "Cannot start server"
→ Check logs: `npm start` command có lỗi gì?
→ Verify NODE_ENV không là "development"

---

## 📚 Useful Links

- [Render Docs - Node.js](https://render.com/docs/deploy-node-express-app)
- [Prisma Migration Docs](https://www.prisma.io/docs/orm/prisma-migrate/workflows/add-to-existing-project)
- [Supabase External Connections](https://supabase.com/docs/guides/database/connecting-to-postgres)
