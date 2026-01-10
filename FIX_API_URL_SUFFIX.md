# 🔧 Fix API URL - Missing /api Suffix

## Issue Found

In your **Preview Deployments Environment Variables**, the `NEXT_PUBLIC_API_BASE_URL` is missing the `/api` suffix.

**Current (Wrong):**
```
https://fkco8g8sso4soo00g0skg4w8.31.97.57.75.sslip.io
```

**Should Be:**
```
https://fkco8g8sso4soo00g0skg4w8.31.97.57.75.sslip.io/api
```

## Why This Matters

Without the `/api` suffix, your frontend will try to make API calls to:
- ❌ `https://fkco8g8sso4soo00g0skg4w8.31.97.57.75.sslip.io/settings/maintenance`
- ❌ `https://fkco8g8sso4soo00g0skg4w8.31.97.57.75.sslip.io/products`

But your backend API is actually at:
- ✅ `https://fkco8g8sso4soo00g0skg4w8.31.97.57.75.sslip.io/api/settings/maintenance`
- ✅ `https://fkco8g8sso4soo00g0skg4w8.31.97.57.75.sslip.io/api/products`

This will cause **404 Not Found** errors for all API calls!

## Quick Fix

### Step 1: Update the Variable

1. Find `NEXT_PUBLIC_API_BASE_URL` in your **Preview Deployments Environment Variables**
2. Click **"Update"** button
3. Change the value from:
   ```
   https://fkco8g8sso4soo00g0skg4w8.31.97.57.75.sslip.io
   ```
   To:
   ```
   https://fkco8g8sso4soo00g0skg4w8.31.97.57.75.sslip.io/api
   ```
4. Make sure ✅ **"Available at Buildtime"** is checked (it already is)
5. Click **Save**

### Step 2: Redeploy

After updating, you **MUST redeploy** the frontend service for the change to take effect (because `NEXT_PUBLIC_*` variables are embedded at build time).

1. Go to your **Frontend service** in Coolify
2. Click **"Redeploy"** button
3. Wait for deployment to complete

### Step 3: Test

After redeployment, test your frontend:
```
https://sgcgkockwkg8kgsowww44w4o.31.97.57.75.sslip.io
```

Open browser DevTools (F12) → Network tab, and verify API calls go to:
- ✅ `https://fkco8g8sso4soo00g0skg4w8.31.97.57.75.sslip.io/api/...`

## Note About Preview vs Production

You're looking at **"Preview Deployments Environment Variables"**. This is for pull request previews and staging environments.

Make sure you also update this variable in:
1. **Preview Deployments Environment Variables** (what you're looking at now)
2. **Production Environment Variables** (for your main deployment)

Both should have the `/api` suffix!

## Complete Correct Values

**Preview Deployments:**
```
NEXT_PUBLIC_API_BASE_URL=https://fkco8g8sso4soo00g0skg4w8.31.97.57.75.sslip.io/api
```

**Production:**
```
NEXT_PUBLIC_API_BASE_URL=https://fkco8g8sso4soo00g0skg4w8.31.97.57.75.sslip.io/api
```

Once you connect your custom domain, update to:
```
NEXT_PUBLIC_API_BASE_URL=https://api.juellehairgh.com/api
```
