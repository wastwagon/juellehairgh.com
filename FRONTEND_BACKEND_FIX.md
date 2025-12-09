# Frontend-Backend Communication Fix Guide

## 🔍 Current Status

### ✅ What's Working
- Backend health endpoint: `200 OK` ✅
- CORS configuration: Correctly configured ✅
- Frontend is deployed and accessible ✅
- Frontend can detect backend URL ✅

### ❌ What's Not Working
- **Backend API endpoints return 500 errors**
- Frontend cannot fetch data from backend
- Admin pages cannot load data

## 🎯 Root Cause

The backend is returning **500 Internal Server Error** for all API endpoints. This is **NOT a frontend-backend communication issue** - it's a **backend application error**.

**Evidence:**
- CORS is configured correctly
- Health endpoint works (backend is running)
- API endpoints return 500 (backend has errors)

## 🔧 Immediate Fixes Required

### Fix 1: Update JWT_SECRET (CRITICAL)

**Problem:** Backend has placeholder JWT_SECRET value

**Solution:**
1. Generate secure secret:
   ```bash
   openssl rand -base64 32
   ```

2. Update in Render Dashboard:
   - Go to: `juelle-hair-backend` → Environment
   - Find: `JWT_SECRET`
   - Replace: `CHANGE_ME_GENERATE_WITH_openssl_rand_base64_32`
   - With: Your generated secret
   - Save (service will auto-restart)

### Fix 2: Check Backend Logs

**In Render Dashboard:**
1. Go to: `juelle-hair-backend` → Logs
2. Look for recent errors (last 10 minutes)
3. Copy the error messages
4. Common errors:
   - Database connection failures
   - Missing environment variables
   - Application crashes
   - Prisma errors

### Fix 3: Verify Database Connection

**Check:**
1. Database status: `juelle-hair-postgres` should be "Available"
2. DATABASE_URL: Should be auto-set from database
3. Backend logs: Should show "✅ Database connection successful"

### Fix 4: Verify Environment Variables

**Required variables:**
- ✅ `DATABASE_URL` - Auto-set from database
- ⚠️ `JWT_SECRET` - **NEEDS REAL VALUE** (currently placeholder)
- ❓ `PAYSTACK_SECRET_KEY` - May be required for some endpoints
- ❓ `SENDGRID_API_KEY` - Optional but may cause errors if missing

## 📋 Frontend Configuration (Already Correct)

### API Base URL
- ✅ Set in `render.yaml`: `https://juelle-hair-backend.onrender.com/api`
- ✅ Frontend can detect backend URL automatically
- ✅ Runtime config injection works

### CORS
- ✅ Backend allows frontend origin
- ✅ CORS headers are correct
- ✅ Preflight requests work

## 🧪 Testing Admin Pages

### Run Test Script
```bash
./test-frontend-backend.sh
```

This will test:
- Backend health
- All API endpoints
- All admin pages
- CORS configuration

### Manual Testing

**Test Admin Pages:**
1. Visit: `https://juelle-hair-web.onrender.com/admin`
2. Should redirect to login (if not authenticated)
3. After login, admin pages should load
4. Check browser console for API errors

**Test API Directly:**
```bash
# Test health
curl https://juelle-hair-backend.onrender.com/health

# Test products (will return 500 until backend is fixed)
curl https://juelle-hair-backend.onrender.com/api/products
```

## 🚨 Most Likely Issue

**JWT_SECRET is a placeholder!**

The backend is configured with:
```
JWT_SECRET=CHANGE_ME_GENERATE_WITH_openssl_rand_base64_32
```

This causes authentication/authorization errors that result in 500 responses.

**Fix immediately:**
1. Generate: `openssl rand -base64 32`
2. Update in Render Dashboard
3. Restart backend (auto-restarts on env var change)

## 📊 Admin Pages Checklist

All admin pages should be accessible at:
- `/admin` - Dashboard
- `/admin/products` - Products management
- `/admin/orders` - Orders management
- `/admin/customers` - Customer management
- `/admin/settings` - Settings
- `/admin/collections` - Collections
- `/admin/categories` - Categories
- `/admin/brands` - Brands
- `/admin/reviews` - Reviews
- `/admin/media` - Media library
- `/admin/blog` - Blog posts
- `/admin/seo` - SEO tools
- `/admin/analytics` - Analytics
- `/admin/shipping` - Shipping
- `/admin/currency` - Currency rates
- `/admin/discount-codes` - Discount codes
- `/admin/banners` - Banners
- `/admin/flash-sales` - Flash sales
- `/admin/newsletter` - Newsletter
- `/admin/emails` - Email templates
- `/admin/attributes` - Product attributes
- `/admin/product-variations` - Product variations
- `/admin/trust-badges` - Trust badges
- `/admin/wallets` - Wallets
- `/admin/badges` - Badges

**Note:** These pages require authentication. They should redirect to `/login` if not authenticated.

## ✅ Next Steps

1. **Update JWT_SECRET** - Replace placeholder with real value
2. **Check backend logs** - Find the exact error causing 500s
3. **Fix backend errors** - Based on log messages
4. **Test admin pages** - Verify they load after backend fix
5. **Test API endpoints** - Verify data loads correctly

---

**Action Required:** Update JWT_SECRET in Render Dashboard and check backend logs for specific error messages.
