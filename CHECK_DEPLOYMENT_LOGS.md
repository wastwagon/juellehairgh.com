# How to Check Deployment Logs in Render

## 🔍 Step-by-Step Guide

### 1. Access the Failed Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on **"Blueprints"** in the left sidebar
3. Click on **"juellehairgh-web"** blueprint
4. You should see the failed services listed

### 2. Check Backend Logs (`juelle-hair-backend`)

1. Click on **"juelle-hair-backend"** service (or find it in the Resources list)
2. Click on the **"Logs"** tab at the top
3. Look for error messages in the logs

**What to look for:**

#### Build Phase Errors:
- ❌ `npm ci` failures (dependency installation)
- ❌ `prisma generate` errors (Prisma Client generation)
- ❌ `npm run build` errors (TypeScript compilation)

#### Runtime Errors:
- ❌ `prisma migrate deploy` failures (database migrations)
- ❌ Application startup errors
- ❌ Port binding errors
- ❌ Database connection errors

#### Health Check Errors:
- ❌ Health check timeouts
- ❌ `/health` endpoint not responding

### 3. Check Frontend Logs (`juelle-hair-web`)

1. Click on **"juelle-hair-web"** service
2. Click on the **"Logs"** tab
3. Look for error messages

**What to look for:**

#### Build Phase Errors:
- ❌ `npm ci` failures
- ❌ `npm run build` errors (Next.js build)

#### Runtime Errors:
- ❌ Port binding errors
- ❌ Next.js startup failures

### 4. Common Error Patterns

#### Error: "Cannot find module" or "Module not found"
- **Cause**: Missing dependencies or incorrect `rootDir`
- **Fix**: Verify `rootDir: backend` and `rootDir: frontend` are correct

#### Error: "Prisma Client not generated"
- **Cause**: `prisma generate` failed during build
- **Fix**: Check Prisma schema and ensure database URL is not required during build

#### Error: "Health check failed" or "Timed out"
- **Cause**: Application not starting or not responding on `/health`
- **Fix**: Check if app is binding to `0.0.0.0` and PORT is set correctly

#### Error: "Database connection failed"
- **Cause**: DATABASE_URL not set or incorrect
- **Fix**: Verify database is created and linked correctly

#### Error: "JWT_SECRET is required"
- **Cause**: Missing JWT_SECRET (though backend has fallback)
- **Fix**: Set JWT_SECRET in Render dashboard (generate with `openssl rand -base64 32`)

### 5. Copy Error Messages

When you find errors:
1. **Select and copy** the error message
2. **Share it** so we can fix it together
3. Include:
   - The full error message
   - Which phase it occurred in (build/runtime)
   - Any stack traces

### 6. Quick Fixes to Try

#### If Build Fails:
1. Check if `package.json` files are correct
2. Verify `rootDir` paths match your folder structure
3. Check for TypeScript/ESLint errors

#### If Runtime Fails:
1. Verify all required environment variables are set
2. Check if PORT is being used correctly
3. Verify health check path is correct (`/health` for backend, `/` for frontend)

#### If Health Check Fails:
1. Check if app starts successfully
2. Verify health endpoint responds quickly (< 5 seconds)
3. Check if app binds to `0.0.0.0` not `localhost`

---

## 📋 Next Steps

1. **Check the logs** using the steps above
2. **Copy the error messages** you find
3. **Share them** and I'll help fix the issues
4. **Or** if you see specific errors, let me know and I can provide targeted fixes

The most common issues are usually:
- Missing environment variables
- Build errors (TypeScript, dependencies)
- Health check timeouts
- Port binding issues

Let's identify the specific error and fix it! 🚀
