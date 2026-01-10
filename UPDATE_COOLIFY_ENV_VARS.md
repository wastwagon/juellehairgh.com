# 🔧 Update Coolify Environment Variables

## Critical Issues Found

Looking at your Coolify environment variables, I can see:

1. ❌ **`NEXT_PUBLIC_API_BASE_URL`** = `https://api.juellehairgh.com/api` 
   - **Should be:** `https://fkco8g8sso4soo00g0skg4w8.31.97.57.75.sslip.io/api`
   
2. ❌ **`NEXTAUTH_URL`** = `https://juellehairgh.com`
   - **Should be:** `https://sgcgkockwkg8kgsowww44w4o.31.97.57.75.sslip.io`

## Step-by-Step Fix

### Step 1: Update `NEXT_PUBLIC_API_BASE_URL`

1. Find the variable `NEXT_PUBLIC_API_BASE_URL` in your environment variables
2. Click **"Update"** button
3. Change the value from:
   ```
   https://api.juellehairgh.com/api
   ```
   To:
   ```
   https://fkco8g8sso4soo00g0skg4w8.31.97.57.75.sslip.io/api
   ```
4. Make sure ✅ **"Available at Buildtime"** is checked (it already is)
5. Click **Save**

### Step 2: Update `NEXTAUTH_URL`

1. Find the variable `NEXTAUTH_URL`
2. Click **"Update"** button
3. Change the value from:
   ```
   https://juellehairgh.com
   ```
   To:
   ```
   https://sgcgkockwkg8kgsowww44w4o.31.97.57.75.sslip.io
   ```
4. Make sure ✅ **"Available at Buildtime"** is checked (it already is)
5. Click **Save**

### Step 3: Verify Other Variables

Make sure these are correct:
- ✅ `SERVICE_FQDN_FRONTEND` = `sgcgkockwkg8kgsowww44w4o.31.97.57.75.sslip.io` ✓ Correct
- ✅ `SERVICE_URL_FRONTEND` = `http://sgcgkockwkg8kgsowww44w4o.31.97.57.75.sslip.io` ✓ Correct
- ✅ `NEXT_PUBLIC_APP_NAME` = `Juelle Hair Ghana` ✓ Correct
- ⚠️ `NEXTAUTH_SECRET` - "Available at Buildtime" is unchecked - this is OK for secrets

### Step 4: REDEPLOY Frontend Service

**CRITICAL:** After updating environment variables, you MUST redeploy the frontend service!

**Why?** `NEXT_PUBLIC_*` variables are embedded at build time. Even if you update the variables, the existing build still has the old values.

1. Go to your **Frontend service** in Coolify
2. Click the **"Redeploy"** button
3. Wait for the deployment to complete
4. Test the frontend preview URL

## Complete Variable List

After updates, your Frontend environment variables should be:

```
SERVICE_FQDN_FRONTEND=sgcgkockwkg8kgsowww44w4o.31.97.57.75.sslip.io
SERVICE_URL_FRONTEND=http://sgcgkockwkg8kgsowww44w4o.31.97.57.75.sslip.io
NEXT_PUBLIC_API_BASE_URL=https://fkco8g8sso4soo00g0skg4w8.31.97.57.75.sslip.io/api
NEXT_PUBLIC_APP_NAME=Juelle Hair Ghana
NEXTAUTH_URL=https://sgcgkockwkg8kgsowww44w4o.31.97.57.75.sslip.io
NEXTAUTH_SECRET=[your secret - keep it as is]
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=[your key - keep it as is]
NODE_ENV=production
```

All `NEXT_PUBLIC_*` variables should have ✅ "Available at Buildtime" checked.

## Test After Redeploy

After redeploying, test these URLs:

1. **Frontend:** 
   ```
   https://sgcgkockwkg8kgsowww44w4o.31.97.57.75.sslip.io
   ```

2. **Backend Health:**
   ```
   https://fkco8g8sso4soo00g0skg4w8.31.97.57.75.sslip.io/api/health
   ```

3. **Check Browser Console:**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Visit frontend URL
   - Check if API calls are going to the preview URL (not api.juellehairgh.com)

## Troubleshooting

### If Backend Preview URL Still Shows "no available server"

Try using **HTTP** instead of **HTTPS**:

1. Update `NEXT_PUBLIC_API_BASE_URL` to:
   ```
   http://fkco8g8sso4soo00g0skg4w8.31.97.57.75.sslip.io/api
   ```
2. Redeploy frontend

### If Frontend Still Uses api.juellehairgh.com

1. Verify `NEXT_PUBLIC_API_BASE_URL` is updated
2. Make sure "Available at Buildtime" is checked
3. **Redeploy frontend** (this is critical!)
4. Clear browser cache and test again

### Alternative: Use Direct Server IP (Temporary)

If preview URLs don't work, temporarily use:

```
NEXT_PUBLIC_API_BASE_URL=http://31.97.57.75:3001/api
NEXTAUTH_URL=http://31.97.57.75:3000
```

Then redeploy and test. Once working, switch back to preview URLs.
