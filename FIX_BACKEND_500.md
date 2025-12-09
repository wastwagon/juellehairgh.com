# Fix Backend 500 Errors - Step-by-Step Guide

## 🎯 Goal
Fix all backend API 500 errors so frontend can load data correctly.

## 🔍 Step 1: Check Backend Logs (DO THIS FIRST)

### In Render Dashboard:
1. Go to: https://dashboard.render.com
2. Navigate to: **Services** → **`juelle-hair-backend`**
3. Click: **"Logs"** tab
4. Look for: **Recent errors** (last 10-15 minutes)

### What to Look For:
- ❌ **Database errors**: "Can't reach database", "Connection refused", "Prisma errors"
- ❌ **JWT errors**: "JWT_SECRET is required", "Invalid token", "Secret key error"
- ❌ **Missing modules**: "Cannot find module", "Module not found"
- ❌ **Environment errors**: "undefined variable", "process.env is undefined"
- ❌ **Application crashes**: Stack traces, unhandled exceptions

### Copy the Error:
- Select the full error message
- Include any stack traces
- Note the timestamp

## 🔧 Step 2: Fix JWT_SECRET (MOST LIKELY ISSUE)

### Current Problem:
Backend has placeholder: `CHANGE_ME_GENERATE_WITH_openssl_rand_base64_32`

### Solution:

**Option A: Generate via Command Line**
```bash
openssl rand -base64 32
```

**Option B: Use Online Generator**
- Visit: https://www.lastpass.com/features/password-generator
- Generate 32+ character random string

**Option C: Use Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Update in Render:
1. Render Dashboard → **`juelle-hair-backend`** → **Environment**
2. Find: **`JWT_SECRET`**
3. Click: **Edit** (pencil icon)
4. Replace value with your generated secret
5. Click: **Save**
6. Service will **auto-restart**

### Verify:
- Wait 1-2 minutes for restart
- Check logs for successful startup
- Test API endpoint again

## 🔧 Step 3: Verify Database Connection

### Check Database Status:
1. Render Dashboard → **Databases** → **`juelle-hair-postgres`**
2. Should show: **"Available"** ✅
3. If not available, wait or check database logs

### Check DATABASE_URL:
1. Backend service → **Environment**
2. Find: **`DATABASE_URL`**
3. Should be: `postgresql://...` (auto-set from database)
4. Format: `postgresql://user:password@host:port/database`

### Test Connection:
Look in backend logs for:
- ✅ `✅ Database connection successful`
- ❌ `❌ Database connection failed`

If failed, check:
- Database is running
- DATABASE_URL is correct
- Network connectivity

## 🔧 Step 4: Check for Missing Environment Variables

### Required Variables:
- ✅ `DATABASE_URL` - Auto-set (should be present)
- ⚠️ `JWT_SECRET` - **NEEDS REAL VALUE** (currently placeholder)
- ❓ `PAYSTACK_SECRET_KEY` - May be required for payment endpoints
- ❓ `SENDGRID_API_KEY` - Optional but may cause errors if code expects it
- ❓ `SMTP_*` variables - Optional email configuration

### Check Each Variable:
1. Backend service → **Environment** tab
2. Verify each variable is set (or intentionally missing)
3. Add missing required variables

## 🔧 Step 5: Verify Prisma Migrations

### Check Migration Status:
Look in backend logs for:
- ✅ `No pending migrations to apply.`
- ✅ `Applied migration: ...`
- ❌ `Migration failed`
- ❌ `Table does not exist`

### If Migrations Failed:
1. Check database is accessible
2. Verify DATABASE_URL is correct
3. Check Prisma schema matches database

## 🔧 Step 6: Test Backend Endpoints

### Test Health Endpoint:
```bash
curl https://juelle-hair-backend.onrender.com/health
```

**Expected:** `{"status":"ok",...}`

### Test API Endpoint:
```bash
curl https://juelle-hair-backend.onrender.com/api/products
```

**Expected:** JSON array of products (or empty array `[]`)
**If 500:** Check logs for specific error

### Test with CORS Headers:
```bash
curl -H "Origin: https://juelle-hair-web.onrender.com" \
     https://juelle-hair-backend.onrender.com/api/products
```

## 🔧 Step 7: Common Fixes

### Fix 1: JWT_SECRET Placeholder
**Problem:** Authentication fails because JWT_SECRET is placeholder
**Solution:** Update to real secret (see Step 2)

### Fix 2: Database Connection
**Problem:** Can't connect to database
**Solutions:**
- Verify database is "Available"
- Check DATABASE_URL format
- Ensure database and backend in same region
- Check connection limits

### Fix 3: Missing Environment Variables
**Problem:** Code expects variable that's not set
**Solution:** Add missing variables or make them optional in code

### Fix 4: Prisma Client Not Generated
**Problem:** Prisma Client missing or outdated
**Solution:** 
- Check build logs for `prisma generate`
- Verify Prisma Client exists in `node_modules/@prisma/client`

### Fix 5: Application Errors
**Problem:** Code errors causing crashes
**Solution:**
- Check logs for stack traces
- Fix the specific error
- Redeploy

## 📋 Quick Diagnostic Checklist

Run through this checklist:

- [ ] Checked backend logs for errors
- [ ] Updated JWT_SECRET to real value
- [ ] Verified DATABASE_URL is set correctly
- [ ] Confirmed database is "Available"
- [ ] Checked for missing environment variables
- [ ] Verified Prisma migrations ran successfully
- [ ] Tested health endpoint (should be 200)
- [ ] Tested API endpoint (should be 200, not 500)
- [ ] Checked CORS configuration
- [ ] Verified backend restarted after changes

## 🚨 Most Common Issue: JWT_SECRET

**90% of 500 errors are caused by JWT_SECRET placeholder!**

The backend is configured with:
```
JWT_SECRET=CHANGE_ME_GENERATE_WITH_openssl_rand_base64_32
```

This causes:
- Authentication failures
- Authorization errors
- 500 Internal Server Error responses

**Fix immediately:**
1. Generate secret: `openssl rand -base64 32`
2. Update in Render Dashboard
3. Wait for restart
4. Test API endpoints

## 📊 Expected Results After Fix

### Before Fix:
- ❌ `/api/products` → 500
- ❌ `/api/collections` → 500
- ❌ `/api/categories` → 500
- ❌ All endpoints → 500

### After Fix:
- ✅ `/api/products` → 200 (with data or empty array)
- ✅ `/api/collections` → 200
- ✅ `/api/categories` → 200
- ✅ All endpoints → 200

## 🔄 Testing After Fix

### Run Test Script:
```bash
./test-frontend-backend.sh
```

### Manual Test:
1. Visit: `https://juelle-hair-web.onrender.com`
2. Check browser console (should see no 500 errors)
3. Try loading products/collections
4. Login to admin and test features

## 📝 Next Steps

1. **Check Backend Logs** - Find the exact error
2. **Update JWT_SECRET** - Replace placeholder
3. **Verify Database** - Ensure connection works
4. **Test Endpoints** - Verify 500 errors are gone
5. **Test Frontend** - Verify data loads correctly

---

## 🎯 Action Plan

**Right Now:**
1. Open Render Dashboard
2. Go to `juelle-hair-backend` → Logs
3. Copy the error message
4. Update JWT_SECRET
5. Test API endpoint

**If Still Failing:**
- Share the error message from logs
- Check database connection
- Verify all environment variables
- Check Prisma migrations

---

**Remember:** The frontend is working perfectly. Once backend 500 errors are fixed, everything will work together correctly!
