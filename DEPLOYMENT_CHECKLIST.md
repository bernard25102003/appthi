# 📋 Complete Deployment Checklist & Summary

## Pre-Deployment

### Code Preparation
- [ ] All code committed to GitHub
- [ ] No `.env` files tracked in git
- [ ] `package.json` has correct build scripts
- [ ] Frontend API endpoints configured with environment variables
- [ ] Backend Dockerfile validated locally

```bash
# Test backend build locally
cd backend
docker build -t ecommerce-backend:test .
```

---

## Phase 1: Backend Deployment (Render)

### 1.1 Database Setup
- [ ] Create Render account
- [ ] Provision PostgreSQL database
  - Name: `ecommerce-db`
  - Version: 16
  - Region: Singapore (or closest)
- [ ] Copy `DATABASE_URL` from Render Dashboard
- [ ] Format: `postgresql://user:password@host:5432/db`

### 1.2 Backend Service
- [ ] Connect GitHub repository to Render
- [ ] Select backend folder as root
- [ ] Choose Docker environment
- [ ] Set build command: `npm ci && npx prisma generate && npm run build`
- [ ] Set start command: `npx prisma migrate deploy && node dist/main.js`

### 1.3 Environment Variables
Required on Render Dashboard:
```
✅ NODE_ENV = production
✅ DATABASE_URL = <from PostgreSQL>
✅ JWT_SECRET = <32-char random string>
✅ JWT_REFRESH_SECRET = <32-char random string>
✅ IMAGEKIT_PUBLIC_KEY = <your key>
✅ IMAGEKIT_PRIVATE_KEY = <your key>
✅ IMAGEKIT_URL_ENDPOINT = <your endpoint>
✅ CORS_ORIGIN = https://your-domain.vercel.app (UPDATE LATER)
✅ LOG_LEVEL = info
```

**Generate secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 1.4 Deploy & Verify
- [ ] Click "Create Web Service"
- [ ] Wait for deployment (~5-10 minutes)
- [ ] Check status: **Live ✓**
- [ ] Backend URL: `https://ecommerce-backend-xxxxx.onrender.com`
- [ ] Test health: `curl https://ecommerce-backend-xxxxx.onrender.com/health`

#### Save Your Backend URL:
```
Backend URL: https://ecommerce-backend-XXXXX.onrender.com
(You'll need this for frontend)
```

---

## Phase 2: Frontend Deployment (Vercel - Admin)

### 2.1 Admin Client (Dashboard)
- [ ] Create Vercel account
- [ ] Import GitHub repository
- [ ] Root directory: `admin-client`
- [ ] Framework: Vite
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`

### 2.2 Environment Variables (Vercel Settings)
```
VITE_API_BASE_URL = https://ecommerce-backend-xxxxx.onrender.com
VITE_API_URL = https://ecommerce-backend-xxxxx.onrender.com/api
```

### 2.3 Deploy
- [ ] Click "Deploy"
- [ ] Wait for build completion (~3-5 minutes)
- [ ] Check status: **✓ Ready**
- [ ] Admin URL: `https://yourdomain.vercel.app` or auto-generated

#### Save Your Admin URL:
```
Admin URL: https://[admin-hash].vercel.app
(or your custom domain)
```

---

## Phase 3: Frontend Deployment (Vercel - User)

### 3.1 User Client (Customer Site)
- [ ] New Vercel deployment
- [ ] Root directory: `user-client`
- [ ] Framework: Vite
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`

### 3.2 Environment Variables (same as Admin)
```
VITE_API_BASE_URL = https://ecommerce-backend-xxxxx.onrender.com
VITE_API_URL = https://ecommerce-backend-xxxxx.onrender.com/api
```

### 3.3 Deploy
- [ ] Click "Deploy"
- [ ] Verify deployment successful

---

## Phase 4: Post-Deployment Configuration

### 4.1 Update Backend CORS
- [ ] Go to Render Dashboard → Backend Service
- [ ] Environment → Edit
- [ ] Update `CORS_ORIGIN` to match your Vercel domains:
  ```
  https://admin-domain.vercel.app,https://user-domain.vercel.app
  ```
- [ ] Redeploy

### 4.2 Test Connections
- [ ] Admin dashboard loads
- [ ] User site loads
- [ ] Can login/register (check Network tab for API calls)
- [ ] No CORS errors in console
- [ ] No 502/503 errors

#### Testing Script:
```bash
# Test 1: Backend health
curl https://ecommerce-backend-xxxxx.onrender.com/health

# Test 2: Check logs
# Render: Dashboard → Logs
# Vercel: Deployments → click latest → Logs

# Test 3: Monitor console
# Admin: Open DevTools → Console → check for errors
```

---

## Phase 5: Custom Domain (Optional)

### Backend Domain
1. Go to Render Service → Settings → Custom Domain
2. Add domain (e.g., `api.yourdomain.com`)
3. Update DNS records per Render instructions
4. Update frontend `VITE_API_URL` to new domain

### Frontend Domains
1. Go to Vercel Project → Settings → Domains
2. Add domains for admin & user sites
3. Update DNS records
4. Vercel handles SSL automatically

---

## Phase 6: Monitoring & Maintenance

### Daily Checks
- [ ] Backend logs for errors
- [ ] Database connection status
- [ ] API response times
- [ ] Frontend build status

### Weekly Tasks
- [ ] Review error logs
- [ ] Monitor database size
- [ ] Check rate limits/usage
- [ ] Test critical workflows

### Monthly Tasks
- [ ] Review costs
- [ ] Update dependencies
- [ ] Backup database
- [ ] Security audit

---

## Troubleshooting Guide

### Backend won't start
```
Check:
1. Logs: Render Dashboard → Logs
2. Build failed? Check npm scripts
3. Database issue? Verify DATABASE_URL
4. Missing env vars? Add to Environment tab
```

### Frontend won't build
```
Check:
1. Logs: Vercel → Deployments → [version] → Logs
2. npm run build works locally?
3. Environment variables set correctly?
4. Correct root directory selected?
5. Node version compatible?
```

### CORS errors in browser
```
Solution:
1. Backend: Update CORS_ORIGIN env var
2. Include protocol: https://
3. No trailing slash
4. Redeploy backend after change
5. Clear browser cache (hard refresh)
```

### Slow performance
```
Optimize:
1. Enable Redis caching (optional)
2. Optimize database queries
3. Add indexes to frequently queried fields
4. Use CDN for static assets
5. Enable compression in Express
```

---

## Deployment Complete Checklist

### ✅ All Deployed
- [ ] Backend running on Render
- [ ] Admin dashboard on Vercel
- [ ] User site on Vercel
- [ ] Database connected
- [ ] CORS configured
- [ ] API connections working
- [ ] No console errors
- [ ] Performance acceptable

### 🎯 Optional Enhancements
- [ ] Custom domain setup
- [ ] Email notifications setup
- [ ] Analytics/monitoring
- [ ] Backup strategy
- [ ] CI/CD pipeline advanced config

---

## Quick Reference URLs

| Service | URL Pattern | Status |
|---------|-----------|--------|
| Backend API | `https://ecommerce-backend-xxxxx.onrender.com` | ? |
| Admin Dashboard | `https://yourdomain.vercel.app` | ? |
| User Site | `https://yourdomain.vercel.app` | ? |
| Database | PostgreSQL on Render | ? |
| Logs (Backend) | Render Dashboard → Logs | ✓ |
| Logs (Frontend) | Vercel → Deployments → Logs | ✓ |

---

## Support Resources

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Prisma ORM**: https://www.prisma.io/docs
- **Express.js**: https://expressjs.com
- **Vite**: https://vitejs.dev

---

## 🎉 Deployment Success Indicators

You've successfully deployed when:

✅ Backend health check returns 200  
✅ Frontend loads without errors  
✅ API calls complete successfully  
✅ No CORS errors in console  
✅ User can register/login  
✅ Product browsing works  
✅ Admin dashboard responsive  
✅ Database queries fast  

**Congratulations on deploying! 🚀**
