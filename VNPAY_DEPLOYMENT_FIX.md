# 🔧 VNPAY Payment Timeout - Deployment Fix Guide

## 🐛 Vấn đề (Problem)
Sau khi deploy lên production, khi user click thanh toán VNPAY **lần đầu tiên**, trang sẽ trả về **"timeout quá thời gian thanh toán"** mặc dù user vừa click.

**Nguyên nhân gốc rễ:** Biến cấu hình VNPAY không được set trong `render.yaml`, nên production server không nhận được VNPAY credentials và settings.

---

## ✅ Các Fix Đã Áp Dụng

### 1. **Cập nhật `backend/render.yaml`** (DONE ✓)
Thêm tất cả VNPAY environment variables vào deployment configuration:

```yaml
envVars:
  # ... existing variables ...
  - key: VNPAY_TMN_CODE
    sync: false
  - key: VNPAY_HASH_SECRET
    sync: false
  - key: VNPAY_URL
    value: https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
  - key: VNPAY_RETURN_URL
    value: https://food.mio.io.vn/vnpay-return
  - key: VNPAY_EXPIRE_DURATION
    value: 30  # 30 phút
```

**Tại sao?**
- `VNPAY_TMN_CODE` & `VNPAY_HASH_SECRET`: Credentials để xác thực với VNPay
- `VNPAY_URL`: Sandbox URL của VNPay  
- `VNPAY_RETURN_URL`: Frontend callback URL sau thanh toán
- `VNPAY_EXPIRE_DURATION`: Thời gian hết hạn thanh toán (30 phút thay vì 15 phút cũ)

---

## 🚀 Hướng Dẫn Triển Khai (Deployment Steps)

### Step 1: Cập nhật trên Render
1. Đi tới **Render.com** → **Dashboard** → Backend service (ecommerce-backend)
2. Vào **Environment** tab
3. Thêm/cập nhật các biến sau:
   - `VNPAY_TMN_CODE` = `03UBH8CS` (hoặc giá trị của bạn)
   - `VNPAY_HASH_SECRET` = `SSS6QHCFOAPXIH4CD42FOJNBP8NI9SS5` (hoặc giá trị của bạn)
   - `VNPAY_URL` = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`
   - `VNPAY_RETURN_URL` = `https://food.mio.io.vn/vnpay-return`
   - `VNPAY_EXPIRE_DURATION` = `30`

4. Click **Save**

### Step 2: Redeploy backend
1. Vào **Dashboard** → **ecommerce-backend**
2. Click **Manual Deploy** hoặc push code mới lên GitHub để trigger auto-deploy
3. Đợi deployment hoàn thành (khoảng 5-10 phút)

### Step 3: Test VNPAY payment
1. Truy cập https://food.mio.io.vn
2. Login & thêm sản phẩm vào giỏ
3. Checkout → Chọn "VNPAY"
4. Click nút thanh toán
5. ✅ Không nên gặp timeout

---

## 🔍 Kiểm Tra Logs

Sau khi deploy, kiểm tra backend logs trên Render:

1. Vào Render Dashboard → Backend service
2. Chọn tab **Logs**
3. Kiểm tra xem có dòng nào sau khi click thanh toán:

```
[VNPAY] Building payment URL for order...
[VNPAY] Payment URL created successfully...
[VNPAY] Verifying payment return...
```

✅ Nếu thấy các dòng này → Setup đúng

❌ Nếu không thấy → Kiểm tra environment variables có đúng chưa

---

## 🐛 Troubleshooting

### Triệu chứng 1: Trang payment hiển thị lỗi "VNPAY not configured"
**Nguyên nhân:** Thiếu `VNPAY_TMN_CODE` hoặc `VNPAY_HASH_SECRET`  
**Giải pháp:** 
1. Kiểm tra Render environment variables
2. Redeploy backend

### Triệu chứng 2: Payment URL được tạo nhưng không redirect  
**Nguyên nhân:** `VNPAY_URL` hoặc `VNPAY_RETURN_URL` sai  
**Giải pháp:**
1. Kiểm tra URL có đúng không
2. Kiểm tra CORS configuration
3. Redeploy

### Triệu chứng 3: Vẫn timeout khi user click  
**Nguyên nhân:** 
- Server time không sync với VNPay
- Expire time quá ngắn
- Network issue

**Giải pháp:**
```bash
# SSH vào server Render (nếu có)
# Kiểm tra server time
date

# Kiểm tra time sync status
timedatectl status

# Nếu time sai, sync lại
timedatectl set-ntp true
```

---

## 📋 Các File Đã Sửa

| File | Thay đổi |
|------|----------|
| `backend/render.yaml` | ✅ Thêm tất cả VNPAY env vars |
| `backend/.env` | ✅ Đã có `VNPAY_EXPIRE_DURATION=30` |
| `backend/src/config/env.ts` | ✅ Schema validation có sẵn |
| `backend/src/modules/orders/orders.service.ts` | ✅ Đã dùng dynamic config |

---

## ✨ Các Cải Tiến Khác

### Logging Details
Backend sẽ log chi tiết mỗi lần payment:
- Order ID, amount, expire time
- Response code từ VNPay  
- Lỗi xác thực (nếu có)

Giúp debug dễ hơn khi có issue.

### Payment Timeout Flexibility  
- Từ hard-coded 15 phút → 30 phút (có thể điều chỉnh)
- Có thể tăng lên 45 phút nếu cần: `VNPAY_EXPIRE_DURATION=45`

---

## 🎯 Checklist Hoàn Thành

- [x] Thêm VNPAY env vars vào render.yaml
- [ ] Cập nhật trên Render Dashboard
- [ ] Redeploy backend
- [ ] Test thanh toán VNPAY
- [ ] Kiểm tra logs có VNPAY messages không
- [ ] Nếu vẫn lỗi → Check server time sync

---

## 📞 Nếu Vẫn Gặp Sự Cố

1. **Kiểm tra logs trên Render** (xem lỗi cụ thể)
2. **Đảm bảo VNPAY credentials đúng** (TMN_CODE, HASH_SECRET)
3. **Test API directly:**
   ```bash
   curl https://appthi.onrender.com/health
   ```
4. **Kiểm tra CORS configuration** (production URLs có trong whitelist)
5. **Kiểm tra server time sync** với NTP

---

**Last Updated:** 2026-05-14
