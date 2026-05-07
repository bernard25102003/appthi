# 🎯 Hướng Dẫn Deploy Từng Bước (Tiếng Việt)

## BƯỚC 1️⃣ - Tạo Database PostgreSQL trên Render

```
1. Vào https://render.com
2. Nhấn "New" → chọn "PostgreSQL"
3. Điền thông tin:
   - Name: ecommerce-db
   - Region: Singapore
   - PostgreSQL Version: 16
   - Plan: Free (hoặc Starter)
4. Nhấn "Create Database"
5. ⏳ Chờ ~2 phút để database được tạo
6. 📋 Sao chép URL (Database → Info → Internal Database URL)
   Format: postgresql://user:password@hostname.com:5432/dbname
```

---

## BƯỚC 2️⃣ - Deploy Backend lên Render

### Chuẩn bị:
- GitHub account có repository
- Backend code push lên GitHub
- File `.dockerignore` ✅ (đã tạo)
- File `render.yaml` ✅ (đã tạo)

### Deploy:
```
1. Vào https://render.com Dashboard
2. Nhấn "New" → "Web Service"
3. Chọn "Connect a repository" → chọn GitHub repo
4. Điền:
   - Name: ecommerce-backend
   - Root Directory: backend/ (QUAN TRỌNG!)
   - Environment: Docker (tự động detect từ Dockerfile)
   - Region: Singapore
   - Branch: main (hoặc branch bạn dùng)
   - Plan: Starter ($7/month) hoặc Experimental (free)

5. Nhấn "Create Web Service"
6. ⏳ Chờ build (5-10 phút) → xem Logs
7. Khi status = "Live ✓" là done!
8. 📋 Lưu URL: https://ecommerce-backend-XXXXX.onrender.com
```

### Thêm Environment Variables:
```
Dashboard → Web Service → Environment

Thêm các biến này:

NODE_ENV                 = production
DATABASE_URL             = [URL từ Bước 1️⃣]
JWT_SECRET               = [sinh random: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
JWT_REFRESH_SECRET       = [sinh random]
IMAGEKIT_PUBLIC_KEY      = [your-key]
IMAGEKIT_PRIVATE_KEY     = [your-key]
IMAGEKIT_URL_ENDPOINT    = [your-endpoint]
CORS_ORIGIN              = https://your-domain.vercel.app [CẬP NHẬT SAU]
LOG_LEVEL                = info

Nhấn "Save" → Backend tự động redeploy
```

### Test Backend:
```
Mở terminal:
curl https://ecommerce-backend-XXXXX.onrender.com/health

Nếu kết quả có {"status":"ok"} → ✅ Backend working!
```

---

## BƯỚC 3️⃣ - Deploy Admin Dashboard lên Vercel

```
1. Vào https://vercel.com (đăng nhập GitHub)
2. Nhấn "Add New..." → "Project"
3. Chọn GitHub repository
4. Cấu hình:
   - Framework: Vite (tự động detect)
   - Root Directory: admin-client/
   - Build Command: npm run build
   - Output Directory: dist
5. Environment Variables (quan trọng!):
   
   VITE_API_BASE_URL = https://ecommerce-backend-XXXXX.onrender.com
   VITE_API_URL      = https://ecommerce-backend-XXXXX.onrender.com/api
   
6. Nhấn "Deploy"
7. ⏳ Chờ build (2-5 phút)
8. Status = "Ready" → ✅ Done!
9. 📋 Lưu URL: https://admin-[hash].vercel.app
```

---

## BƯỚC 4️⃣ - Deploy User Site lên Vercel

```
Lặp lại Bước 3️⃣ nhưng:
- Root Directory: user-client/
- Environment Variables giống admin
```

---

## BƯỚC 5️⃣ - Cập nhật CORS ở Backend

```
Render Dashboard → Backend Service → Environment

Cập nhật CORS_ORIGIN:

Nếu 1 frontend:
CORS_ORIGIN = https://admin-hash.vercel.app

Nếu 2 frontend:
CORS_ORIGIN = https://admin-hash.vercel.app,https://user-hash.vercel.app

Nhấn "Save" → Backend redeploy tự động
```

---

## ✅ KIỂM TRA KẾT QUẢ

### 1. Backend working?
```
curl https://ecommerce-backend-XXXXX.onrender.com/health
→ Nếu thấy {"status":"ok"} = ✅
```

### 2. Frontend loading?
```
Mở https://admin-hash.vercel.app
→ Nếu không có lỗi = ✅
```

### 3. API connections?
```
Mở admin dashboard
Nhấn F12 (mở DevTools)
Đi tới Network tab
Thử login/register
→ Nếu không có CORS error = ✅
```

### 4. Xem Logs nếu có lỗi:
```
Backend: Render → Service → Logs
Frontend: Vercel → Deployments → [version] → Logs
Browser: F12 → Console
```

---

## 🎓 GIẢI THÍCH TỪNG PHẦN

### Tại sao cần .dockerignore?
- Bỏ file không cần thiết từ Docker image
- Giảm kích thước image → deploy nhanh hơn

### Tại sao cần Environment Variables?
- Database URL, JWT secrets an toàn
- Không hardcode vào code
- Có thể thay đổi mà không cần redeploy code

### Tại sao cần CORS_ORIGIN?
- Backend chỉ cho phép request từ domain cụ thể
- Ngăn chặn request từ domain khác
- Frontend domain phải match với CORS_ORIGIN

### Tại sao Vite cần VITE_ prefix?
- Vite chỉ expose biến có prefix VITE_ cho frontend
- Bảo vệ secret không bị expose (chỉ nhạy cảm ở backend)

---

## 🆘 TROUBLESHOOTING NHANH

| Vấn đề | Cách Fix |
|--------|---------|
| Backend fail deploy | Kiểm tra Render Logs, xem error gì |
| Frontend CORS error | Cập nhật CORS_ORIGIN ở backend env vars |
| 502 Bad Gateway | Backend down, kiểm tra Render service |
| Can't login | Kiểm tra backend logs, database connection |
| Env vars không load | Redeploy service sau khi update |
| Database connection error | Kiểm tra DATABASE_URL format, syntax |

---

## 💰 TÍNH CHÍ PHÍ (Gần đúng)

| Dịch vụ | Plan | Chi phí/Tháng |
|---------|------|--------------|
| Backend (Render) | Starter | $7 |
| Database (Render) | Starter | $7 |
| Frontend (Vercel) | Free | $0 |
| **Tổng** | | **~$14** |

---

## 📝 CHECKLIST HOÀN TẤT

```
Backend:
☐ Database PostgreSQL tạo xong
☐ Backend service deployed
☐ Environment variables set
☐ Backend health check OK
☐ Logs xem OK

Frontend:
☐ Admin dashboard deployed
☐ User site deployed
☐ Environment variables set
☐ Frontend loading OK
☐ No console errors

Cuối cùng:
☐ CORS updated
☐ Test login/register
☐ API calls working
☐ Performance OK
☐ 🎉 Deployment hoàn tất!
```

---

## 🔗 LINKS CẦN THIẾT

- Render: https://render.com
- Vercel: https://vercel.com
- GitHub: https://github.com
- ImageKit (optional): https://imagekit.io
- Redis (optional): https://redis.com

---

## 💡 TIPS

✅ **LÀM:**
- Kiểm tra code trước push
- Monitor logs thường xuyên
- Backup database định kỳ
- Update dependencies thường xuyên

❌ **KHÔNG LÀM:**
- Hardcode secrets vào code
- Deploy code untested
- Share .env files công khai
- Bỏ qua warning/error logs

---

**Mọi câu hỏi, tham khảo file DEPLOYMENT_GUIDE.md hoặc DEPLOYMENT_CHECKLIST.md**

**Good luck! 🚀**
