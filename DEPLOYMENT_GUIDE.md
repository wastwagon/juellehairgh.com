# 🚀 Juelle Hair Ghana - Deployment Guide

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Database Migration Strategy](#database-migration-strategy)
4. [First-Time Deployment](#first-time-deployment)
5. [Coolify Deployment](#coolify-deployment)
6. [Manual Deployment](#manual-deployment)
7. [Updating Production](#updating-production)
8. [Troubleshooting](#troubleshooting)

---

## 📖 Overview

This application uses an **automated migration system** that:

✅ **Automatically detects empty databases** and imports production data  
✅ **Includes all product images** (24MB committed to Git)  
✅ **Removes test users** automatically  
✅ **Runs on every deployment** via Docker entrypoint  
✅ **Safe for existing databases** (won't overwrite data)

### What's Included

- **Database:** Complete PostgreSQL dump with:
  - 46 products with variants
  - 19 categories, 15 brands
  - 3 production users (admin@juellehair.com, juellehair@juellehair.com, iwisebrain@yahoo.com)
  - 12 orders with history
  - All reviews, collections, banners
  - Product attributes and terms

- **Media Files:** 
  - 172 files in `frontend/public/media/` (7.9MB)
  - 96 files in `backend/uploads/media/` (16MB)
  - Product images, swatches, library assets

---

## ✅ Prerequisites

### Required Environment Variables

**Backend (.env):**
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname?schema=public
JWT_SECRET=your-secure-random-secret-key
PAYSTACK_SECRET_KEY=sk_live_your_paystack_secret
FRONTEND_URL=https://yourdomain.com
PORT=3001
NODE_ENV=production
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_your_paystack_public
NEXT_PUBLIC_APP_NAME=Juelle Hair Ghana
NEXT_PUBLIC_BASE_CURRENCY=GHS
```

### Generate Secrets

```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate NEXTAUTH_SECRET
openssl rand -base64 32
```

---

## 🗄️ Database Migration Strategy

### How It Works

The application uses a **3-tier migration system**:

1. **Empty Database Detection** → Imports `production-baseline.sql`
2. **Existing Database** → Runs Prisma migrations only
3. **Force Import** → Set `FORCE_IMPORT=true` to reimport

### Migration File

**Location:** `backend/prisma/migrations/production-baseline.sql`  
**Size:** ~3MB  
**Contains:** Complete database schema + production data

### What Happens on Deploy

```mermaid
graph TD
    A[Container Starts] --> B{Database Empty?}
    B -->|Yes| C[Import production-baseline.sql]
    B -->|No| D[Run pending migrations]
    C --> E[Start Application]
    D --> E
```

**Timeline:**
- Database check: ~2 seconds
- Import (if empty): ~30-60 seconds
- Total startup: ~1-2 minutes

---

## 🚀 First-Time Deployment

### Step 1: Prepare Your Code

```bash
# Clone repository
git clone https://github.com/yourusername/juellehairgh.com.git
cd juellehairgh.com

# Verify migration file exists
ls -lh backend/prisma/migrations/production-baseline.sql
# Should show: -rw-r--r-- 1 user user 3.0M ...

# Verify media files
find frontend/public/media -type f | wc -l  # Should show: 172
find backend/uploads/media -type f | wc -l  # Should show: 96
```

### Step 2: Set Up Environment

Create `.env` files in both `backend/` and `frontend/` directories using the templates above.

### Step 3: Deploy (Choose One)

- [Option A: Coolify](#coolify-deployment) (Recommended)
- [Option B: Manual Docker](#manual-deployment)

---

## 🎯 Coolify Deployment

### Setup Coolify

1. **Create New Project** in Coolify dashboard
2. **Add Git Repository** with SSH/HTTPS
3. **Configure Services:**

#### Backend Service

- **Type:** Docker Compose / Dockerfile
- **Dockerfile:** `backend/Dockerfile.prod`
- **Port:** 3001
- **Environment Variables:** Add all backend vars
- **Health Check:** `http://localhost:3001/health`
- **Persistent Storage:**
  - `/app/backend/uploads/media` → for future uploads
  - `/app/backend/prisma` → migrations persist

#### Frontend Service

- **Type:** Next.js / Docker
- **Dockerfile:** `frontend/Dockerfile.prod`
- **Port:** 3000
- **Environment Variables:** Add all frontend vars
- **Build Args:**
  ```
  NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
  ```

#### PostgreSQL Database

- **Type:** PostgreSQL 15
- **Database Name:** `juellehair`
- **Persistent Volume:** `/var/lib/postgresql/data`
- **Backup Schedule:** Daily recommended

### GitHub Integration

1. **Add Coolify Webhook** to GitHub repository:
   - Go to: Settings → Webhooks → Add webhook
   - Payload URL: `https://coolify.yourdomain.com/webhooks/...`
   - Content type: `application/json`
   - Events: Just the push event

2. **Configure GitHub Secret:**
   ```bash
   # In repository Settings → Secrets → Actions
   COOLIFY_WEBHOOK_URL=https://coolify.yourdomain.com/webhooks/...
   ```

### Deploy

```bash
# Push to main branch
git push origin main

# GitHub Actions will:
# 1. Build and test
# 2. Trigger Coolify webhook
# 3. Coolify pulls, builds, deploys
# 4. Docker entrypoint runs migrations
# 5. Application starts
```

**First deployment takes:** ~5-10 minutes  
**Subsequent deployments:** ~2-3 minutes

---

## 🛠️ Manual Deployment

### Using Docker Compose

1. **Clone Repository:**
```bash
git clone https://github.com/yourusername/juellehairgh.com.git
cd juellehairgh.com
```

2. **Create `.env` file** in project root:
```env
# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=juellehair
POSTGRES_PORT=5432

# Backend
JWT_SECRET=your-jwt-secret
PAYSTACK_SECRET_KEY=sk_live_...
FRONTEND_URL=https://yourdomain.com

# Frontend
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
NEXTAUTH_SECRET=your-nextauth-secret
```

3. **Deploy:**
```bash
# Build and start all services
docker-compose up -d --build

# Watch logs
docker-compose logs -f backend

# Expected output:
# ✓ Database is empty - safe to import
# ✓ Database import successful
# ✓ Products: 46
# ✓ Categories: 19
# ✓ Users: 3
# 🚀 Application starting...
```

4. **Verify Deployment:**
```bash
# Check services
docker-compose ps

# Test backend API
curl http://localhost:8001/api/health

# Test frontend
curl http://localhost:8002

# Check database
docker exec juelle-hair-db psql -U postgres -d juellehair -c \
  "SELECT COUNT(*) FROM products;"
```

---

## 🔄 Updating Production

### Regular Updates (Code Changes)

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose up -d --build

# Migration system automatically:
# - Skips reimport (database not empty)
# - Runs any new Prisma migrations
# - Starts application
```

### Adding New Products Locally → Production

**Option 1: Export & Import (Manual)**
```bash
# Export from local
cd backend/scripts
./export-production-database.sh

# Commit and push
git add ../prisma/migrations/production-baseline.sql
git commit -m "Update products and categories"
git push origin main

# On server (or via Coolify):
# Set FORCE_IMPORT=true to reimport
docker-compose down
FORCE_IMPORT=true docker-compose up -d
```

**Option 2: Direct Database Sync (Advanced)**
```bash
# Create sync script (coming soon)
# Will sync only new products, not entire DB
```

### Schema Changes

```bash
# 1. Update prisma/schema.prisma locally
# 2. Create migration
cd backend
npx prisma migrate dev --name add_new_feature

# 3. Commit and push
git add prisma/migrations/
git commit -m "Add new feature migration"
git push origin main

# 4. Deploy - migration runs automatically
```

---

## 🔧 Troubleshooting

### Database Import Failed

**Symptom:** Container restarts repeatedly, logs show "Database import failed"

**Solution:**
```bash
# Check database connection
docker exec juelle-hair-db psql -U postgres -l

# Check if database is accessible
docker exec juelle-hair-backend psql $DATABASE_URL -c "SELECT 1;"

# Manual import
docker exec -i juelle-hair-db psql -U postgres -d juellehair < \
  backend/prisma/migrations/production-baseline.sql
```

### Media Files Not Loading

**Symptom:** Product images return 404

**Check:**
```bash
# Verify files exist in container
docker exec juelle-hair-frontend ls -la /app/public/media/products/ | head

# Verify volume mounts
docker inspect juelle-hair-frontend | grep -A 10 Mounts

# Rebuild if needed
docker-compose up -d --build --force-recreate frontend
```

### Database Already Has Data

**Symptom:** Import skipped, but you want fresh data

**Solution:**
```bash
# Option 1: Drop and recreate database
docker exec juelle-hair-db psql -U postgres -c "DROP DATABASE juellehair;"
docker exec juelle-hair-db psql -U postgres -c "CREATE DATABASE juellehair;"
docker-compose restart backend

# Option 2: Force reimport
docker-compose down backend
FORCE_IMPORT=true docker-compose up -d backend
```

### Performance Issues After Import

**Solution:**
```bash
# Run vacuum and analyze
docker exec juelle-hair-db psql -U postgres -d juellehair -c "VACUUM ANALYZE;"

# Check table sizes
docker exec juelle-hair-db psql -U postgres -d juellehair -c \
  "SELECT relname, pg_size_pretty(pg_total_relation_size(relid))
   FROM pg_catalog.pg_statio_user_tables
   ORDER BY pg_total_relation_size(relid) DESC;"
```

### GitHub Actions Failing

**Check:**
```bash
# Verify secrets are set:
# - COOLIFY_WEBHOOK_URL (optional)
# - NEXT_PUBLIC_API_BASE_URL

# Test build locally
cd backend && npm run build
cd frontend && npm run build
```

---

## 📊 Monitoring

### Health Checks

```bash
# Backend health
curl https://api.yourdomain.com/api/health

# Expected response:
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2024-01-07T..."
}
```

### Database Size

```bash
docker exec juelle-hair-db psql -U postgres -d juellehair -c \
  "SELECT pg_database_size('juellehair')/1024/1024 as size_mb;"
```

### Application Logs

```bash
# Real-time logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100 backend
```

---

## 🔐 Security Notes

1. **Never commit** `.env` files
2. **Rotate secrets** regularly (JWT_SECRET, database passwords)
3. **Use strong passwords** for database (min 20 characters)
4. **Enable SSL/TLS** for production database connections
5. **Backup database** daily (automated in Coolify)

---

## 📞 Support

**Issues?**
- Check logs: `docker-compose logs backend`
- Verify environment variables
- Ensure database is accessible
- Review this guide's troubleshooting section

**Need Help?**
- Create GitHub issue with logs
- Include: OS, Docker version, error messages
- Sanitize sensitive data (passwords, keys)

---

## ✅ Post-Deployment Checklist

- [ ] Backend API responding at `/api/health`
- [ ] Frontend loading at homepage
- [ ] Products visible and images loading
- [ ] User login works (admin@juellehair.com)
- [ ] Cart functionality working
- [ ] Checkout process functional
- [ ] Payment gateway configured (Paystack)
- [ ] Email notifications working (if configured)
- [ ] SSL/HTTPS enabled
- [ ] Domain pointing correctly
- [ ] Backups configured
- [ ] Monitoring setup (optional)

---

**🎉 Congratulations! Your Juelle Hair e-commerce platform is now live!**

---

_Last updated: January 2026_
_Version: 1.0.0_

