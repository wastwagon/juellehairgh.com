# 🔧 Fix Database Password - Quick Guide

## Current Issue

The database password doesn't match the environment variable `POSTGRES_PASSWORD=JuelleHair2026`.

## Solution: Update Database Password

### Option 1: Via Coolify Terminal (Recommended)

If Coolify provides terminal access:

1. **Go to Coolify** → Your Project → Services → PostgreSQL
2. **Open Terminal/Console**
3. **Run these commands:**

```bash
# Connect to PostgreSQL
psql -U postgres -d postgres

# Update password
ALTER USER postgres WITH PASSWORD 'JuelleHair2026';

# Exit
\q
```

### Option 2: Via SSH/Docker (If you have server access)

**Find the PostgreSQL container:**
```bash
docker ps | grep postgres
```

**Update password:**
```bash
# Replace <container-name> with actual container name
docker exec -it <postgres-container-name> psql -U postgres -d postgres -c "ALTER USER postgres WITH PASSWORD 'JuelleHair2026';"
```

**Or connect interactively:**
```bash
docker exec -it <postgres-container-name> bash
psql -U postgres -d postgres
ALTER USER postgres WITH PASSWORD 'JuelleHair2026';
\q
exit
```

### Option 3: If Container Requires Password

If the above doesn't work, the container might require authentication. Try:

```bash
# Try with empty password first (local connections sometimes work)
docker exec <postgres-container-name> psql -U postgres -d postgres -c "ALTER USER postgres WITH PASSWORD 'JuelleHair2026';"

# Or if you know the old password
docker exec -e PGPASSWORD='old_password' <postgres-container-name> psql -U postgres -d postgres -c "ALTER USER postgres WITH PASSWORD 'JuelleHair2026';"
```

### Option 4: Reset Database (⚠️ DELETES ALL DATA)

If you can afford to lose data:

1. **Stop all services in Coolify**
2. **SSH into your server** (if you have access)
3. **Remove the database volume:**

```bash
# Find postgres volume
docker volume ls | grep postgres

# Remove it (replace with actual volume name)
docker volume rm <volume-name>
```

4. **Restart services in Coolify** - Database will initialize with `JuelleHair2026` password

## After Updating Password

1. **Restart Backend Service in Coolify**
   - Go to Backend service
   - Click "Restart" or "Redeploy"

2. **Check Backend Logs**
   - Should see: `✓ Database credentials are valid`
   - Should NOT see: `✗ Database authentication failed`

3. **Verify Application**
   - Visit: `https://api.juellehairgh.com/api/health`
   - Should return a healthy response

## Container Name Reference

From your deployment logs, the PostgreSQL container is likely named:
```
postgres-h0wogckw88c8w8g40w0g4w8g-170057264001
```

Or similar pattern. Check current containers:
```bash
docker ps | grep postgres
```

## Quick One-Liner (SSH Access)

If you have SSH access to the server:

```bash
docker exec $(docker ps -q -f "name=postgres") psql -U postgres -d postgres -c "ALTER USER postgres WITH PASSWORD 'JuelleHair2026';" && echo "Password updated! Restart backend in Coolify."
```

## Verification

After updating and restarting, the backend logs should show:
```
✓ Database environment configured
✓ Environment variables OK
✓ Database is ready
✓ Database credentials are valid  ← This confirms success!
```

If you still see authentication errors, the password wasn't updated correctly or there's a different issue.
