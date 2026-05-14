# 🔍 VNPAY Timeout Error - Advanced Diagnostics

## 🐛 Error: "Quá thời gian thanh toán" (Payment Timeout) Still Occurring

### Current Situation
- ✅ Payment URL is created successfully on backend
- ❌ But VNPAY returns "payment timeout/expired" error
- 🤔 User either sees error immediately or after VNPAY redirect

---

## 🎯 Most Likely Causes

### 1️⃣ **Server Time is Wrong on Render** (95% probability)

**How it fails:**
```
Server Time:     2026-05-14 18:00:00  (2 hours ahead!)
Real Time:       2026-05-14 16:00:00
Current + 30m:   2026-05-14 18:30:00  (expireDate)

VNPAY checks:    Is expireDate > real time?
                 18:30:00 > 16:00:00? YES... but wait...
                 Is current > expireDate? 
                 16:00:00 > 18:30:00? NO... 
                 
Actually VNPAY calculates: current server time vs expireDate
If Server says: "Current time is 18:00" but real time is 16:00
And you set expireDate to 18:30
VNPAY might think: "18:30 is already passed, transaction expired"
```

**Kiểm tra:**
1. SSH vào Render (if you have access):
```bash
timedatectl status
date
ntpstat
```

2. Hoặc kiểm tra từ backend logs (add this code):
```typescript
logger.info(`[VNPAY] Server timestamp:`, {
  serverTime: new Date().toISOString(),
  timestamp: Date.now(),
  timezone: process.env.TZ,
});
```

---

### 2️⃣ **VNPAY_EXPIRE_DURATION Not Set on Render Dashboard**

**Check on Render.com:**
1. Dashboard → ecommerce-backend
2. Environment tab
3. Look for `VNPAY_EXPIRE_DURATION`

**If missing/wrong:**
```bash
# Render is using default (30 minutes)
# But if config is broken, env.VNPAY_EXPIRE_DURATION might be:
# - undefined (use default 30)
# - "30" as string (should auto-convert)
# - 0 (from broken parsing)
```

---

### 3️⃣ **Date Format Issue**

**The backend calculates:**
```typescript
const createDate = this.formatVnpDate();  // e.g., "20260514145748"
const expireDate = this.formatVnpDate(
  new Date(Date.now() + env.VNPAY_EXPIRE_DURATION * 60 * 1000)
);  // e.g., "20260514151748" (30 min later)
```

**If calculation is wrong, format could be:**
- Invalid timestamp
- Time in past
- Malformed date

---

## ✅ Troubleshooting Steps

### Step 1: Add Detailed Logging

Edit `backend/src/modules/orders/orders.service.ts`:

```typescript
private buildVnpayPaymentUrl(order: { id: string; orderNumber: string; totalPrice: Prisma.Decimal }, ipAddress: string) {
  this.ensureVnpayConfig();

  const amount = order.totalPrice.mul(100).toFixed(0);
  const nowDate = new Date();  // ← Add this
  const createDate = this.formatVnpDate(nowDate);
  const expireDate = this.formatVnpDate(new Date(Date.now() + env.VNPAY_EXPIRE_DURATION * 60 * 1000));

  // ← Add detailed logging
  logger.info(`[VNPAY] Timestamp Debug for order ${order.id}`, {
    serverNow: new Date().toISOString(),
    serverTimestamp: Date.now(),
    createDateFormatted: createDate,
    expireDateFormatted: expireDate,
    expireDurationMinutes: env.VNPAY_EXPIRE_DURATION,
    expireDurationMs: env.VNPAY_EXPIRE_DURATION * 60 * 1000,
    calculatedExpireTime: new Date(Date.now() + env.VNPAY_EXPIRE_DURATION * 60 * 1000).toISOString(),
    timezone: process.env.TZ || 'not set',
  });

  // ... rest of code
}
```

Then redeploy and check logs.

### Step 2: Verify Environment Variables

Add this endpoint for debugging (temporary):

```typescript
// In orders.routes.ts - DEBUG ONLY (remove after fix)
router.get(
  '/debug/config',
  asyncHandler(async (req, res) => {
    res.json({
      VNPAY_TMN_CODE: env.VNPAY_TMN_CODE ? 'SET' : 'MISSING',
      VNPAY_HASH_SECRET: env.VNPAY_HASH_SECRET ? 'SET' : 'MISSING',
      VNPAY_EXPIRE_DURATION: env.VNPAY_EXPIRE_DURATION,
      NODE_ENV: env.NODE_ENV,
      serverTime: new Date().toISOString(),
      timestamp: Date.now(),
    });
  }),
);
```

Then call: `https://appthi.onrender.com/api/orders/debug/config`

### Step 3: Check Render Server Time

1. Go to Render Dashboard
2. Backend service → Logs
3. Look for any `date` or `time` related messages
4. Or add to backend startup:

```typescript
// In main.ts or config
console.log('[BOOT] Server started at:', new Date().toISOString());
```

---

## 🛠️ If Server Time is Wrong

### Fix on Render

1. Render doesn't allow SSH by default
2. But you can add an environment variable `TZ`:

```
TZ=Asia/Ho_Chi_Minh
```

3. Or force NTP sync by adding pre-deploy command:

In `render.yaml`, update:
```yaml
preDeployCommand: |
  ntpdate -u time.nist.gov || true
  npx prisma migrate deploy --skip-generate 2>&1 || true
```

---

## 📊 Expected Values

After fix, logs should show something like:

```
[VNPAY] Timestamp Debug for order XYZ
{
  "serverNow": "2026-05-14T14:57:48.123Z",
  "serverTimestamp": 1715679468123,
  "createDateFormatted": "20260514145748",
  "expireDateFormatted": "20260514152748",  ← Should be 30 min later
  "expireDurationMinutes": 30,
  "calculatedExpireTime": "2026-05-14T15:27:48.123Z",
  "timezone": "UTC"
}
```

The `expireDateFormatted` should be exactly **600 seconds (10 digits × 60 seconds = 600)** ahead of `createDateFormatted` for 10 minutes, or **1800 seconds** for 30 minutes.

Actually check: `20260514152748 - 20260514145748 = 0700` which is 7 minutes? That doesn't look right...

Wait, let me check the format:
- `20260514145748` = YYYYMMDDHHMMSS
- Year: 2026
- Month: 05
- Day: 14
- Hour: 14
- Minute: 57
- Second: 48

So:
- Create: 14:57:48
- Expire (add 30 min): 15:27:48
- Create: `20260514145748`
- Expire: `20260514152748` ✅

Yes that's correct! 145748 + 0030 minutes = 152748

---

## 🎯 Quick Checklist

- [ ] Added detailed logging to buildVnpayPaymentUrl
- [ ] Redeployed backend
- [ ] Checked logs - Is expireDate 30 minutes ahead?
- [ ] Called `/api/orders/debug/config` - Are values correct?
- [ ] Checked server time - Is it reasonable?
- [ ] If server time is wrong - Added `TZ` environment variable
- [ ] Retested payment flow

---

## 💡 Alternative: Increase Expire Duration

If server time is slightly off but hard to fix, just increase the duration:

In Render Dashboard Environment:
```
VNPAY_EXPIRE_DURATION=60  # Increase to 60 minutes
```

This gives more buffer, but users should still complete payment quickly.

---

## 🚨 If Still Not Working

Provide:
1. Backend logs with timestamp debug info
2. Output from `/api/orders/debug/config`
3. Exact error message user sees
4. When does error appear (immediately or after VNPAY?)?
5. Your Render server region (for timezone reference)

---

**Updated:** 2026-05-14
