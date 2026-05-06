# 🔧 Fix: Admin Page 404 Not Found

## Problem
`https://food.mio.io.vn/admin` returns 404 Not Found

## Root Cause
Frontend and backend were deployed separately:
- Backend only served API routes (`/api/*`)
- Frontend SPA routes (`/admin`, etc.) had no corresponding routes
- React Router client-side routing couldn't work without the frontend being served

## Solution
Configured backend to serve both API and frontend static files:

### Changes Made:

#### 1. **Backend - `src/app.ts`**
- Added `path` import for file handling
- Added static file serving from `../frontend/dist`
- Added SPA fallback route: any request to non-API routes gets `index.html`
- This enables React Router to handle client-side routing

```typescript
// Serve Frontend Static Files
app.use(express.static(frontendPath));

// SPA Fallback for client-side routing
app.get("*", (_req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});
```

#### 2. **Backend - `Dockerfile`** (Multi-stage build)
- **Stage 1**: Build frontend (Vite)
- **Stage 2**: Build backend (TypeScript)
- **Stage 3**: Runtime image with both built frontend and backend
- Frontend dist files copied to `frontend/dist` directory
- Backend serves from `dist` directory

#### 3. **Frontend - `vite.config.ts`**
- Updated proxy to use environment variable: `VITE_API_URL`
- Falls back to `http://localhost:4000` for development

#### 4. **Frontend - `.env.production`**
- Changed `VITE_API_BASE_URL` from `https://api.yourdomain.com/api` to `/api`
- Now uses relative path (served from same domain)

## Deployment Instructions

### For Render.com:

1. **Update Environment Variables** in Render dashboard:
   ```
   CLIENT_URL=https://food.mio.io.vn
   API_URL=https://food.mio.io.vn
   VITE_API_URL=http://localhost:4000  (dev only)
   ```

2. **Update Build Command** in Render settings:
   ```bash
   cd backend && npm install && npm run build
   ```

3. **Build should:**
   - Install backend dependencies
   - Build TypeScript to `dist/`
   - **Frontend is now included in Dockerfile**, no separate build needed

4. **Restart deployment** after Dockerfile changes are pushed

### For Local Development:

```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev
# Runs on http://localhost:4000

# Terminal 2: Frontend (optional, for hot reload)
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173 (proxied to backend)
```

### Testing:

✅ Access `/admin` → Should load admin dashboard (if logged in with ADMIN role)
✅ Access `/api/admin/dashboard` → Should return admin data (with valid JWT token)
✅ All other routes → Should be served by frontend

## Architecture After Changes

```
User Request to https://food.mio.io.vn
    ↓
Backend (Node.js/Express)
    ├─ /api/* → API Routes (Express handlers)
    └─ /* → SPA Fallback (serves frontend/dist/index.html)
         ↓
      React Router (Client-side)
         ├─ /admin → AdminLayout
         ├─ / → Home
         └─ * → NotFound
```

## Verification Checklist

- [ ] Dockerfile builds successfully
- [ ] Docker image contains both backend and frontend
- [ ] Backend runs and serves static files
- [ ] `/` loads the homepage
- [ ] `/admin` loads admin dashboard (with ADMIN credentials)
- [ ] `/api/admin/dashboard` returns JSON (with valid token)
- [ ] Non-existent routes return frontend 404 page

## Files Modified

1. `backend/src/app.ts` - Added static file serving and SPA fallback
2. `backend/Dockerfile` - Multi-stage build for frontend + backend
3. `frontend/vite.config.ts` - Environment-based API proxy
4. `frontend/.env.production` - Use relative API path

## Next Steps

1. Push changes to Git
2. Render.com should auto-deploy (if connected)
3. Verify deployment on `https://food.mio.io.vn/admin`
4. Check backend logs for any errors
