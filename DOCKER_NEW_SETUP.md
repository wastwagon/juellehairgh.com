# 🐳 New Docker Build & Environment Setup

This guide explains how to use the new Docker configuration files with prefilled environment variables.

---

## 📁 New Files Created

1. **`docker-compose.new.yml`** - New production Docker Compose file with prefilled values
2. **`env.production.prefilled`** - Production environment file with all known values prefilled (copy to `.env.production`)
3. **`env.production.template`** - Template showing what needs to be customized

---

## ✅ Prefilled Values

The following values are already filled in from your existing setup:

### ✅ Already Set (No Changes Needed):

- **JWT_SECRET**: `PCwghTqQLAVLZzw2UdQlrnKc1d1uQhC15nRxq04dT5s=`
- **NEXTAUTH_SECRET**: `fn5e7Nhost1t/ONNBVVWGZYDS8nqz+fyEJ2Y5ykUdN0=`
- **POSTGRES_USER**: `postgres`
- **POSTGRES_DB**: `juellehair`
- **NEXT_PUBLIC_APP_NAME**: `Juelle Hair Ghana`
- **NEXT_PUBLIC_BASE_CURRENCY**: `GHS`

### ⚠️ Must Update Before Deploying:

1. **POSTGRES_PASSWORD** - Change to your secure database password
2. **FRONTEND_URL** - Update to your actual domain (currently set to `https://juellehair.com`)
3. **NEXT_PUBLIC_API_BASE_URL** - Update to your backend API URL (currently set to `https://api.juellehair.com/api`)
4. **NEXTAUTH_URL** - Must match FRONTEND_URL (currently set to `https://juellehair.com`)
5. **PAYSTACK_SECRET_KEY** - Add your actual Paystack secret key
6. **NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY** - Add your actual Paystack public key

---

## 🚀 Quick Start

### Step 1: Create Environment File

```bash
# Copy the prefilled template
cp env.production.prefilled .env.production

# Edit the file to update domain and Paystack keys
nano .env.production
# Or use your preferred editor
code .env.production
```

**Update these values:**
- Replace `ChangeThisToSecurePassword123!@#` with your database password
- Replace `https://juellehair.com` with your actual domain
- Replace `https://api.juellehair.com/api` with your backend API URL
- Replace `sk_live_YOUR_PAYSTACK_SECRET_KEY` with your Paystack secret key
- Replace `pk_live_YOUR_PAYSTACK_PUBLIC_KEY` with your Paystack public key

### Step 2: Deploy with New Configuration

```bash
# Stop existing containers (if running)
docker-compose -f docker-compose.prod.yml down

# Start with new configuration
docker-compose -f docker-compose.new.yml --env-file .env.production up -d --build

# Watch logs
docker-compose -f docker-compose.new.yml logs -f
```

---

## 🔄 Using with Coolify

If you're deploying to Coolify:

1. **Copy values from `.env.production`** to Coolify's Environment Variables section
2. **Make sure to check "Available at Buildtime"** for these variables:
   - `NEXT_PUBLIC_API_BASE_URL`
   - `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
   - `NEXT_PUBLIC_APP_NAME`
   - `NEXT_PUBLIC_BASE_CURRENCY`
3. **Update the domain values** in Coolify to match your actual domain
4. **Trigger a new deployment**

---

## 📋 Environment Variables Checklist

Before deploying, verify these are set correctly:

### Database
- [ ] `POSTGRES_PASSWORD` - Secure password (min 20 chars)
- [ ] `POSTGRES_USER` - `postgres` ✅ (prefilled)
- [ ] `POSTGRES_DB` - `juellehair` ✅ (prefilled)

### Backend
- [ ] `JWT_SECRET` - ✅ Prefilled
- [ ] `PAYSTACK_SECRET_KEY` - ⚠️ Update with your key
- [ ] `FRONTEND_URL` - ⚠️ Update to your domain
- [ ] `DATABASE_URL` - Auto-generated from POSTGRES_* vars

### Frontend (Build Time - CRITICAL!)
- [ ] `NEXT_PUBLIC_API_BASE_URL` - ⚠️ Update to your backend URL
- [ ] `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` - ⚠️ Update with your key
- [ ] `NEXT_PUBLIC_APP_NAME` - ✅ Prefilled
- [ ] `NEXT_PUBLIC_BASE_CURRENCY` - ✅ Prefilled

### Frontend (Runtime)
- [ ] `NEXTAUTH_URL` - ⚠️ Update to match FRONTEND_URL
- [ ] `NEXTAUTH_SECRET` - ✅ Prefilled

---

## 🔍 Verifying the Setup

After deployment, verify everything works:

```bash
# Check containers are running
docker-compose -f docker-compose.new.yml ps

# Check backend health
curl http://localhost:3001/api/health

# Check frontend
curl http://localhost:3000

# Check database connection
docker exec juelle-hair-db-new psql -U postgres -d juellehair -c "SELECT COUNT(*) FROM products;"
```

---

## 🔄 Migrating from Old Setup

If you want to migrate from the old setup:

1. **Backup your current database:**
   ```bash
   docker exec juelle-hair-db-prod pg_dump -U postgres juellehair > backup.sql
   ```

2. **Stop old containers:**
   ```bash
   docker-compose -f docker-compose.prod.yml down
   ```

3. **Copy and update environment file:**
   ```bash
   cp env.production.prefilled .env.production
   # Then edit .env.production with your values
   ```

4. **Start new containers:**
   ```bash
   docker-compose -f docker-compose.new.yml --env-file .env.production up -d --build
   ```

5. **Restore database (if needed):**
   ```bash
   docker exec -i juelle-hair-db-new psql -U postgres juellehair < backup.sql
   ```

---

## 📝 Notes

- The new Docker Compose file uses different container names (`-new` suffix) to avoid conflicts
- All volumes are separate (`_new` suffix) so your old data won't be affected
- The network is also separate (`-new` suffix)
- You can run both old and new setups side-by-side for testing

---

## 🆘 Troubleshooting

### Build Fails with "NEXT_PUBLIC_API_BASE_URL is empty"
- Make sure you're passing build args correctly
- Check that `.env.production` has the value set
- Verify Coolify has "Available at Buildtime" checked

### Database Connection Fails
- Verify `POSTGRES_PASSWORD` matches in both `DATABASE_URL` and `POSTGRES_PASSWORD`
- Check that the postgres container is healthy: `docker-compose -f docker-compose.new.yml ps`

### Frontend Can't Connect to Backend
- Verify `NEXT_PUBLIC_API_BASE_URL` is correct
- Check CORS settings in backend
- Ensure backend is running and healthy

---

**Last Updated:** January 8, 2026
