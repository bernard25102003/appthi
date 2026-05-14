# ⚡ VNPAY TIMEOUT FIX - QUICK ACTION PLAN

## 📌 Vấn đề
Payment page timeout ngay cả khi user click lần đầu → **VNPAY env vars không được deploy**

## 🎯 Giải Pháp (5 Phút)

### Bước 1: Kiểm tra Code (DONE ✓)
```
✅ backend/render.yaml - Đã thêm VNPAY variables
✅ backend/.env - Đã có VNPAY_EXPIRE_DURATION=30
✅ orders.service.ts - Đã dùng dynamic config
```

### Bước 2: Update trên Render (IMMEDIATE)
1. Mở https://render.com/dashboard
2. Chọn "ecommerce-backend"
3. Vào tab **Environment**
4. Kiểm tra/cập nhật 5 biến này:
   - `VNPAY_TMN_CODE` = `03UBH8CS` ← Check value
   - `VNPAY_HASH_SECRET` = `SSS6QHCFOAPXIH4CD42FOJNBP8NI9SS5` ← Check value
   - `VNPAY_URL` = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`
   - `VNPAY_RETURN_URL` = `https://food.mio.io.vn/vnpay-return`
   - `VNPAY_EXPIRE_DURATION` = `30`
5. **Save** (⚠️ Này sẽ auto-redeploy)

### Bước 3: Đợi Deploy (5-10 phút)
Vào **Render Dashboard** → Backend → Logs → Chờ xanh ✅

### Bước 4: Test (1 phút)
1. Vào https://food.mio.io.vn
2. Checkout → VNPAY → Submit
3. ✅ Không timeout = OK!

---

## ⚠️ Nếu Vẫn Lỗi

### Cách Kiểm Tra:
1. Vào Render Logs
2. Tìm dòng `[VNPAY]` trong logs
3. Nếu không có → Environment vars không load
4. Nếu có error → Kiểm tra credentials

### Kiểm Tra Server Time (Optional):
```bash
# SSH vào Render nếu có
date
timedatectl status
```

---

## 📱 Thông Tin Liên Lạc
Nếu vẫn gặp issue sau khi follow steps này, cần check:
1. VNPAY credentials có đúng không?
2. VNPAY_RETURN_URL có khớp với domain không?
3. Server time có sync không?

---

**⏱️ Estimated time to fix: 10-15 minutes**
