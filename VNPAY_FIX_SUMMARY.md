# VNPay Payment Timeout Issue - Fix Summary

## 🔧 Khắc phục (Fixes Applied)

### 1. **Tăng thời gian hết hạn thanh toán** (Increased Payment Expiry Duration)
- **File**: `backend/.env`
- **Thay đổi**: Thêm cấu hình `VNPAY_EXPIRE_DURATION=30` (mặc định: 30 phút)
- **Lý do**: Thời gian 15 phút quá ngắn, VNPay có thể timeout giao dịch

**Before:**
```env
# Cứng 15 phút trong code
```

**After:**
```env
VNPAY_EXPIRE_DURATION=30  # Có thể điều chỉnh qua env
```

---

### 2. **Cấu hình Expire Duration trong backend** 
- **File**: `backend/src/config/env.ts`
- **Thay đổi**: Thêm schema validation cho `VNPAY_EXPIRE_DURATION`

```typescript
VNPAY_EXPIRE_DURATION: z.coerce.number().default(30), // minutes
```

---

### 3. **Sử dụng cấu hình động** 
- **File**: `backend/src/modules/orders/orders.service.ts`
- **Thay đổi**: Thay đổi từ hard-coded 15 phút sang biến cấu hình

**Before:**
```typescript
const expireDate = this.formatVnpDate(new Date(Date.now() + 15 * 60 * 1000));
```

**After:**
```typescript
const expireDate = this.formatVnpDate(new Date(Date.now() + env.VNPAY_EXPIRE_DURATION * 60 * 1000));
```

---

### 4. **Thêm Logging & Debugging**
- **File**: `backend/src/modules/orders/orders.service.ts`
- **Thay đổi**: Thêm chi tiết logging để theo dõi:
  - Lúc tạo payment URL (thời gian, expire date, order ID)
  - Lúc verify return (response code, current time)
  - Các lỗi xác thực

Logging giúp kiểm tra:
- Thời gian server có đồng bộ không
- Các thông số thanh toán có đúng không
- Khi nào giao dịch timeout

---

## 🔍 Nguyên nhân gốc rễ (Root Causes)

| Nguyên nhân | Tác động | Giải pháp |
|-----------|---------|----------|
| **Expire time quá ngắn (15 phút)** | User bấm thanh toán xong chậm → timeout | Tăng lên 30 phút (hoặc tuỳ chỉnh) |
| **Cứng giá trị trong code** | Không thể điều chỉnh động | Chuyển sang env config |
| **Không có logging** | Khó debug khi có sự cố | Thêm chi tiết logs |
| **Thiếu time sync validation** | Nếu server time sai → VNPay reject | Kiểm tra server time |

---

## ✅ Hướng dẫn Kiểm tra (Testing Guide)

### 1. Kiểm tra logs khi thanh toán
```bash
# Chạy backend
npm start

# Thực hiện thanh toán, xem logs:
# [VNPAY] Building payment URL for order...
# [VNPAY] Payment URL created successfully...
```

### 2. Kiểm tra server time
```bash
# SSH vào server production
ntpstat  # Hoặc systemctl status systemd-timesyncd
date     # Xem current time
```

### 3. Thử thanh toán với thời gian khác nhau
- Bấm ngay lập tức → Không nên timeout
- Chờ 20 phút rồi bấm → Vẫn phải thành công (vì 30 phút expiry)
- Chờ 35 phút rồi bấm → Sẽ timeout (như mong đợi)

---

## 🚀 Khuyến nghị bổ sung (Additional Recommendations)

### 1. **Kiểm tra đồng bộ thời gian Server**
```bash
# Linux/Ubuntu
sudo ntpdate -u time.nist.gov  # Đồng bộ time
sudo systemctl restart systemd-timesyncd
```

### 2. **Tăng Expire Duration nếu cần**
Nếu user thường bấm chậm, có thể tăng lên 45 phút:
```env
VNPAY_EXPIRE_DURATION=45
```

### 3. **Thêm Alert khi Expire gần**
Có thể thêm frontend notification khi còn lại 5 phút:
```javascript
// Còn 5 phút nữa hết hạn
if (timeRemaining < 5 * 60) {
  toast.warning('Thanh toán sắp hết hạn, vui lòng hoàn thành giao dịch');
}
```

### 4. **Retry Logic**
Nếu user bị timeout, cho phép tạo lại payment URL:
```typescript
// CheckoutPage.tsx
const handleRetry = async () => {
  const { paymentUrl } = await createVnpayPayment(formData);
  window.location.href = paymentUrl;
};
```

### 5. **Monitor & Alert**
Thêm monitoring để báo alert khi có nhiều timeout:
```typescript
logger.warn(`[VNPAY] Timeout: Order ${orderId} expired before payment`);
// Gửi alert tới Slack/email
```

---

## 📋 Checklist Triển khai

- [x] Thêm `VNPAY_EXPIRE_DURATION` vào `.env`
- [x] Cập nhật schema validation trong `env.ts`
- [x] Sửa code sử dụng biến cấu hình
- [x] Thêm logging chi tiết
- [ ] Kiểm tra đồng bộ thời gian server
- [ ] Test thanh toán trên production
- [ ] Monitor logs trong 24-48h đầu
- [ ] Điều chỉnh VNPAY_EXPIRE_DURATION nếu cần

---

## 📞 Support

**Nếu vẫn bị timeout sau fix:**
1. Kiểm tra logs: `tail -f backend/logs/app.log | grep VNPAY`
2. Xem server time: `date`
3. Liên hệ VNPay support với thông tin:
   - Mã TMN Code: `03UBH8CS`
   - Thời gian transaction: `14/05/2026 9:28:12`
   - Transaction ID: `w7KHo5Dy30`
   - Logs chi tiết từ backend

---

**Cập nhật**: 14/05/2026
