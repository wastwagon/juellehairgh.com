# 🔧 CORS Fix for Production

## Issue
CORS errors blocking requests from `https://juelle-hair-web.onrender.com` to `https://juelle-hair-backend.onrender.com/api`

## Changes Made
✅ Updated CORS configuration in `backend/src/main.ts`:
- Improved origin matching with better logging
- Added support for wildcard subdomain matching
- Included all necessary headers for preflight requests
- Proper OPTIONS request handling
- Added localhost origins for testing

## Next Steps

### 1. Verify Environment Variables on Render

Go to Render Dashboard → Backend Service → Environment and verify:

```
NODE_ENV=production
FRONTEND_URL=https://juelle-hair-web.onrender.com
```

### 2. Redeploy Backend

The backend needs to be redeployed for CORS changes to take effect:

**Option A: Auto-deploy (if enabled)**
- Push changes to GitHub
- Render will automatically deploy

**Option B: Manual Deploy**
- Go to Render Dashboard → Backend Service
- Click "Manual Deploy" → "Deploy latest commit"

### 3. Verify CORS is Working

After deployment, check backend logs for:
```
🌐 CORS Configuration:
   Environment: production
   Allowed Origins: https://juelle-hair-web.onrender.com, https://juellehairgh.com, ...
   FRONTEND_URL: https://juelle-hair-web.onrender.com
```

### 4. Test CORS

Open browser console on frontend and check:
- No more CORS errors
- API requests succeed
- Checkout flow works

## Troubleshooting

### If CORS still fails:

1. **Check Backend Logs:**
   - Look for "CORS blocked origin" warnings
   - Verify allowed origins match frontend URL exactly

2. **Verify Frontend URL:**
   - Ensure `FRONTEND_URL` matches exactly: `https://juelle-hair-web.onrender.com`
   - No trailing slash
   - Correct protocol (https)

3. **Check Render Service URLs:**
   - Backend: `https://juelle-hair-backend.onrender.com`
   - Frontend: `https://juelle-hair-web.onrender.com`

4. **Test with curl:**
   ```bash
   curl -X OPTIONS https://juelle-hair-backend.onrender.com/api/payments/initialize \
     -H "Origin: https://juelle-hair-web.onrender.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type,Authorization" \
     -v
   ```
   
   Should return `Access-Control-Allow-Origin` header

## Expected Behavior After Fix

✅ No CORS errors in browser console
✅ API requests succeed
✅ Checkout flow completes successfully
✅ Payment initialization works
✅ Analytics tracking works

---

**Status**: ✅ CORS configuration updated - needs backend redeploy on Render

