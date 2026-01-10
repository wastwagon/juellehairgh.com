# 🔐 Database Authentication Error - Troubleshooting Guide

## Problem

You're seeing errors like:
```
Authentication failed against database server at `postgres`, 
the provided database credentials for `postgres` are not valid.
```

This means the `DATABASE_URL` password doesn't match the actual PostgreSQL database password.

## Root Causes

### 1. **Password Mismatch**
The `POSTGRES_PASSWORD` environment variable doesn't match the password used when the database was initialized.

### 2. **Database Volume Persistence**
If the database volume already exists with a different password, changing `POSTGRES_PASSWORD` won't update the existing database.

### 3. **Special Characters in Password**
Passwords with special characters (like `@`, `#`, `$`, etc.) need proper URL encoding in the connection string.

## Solutions

### Solution 1: Reset Database Password (Recommended for Development/Testing)

If you're in a development environment and can afford to lose data:

1. **Stop all containers:**
   ```bash
   docker-compose down
   ```

2. **Remove the database volume:**
   ```bash
   docker volume rm juelle-hair-db_postgres_data
   # Or check actual volume name:
   docker volume ls | grep postgres
   ```

3. **Set correct password in environment:**
   - In Coolify: Set `POSTGRES_PASSWORD` to your desired password
   - In `.env` file: Set `POSTGRES_PASSWORD=your_secure_password_here`

4. **Restart containers:**
   ```bash
   docker-compose up -d
   ```

### Solution 2: Update Existing Database Password (Production)

If you need to keep your data:

1. **Connect to the database container:**
   ```bash
   docker exec -it juelle-hair-db-prod psql -U postgres -d juellehair
   ```

2. **Change the password:**
   ```sql
   ALTER USER postgres WITH PASSWORD 'your_new_secure_password';
   \q
   ```

3. **Update environment variable:**
   - In Coolify: Update `POSTGRES_PASSWORD` to match the new password
   - The `fix-db-env.js` script will automatically rebuild `DATABASE_URL`

4. **Restart backend container:**
   ```bash
   docker restart juelle-hair-backend-prod
   ```

### Solution 3: Verify Current Database Password

To find out what password the database is actually using:

1. **Check database logs:**
   ```bash
   docker logs juelle-hair-db-prod | grep -i password
   ```

2. **Try to connect with psql:**
   ```bash
   # Try different passwords
   PGPASSWORD=old_password psql -h postgres -U postgres -d juellehair -c "SELECT 1;"
   ```

### Solution 4: Use External Database

If using an external PostgreSQL database:

1. **Set these environment variables in Coolify:**
   ```
   POSTGRES_HOST=your-db-host.com
   POSTGRES_PORT=5432
   POSTGRES_USER=your_db_user
   POSTGRES_PASSWORD=your_db_password
   POSTGRES_DB=juellehair
   ```

2. **The `fix-db-env.js` script will construct `DATABASE_URL` automatically**

## Verification Steps

After fixing, verify the connection:

1. **Check backend logs:**
   ```bash
   docker logs juelle-hair-backend-prod | grep -i "database\|credential"
   ```

2. **You should see:**
   ```
   ✓ Database environment configured
   ✓ Database is ready
   ✓ Database credentials are valid
   ```

3. **If you see errors, check:**
   - `POSTGRES_PASSWORD` matches database password
   - Database container is running: `docker ps | grep postgres`
   - Network connectivity: `docker network ls`

## Environment Variables Checklist

Make sure these are set in Coolify (or your `.env` file):

- ✅ `POSTGRES_USER=postgres` (default)
- ✅ `POSTGRES_PASSWORD=your_secure_password` ⚠️ **Must match database password**
- ✅ `POSTGRES_DB=juellehair`
- ✅ `POSTGRES_HOST=postgres` (for Docker Compose)
- ✅ `POSTGRES_PORT=5432`

The `DATABASE_URL` will be automatically generated from these by `fix-db-env.js`.

## Quick Fix Script

If you have SSH access to the server, you can run this diagnostic script:

```bash
#!/bin/bash
echo "Checking database connection..."
docker exec juelle-hair-backend-prod node -e "
const { execSync } = require('child_process');
try {
  const output = execSync('node ./scripts/fix-db-env.js', { encoding: 'utf-8' });
  console.log('✓ Environment fix script works');
  eval(output);
  console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'));
} catch (e) {
  console.error('✗ Error:', e.message);
}
"
```

## Still Having Issues?

1. **Check backend logs for detailed errors:**
   ```bash
   docker logs juelle-hair-backend-prod --tail 100
   ```

2. **Verify database is accessible:**
   ```bash
   docker exec juelle-hair-db-prod pg_isready -U postgres
   ```

3. **Test connection manually:**
   ```bash
   docker exec -it juelle-hair-backend-prod bash
   PGPASSWORD="$POSTGRES_PASSWORD" psql -h postgres -U postgres -d juellehair -c "SELECT 1;"
   ```

4. **Review the updated scripts:**
   - `backend/scripts/fix-db-env.js` - Handles password encoding
   - `backend/scripts/docker-entrypoint.sh` - Improved error handling
