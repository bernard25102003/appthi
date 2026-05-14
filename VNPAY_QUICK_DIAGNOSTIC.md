# ⚡ VNPAY Timeout - Quick Diagnostic Steps

## 🎯 What I Just Added

1. ✅ **Detailed timestamp logging** in payment URL creation
2. ✅ **Debug endpoint** to check VNPAY config
3. ✅ **Server startup time logging**

---

## 📋 Immediate Action Plan

### Step 1: Redeploy Backend (2 min)
```bash
# Push new code to GitHub or redeploy on Render
# New logs with diagnostic info will appear
```

### Step 2: Check Debug Config (1 min)
Visit this URL in your browser:
```
https://appthi.onrender.com/api/orders/debug/vnpay-config
```

You should see something like:
```json
{
  "VNPAY_TMN_CODE": "✅ SET",
  "VNPAY_HASH_SECRET": "✅ SET",
  "VNPAY_EXPIRE_DURATION": "30 minutes",
  "NODE_ENV": "production",
  "SERVER_TIME": "2026-05-14T14:57:48.123Z",
  "SERVER_TIMESTAMP": 1715679468123,
  "TIMEZONE": "not set (default: UTC)"
}
```

**Key things to check:**
- ❌ If `VNPAY_TMN_CODE` or `VNPAY_HASH_SECRET` show `MISSING` → Set them on Render dashboard
- ❌ If `VNPAY_EXPIRE_DURATION` ≠ 30 → Check Render dashboard
- ⚠️ If `TIMEZONE` = "not set" → This might cause issues

### Step 3: Try Payment and Check Logs (3 min)
1. Go to https://food.mio.io.vn
2. Add product → Checkout → Select "VNPAY"
3. Click "Thanh toán"
4. Go to Render Dashboard → Backend Logs
5. Search for `[VNPAY] Timestamp Debug`

**Expected log output:**
```
[VNPAY] Timestamp Debug for order cmp5m4m8u0001jm07bd0erqdv
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

---

## 🔍 What to Look For

### If Server Time is WRONG
```
❌ BAD: "serverNow": "2026-05-15T10:00:00Z"  but real time is 14:57

Why this breaks:
- Render thinks it's May 15, 10:00 AM
- Real time is May 14, 2:57 PM (yesterday from Render's perspective!)
- Payment expires in 30 min = May 15, 10:30 AM (from Render's perspective)
- VNPAY checks: Is May 15, 10:30 AM in the future? 
  Real time says May 14, 2:57 PM → YES, in future... should work? But VNPAY might have its own time check!
```

**Fix:** 
Add to Render environment:
```
TZ=Asia/Ho_Chi_Minh
```

### If Expire Duration is WRONG
```
❌ BAD: "VNPAY_EXPIRE_DURATION": "0 minutes" (or missing)

Why this breaks:
- Payment expires immediately!
```

**Fix:**
Check Render dashboard → Environment:
```
VNPAY_EXPIRE_DURATION=30
```

### If calculateExpireTime is in PAST
```
❌ BAD: "calculatedExpireTime": "2026-05-13T..."  (past date!)

Why this breaks:
- VNPAY sees expireDate in past → Rejects payment
```

**This means server time is VERY wrong**

---

## 🚨 If Still Failing After These Steps

**Provide me with:**

1. Full log output from `[VNPAY] Timestamp Debug`:
```
Copy the entire JSON object from logs
```

2. Output from debug endpoint:
```
https://appthi.onrender.com/api/orders/debug/vnpay-config
(copy entire JSON response)
```

3. **When exactly does user see the error?**
   - [ ] Immediately after clicking "Thanh toán"
   - [ ] After being redirected to VNPAY payment page
   - [ ] After completing payment on VNPAY (when redirected back)
   - [ ] Other: ___________

4. **What is the exact error message?**
   - Copy the exact Vietnamese message shown

5. **Has the backend been redeployed?**
   - [ ] Yes, I pushed new code
   - [ ] No, haven't done it yet

---

## 💾 Remember to Remove Debug Endpoint Later

After fixing the issue, delete or comment out the debug endpoint in:
```
backend/src/modules/orders/orders.routes.ts

// Remove or comment this section:
/**
 * GET /api/orders/debug/vnpay-config
 * DEBUG ENDPOINT - REMOVE AFTER FIXING
 */
router.get('/debug/vnpay-config', ...);
```

This keeps your production API clean and secure.

---

## 📞 Next Steps

1. ✅ Redeploy backend with new diagnostic code
2. ✅ Check `/api/orders/debug/vnpay-config`  
3. ✅ Attempt payment and check logs
4. ✅ Report findings back to me

**Estimated time to identify issue: 5-10 minutes**

---

**Created:** 2026-05-14
