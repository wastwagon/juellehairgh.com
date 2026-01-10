# 🎯 Recommended Method: Coolify Built-in PostgreSQL Service

## ✅ Use Method 2: Coolify's PostgreSQL Service

This is the **easiest and recommended** method for separating your database.

## Step-by-Step Setup

### Step 1: Create PostgreSQL Service in Coolify

1. **In Coolify Dashboard:**
   - Click "**+ New Resource**" or "**+ New**"
   - Choose "**Database**" → "**PostgreSQL**"
   - **OR** click "**Add Service**" → "**PostgreSQL**"

2. **Configure the Database:**
   - **Name:** `juelle-hair-database` (or any name you prefer)
   - **Image:** `postgres:15-alpine` (recommended) or `postgres:17-alpine`
   - **Username:** `postgres`
   - **Password:** `JuelleHair2026` ⚠️ **Use the same password everywhere**
   - **Initial Database:** `juellehair` (or `postgres` if you want to create it later)
   - **Port Mapping:** `3000:5432` (or leave default)

3. **Start the service** - Click "**Start**" or "**Deploy**"

### Step 2: Get Database Connection Info

After the database service is running:

1. **Go to the PostgreSQL service** in Coolify
2. **Check the "Links" or "Configuration" tab**
3. **Find the "Postgres URL (internal)"** - This is the connection string
4. **Note the hostname** - It will be something like:
   - `postgresql-database-wg4kgo8g08c4gcsk080ssoww` (service name)
   - Or an internal IP/FQDN

### Step 3: Update Backend Service

In your **Backend service** configuration:

1. **Go to "Environment Variables"**
2. **Add/Update these variables:**

```
POSTGRES_HOST=<hostname-from-step-2>
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=JuelleHair2026
POSTGRES_DB=juellehair
```

**Important:** `POSTGRES_HOST` should be:
- The service name (e.g., `postgresql-database-wg4kgo8g08c4gcsk080ssoww`)
- OR the container name
- OR if both services are on same server, just use the service name

### Step 4: Remove Database from Backend Project

In your current backend project that has both backend + database:

1. **Option A: Delete the database container** from the backend compose
   - Already done! ✅ `docker-compose.backend.yml` no longer has postgres
   - Just need to update environment variables

2. **Option B: If still showing in Coolify:**
   - Go to backend project → Configuration
   - Change "Docker Compose Location" to `/docker-compose.backend.yml`
   - This uses the updated file without postgres

### Step 5: Redeploy Backend

1. **Update environment variables** with `POSTGRES_HOST`
2. **Save changes**
3. **Redeploy** the backend service
4. **Check logs** - Should see:
   ```
   ✓ Database credentials are valid
   ```

## Finding the Correct POSTGRES_HOST

### Method 1: Check Service Links
- Go to PostgreSQL service → **Links** tab
- Use the internal service name or URL

### Method 2: Use Service Name
- Use the service name shown in Coolify
- Example: `postgresql-database-wg4kgo8g08c4gcsk080ssoww`

### Method 3: Test from Backend Terminal
- Go to Backend service → **Terminal**
- Run: `nslookup postgresql-database-wg4kgo8g08c4gcsk080ssoww`
- OR: `ping postgresql-database-wg4kgo8g08c4gcsk080ssoww`

## Environment Variables Checklist

### PostgreSQL Service (Built-in):
✅ Set during creation:
- Username: `postgres`
- Password: `JuelleHair2026`
- Database: `juellehair`

### Backend Service:
✅ Required variables:
```
POSTGRES_HOST=<postgres-service-name>
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=JuelleHair2026
POSTGRES_DB=juellehair
JWT_SECRET=PCwghTqQLAVLZzw2UdQlrnKc1d1uQhC15nRxq04dT5s=
FRONTEND_URL=https://juellehairgh.com
```

## Why This Method is Better

✅ **Easier Setup** - Coolify handles database configuration  
✅ **Automatic Backups** - Coolify can manage backups for you  
✅ **Better Management** - Dedicated database interface  
✅ **Auto-scaling** - Easier to scale independently  
✅ **Monitoring** - Built-in database metrics  
✅ **No Docker Compose** - Simpler for database services  

## Troubleshooting

### Can't Connect to Database

**Check network connectivity:**
```bash
# From Backend terminal
nc -zv <POSTGRES_HOST> 5432
```

**Verify service names:**
- Make sure both services are on the same server
- Check if they're on the same Docker network

### Password Mismatch

**Update password in PostgreSQL service:**
1. Go to PostgreSQL service → Configuration
2. Update "Password" field
3. Save and restart service

**Sync password in Backend:**
1. Update `POSTGRES_PASSWORD` in Backend environment variables
2. Redeploy backend

## Quick Start Summary

1. ✅ Create PostgreSQL service (built-in) in Coolify
2. ✅ Set password: `JuelleHair2026`
3. ✅ Note the service name/hostname
4. ✅ Add `POSTGRES_HOST` to Backend environment variables
5. ✅ Redeploy Backend
6. ✅ Check logs for successful connection

That's it! Much simpler than Docker Compose for the database.
