# 🚀 Quick Start Deploy Guide - Render + Vercel

## Backend Deploy (Render + Docker)

### Step 1: Tạo Database PostgreSQL trên Render
```
1. Vào render.com → New → PostgreSQL
2. Name: ecommerce-db
3. Region: Singapore
4. Plan: Free/Starter
5. Lưu DATABASE_URL (format: postgresql://...)
```

### Step 2: Deploy Backend Service
```
1. render.com → New → Web Service
2. Connect GitHub repository
3. Root Directory: backend/
4. Environment: Docker
5. Build Command: npm ci && npx prisma generate && npm run build
6. Start Command: npx prisma migrate deploy && node dist/main.js
7. Plan: Starter ($7/month) or Experimental (free)
```

### Step 3: Set Environment Variables (QUAN TRỌNG!)
```
NODE_ENV=production
DATABASE_URL=postgresql://...  [từ bước 1]
JWT_SECRET=<generate-random-min-16-chars>
JWT_REFRESH_SECRET=<generate-random-min-16-chars>
CORS_ORIGIN=https://yourdomain.vercel.app  [sẽ update sau]
IMAGEKIT_PUBLIC_KEY=<your-key>
IMAGEKIT_PRIVATE_KEY=<your-key>
IMAGEKIT_URL_ENDPOINT=<your-endpoint>
LOG_LEVEL=info
```

### Step 4: Deploy
```
Click "Create Web Service" → Chờ deploy (5-10 phút)
Backend URL: https://ecommerce-backend-xxxx.onrender.com
```

---

## Frontend Deploy (Vercel)

### Step 1: Deploy Admin Client
```
1. vercel.com → Import Project
2. Chọn GitHub repository
3. Framework: Vite
4. Root Directory: admin-client/
5. Build Command: npm run build
6. Output: dist
```

### Step 2: Set Environment Variables
```
VITE_API_BASE_URL=https://ecommerce-backend-xxxx.onrender.com
VITE_API_URL=https://ecommerce-backend-xxxx.onrender.com/api
```

### Step 3: Deploy
```
Click Deploy → Chờ build (2-5 phút)
Frontend URL: https://yourdomain.vercel.app
```

### Step 4: Deploy User Client (lặp lại Step 1-3)
```
Tương tự nhưng Root Directory: user-client/
```

---

## Update CORS sau khi có Vercel URL

```
Render Backend → Environment Variables
Cập nhật: CORS_ORIGIN=https://yourdomain.vercel.app
Redeploy backend
```

---

## Testing

### Test Backend
```
curl https://ecommerce-backend-xxxx.onrender.com/health
```

### Test Frontend → Backend Connection
```
Mở Browser Console
Kiểm tra Network tab khi gọi API
Không được có CORS error
```

---

## Useful Commands

### Local Testing trước deploy
```bash
# Backend
cd backend
npm run build
npm run start

# Frontend
cd admin-client
npm run build
npm run dev
```

### Check Logs
```
Render: Dashboard → Logs
Vercel: Deployments → click deployment → Logs
```

### Rollback Deploy
```
Render: Dashboard → Logs → select previous build → Redeploy
Vercel: Deployments → click previous deployment → Redeploy
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Build fail | Check logs, verify package.json scripts |
| CORS error | Check CORS_ORIGIN in backend env vars |
| 502 Bad Gateway | Check backend is running, restart service |
| Database connection error | Verify DATABASE_URL format |
| Env vars not loading | Redeploy after updating env vars |

---

## Costs (Approximate)

| Service | Plan | Cost/Month |
|---------|------|-----------|
| Render Backend | Starter | $7 |
| Render Database | Starter | $7 |
| Vercel Frontend | Free/Pro | Free - $20 |
| **Total** | | ~$14+ |

---

## Tips & Best Practices

✅ **Do:**
- Lưu DATABASE_URL an toàn, không share public
- Test local trước khi push code
- Monitor logs thường xuyên
- Commit code trước deploy

❌ **Don't:**
- Hardcode secrets/API keys
- Deploy untested code
- Ignore warnings trong build logs
- Share .env files

---

## Next Steps

1. ✅ Tạo Render account
2. ✅ Tạo PostgreSQL database
3. ✅ Deploy backend
4. ✅ Tạo Vercel account
5. ✅ Deploy frontend
6. ✅ Update CORS_ORIGIN
7. ✅ Test connections
8. ✅ Setup custom domain (optional)
9. ✅ Monitor logs & performance
10. ✅ Celebrate! 🎉
