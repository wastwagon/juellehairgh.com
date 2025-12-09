# Runtime Configuration Fix for Live Server

## Issue
Products and other sections not loading on live server because API base URL was hardcoded at build time.

## Problem
Next.js `NEXT_PUBLIC_*` environment variables are embedded at **build time**. If the Docker image was built without the correct `NEXT_PUBLIC_API_BASE_URL`, it defaults to `http://localhost:8001/api`, which doesn't work on the live server.

## Solution
Updated the API configuration to support **runtime environment variables** in addition to build-time variables.

### Changes Made

1. **Updated `frontend/lib/api.ts`**:
   - Now checks for runtime config via `window.__ENV__`
   - Falls back to build-time `process.env.NEXT_PUBLIC_API_BASE_URL`
   - Supports both client-side and server-side configuration

2. **Updated `frontend/app/layout.tsx`**:
   - Injects runtime configuration into the HTML via a script tag
   - Makes environment variables available to client-side code

3. **Updated `frontend/Dockerfile.prod`**:
   - Added comments about runtime environment variable support

## How It Works

1. **Build Time**: `NEXT_PUBLIC_API_BASE_URL` is embedded if set during Docker build
2. **Runtime**: Environment variables set in Render are available to the Node.js server
3. **Client-Side**: Runtime config is injected into the HTML and accessible via `window.__ENV__`
4. **API Calls**: The API client checks both sources and uses the most appropriate one

## Deployment Instructions

### Option 1: Set Environment Variable in Render (Recommended)

1. Go to your **Frontend Service** in Render Dashboard
2. Navigate to **Environment** tab
3. Add/Update:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.onrender.com/api
   ```
4. **Redeploy** the service (or it will auto-deploy)

### Option 2: Rebuild Docker Image with Build Args

If you want to embed the URL at build time:

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.onrender.com/api \
  --platform linux/amd64 \
  -f Dockerfile.prod \
  -t flygonpriest/juelle-hair-frontend:latest \
  frontend/
```

## Verification

After setting the environment variable:

1. **Check Browser Console**: 
   - Open browser DevTools → Console
   - Look for: `🔧 API Base URL configured: https://your-backend-url.onrender.com/api`
   - Should NOT show `http://localhost:8001/api`

2. **Check Network Tab**:
   - Open browser DevTools → Network
   - Look for API requests
   - Verify they're going to the correct backend URL

3. **Check Render Logs**:
   - Go to Render Dashboard → Your Frontend Service → Logs
   - Look for API request logs
   - Verify no CORS errors or connection refused errors

## Required Environment Variables in Render

Make sure these are set in your **Frontend Service** environment:

```
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.onrender.com/api
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_APP_NAME=Juelle Hair Ghana
NEXT_PUBLIC_BASE_CURRENCY=GHS
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your-paystack-key
```

## Troubleshooting

### Products Still Not Loading

1. **Check Backend URL**:
   - Verify backend service is running
   - Test backend URL directly: `https://your-backend-url.onrender.com/api/products`

2. **Check CORS**:
   - Backend must allow requests from frontend domain
   - Check backend CORS configuration

3. **Check Environment Variable**:
   - In Render, verify `NEXT_PUBLIC_API_BASE_URL` is set correctly
   - No trailing slash (should end with `/api`)
   - Use HTTPS (not HTTP)

4. **Check Browser Console**:
   - Look for API errors
   - Check network requests in DevTools
   - Verify API calls are going to correct URL

### Still Using Localhost

If you see `http://localhost:8001/api` in console:

1. **Clear Browser Cache**: Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
2. **Verify Env Var**: Check Render dashboard that variable is set
3. **Redeploy**: Trigger a new deployment in Render
4. **Check Build**: Verify the Docker image was built/redeployed

---

**Fixed on:** December 6, 2025
**Files Changed:**
- `frontend/lib/api.ts` - Runtime config support
- `frontend/app/layout.tsx` - Runtime config injection
- `frontend/Dockerfile.prod` - Documentation update
