# Render Deployment Fix - Backend

## Issue Fixed
The backend service was failing on Render with error:
```
Error: Cannot find module '/app/dist/src/main.js'
```

## Root Cause
1. **Build Output Location**: NestJS builds to `dist/src/main.js` (preserves source structure), not `dist/main.js`
2. **Start Script**: The `start.sh` script was looking for `dist/main.js` instead of `dist/src/main.js`
3. **Production Dockerfile**: Was using `pnpm` but project uses `npm`

## Fixes Applied

### 1. Updated `start.sh`
Changed from:
```bash
exec node dist/main.js
```
To:
```bash
exec node dist/src/main.js
```

### 2. Updated `package.json`
Changed `start:prod` script:
```json
"start:prod": "node dist/src/main.js"
```

### 3. Fixed `Dockerfile.prod`
- Changed from `pnpm` to `npm` (matches project setup)
- Removed duplicate Prisma Client generation in production stage
- Ensured proper build output structure

## New Docker Image

**Image:** `flygonpriest/juelle-hair-backend:latest`
**Tag:** `20251206053212`
**Platform:** `linux/amd64`

## Deployment Steps on Render

1. **Update Backend Service:**
   - Go to your Render backend service settings
   - Update Docker image to: `flygonpriest/juelle-hair-backend:latest`
   - Or use: `flygonpriest/juelle-hair-backend:20251206053212`

2. **Verify Environment Variables:**
   ```
   DATABASE_URL=postgresql://juellehair_user:lJbEutCA26lLKqZIaBfq4YWOdudkwGfC@dpg-d4nkgtngi27c73bi9j8g-a.oregon-postgres.render.com/juellehair_k4fu
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=your-secret-key
   PAYSTACK_SECRET_KEY=your-paystack-key
   FRONTEND_URL=https://your-frontend-url.com
   ```

3. **Deploy:**
   - Render will pull the new image
   - The service should start successfully
   - Check logs to verify: `Starting application...`

## Verification

After deployment, verify the service is running:
- Health check: `https://your-backend-url.com/api/health`
- API endpoint: `https://your-backend-url.com/api/products`

## What's Fixed

✅ Correct build output path (`dist/src/main.js`)
✅ Production Dockerfile uses `npm` (not `pnpm`)
✅ Prisma Client properly included
✅ Startup script points to correct file location
✅ All migrations will run automatically on startup

---

**Fixed on:** December 6, 2025
**Docker Image:** `flygonpriest/juelle-hair-backend:latest`
