# 🔄 Restart Services - Complete Fix

## Current Status

✅ Database password updated to `JuelleHair2026`
✅ Environment variable `POSTGRES_PASSWORD` is set correctly in Coolify
❌ Backend still showing authentication errors

## Solution: Full Service Restart

The backend container is likely using cached credentials or hasn't picked up the password change yet. You need to **restart both services**.

### Step 1: Restart PostgreSQL Service

1. In Coolify, go to your project
2. Click on **PostgreSQL service**
3. Click **"Restart"** button
4. Wait for it to show as "Healthy" or "Running"

### Step 2: Restart Backend Service

1. Go to **Backend service** in the same project
2. Click **"Restart"** or **"Redeploy"** button
3. Wait for deployment to complete

### Step 3: Check Backend Logs

1. Go to Backend service → **"Logs"** tab
2. Look for these success messages:
   ```
   ✓ Database environment configured
   ✓ Database is ready
   ✓ Database credentials are valid  ← This means it worked!
   ```

## Alternative: Complete Redeploy

If restart doesn't work, try a full redeploy:

1. **Stop both services** (Backend and PostgreSQL)
2. **Start PostgreSQL first** - Wait until it's healthy
3. **Start Backend** - This will connect with fresh credentials

## Verify Password is Set

You can verify the password was updated by running in PostgreSQL terminal:

```bash
psql -U postgres -d postgres -c "SELECT rolpassword IS NOT NULL as has_password FROM pg_authid WHERE rolname='postgres';"
```

Or check if you can connect with the new password:

```bash
PGPASSWORD='JuelleHair2026' psql -h postgres -U postgres -d juellehair -c "SELECT 1;"
```

## Still Not Working?

If you still see authentication errors after restarting:

1. **Verify password in database** - Make sure the ALTER USER command actually worked
2. **Check for multiple postgres users** - There might be other users
3. **Try resetting the backend container** - Delete and recreate it in Coolify

## Quick Command to Test Connection

From Backend terminal (if accessible):

```bash
PGPASSWORD='JuelleHair2026' psql -h postgres -U postgres -d juellehair -c "SELECT 1;"
```

If this works, the password is correct and the issue is with the backend service needing a restart.
