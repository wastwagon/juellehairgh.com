# Render Backend Service Setup Guide

## Step 1: Create New Web Service

1. Go to Render Dashboard → **"New +"** → **"Web Service"**
2. Connect your Docker Hub account (if not already connected)
3. Select **"Use an existing image from a registry"**
4. Enter image: `flygonpriest/juelle-hair-backend:latest`
5. Click **"Create Web Service"**

## Step 2: Configure Service Settings

### Basic Settings:
- **Name**: `juelle-hair-backend` (or your preferred name)
- **Region**: Choose closest to your users
- **Branch**: (Not applicable for Docker images)
- **Root Directory**: (Leave empty for Docker)

### Health Check Settings (CRITICAL):
- **Health Check Path**: `/health` ⚠️ **This is the key setting!**
- **Health Check Port**: Leave default (Render will use port 10000 internally)

### Build & Deploy:
- **Docker Image**: `flygonpriest/juelle-hair-backend:latest`
- **Docker Command**: (Leave empty - uses CMD from Dockerfile)
- **Auto-Deploy**: Enable if you want automatic updates when you push new `latest` tag

## Step 3: Link Database (RECOMMENDED)

1. In your new service → **"Connections"** or **"Linked Resources"** tab
2. Click **"Link Resource"**
3. Select your PostgreSQL database: `juelle-hair-postgres`
4. Render will automatically set `DATABASE_URL` environment variable

**OR** manually set `DATABASE_URL` in Environment Variables (see Step 4)

## Step 4: Set Environment Variables

Go to **"Environment"** tab and add these variables:

### Required Variables:

```
DATABASE_URL=postgresql://juellehair_user:1JbEutCA261LKqZIaBfq4YW0dudkwGfC@dpg-d4nkgtngi27c73bi9j8g-a:5432/juellehair_k4fu?sslmode=require
```

**OR** if you linked the database, Render sets this automatically - you can skip it.

```
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://juelle-hair-web.onrender.com
JWT_SECRET=<generate-a-random-string-here>
PAYSTACK_SECRET_KEY=<your-paystack-secret-key>
```

### Optional but Recommended:
```
RENDER_EXTERNAL_URL=https://<your-backend-service-name>.onrender.com
```

## Step 5: Generate JWT Secret

Run this command locally to generate a secure JWT secret:
```bash
openssl rand -base64 32
```

Copy the output and use it as your `JWT_SECRET` value.

## Step 6: Deploy

1. Click **"Save Changes"** or **"Manual Deploy"**
2. Wait for deployment to complete
3. Check logs to verify:
   - `✅ Application is running on: http://0.0.0.0:3001`
   - `✅ Health check available at: http://0.0.0.0:3001/health`

## Step 7: Verify Health Check

After deployment, check:
1. Service status should show **"Live"** (green)
2. Logs should show successful startup
3. Health check should pass (no timeout errors)

## Troubleshooting

### If health check still fails:
1. Verify **Health Check Path** is set to `/health` (not `/api/health`)
2. Check logs for startup errors
3. Verify the app is listening on `0.0.0.0` (check logs)
4. Ensure `DATABASE_URL` is set correctly (if not linked)

### If database connection fails:
1. Link the database in Connections tab (recommended)
2. OR verify `DATABASE_URL` is correct in Environment Variables
3. Check database is running and accessible

## Quick Copy-Paste Environment Variables

Use the "Add from .env" feature in Render and paste:

```
DATABASE_URL=postgresql://juellehair_user:1JbEutCA261LKqZIaBfq4YW0dudkwGfC@dpg-d4nkgtngi27c73bi9j8g-a:5432/juellehair_k4fu?sslmode=require
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://juelle-hair-web.onrender.com
JWT_SECRET=<REPLACE-WITH-GENERATED-SECRET>
PAYSTACK_SECRET_KEY=<REPLACE-WITH-YOUR-PAYSTACK-KEY>
```

**Remember to replace:**
- `<REPLACE-WITH-GENERATED-SECRET>` with output from `openssl rand -base64 32`
- `<REPLACE-WITH-YOUR-PAYSTACK-KEY>` with your actual Paystack secret key

