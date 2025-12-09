# Render Blueprint Setup - Complete Guide

## What is a Blueprint?
A Blueprint is Render's Infrastructure as Code (IaC) feature. You define your entire infrastructure in a `render.yaml` file, and Render creates everything automatically.

## ✅ What I've Set Up For You

I've created a complete `render.yaml` file in your repository root that will:

1. **Create the backend web service**
   - Builds from your `backend` folder
   - Uses Node.js runtime
   - Automatically handles port binding
   - Sets up health checks

2. **Configure database connection**
   - Links to your PostgreSQL database automatically
   - Sets `DATABASE_URL` environment variable

3. **Set up build and start commands**
   - Installs dependencies
   - Generates Prisma Client
   - Builds the application
   - Starts in production mode

## 🚀 How to Deploy Using Blueprint

### Step 1: Push render.yaml to GitHub

The `render.yaml` file is already created. Make sure it's committed and pushed:

```bash
cd /Users/OceanCyber/Downloads/juellehairgh.com
git add render.yaml
git commit -m "Add Render Blueprint configuration"
git push origin main
```

### Step 2: Create Blueprint in Render

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Click **"New +"** → **"Blueprint"**

2. **Connect Repository**
   - Select your Git provider (GitHub)
   - Choose your repository: `juellehairgh.com` (or whatever it's named)
   - Click **"Connect"**

3. **Render will detect render.yaml**
   - Render automatically finds `render.yaml` in your repo
   - It will show a preview of what will be created

4. **Review Configuration**
   - You'll see:
     - ✅ Web Service: `juelle-hair-backend`
     - ✅ Database: `juelle-hair-postgres` (if creating new) OR link existing
   
5. **Important: Link Existing Database**
   - If you already have a database, you can:
     - **Option A:** Let Render create a new one (then migrate data)
     - **Option B:** After Blueprint creates the service, manually link your existing database
     - **Option C:** Modify render.yaml to reference existing database (see below)

6. **Set Environment Variables**
   Before deploying, you'll need to add these in Render:
   - `JWT_SECRET` - Generate with: `openssl rand -base64 32`
   - `PAYSTACK_SECRET_KEY` - Your Paystack secret key
   - `SENDGRID_API_KEY` - (Optional) For email
   - Or SMTP settings if not using SendGrid

7. **Click "Apply"**
   - Render will create everything automatically
   - Watch the build logs
   - Service will be available at: `https://juelle-hair-backend.onrender.com`

## 📝 Environment Variables to Add

After the Blueprint creates the service, add these in Render Dashboard:

### Required:
```
JWT_SECRET=<generate-a-random-string>
PAYSTACK_SECRET_KEY=<your-paystack-secret-key>
```

### Optional (Email):
```
SENDGRID_API_KEY=<your-sendgrid-key>
# OR
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

## 🔗 Link Existing Database

If you already have a PostgreSQL database:

1. **After Blueprint creates the service:**
   - Go to `juelle-hair-backend` service
   - Click **"Connections"** tab
   - Click **"Link Resource"**
   - Select your existing database: `juelle-hair-postgres`
   - Render will automatically set `DATABASE_URL`

2. **Or modify render.yaml** to reference existing database:
   ```yaml
   services:
     - type: web
       name: juelle-hair-backend
       # ... other config ...
       envVars:
         - key: DATABASE_URL
           fromDatabase:
             name: juelle-hair-postgres
             property: connectionString
   ```

## ✅ What Gets Created

### Web Service:
- **Name:** `juelle-hair-backend`
- **URL:** `https://juelle-hair-backend.onrender.com`
- **Runtime:** Node.js
- **Build:** `npm ci && npm run prisma:generate && npm run build`
- **Start:** `npm run start:prod`
- **Health Check:** `/health`

### Database (if creating new):
- **Name:** `juelle-hair-postgres`
- **Plan:** Starter
- **Region:** Oregon
- **Auto-linked** to backend service

## 🎯 Verification Steps

After deployment:

1. **Check Build Logs**
   - Should see: `✅ Application is running on: http://0.0.0.0:10000`
   - Should see: `🚀 Server is ready to accept connections`

2. **Test Health Endpoint**
   ```bash
   curl https://juelle-hair-backend.onrender.com/health
   ```

3. **Test Version Endpoint**
   ```bash
   curl https://juelle-hair-backend.onrender.com/version
   ```

4. **Test API**
   ```bash
   curl https://juelle-hair-backend.onrender.com/api/products
   ```

## 🔄 Updating the Blueprint

To update your infrastructure:

1. **Modify `render.yaml`** in your repo
2. **Push changes** to GitHub
3. **In Render Dashboard:**
   - Go to your Blueprint
   - Click **"Update"** or **"Sync"**
   - Render will apply changes

## 🐛 Troubleshooting

### Build Fails
- Check Root Directory is `backend`
- Verify `package.json` has correct scripts
- Check Prisma schema is in `backend/prisma/`

### Health Check Fails
- Try changing Health Check Path to `/api/health`
- Increase Initial Delay to 30 seconds
- Check logs for binding issues

### Database Connection Fails
- Verify database is linked in Connections tab
- Check `DATABASE_URL` is set correctly
- Ensure database is accessible from Render

## 📋 Quick Checklist

- [ ] `render.yaml` is in repository root
- [ ] `render.yaml` is committed and pushed to GitHub
- [ ] Blueprint created in Render Dashboard
- [ ] Repository connected in Render
- [ ] Environment variables added (JWT_SECRET, PAYSTACK_SECRET_KEY)
- [ ] Database linked (if using existing)
- [ ] Service deployed successfully
- [ ] Health check passing
- [ ] API endpoints working

## 🎉 Benefits of Blueprint

✅ **Infrastructure as Code** - Version controlled
✅ **Reproducible** - Same setup every time
✅ **Easy Updates** - Change YAML, sync, done
✅ **Team Friendly** - Anyone can deploy
✅ **No Manual Configuration** - Everything automated

---

**Ready to deploy?** Follow Step 1 and Step 2 above, and Render will handle the rest!
