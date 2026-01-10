# 🔧 Fix Preview URL Issues

## Current Issues

1. **Backend preview URL:** `https://fkco8g8sso4soo00g0skg4w8.31.97.57.75.sslip.io` shows "no available server"
2. **Frontend:** Still trying to connect to `api.juellehairgh.com` instead of preview URL

## Solutions

### Issue 1: Backend "no available server"

The backend is running, but the preview URL proxy might not be working. Try:

**Option A: Use HTTP instead of HTTPS**

Sometimes `.sslip.io` domains work better with HTTP. Update the backend URL in Frontend to:
```
NEXT_PUBLIC_API_BASE_URL=http://fkco8g8sso4soo00g0skg4w8.31.97.57.75.sslip.io/api
```

**Option B: Check Backend Service Status**

1. Go to Backend service in Coolify
2. Check **Logs** tab - make sure it shows "Running (healthy)"
3. Check **Links** tab - verify the URL is correct
4. Try accessing backend via direct port: `http://31.97.57.75:3001/api/health`

**Option C: Verify Domain Configuration**

1. Go to Backend → **Configuration** → **General**
2. In **Domains** section, make sure `https://fkco8g8sso4soo00g0skg4w8.31.97.57.75.sslip.io` is listed
3. If not, add it and redeploy

### Issue 2: Frontend Using Wrong URL

The frontend is still trying to connect to `api.juellehairgh.com`. This means:

**The `NEXT_PUBLIC_API_BASE_URL` environment variable in Coolify is still set to the production URL!**

## ✅ Fix: Update Frontend Environment Variables

### Step 1: Go to Frontend Service in Coolify

1. Navigate to **Frontend service** → **Environment Variables**

### Step 2: Update These Variables

**CRITICAL - Update this first:**
```
NEXT_PUBLIC_API_BASE_URL=https://fkco8g8sso4soo00g0skg4w8.31.97.57.75.sslip.io/api
```

**If HTTPS doesn't work, try HTTP:**
```
NEXT_PUBLIC_API_BASE_URL=http://fkco8g8sso4soo00g0skg4w8.31.97.57.75.sslip.io/api
```

**Also update:**
```
NEXTAUTH_URL=https://sgcgkockwkg8kgsowww44w4o.31.97.57.75.sslip.io
```

### Step 3: Check Buildtime Checkbox

**IMPORTANT:** For `NEXT_PUBLIC_API_BASE_URL`, check ✅ **"Available at Buildtime"**

This is critical because Next.js embeds `NEXT_PUBLIC_*` variables at build time!

### Step 4: Redeploy Frontend

**MUST redeploy** the frontend service because `NEXT_PUBLIC_*` variables are embedded during build.

1. Go to Frontend service
2. Click **"Redeploy"** button
3. Wait for deployment to complete

## Test URLs

After fixing, test these:

### Backend Health (Try both HTTP and HTTPS):
```
http://fkco8g8sso4soo00g0skg4w8.31.97.57.75.sslip.io/api/health
https://fkco8g8sso4soo00g0skg4w8.31.97.57.75.sslip.io/api/health
```

### Direct Port (If preview URL doesn't work):
```
http://31.97.57.75:3001/api/health
```

### Frontend:
```
https://sgcgkockwkg8kgsowww44w4o.31.97.57.75.sslip.io
```

## Quick Checklist

**Backend Environment Variables:**
- [ ] `FRONTEND_URL` = `https://sgcgkockwkg8kgsowww44w4o.31.97.57.75.sslip.io`
- [ ] `POSTGRES_HOST` = `wg4kgo8g08c4gcsk080ssoww`
- [ ] `POSTGRES_PASSWORD` = `JuelleHair2026`
- [ ] All database variables set

**Frontend Environment Variables:**
- [ ] `NEXT_PUBLIC_API_BASE_URL` = `https://fkco8g8sso4soo00g0skg4w8.31.97.57.75.sslip.io/api` ⚠️ **MUST UPDATE THIS**
- [ ] `NEXTAUTH_URL` = `https://sgcgkockwkg8kgsowww44w4o.31.97.57.75.sslip.io`
- [ ] ✅ "Available at Buildtime" checked for `NEXT_PUBLIC_API_BASE_URL`
- [ ] All `NEXT_PUBLIC_*` variables have "Available at Buildtime" checked

**After Updating:**
- [ ] Save environment variables
- [ ] **Redeploy Frontend** (critical!)
- [ ] Test frontend preview URL
- [ ] Check browser console for API calls

## Why Frontend Still Shows api.juellehairgh.com

The middleware is using `NEXT_PUBLIC_API_BASE_URL` from environment variables. If it's not set or still set to `api.juellehairgh.com`, it will use that.

**The variable must be updated in Coolify Frontend service environment variables AND the frontend must be redeployed!**

## Alternative: Use Direct Server IP (Temporary)

If preview URLs don't work, you can temporarily use:

**Frontend Environment:**
```
NEXT_PUBLIC_API_BASE_URL=http://31.97.57.75:3001/api
NEXTAUTH_URL=http://31.97.57.75:3000
```

**Backend Environment:**
```
FRONTEND_URL=http://31.97.57.75:3000
```

Then redeploy both services. This is a temporary solution to test everything works before fixing preview URLs.
