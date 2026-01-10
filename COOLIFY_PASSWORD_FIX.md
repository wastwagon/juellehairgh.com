# 🔧 Fix Database Password in Coolify

## Current Situation

Your PostgreSQL database was initialized with a different password than `JuelleHair2026` (your current environment variable). Since database volumes persist, changing the environment variable doesn't update the existing password.

## ✅ Solution Options

### Option 1: Via Coolify Terminal (Easiest)

1. **Go to Coolify Dashboard**
2. **Navigate to:** Your Project → PostgreSQL Service
3. **Click on "Terminal" or "Console" button**
4. **Run this command:**
   ```bash
   psql -U postgres -d postgres -c "ALTER USER postgres WITH PASSWORD 'JuelleHair2026';"
   ```
5. **Restart Backend Service** in Coolify
6. **Check logs** - Should see: `✓ Database credentials are valid`

### Option 2: Via Coolify Exec/SSH (If Available)

If Coolify provides exec access:

1. **Find PostgreSQL container name:**
   ```bash
   docker ps | grep postgres
   ```

2. **Update password:**
   ```bash
   # Replace <container-name> with actual name
   docker exec <container-name> psql -U postgres -d postgres -c "ALTER USER postgres WITH PASSWORD 'JuelleHair2026';"
   ```

### Option 3: Reset Database Volume (⚠️ Deletes All Data)

**If you can afford to lose data:**

1. **In Coolify, stop all services** (Backend and PostgreSQL)

2. **SSH into your server** (if you have access) and run:
   ```bash
   # Find the volume (will have long UUID-like name)
   docker volume ls | grep postgres
   
   # Remove it (replace <volume-name> with actual name)
   docker volume rm <volume-name>
   ```

3. **Restart services in Coolify**
   - The database will reinitialize with `JuelleHair2026` password
   - This is a fresh database (all data will be lost)

### Option 4: Change Environment Variable to Match Database

**If you know the current database password:**

1. **Try to find it in:**
   - Old deployment logs
   - Previous environment variables
   - Initial setup documentation

2. **Update `POSTGRES_PASSWORD` in Coolify** to match the actual database password

3. **Restart backend service**

## Quick Test Commands

If you have terminal access to the PostgreSQL container:

```bash
# Test current connection (this might reveal the password format)
psql -U postgres -d postgres -c "SELECT 1;"

# Update password
psql -U postgres -d postgres -c "ALTER USER postgres WITH PASSWORD 'JuelleHair2026';"

# Verify it works
PGPASSWORD='JuelleHair2026' psql -U postgres -d postgres -c "SELECT 1;"
```

## After Fixing

1. ✅ **Restart Backend Service** in Coolify
2. ✅ **Check Backend Logs** - Look for:
   ```
   ✓ Database environment configured
   ✓ Database is ready
   ✓ Database credentials are valid  ← This confirms success!
   ```
3. ✅ **Test API:**
   ```bash
   curl https://api.juellehairgh.com/api/health
   ```

## Troubleshooting

### If Terminal Access Doesn't Work

PostgreSQL container might require authentication. Try:

```bash
# Connect via bash first
docker exec -it <postgres-container> bash

# Then use psql (local connections sometimes don't need password)
psql -U postgres -d postgres

# Run SQL command
ALTER USER postgres WITH PASSWORD 'JuelleHair2026';
\q
exit
```

### If You Get Permission Denied

The container might not allow direct psql access. In that case:
- Use Option 3 (reset volume) if data loss is acceptable
- Contact your server administrator if you need data preserved

## Next Steps

1. Try **Option 1** first (Coolify Terminal)
2. If that doesn't work, try **Option 2** (Docker exec)
3. As last resort, use **Option 3** (Reset volume) if data loss is acceptable

Once password is updated, restart the backend and verify the connection works!
