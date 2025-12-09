# Deployment Troubleshooting Guide

## ✅ Fixed Issues

1. **Frontend Start Command**: Fixed to use `npm run start -- -p $PORT` to properly override the hardcoded port in package.json
2. **Database Plan**: Changed from legacy `starter` to `free` plan
3. **Frontend Added**: Frontend service is now included in Blueprint

## 🔍 Current Status

- ✅ Database created successfully (`juelle-hair-postgres`)
- ❌ Backend deployment failed (`juelle-hair-backend`)
- ❌ Frontend deployment failed (`juelle-hair-web`)

## 🔧 Next Steps to Debug

### 1. Check Deployment Logs in Render

Go to each failed service in Render Dashboard and check the build/deployment logs:

**For Backend (`juelle-hair-backend`):**
- Click on the service
- Go to "Logs" tab
- Look for:
  - Build errors (npm install, Prisma generate, build)
  - Runtime errors (startup, database connection)
  - Health check failures

**For Frontend (`juelle-hair-web`):**
- Click on the service
- Go to "Logs" tab
- Look for:
  - Build errors (npm install, Next.js build)
  - Runtime errors (startup, port binding)

### 2. Common Issues to Check

#### Backend Issues:

1. **Missing Environment Variables:**
   - `JWT_SECRET` - Required for authentication
   - `PAYSTACK_SECRET_KEY` - Required for payments
   - Check if these are set in Render dashboard

2. **Prisma Generation:**
   - Check if `npm run prisma:generate` succeeds
   - Verify Prisma Client is generated correctly

3. **Database Connection:**
   - Verify `DATABASE_URL` is correctly linked from database
   - Check if migrations run successfully (`npm run prisma:deploy`)

4. **Health Check:**
   - Verify `/health` endpoint responds quickly
   - Check if health check path is correct

#### Frontend Issues:

1. **Build Errors:**
   - Check for TypeScript errors (currently ignored in config)
   - Check for missing dependencies
   - Verify Next.js build completes

2. **Port Binding:**
   - Verify PORT environment variable is set
   - Check if Next.js starts on correct port

3. **Environment Variables:**
   - `NEXT_PUBLIC_API_BASE_URL` - Must point to backend URL
   - Verify backend URL is correct (will be `https://juelle-hair-backend.onrender.com/api`)

### 3. Verify Repository Connection

- Ensure Render Blueprint is connected to correct repository
- Verify branch is `main`
- Check if `render.yaml` is in root directory

### 4. Manual Fixes After Initial Deployment

Once services are deployed, you may need to:

1. **Update Frontend Backend URL:**
   - In Render dashboard, go to `juelle-hair-web` service
   - Update `NEXT_PUBLIC_API_BASE_URL` to actual backend URL
   - Format: `https://juelle-hair-backend.onrender.com/api`

2. **Add Missing Environment Variables:**
   - Backend: `JWT_SECRET`, `PAYSTACK_SECRET_KEY`, etc.
   - Frontend: `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`, etc.

3. **Update Backend Frontend URL:**
   - In Render dashboard, go to `juelle-hair-backend` service
   - Update `FRONTEND_URL` to actual frontend URL
   - Format: `https://juelle-hair-web.onrender.com`

## 📋 Current render.yaml Configuration

```yaml
services:
  - type: web
    name: juelle-hair-backend
    runtime: node
    plan: starter
    region: oregon
    branch: main
    rootDir: backend
    buildCommand: npm ci && npm run prisma:generate && npm run build
    startCommand: (npm run prisma:deploy || true) && npm run start:prod
    healthCheckPath: /health

  - type: web
    name: juelle-hair-web
    runtime: node
    plan: starter
    region: oregon
    branch: main
    rootDir: frontend
    buildCommand: npm ci && npm run build
    startCommand: npm run start -- -p $PORT
    healthCheckPath: /

databases:
  - name: juelle-hair-postgres
    plan: free
    region: oregon
    databaseName: juellehair
    user: juellehair_user
    postgresMajorVersion: "16"
```

## 🚀 After Fixing

1. Push latest changes to GitHub
2. Render will auto-sync and retry deployment
3. Monitor logs for any remaining issues
4. Once deployed, verify health checks pass
5. Test API endpoints and frontend

---

**Action Required:** Check the deployment logs in Render Dashboard to identify the specific error causing the failures.
