# Render Native Build Setup Guide

## Overview
This guide will help you deploy your backend using Render's native build (no Docker). Render will build directly from your Git repository.

## Prerequisites
1. Your code must be in a Git repository (GitHub, GitLab, or Bitbucket)
2. Render account connected to your Git provider

## Step 1: Prepare Your Repository

### Option A: If you have a monorepo (backend + frontend in same repo)

Create a `render.yaml` file in your repository root:

```yaml
services:
  - type: web
    name: juelle-hair-backend
    runtime: node
    plan: starter
    buildCommand: cd backend && npm ci && npm run prisma:generate && npm run build
    startCommand: cd backend && npm run start:prod
    rootDir: backend
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        sync: false  # Render sets this automatically
    healthCheckPath: /health
```

### Option B: Manual Setup (Recommended for first time)

Follow the steps below in Render Dashboard.

## Step 2: Create New Web Service in Render

1. **Go to Render Dashboard**
   - Click "New +" → "Web Service"

2. **Connect Repository**
   - Select your Git provider (GitHub/GitLab/Bitbucket)
   - Choose your repository: `juellehairgh.com` (or whatever it's named)
   - Click "Connect"

3. **Configure Service**

   **Basic Settings:**
   - **Name**: `juelle-hair-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or `master` - your default branch)
   - **Root Directory**: `backend` ⚠️ **IMPORTANT: Set this to `backend`**
   - **Runtime**: `Node`
   - **Build Command**: 
     ```
     npm ci && npm run prisma:generate && npm run build
     ```
   - **Start Command**: 
     ```
     npm run start:prod
     ```

   **Health Check:**
   - **Health Check Path**: `/health`
   - **Initial Delay**: `10` seconds
   - **Interval**: `10` seconds
   - **Timeout**: `5` seconds

## Step 3: Set Environment Variables

Go to **Environment** tab and add:

### Required Variables:

```
NODE_ENV=production
```

**Note:** `PORT` is automatically set by Render - DO NOT set it manually.

### Database:
```
DATABASE_URL=postgresql://juellehair_user:lJbEutCA26lLKqZIaBfq4YWOdudkwGfC@dpg-d4nkgtngi27c73bi9j8g-a/juellehair_k4fu
```

**OR** better: Link the database in Render:
1. Go to **Connections** tab
2. Click **Link Resource**
3. Select your PostgreSQL database
4. Render will automatically set `DATABASE_URL`

### Other Required Variables:
```
FRONTEND_URL=https://juelle-hair-web.onrender.com
JWT_SECRET=your-super-secret-jwt-key-change-this-to-a-random-string
PAYSTACK_SECRET_KEY=sk_live_your_paystack_secret_key_here
```

### Optional (Email):
```
SENDGRID_API_KEY=your_sendgrid_api_key
# OR
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

## Step 4: Link Database (Recommended)

1. In your service → **Connections** tab
2. Click **Link Resource**
3. Select your PostgreSQL database: `juelle-hair-postgres`
4. Render automatically sets `DATABASE_URL` - you can remove it from Environment Variables

## Step 5: Deploy

1. Click **"Create Web Service"**
2. Render will:
   - Clone your repository
   - Run `npm ci` (install dependencies)
   - Run `npm run prisma:generate` (generate Prisma Client)
   - Run `npm run build` (build NestJS app)
   - Run `npm run start:prod` (start the app)
   - Check health at `/health`

## Step 6: Verify Deployment

### Check Logs

You should see:
```
✅ Application is running on: http://0.0.0.0:10000
✅ Build Version: [version]
✅ Health check available at: http://0.0.0.0:10000/health
🚀 Server is ready to accept connections
```

### Test Endpoints

```bash
# Health check
curl https://juelle-hair-backend.onrender.com/health

# Version
curl https://juelle-hair-backend.onrender.com/version

# API endpoint
curl https://juelle-hair-backend.onrender.com/api/products
```

## Advantages of Native Build

✅ **No Docker builds** - Faster deployments
✅ **Automatic port binding** - Render handles it
✅ **Easier debugging** - Direct access to logs
✅ **Auto-deploy on Git push** - Enable in settings
✅ **Better error messages** - See build errors directly
✅ **No image versioning** - Always uses latest code

## Troubleshooting

### Build Fails

**Check:**
- Root Directory is set to `backend`
- Build Command includes `prisma:generate`
- Node version matches (Render uses Node 18 by default)

**Fix Node Version (if needed):**
Add to Environment Variables:
```
NODE_VERSION=18.20.8
```

### Prisma Generate Fails

**Check:**
- `DATABASE_URL` is set (even if database isn't accessible during build)
- Prisma schema is in `backend/prisma/schema.prisma`

**Note:** Prisma generate doesn't need a real database connection, but it needs `DATABASE_URL` to be set.

### Health Check Fails

**Try:**
- Change Health Check Path to `/api/health`
- Or use `/` (root)
- Increase Initial Delay to 30 seconds

### Port Issues

**Render automatically:**
- Sets `PORT` environment variable
- Your code uses `process.env.PORT || 3001`
- Binds to `0.0.0.0` automatically (Render handles this)

## Migration from Docker

If you're currently using Docker:

1. **Create new service** using native build (don't delete old one yet)
2. **Test the new service** to make sure it works
3. **Update frontend** to point to new backend URL (if different)
4. **Delete old Docker-based service** once confirmed working

## Auto-Deploy

Enable automatic deployments:

1. Service → Settings → **Auto-Deploy**
2. Toggle **ON**
3. Render will deploy on every push to your default branch

## Next Steps

1. Set up the service using the steps above
2. Test the deployment
3. Update frontend to use new backend URL (if changed)
4. Enable auto-deploy for convenience

---

**Need Help?** Check Render logs for detailed error messages. The native build approach provides much clearer error output than Docker builds.
