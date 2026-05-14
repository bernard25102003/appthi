# 🔧 VNPAY Timeout Issue - Diagnostic Update

## 📊 Analysis of Your Logs

Your logs show:
```
2026-05-14 14:57:48 [info]: [VNPAY] Building payment URL for order...
2026-05-14 14:57:48 [info]: [VNPAY] Payment URL created successfully...
```

✅ Payment URL creation is working!  
❌ But user still sees "Quá thời gian thanh toán" (payment timeout)

---

## 🎯 Most Likely Cause: Server Time Issue

### Why This Happens

1. **Backend calculates expireDate:**
   ```
   expireDate = now() + 30 minutes
   e.g., if now = 2026-05-14 14:57:48
        then expireDate = 2026-05-14 15:27:48
   ```

2. **VNPAY validates expireDate:**
   - If server time on Render is **ahead** of real time (e.g., 2 hours ahead)
   - Then expireDate calculation results in a date that's already past
   - VNPAY rejects it as "expired"

### Example of Server Time Problem
```
Scenario: Server time is 2 hours ahead

Real Time:        2026-05-14 14:57:48
Render's Time:    2026-05-14 16:57:48  ← 2 hours ahead

Backend calculates:
- expireDate = 16:57:48 + 30 min = 17:27:48

VNPAY checks with REAL time (14:57:48):
- Is 17:27:48 in the future? 
- From real time perspective: 17:27:48 is about 2.5 hours in the future ✅
- But there might be a check that says: "expireDate can't be more than X minutes ahead"
- Or VNPAY uses its own server time which is correct
- Then sees expireDate as too far in the future or invalid
```

The actual issue could also be the opposite: **if Render's time is behind real time**, the expireDate might be calculated as past.

---

## 🛠️ What I've Done (Diagnostic Code Added)

### 1. Added Detailed Timestamp Logging
In `backend/src/modules/orders/orders.service.ts`:
- Now logs exact server time, timestamp, timezone
- Shows calculateExpireTime in ISO format
- Helps identify if times are wrong

### 2. Added Debug Endpoint
```
GET https://appthi.onrender.com/api/orders/debug/vnpay-config
```

This shows:
- All VNPAY configuration values
- Current server time
- Timezone setting
- VNPAY credentials status

### 3. Added Startup Time Logging
In `backend/src/main.ts`:
- Logs server start time when app boots
- Logs timezone setting
- Helps track server time

---

## 📋 Action Items for You

### 1. **Redeploy Backend** (REQUIRED)
Push code to GitHub or redeploy on Render so the new diagnostic code takes effect.

### 2. **Access Debug Endpoint**
```
https://appthi.onrender.com/api/orders/debug/vnpay-config
```

Check the response for:
- VNPAY_EXPIRE_DURATION should be `30 minutes`
- SERVER_TIME should match your current time
- If SERVER_TIME is significantly different → This is the problem!

### 3. **Add Timezone to Render** (If Needed)
If server time is wrong:

1. Go to Render Dashboard → Backend Service
2. Environment tab
3. Add: `TZ=Asia/Ho_Chi_Minh`
4. Save → This will trigger redeploy

### 4. **Test Payment with Logs**
1. Go to https://food.mio.io.vn
2. Add product → Checkout → VNPAY
3. Click "Thanh toán"
4. Check Render logs for `[VNPAY] Timestamp Debug`
5. Look for the timestamp values

### 5. **Collect Diagnostic Info**
If still failing, collect:
- Full `[VNPAY] Timestamp Debug` log
- Response from `/api/orders/debug/vnpay-config`
- Exact error message user sees
- When error appears (immediately vs after VNPAY redirect)

---

## ⏱️ Expected Timeline

- **Redeploy:** 5-10 min
- **Check debug endpoint:** 1 min
- **Test payment:** 3-5 min
- **Diagnose:** 2-5 min

**Total: 15-20 minutes to identify the root cause**

---

## 🚀 Next Steps

1. Redeploy backend with new code
2. Check `/api/orders/debug/vnpay-config`
3. If server time looks wrong → Add TZ variable
4. Test payment again
5. Report back with diagnostic output if still having issues

---

**Status:** 🔍 Waiting for diagnostic data  
**Priority:** 🔴 High - Payment feature broken

---

### Quick Reference
- Backend changes: `orders.service.ts`, `orders.routes.ts`, `main.ts`
- Frontend: No changes needed
- Render: Might need `TZ` variable added
- Debug endpoint: `/api/orders/debug/vnpay-config`

---

**Created:** 2026-05-14  
**Code Added:** Timestamp logging, Debug endpoint, Startup time logging
