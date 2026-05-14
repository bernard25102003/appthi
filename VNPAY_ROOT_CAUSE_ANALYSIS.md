# 🔬 VNPAY Timeout - Technical Root Cause Analysis

## ❌ Vấn đề Xảy Ra

User click thanh toán VNPAY **lần đầu tiên** → Thay vì redirect đến VNPAY payment page, gặp lỗi **"Quá thời gian thanh toán"**.

---

## 🔍 Root Cause

### Scenario: Local Development vs Production

#### ✅ Local Development (Hoạt động bình thường)
```
Dev Computer
│
├─ backend/.env (có VNPAY_TMN_CODE, VNPAY_HASH_SECRET)
│  └─ Khi start: npm run dev
│     └─ Đọc .env → VNPAY credentials load ✅
│
└─ Payment Flow:
   1. User click → createVnpayPayment()
   2. Backend read VNPAY_TMN_CODE từ env.VNPAY_TMN_CODE ✅
   3. Tạo payment URL với hmac signature ✅
   4. Frontend redirect → VNPAY payment page ✅
```

#### ❌ Production (Lỗi xảy ra)
```
Render Server (Production)
│
├─ backend/render.yaml (TRƯỚC FIX - không có VNPAY vars!)
│  └─ Khi deploy:
│     └─ Environment variables: Chỉ DATABASE_URL, JWT_SECRET, ... (NO VNPAY!) ❌
│
└─ Payment Flow:
   1. User click → createVnpayPayment()
   2. Backend try read VNPAY_TMN_CODE
   3. ❌ env.VNPAY_TMN_CODE = undefined (undefined!)
   4. ❌ Can't build VNPAY payment URL
   5. ❌ Error: "VNPAY is not configured"
   
   → Nhưng user thấy: "Quá thời gian thanh toán" (timeout error)
   → Vì frontend lỗi khi call API, hiển thị error message generic
```

---

## 🎯 Tại Sao Cách Fix Này Hoạt Động?

### Trước Fix:
```yaml
# backend/render.yaml
envVars:
  - key: DATABASE_URL
    sync: false
  - key: JWT_SECRET
    sync: false
  # ... many other vars ...
  # ❌ KHÔNG CÓ VNPAY VARIABLES!
  # ❌ Render không biết phải set VNPAY_TMN_CODE gì
  # ❌ Khi app start, env.VNPAY_TMN_CODE = undefined
```

### Sau Fix:
```yaml
# backend/render.yaml
envVars:
  - key: DATABASE_URL
    sync: false
  - key: JWT_SECRET
    sync: false
  # ... other vars ...
  - key: VNPAY_TMN_CODE
    sync: false              ← Render đọc từ environment dashboard
  - key: VNPAY_HASH_SECRET
    sync: false              ← Render đọc từ environment dashboard
  - key: VNPAY_URL
    value: https://...       ← Render set giá trị này
  - key: VNPAY_RETURN_URL
    value: https://...       ← Render set giá trị này
  - key: VNPAY_EXPIRE_DURATION
    value: 30                ← Render set 30 phút
```

**Khi Render deploy:**
1. ✅ Render check render.yaml
2. ✅ Thấy `VNPAY_TMN_CODE` key → "Aha, cần biến này!"
3. ✅ Đi tìm `VNPAY_TMN_CODE` từ environment dashboard  
4. ✅ Set vào app environment
5. ✅ App start → env.VNPAY_TMN_CODE = "03UBH8CS" ✅
6. ✅ Payment flow hoạt động bình thường

---

## 📊 Comparison: render.yaml Config Changes

| Aspect | Trước | Sau |
|--------|------|-----|
| `VNPAY_TMN_CODE` | ❌ Missing | ✅ Added (sync: false) |
| `VNPAY_HASH_SECRET` | ❌ Missing | ✅ Added (sync: false) |
| `VNPAY_URL` | ❌ Missing | ✅ Added (hardcoded) |
| `VNPAY_RETURN_URL` | ❌ Missing | ✅ Added (hardcoded) |
| `VNPAY_EXPIRE_DURATION` | ❌ Missing | ✅ Added (30 min) |

**Note:** 
- `sync: false` = User phải set manually từ Render dashboard
- `value: ...` = Giá trị fixed, không cần set ở dashboard

---

## 🔐 Environment Variables Security

### Sensitive Variables (sync: false)
```yaml
- key: VNPAY_TMN_CODE
  sync: false              ← User phải set manually
- key: VNPAY_HASH_SECRET
  sync: false              ← User phải set manually
```

**Tại sao?** 
- Đây là sensitive credentials
- Không nên commit vào git
- Render dashboard có encryption
- User kiểm soát giá trị

### Public Variables (value: ...)
```yaml
- key: VNPAY_URL
  value: https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
- key: VNPAY_RETURN_URL
  value: https://food.mio.io.vn/vnpay-return
```

**Tại sao?**
- Không sensitive
- URL công khai
- Có thể hardcode

---

## 🧪 Test Hypothesis

### Hypothetical Scenario:
```
1. Developer test locally → ✅ Works (read from .env)
2. Deploy code to GitHub → ✓ Same code
3. Render deploy backend:
   a. Pull code ✅
   b. Install dependencies ✅
   c. Build app ✅
   d. Load env from render.yaml ← ❌ VNPAY vars missing!
   e. Start app ← env.VNPAY_TMN_CODE = undefined
   f. User click payment ← App throw error
   
4. Fix: Add VNPAY vars to render.yaml
5. Render redeploy:
   a. Pull code ✅
   b. Install dependencies ✅
   c. Build app ✅
   d. Load env from render.yaml ← ✅ VNPAY vars present!
   e. Start app ← env.VNPAY_TMN_CODE = "03UBH8CS" ✅
   f. User click payment ← ✅ Works!
```

---

## 📈 Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│ Backend code (orders.service.ts)                        │
│                                                         │
│ private buildVnpayPaymentUrl() {                        │
│   const amount = order.totalPrice * 100;               │
│   const createDate = this.formatVnpDate();             │
│   const expireDate = this.formatVnpDate(               │
│     new Date(Date.now() + env.VNPAY_EXPIRE_DURATION * 60 * 1000)
│   );  ← Đọc từ env!                                     │
│                                                         │
│   const params = {                                      │
│     vnp_TmnCode: env.VNPAY_TMN_CODE, ← Đọc từ env!    │
│     // ... other params ...                             │
│   };                                                    │
│                                                         │
│   // Sign with hmac                                     │
│   const secureHash = crypto                            │
│     .createHmac('sha512', env.VNPAY_HASH_SECRET!) ← Đọc│
│     .update(payload)                                    │
│     .digest('hex');                                     │
│                                                         │
│   return VNPAY_URL + "?" + params + secureHash;        │
│ }                                                       │
└─────────────────────────────────────────────────────────┘
                         ↓
        Tất cả env.VNPAY_* = undefined nếu:
        render.yaml không có VNPAY entries
        + Render dashboard không có env vars set
```

---

## ✅ Fix Applied

1. **Updated `render.yaml`** 
   - ✅ Added `VNPAY_TMN_CODE` with `sync: false`
   - ✅ Added `VNPAY_HASH_SECRET` with `sync: false`
   - ✅ Added `VNPAY_URL` with hardcoded value
   - ✅ Added `VNPAY_RETURN_URL` with hardcoded value
   - ✅ Added `VNPAY_EXPIRE_DURATION` with value 30

2. **Next Step: Deploy**
   - User must set `VNPAY_TMN_CODE` & `VNPAY_HASH_SECRET` in Render dashboard
   - Trigger redeploy

---

## 🎓 Learning Point

**Golden Rule for 12-Factor App:**
> Every configuration that varies between environments should be:
> 1. NOT hardcoded in source
> 2. NOT hardcoded in deployment config (render.yaml)
> 3. Store in environment variables
> 4. Load at runtime from env

**render.yaml Purpose:**
- Define **what** env vars are needed
- Tell platform (Render): "Hey, I need VNPAY_TMN_CODE from somewhere"
- Render dashboard stores actual **values** securely
- At runtime: process.env.VNPAY_TMN_CODE = value from dashboard

---

**Version:** 1.0  
**Date:** 2026-05-14
