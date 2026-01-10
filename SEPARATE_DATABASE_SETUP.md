# 🗄️ Separate Database Setup Guide

## Overview

This guide helps you set up the database as a **separate service** in Coolify, independent from the backend. This makes management easier and allows for better scalability.

## Architecture

- **Frontend Project** - Next.js frontend (separate project)
- **Backend Project** - NestJS API (separate project)  
- **Database Project** - PostgreSQL (separate project/service)

## Step 1: Create Database Service in Coolify

### 1.1 Create New Project/Service for Database

1. **In Coolify Dashboard:**
   - Click "**+ New Resource**" or "**+ New**"
   - Choose "**Database**" or "**PostgreSQL**" (if available as a one-click service)
   - **OR** create a new "**Docker Compose**" project

### 1.2 If Using Docker Compose for Database

1. **Create a new project** in Coolify named "**Juelle Hair Database**"
2. **Set up Git source** (or upload files manually)
3. **Use `docker-compose.database.yml`** as the compose file

**Or manually configure:**

1. **Create new service** → Choose "**Docker Compose**"
2. **Name it:** `juelle-hair-database` or `postgres`
3. **Select `docker-compose.database.yml`** from your repository
4. **Set Environment Variables:**
   ```
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=JuelleHair2026
   POSTGRES_DB=juellehair
   ```
5. **Deploy** the database service

### 1.3 Get Database Hostname/FQDN

After deployment, Coolify will assign a hostname to your database service:
- Check the "**Links**" or "**Domains**" tab in the database service
- Note the **internal hostname** (e.g., `postgres-xxxxx` or the service FQDN)
- **OR** check the service name in the network

**Common formats:**
- Internal Docker name: `postgres` (if in same network)
- Service FQDN: `postgres.juellehairgh.com` (if configured)
- IP address: `172.x.x.x` (internal Docker IP)

## Step 2: Update Backend Configuration

### 2.1 Remove Database from Backend Project

The `docker-compose.backend.yml` has been updated to **remove the postgres service**. It now expects an external database.

### 2.2 Set Environment Variables in Backend

In your **Backend service** in Coolify, update/add these environment variables:

**Required:**
```
POSTGRES_HOST=<database-hostname-or-ip>
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=JuelleHair2026
POSTGRES_DB=juellehair
```

**Other backend variables (keep existing):**
```
JWT_SECRET=PCwghTqQLAVLZzw2UdQlrnKc1d1uQhC15nRxq04dT5s=
FRONTEND_URL=https://juellehairgh.com
PORT=3001
NODE_ENV=production
```

### 2.3 Determine POSTGRES_HOST Value

The `POSTGRES_HOST` depends on your Coolify setup:

**Option A: Same Server, Same Docker Network (Coolify Network)**
- Use the **container name** or **service name** from the database project
- Example: `postgres-h0wogckw88c8w8g40w0g4w8g-xxxxx`
- **OR** use the service's internal hostname

**Option B: Database has FQDN/Domain**
- Use the database service FQDN
- Example: `db.juellehairgh.com` or `postgres.juellehairgh.com`

**Option C: Different Server**
- Use the database server's IP address or external hostname
- Make sure port 5432 is accessible

**How to find the correct hostname:**
1. Check database service → **Links** tab
2. Check database service → **Terminal** → Run: `hostname`
3. From backend terminal: `ping postgres` or `nslookup <service-name>`
4. Check Docker network: `docker network inspect coolify`

## Step 3: Connect Services

### 3.1 Ensure Both Services Use Same Network

Both services should be on the `coolify` network (external network). This is already configured in both compose files.

### 3.2 Test Connection

**From Backend terminal:**
```bash
# Test if you can reach the database
nc -zv <POSTGRES_HOST> 5432

# Or test with psql (if postgresql-client is installed)
PGPASSWORD='JuelleHair2026' psql -h <POSTGRES_HOST> -U postgres -d juellehair -c "SELECT 1;"
```

## Step 4: Deploy Updated Backend

1. **Update environment variables** in Backend service with `POSTGRES_HOST`
2. **Redeploy** the backend service
3. **Check logs** - Should see:
   ```
   ✓ Database environment configured
   ✓ Database is ready
   ✓ Database credentials are valid
   ```

## Step 5: Migration (If Moving Existing Database)

### Option A: Use Existing Data Volume

If you want to keep your existing database:

1. **Stop current backend project** (with database)
2. **Note the database volume name:**
   ```bash
   docker volume ls | grep postgres
   ```
3. **Update database service** to use the same volume:
   ```yaml
   volumes:
     - existing_volume_name:/var/lib/postgresql/data
   ```
4. **Start new database service**

### Option B: Export and Import

1. **Export data from old database:**
   ```bash
   docker exec old-postgres-container pg_dump -U postgres juellehair > backup.sql
   ```

2. **Import to new database:**
   ```bash
   docker exec -i new-postgres-container psql -U postgres juellehair < backup.sql
   ```

### Option C: Fresh Start

Start with a clean database and re-run migrations/seeds.

## Troubleshooting

### Connection Refused

**Check:**
- `POSTGRES_HOST` is correct
- Database service is running and healthy
- Both services are on the same network (`coolify`)
- Port 5432 is accessible

**Test:**
```bash
# From backend container
nc -zv <POSTGRES_HOST> 5432
```

### Authentication Failed

**Check:**
- `POSTGRES_PASSWORD` matches in both services
- `POSTGRES_USER` is correct
- `POSTGRES_DB` exists

**Update password in database:**
```bash
# Connect to database terminal
psql -U postgres -d postgres -c "ALTER USER postgres WITH PASSWORD 'JuelleHair2026';"
```

### Network Issues

**Verify network connectivity:**
```bash
# From backend container
docker exec backend-container ping <POSTGRES_HOST>

# Check network
docker network inspect coolify
```

## Benefits of Separate Database

✅ **Independent Scaling** - Scale database and backend separately  
✅ **Easier Management** - Update database without affecting backend  
✅ **Better Security** - Isolate database access  
✅ **Flexible Architecture** - Can move database to dedicated server later  
✅ **Clearer Separation** - Each service has its own project in Coolify  

## Quick Reference

### Database Service Environment Variables
```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=JuelleHair2026
POSTGRES_DB=juellehair
```

### Backend Service Environment Variables
```
POSTGRES_HOST=<database-hostname>
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=JuelleHair2026
POSTGRES_DB=juellehair
JWT_SECRET=PCwghTqQLAVLZzw2UdQlrnKc1d1uQhC15nRxq04dT5s=
FRONTEND_URL=https://juellehairgh.com
```

## Files Changed

- ✅ `docker-compose.database.yml` - Standalone database service
- ✅ `docker-compose.backend.yml` - Updated to use external database
- ✅ Both services use `coolify` external network for connectivity
