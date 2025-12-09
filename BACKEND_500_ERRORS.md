# Backend 500 Errors - Troubleshooting Guide

## 🔍 Current Issue
Backend API is returning 500 Internal Server Error for all endpoints:
- `/api/products`
- `/api/collections`
- `/api/currency/rates`
- `/api/flash-sales/active`
- `/api/blog`
- `/api/settings`
- And many more...

## ✅ What's Working
- Frontend is loading correctly ✅
- Frontend can connect to backend URL ✅
- Backend is deployed and running ✅
- Health check endpoint might be working ✅

## ❌ What's Not Working
- All API endpoints return 500 errors
- No data is being returned

## 🔧 Steps to Diagnose

### 1. Check Backend Logs in Render

1. Go to **Render Dashboard**
2. Click on **`juelle-hair-backend`** service
3. Click on **"Logs"** tab
4. Look for error messages, especially:
   - Database connection errors
   - Missing environment variables
   - Application crashes
   - Stack traces

### 2. Common Causes of 500 Errors

#### A. Database Connection Issues
**Symptoms:**
- Errors like "Can't reach database server"
- "Connection refused"
- Prisma errors

**Check:**
- Verify `DATABASE_URL` is set correctly
- Check if database is running (`juelle-hair-postgres` should show "Available")
- Test database connection

#### B. Missing Environment Variables
**Symptoms:**
- Errors about undefined variables
- JWT errors
- Payment processing errors

**Check:**
- `JWT_SECRET` - Currently set to placeholder `CHANGE_ME_GENERATE_WITH_openssl_rand_base64_32`
- `PAYSTACK_SECRET_KEY` - May be missing
- Other required variables

#### C. Database Schema/Migration Issues
**Symptoms:**
- Prisma errors
- "Table does not exist"
- Migration errors

**Check:**
- Verify migrations ran successfully
- Check if database tables exist

#### D. Application Errors
**Symptoms:**
- Unhandled exceptions
- Type errors
- Missing modules

**Check:**
- Look for stack traces in logs
- Check for import errors
- Verify all dependencies are installed

### 3. Quick Fixes to Try

#### Fix 1: Update JWT_SECRET
The current JWT_SECRET is a placeholder. Generate a real one:

1. In Render Dashboard → `juelle-hair-backend` → Environment
2. Update `JWT_SECRET`:
   - Generate: `openssl rand -base64 32`
   - Or use: Any secure random string (at least 32 characters)

#### Fix 2: Verify Database Connection
1. Check if `juelle-hair-postgres` database is "Available"
2. Verify `DATABASE_URL` is set correctly
3. Test connection from backend logs

#### Fix 3: Check for Missing Environment Variables
Add any missing required variables:
- `PAYSTACK_SECRET_KEY` (if using payments)
- `SENDGRID_API_KEY` (if using email)
- Other service-specific keys

### 4. Test Backend Directly

Try accessing backend endpoints directly:
- Health check: `https://juelle-hair-backend.onrender.com/health`
- API test: `https://juelle-hair-backend.onrender.com/api/products`

Check the response and error messages.

### 5. Check Backend Startup Logs

Look at the backend startup logs for:
- ✅ "Application is running on..."
- ✅ "Database connection successful"
- ❌ Any error messages during startup
- ❌ Failed module imports
- ❌ Configuration errors

## 📋 Next Steps

1. **Check Backend Logs** - This is the most important step
2. **Share Error Messages** - Copy the specific error from logs
3. **Verify Environment Variables** - Check all required vars are set
4. **Test Database Connection** - Ensure database is accessible

---

**Action Required:** Check the backend logs in Render Dashboard and share the specific error messages you see. This will help identify the exact cause of the 500 errors.
