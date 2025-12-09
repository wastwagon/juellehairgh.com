# Production Backend 500 Errors - Diagnostic Guide

## 🎯 Goal
Diagnose and fix 500 Internal Server Errors on your live production backend at `https://juelle-hair-backend.onrender.com`

## 📋 Step-by-Step Diagnosis

### Step 1: Check Backend Logs (CRITICAL)

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Navigate to: **Services** → **`juelle-hair-backend`**

2. **Open Logs Tab**
   - Click on **"Logs"** tab
   - Look for recent errors (last 5-10 minutes)

3. **What to Look For:**
   - ❌ **Database connection errors**: "Can't reach database server", "Connection refused"
   - ❌ **Prisma errors**: "Table does not exist", "Migration errors"
   - ❌ **Environment variable errors**: "JWT_SECRET is required", "undefined variable"
   - ❌ **Application crashes**: Stack traces, unhandled exceptions
   - ❌ **Module errors**: "Cannot find module", "Module not found"

4. **Copy the Error Messages**
   - Select and copy the full error message
   - Include any stack traces
   - Note the timestamp

### Step 2: Test Backend Health Endpoint

**Test the health endpoint directly:**
```
https://juelle-hair-backend.onrender.com/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "...",
  "service": "juelle-hair-backend",
  "version": "..."
}
```

**If health endpoint fails:**
- Backend isn't starting correctly
- Check startup logs for errors

**If health endpoint works but API fails:**
- Backend is running but has runtime errors
- Check recent request logs

### Step 3: Test a Simple API Endpoint

**Try accessing:**
```
https://juelle-hair-backend.onrender.com/api/products
```

**Check the response:**
- Status code (should be 200, not 500)
- Error message in response body
- Any CORS errors

### Step 4: Check Environment Variables

**In Render Dashboard → `juelle-hair-backend` → Environment:**

1. **Verify these are set:**
   - ✅ `DATABASE_URL` - Should be auto-set from database
   - ⚠️ `JWT_SECRET` - Currently placeholder, needs real value
   - ❓ `PAYSTACK_SECRET_KEY` - May be missing
   - ❓ `SENDGRID_API_KEY` - Optional but may be required

2. **Update JWT_SECRET:**
   - Current value: `CHANGE_ME_GENERATE_WITH_openssl_rand_base64_32`
   - **Generate new secret:**
     ```bash
     openssl rand -base64 32
     ```
   - **Or use:** Any secure random string (32+ characters)
   - **Update in Render Dashboard** → Environment → `JWT_SECRET`

### Step 5: Verify Database Connection

1. **Check Database Status:**
   - Render Dashboard → **Databases** → `juelle-hair-postgres`
   - Should show: **"Available"** ✅

2. **Check Database URL:**
   - Backend service → Environment → `DATABASE_URL`
   - Should be: `postgresql://...` (auto-set from database)

3. **Test Connection:**
   - Look in backend logs for: `✅ Database connection successful`
   - If you see: `❌ Database connection failed` → Database issue

### Step 6: Check Recent Deployments

1. **View Deployment History:**
   - Backend service → **"Events"** or **"Deployments"** tab
   - Check if latest deployment succeeded
   - Look for any deployment errors

2. **Check Build Logs:**
   - If deployment failed, check build logs
   - Look for build errors

## 🔧 Common Fixes

### Fix 1: Update JWT_SECRET (Most Likely Issue)

**Problem:** JWT_SECRET is a placeholder value

**Solution:**
1. Generate secure secret: `openssl rand -base64 32`
2. Render Dashboard → Backend → Environment
3. Update `JWT_SECRET` with new value
4. Save and restart service

### Fix 2: Database Connection Issues

**Problem:** Can't connect to database

**Solutions:**
- Verify database is "Available"
- Check `DATABASE_URL` is correct
- Ensure database and backend are in same region
- Check database connection limits

### Fix 3: Missing Environment Variables

**Problem:** Required env vars not set

**Solution:**
- Add missing variables in Render Dashboard
- Common missing vars:
  - `PAYSTACK_SECRET_KEY`
  - `SENDGRID_API_KEY`
  - `SMTP_*` variables

### Fix 4: Database Schema Issues

**Problem:** Tables don't exist or migrations failed

**Solution:**
- Check if migrations ran: Look for `prisma migrate deploy` in logs
- Manually run migrations if needed
- Verify database schema matches Prisma schema

### Fix 5: Application Errors

**Problem:** Code errors causing crashes

**Solution:**
- Check logs for stack traces
- Fix the specific error in code
- Redeploy after fix

## 📊 Quick Diagnostic Checklist

- [ ] Checked backend logs for errors
- [ ] Tested `/health` endpoint
- [ ] Verified `DATABASE_URL` is set
- [ ] Updated `JWT_SECRET` to real value
- [ ] Verified database is "Available"
- [ ] Checked for missing environment variables
- [ ] Tested a simple API endpoint
- [ ] Reviewed recent deployment logs

## 🚨 Most Common Issue

**JWT_SECRET is a placeholder!**

The backend is configured with:
```
JWT_SECRET=CHANGE_ME_GENERATE_WITH_openssl_rand_base64_32
```

This placeholder value may be causing authentication/authorization errors that result in 500 responses.

**Fix immediately:**
1. Generate: `openssl rand -base64 32`
2. Update in Render Dashboard
3. Restart backend service

---

## 📝 Next Steps

1. **Check backend logs** - This will show the exact error
2. **Share the error message** - Copy from Render logs
3. **Update JWT_SECRET** - Replace placeholder
4. **Test again** - Verify fixes work

**Action Required:** Check the backend logs in Render Dashboard and share the specific error messages you see. This will help identify the exact cause.
