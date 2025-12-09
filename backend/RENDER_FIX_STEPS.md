# Render Health Check Fix - Step by Step

## The Problem
Render shows "No open ports detected" because the app was binding to `localhost` instead of `0.0.0.0`.

## The Solution
New Docker image `v20251209-131205` fixes this by binding to `0.0.0.0`.

## Steps to Fix

### Step 1: Update Docker Image
1. In Render Dashboard → Your Service → Settings
2. Scroll to "Deploy" section (or find "Docker Image" field)
3. Update Image URL to: `flygonpriest/juelle-hair-backend:v20251209-131205`
4. Click "Save Changes"

### Step 2: Try Different Health Check Paths
If health check still fails, try changing the path:

**Option A:** Change to `/api/health`
1. Settings → Health Checks
2. Health Check Path: Change from `/health` to `/api/health`
3. Save

**Option B:** Change to `/` (root)
1. Health Check Path: Change to `/`
2. Save

**Option C:** Keep `/health` but verify it works
- The new image has `/health` registered at Express level
- This should work with the new image

### Step 3: Verify Deployment
After deployment, check logs for:
```
✅ Application is running on: http://0.0.0.0:10000
✅ Build Version: v20251209-131205
🚀 Server is ready to accept connections
```

If you see `localhost` instead of `0.0.0.0`, the old image is still being used.

## What Changed in the New Image

1. ✅ Binds to `0.0.0.0` (not localhost)
2. ✅ Health endpoint at `/health` (Express level)
3. ✅ Health endpoint at `/api/health` (NestJS level)
4. ✅ Root endpoint at `/`
5. ✅ Non-blocking startup (database queries don't delay health checks)
6. ✅ PORT validation and logging

## If Still Failing

1. **Check Render logs** - Look for the startup message
2. **Verify image tag** - Make sure Render is using `v20251209-131205`
3. **Try different health check path** - `/api/health` or `/`
4. **Check PORT environment variable** - Render should set this automatically

## Alternative: Use Render Native Build

If Docker continues to cause issues, switch to Render's native build:

1. Create new Web Service
2. Connect Git repository
3. Root Directory: `backend`
4. Build Command: `npm ci && npm run prisma:generate && npm run build`
5. Start Command: `npm run start:prod`
6. Environment: Node

This avoids Docker entirely and Render handles port binding automatically.
