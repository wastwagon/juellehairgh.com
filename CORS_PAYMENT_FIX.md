# CORS and Payment Fix - Production

## Issue
Payment initialization is failing with CORS errors:
- `Access to XMLHttpRequest at 'https://juelle-hair-backend.onrender.com/api/payments/initialize' from origin 'https://juelle-hair-web.onrender.com' has been blocked by CORS policy`
- 502 Bad Gateway errors

## Fix Applied

### 1. Simplified CORS Configuration
Updated `backend/src/main.ts` to be more permissive:
- Automatically allows all `.onrender.com` domains
- Allows `juellehairgh.com` domains
- Allows localhost for testing
- More permissive to prevent payment failures

### 2. Changes Made
- Removed excessive logging that might slow requests
- Simplified origin checking logic
- Ensured all payment-related endpoints are accessible

## Next Steps

### 1. Push Changes to Production
```bash
git push origin main
```

### 2. Verify Backend is Running
Check Render Dashboard → Backend Service → Logs:
- Look for "✅ Application is running on: http://0.0.0.0:10000"
- Check for CORS configuration logs
- Verify no crash errors

### 3. Test Payment Flow
1. Go to checkout page
2. Fill in details
3. Click "Pay Now"
4. Should redirect to Paystack without CORS errors

### 4. If Still Failing

#### Check Backend Health:
```bash
curl https://juelle-hair-backend.onrender.com/health
```
Should return: `{"status":"ok",...}`

#### Check CORS Headers:
```bash
curl -H "Origin: https://juelle-hair-web.onrender.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://juelle-hair-backend.onrender.com/api/payments/initialize \
     -v
```

Should see:
- `Access-Control-Allow-Origin: https://juelle-hair-web.onrender.com`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS`

#### Restart Backend Service:
In Render Dashboard → Backend Service → Manual Deploy → Deploy latest commit

## Environment Variables to Verify

### Backend Service:
- `FRONTEND_URL=https://juelle-hair-web.onrender.com`
- `NODE_ENV=production`
- `PAYSTACK_SECRET_KEY=sk_live_...` (your live key)

### Frontend Service:
- `NEXT_PUBLIC_API_BASE_URL=https://juelle-hair-backend.onrender.com/api`

## Expected Behavior After Fix

1. ✅ No CORS errors in browser console
2. ✅ Payment initialization succeeds
3. ✅ Redirect to Paystack works
4. ✅ Payment callback works
5. ✅ Order creation succeeds

