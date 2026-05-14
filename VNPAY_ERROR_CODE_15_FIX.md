# 🔧 VNPay Error Code 15 - Complete Diagnostic & Fix Guide

## 🐛 Vấn đề (Problem)
Khi click "Thanh toán", bị redirect tới:
```
https://sandbox.vnpayment.vn/paymentv2/Payment/Error.html?code=15
```

**Error Code 15 meaning:** "Invalid transaction specification" - Các thông số thanh toán gửi đi không hợp lệ hoặc sai format.

---

## ✅ Các Fix Đã Áp Dụng (Just Now)

### 1. **Fixed Amount Formatting** ✅
**Problem:** Decimal amount được format sai
```typescript
// ❌ TRƯỚC (sai)
const amount = order.totalPrice.mul(100).toFixed(0);  // Trả về string like "100000.0"

// ✅ SAU (đúng)
const amount = Math.floor(order.totalPrice.toNumber() * 100).toString();  // "100000"
```

### 2. **Fixed Parameter Encoding** ✅
**Problem:** Numeric parameters như `vnp_Amount` được URL-encode, làm VNPay không nhận dạng
```typescript
// ✅ Now: Special handling for numeric fields
if (key === 'vnp_Amount') {
  return `${key}=${value}`;  // No encoding for amounts
}
```

### 3. **Improved TxnRef** ✅
**Problem:** Order ID format có thể không compatible với VNPay
```typescript
// ❌ TRƯỚC
vnp_TxnRef: order.id  // e.g., "cmp5m4m8u0001jm07bd0erqdv"

// ✅ SAU
vnp_TxnRef: order.orderNumber || order.id  // e.g., "ORD001" (more numeric)
```

### 4. **Added Debug Logging** ✅
Giờ có detail logging cho tất cả payment parameters

### 5. **Added Debug Endpoint** ✅
Mới thêm endpoint để test parameters:
```
GET /api/orders/debug/vnpay-params?amount=100000&orderNumber=TEST001
```

---

## 🚀 Deployment Steps

### Step 1: Redeploy Backend (5 min)
1. Các fix ở trên đã được apply vào code
2. Push code lên GitHub
3. Render sẽ auto-deploy hoặc click "Manual Deploy"
4. Đợi deployment hoàn tất (~5 phút)

### Step 2: Test Configuration (1 min)
Truy cập debug endpoint:
```
https://appthi.onrender.com/api/orders/debug/vnpay-config
```

**Expected response:**
```json
{
  "VNPAY_TMN_CODE": "✅ SET",
  "VNPAY_HASH_SECRET": "✅ SET",
  "VNPAY_EXPIRE_DURATION": "30 minutes",
  "VNPAY_URL": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  "VNPAY_RETURN_URL": "https://food.mio.io.vn/vnpay-return",
  "NODE_ENV": "production",
  "SERVER_TIME": "2026-05-14T...",
  "TIMEZONE": "not set (default: UTC)"
}
```

### Step 3: Test Payment Parameters (1 min)
```
https://appthi.onrender.com/api/orders/debug/vnpay-params?amount=100000&orderNumber=ORD0001
```

**Expected response:**
```json
{
  "DEBUG_INFO": "Simulated VNPAY payment URL generation",
  "fullPaymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Version=2.1.0&vnp_Command=pay&vnp_TmnCode=03UBH8CS&vnp_Amount=100000&vnp_CurrCode=VND&vnp_TxnRef=ORD0001&...",
  "parameters": {
    "vnp_Version": "2.1.0",
    "vnp_Command": "pay",
    "vnp_Amount": "100000",
    "vnp_TxnRef": "ORD0001",
    ...
  }
}
```

### Step 4: Test Real Payment (2 min)
1. Truy cập https://food.mio.io.vn
2. Login
3. Add product → Checkout
4. Select "VNPAY" payment method
5. Click "Thanh toán"

**Expected behavior:**
- ✅ Redirect tới VNPay payment page (không phải error page)
- ✅ Có thể nhập VNPAY test card

---

## 📋 VNPay Sandbox Test Cards

If error code 15 persists after deployment:

| Card Number | Expiry | OTP |
|------------|--------|-----|
| 9704198526191432198 | 12/26 | 123456 |
| 9704198526191432195 | 12/26 | 123456 |

---

## 🔍 If Error Code 15 Still Occurs

### Check 1: Verify Backend Logs
1. Render Dashboard → Backend service → Logs
2. Search for `[VNPAY] Building payment URL`
3. Look for this log to verify parameters:
```
[VNPAY] Payment parameters before hashing: { ... }
```

### Check 2: Verify Payment Parameters
Call debug endpoint and compare:

| Parameter | Expected | Your Value |
|-----------|----------|-----------|
| `vnp_Amount` | Integer string like "100000" | ? |
| `vnp_TxnRef` | Alphanumeric like "ORD0001" | ? |
| `vnp_CreateDate` | Format: YYYYMMDDhhmmss like "20260514145748" | ? |
| `vnp_ExpireDate` | 30 min after create like "20260514152748" | ? |
| `vnp_CurrCode` | Exactly "VND" | ? |
| `vnp_Locale` | Exactly "vn" | ? |

### Check 3: Verify Credentials
Make sure on Render dashboard:
- `VNPAY_TMN_CODE` = "03UBH8CS" (or your test TMN code)
- `VNPAY_HASH_SECRET` = "SSS6QHCFOAPXIH4CD42FOJNBP8NI9SS5" (or your secret)

**⚠️ Note:** These are test credentials. In production, use real credentials.

### Check 4: Server Time Zone Issue
If dates are calculated wrong:

**Add to Render environment:**
```
TZ=Asia/Ho_Chi_Minh
```

Or check in logs:
```
"timezone": "not set (default: UTC)"
```

---

## 🛠️ Other Possible Causes

### If Amount is Invalid
VNPay requires minimum amount. If order < 1000 VND:

**Solution:** 
- Test with amount >= 100000 VND (~ $4 USD)
- Or adjust test order amounts

### If TxnRef Contains Special Characters
Order ID might have characters VNPay rejects.

**Solution:** Already fixed - now uses `orderNumber` instead.

### If Secure Hash is Invalid
Hash signature mismatch causes error code 15.

**Solution:** 
- Verify `VNPAY_HASH_SECRET` matches your account
- Check log: `[VNPAY] Secure hash generated`

---

## ✅ Checklist Before Testing

- [ ] Redeploy backend after code changes
- [ ] Wait 5 minutes for deployment to complete
- [ ] Check `/api/orders/debug/vnpay-config` returns "✅ SET"
- [ ] Check `/api/orders/debug/vnpay-params` returns valid parameters
- [ ] Verify amount is >= 100000 VND
- [ ] Verify `VNPAY_EXPIRE_DURATION` = 30 minutes
- [ ] Verify timezone is set or UTC is correct
- [ ] Try payment with sandbox test card

---

## 📝 Notes

- These debug endpoints (`/debug/vnpay-config`, `/debug/vnpay-params`) should be **removed after fixing** to avoid exposing sensitive info
- Check backend logs in Render for detailed error messages
- If still failing, collect the full payment URL from debug endpoint and check with VNPay documentation

---

**Last Updated:** May 14, 2026
**Status:** ✅ Fixes Applied - Awaiting Deployment & Testing
