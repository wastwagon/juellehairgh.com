# 🔍 Payment System Diagnostic Guide

## Overview
This guide helps diagnose payment failures, CORS errors, and 502 Bad Gateway errors.

## Quick Diagnostic Steps

### 1. Run the Diagnostic Script

**Locally:**
```bash
cd backend
npm run ts-node scripts/diagnose-payment-issues.ts
```

**In Render Shell:**
```bash
cd backend
npx ts-node scripts/diagnose-payment-issues.ts
```

### 2. Check Backend Health

Test if your backend is accessible:

```bash
# Replace with your actual backend URL
curl https://juelle-hair-backend.onrender.com/health
curl https://juelle-hair-backend.onrender.com/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T12:00:00.000Z",
  "service": "juelle-hair-backend"
}
```

### 3. Check CORS Configuration

Test CORS preflight request:

```bash
curl -X OPTIONS https://juelle-hair-backend.onrender.com/api/payments/initialize \
  -H "Origin: https://juelle-hair-web.onrender.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -v
```

**Look for these headers in response:**
- `Access-Control-Allow-Origin: https://juelle-hair-web.onrender.com`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS`
- `Access-Control-Allow-Credentials: true`

### 4. Check Frontend API Configuration

**In Browser Console (on live site):**
```javascript
// Check what API URL is being used
console.log(window.__ENV__?.NEXT_PUBLIC_API_BASE_URL);
console.log(process.env.NEXT_PUBLIC_API_BASE_URL);
```

**Expected:** Should show your backend URL ending with `/api`, NOT `localhost`

### 5. Check Environment Variables in Render

**Backend Service Environment Variables:**
- ✅ `FRONTEND_URL` - Must match your frontend URL exactly
- ✅ `PAYSTACK_SECRET_KEY` - Must start with `sk_`
- ✅ `DATABASE_URL` - PostgreSQL connection string
- ✅ `JWT_SECRET` - Secret key for JWT tokens
- ✅ `NODE_ENV=production`
- ✅ `PORT` - Usually auto-set by Render

**Frontend Service Environment Variables:**
- ✅ `NEXT_PUBLIC_API_BASE_URL` - Must be your backend URL ending with `/api`
- ✅ `NODE_ENV=production`
- ✅ `PORT` - Usually auto-set by Render

## Common Issues and Solutions

### Issue 1: 502 Bad Gateway

**Symptoms:**
- Frontend shows "502 Bad Gateway" error
- Network tab shows failed requests to backend

**Possible Causes:**
1. Backend service crashed or not running
2. Backend health check failing
3. Backend timeout
4. Database connection issues

**Solutions:**
1. Check Render backend logs for errors
2. Verify backend service is running (green status in Render dashboard)
3. Check database connection string is correct
4. Restart backend service in Render

### Issue 2: CORS Errors

**Symptoms:**
- Browser console shows "CORS policy" errors
- Preflight OPTIONS requests failing
- "No 'Access-Control-Allow-Origin' header" error

**Possible Causes:**
1. `FRONTEND_URL` not set in backend
2. Frontend URL doesn't match backend CORS config
3. CORS middleware not working correctly

**Solutions:**
1. Verify `FRONTEND_URL` is set correctly in backend environment variables
2. Check backend logs for CORS warnings
3. Ensure frontend URL matches exactly (including `https://` and no trailing slash)
4. Restart backend service after changing environment variables

### Issue 3: Payment Initialization Fails

**Symptoms:**
- "Failed to initialize payment" error
- Network request to `/api/payments/initialize` fails
- 401 Unauthorized or 400 Bad Request errors

**Possible Causes:**
1. User not authenticated (no JWT token)
2. Paystack secret key not configured
3. Order not found or invalid
4. Backend endpoint not accessible

**Solutions:**
1. Verify user is logged in (check localStorage for `token`)
2. Check `PAYSTACK_SECRET_KEY` is set in backend environment variables
3. Verify order exists and is in correct state
4. Check backend logs for detailed error messages

### Issue 4: Wrong API URL

**Symptoms:**
- Frontend trying to connect to `localhost:8001/api` or `localhost:3001/api`
- Network requests going to wrong URL
- "Connection refused" errors

**Possible Causes:**
1. `NEXT_PUBLIC_API_BASE_URL` not set in frontend environment variables
2. Frontend Docker image built with wrong URL
3. Runtime config not working

**Solutions:**
1. Set `NEXT_PUBLIC_API_BASE_URL` in Render frontend environment variables
2. Ensure it ends with `/api` (e.g., `https://juelle-hair-backend.onrender.com/api`)
3. Redeploy frontend service after setting environment variable
4. Clear browser cache and hard refresh

## Testing Payment Flow

### Step 1: Create Test Order

1. Add products to cart
2. Go to checkout
3. Fill in shipping details
4. Select payment method
5. Submit order

### Step 2: Monitor Network Requests

**In Browser DevTools → Network Tab:**
1. Look for `POST /api/orders` - Should return 201 Created
2. Look for `POST /api/payments/initialize` - Should return 200 OK with `authorizationUrl`
3. Check request headers include `Authorization: Bearer <token>`
4. Check response doesn't have CORS errors

### Step 3: Check Backend Logs

**In Render Dashboard → Backend Service → Logs:**
1. Look for payment initialization logs
2. Check for Paystack API calls
3. Verify no database errors
4. Check CORS logs (if any warnings)

## Debugging Commands

### Check Backend Logs (Render)
```bash
# In Render Shell
tail -f /var/log/backend.log
# Or check Render dashboard logs
```

### Test Paystack Connection
```bash
# Replace with your actual secret key
curl https://api.paystack.co/bank \
  -H "Authorization: Bearer sk_live_your_key_here"
```

### Test Database Connection
```bash
# In Render Shell
psql $DATABASE_URL -c "SELECT COUNT(*) FROM orders;"
```

### Test Backend Endpoint
```bash
# Replace with your actual backend URL
curl https://juelle-hair-backend.onrender.com/api/health
```

## Environment Variable Checklist

### Backend Service (Render)
- [ ] `FRONTEND_URL=https://juelle-hair-web.onrender.com`
- [ ] `PAYSTACK_SECRET_KEY=sk_live_...` (or `sk_test_...` for testing)
- [ ] `DATABASE_URL=postgresql://...`
- [ ] `JWT_SECRET=<random-secret-string>`
- [ ] `NODE_ENV=production`
- [ ] `PORT=3001` (usually auto-set)

### Frontend Service (Render)
- [ ] `NEXT_PUBLIC_API_BASE_URL=https://juelle-hair-backend.onrender.com/api`
- [ ] `NODE_ENV=production`
- [ ] `PORT=3000` (usually auto-set)

## Still Having Issues?

1. **Run the diagnostic script** and share the output
2. **Check Render logs** for both frontend and backend services
3. **Verify environment variables** are set correctly
4. **Test backend health endpoint** directly
5. **Check browser console** for detailed error messages
6. **Verify Paystack keys** are correct (test vs live)

## Contact Information

If issues persist after following this guide:
- Share diagnostic script output
- Share relevant Render logs
- Share browser console errors
- Share network request details (from DevTools)

