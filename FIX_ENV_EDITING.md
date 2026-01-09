# 🔧 Fix: Cannot Edit Environment Variables in Coolify

## Problem

Coolify shows error: **"Cannot delete environment variable 'FRONTEND_URL'. Please remove it from the Docker Compose file first."**

This happens because environment variables are explicitly listed in `docker-compose.prod.yml`, making Coolify treat them as "hardcoded."

## Solution

I've updated `docker-compose.prod.yml` to remove explicit environment variable declarations. Coolify will now automatically inject all environment variables you set in its UI.

## What Changed

### Before (Blocked Editing):
```yaml
environment:
  FRONTEND_URL: ${FRONTEND_URL:?FRONTEND_URL is required}
  JWT_SECRET: ${JWT_SECRET:?JWT_SECRET is required}
  # ... etc
```

### After (Editable in Coolify):
```yaml
# Environment variables are managed by Coolify UI
# All variables should be set in Coolify Environment Variables section
environment:
  DATABASE_URL: postgresql://...  # Only computed values remain
  NODE_ENV: production            # Only static values remain
```

## Next Steps

1. **Commit and push the changes:**
   ```bash
   git add docker-compose.prod.yml
   git commit -m "Remove hardcoded env vars to allow Coolify UI editing"
   git push
   ```

2. **Redeploy in Coolify:**
   - Go to your Coolify project
   - Click "Redeploy" or trigger a new deployment
   - This will use the updated docker-compose.prod.yml

3. **Edit Variables in Coolify:**
   - After redeploy, go to Environment Variables
   - You should now be able to edit/delete variables
   - Click on variable names to edit them
   - Update to your domain values

## Variables You Can Now Edit

After this fix, you can edit these in Coolify UI:
- ✅ `FRONTEND_URL`
- ✅ `JWT_SECRET`
- ✅ `PAYSTACK_SECRET_KEY`
- ✅ `NEXT_PUBLIC_API_BASE_URL`
- ✅ `NEXTAUTH_URL`
- ✅ `NEXTAUTH_SECRET`
- ✅ `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
- ✅ `POSTGRES_PASSWORD`
- ✅ `CURRENCY_API_KEY`
- ✅ All other variables

## Important Notes

1. **Build Args Still Work:** Frontend build args (`NEXT_PUBLIC_*`) are still passed during build - they're just managed through Coolify's UI now.

2. **DATABASE_URL:** This is still computed in the compose file because it needs to combine `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB`.

3. **Coolify Auto-Injection:** Coolify automatically injects all environment variables you set in its UI into containers, so you don't need to list them in the compose file.

## If You Still Can't Edit

If you still see the error after redeploying:

1. **Check if variables are locked:**
   - Look for lock icons next to variables
   - Try clicking the variable name (not the lock icon)

2. **Try Developer View:**
   - Click "Developer view" button
   - This might reveal additional editing options

3. **Delete and Recreate:**
   - Delete the variable (should work now)
   - Create a new one with your desired value

---

**Last Updated:** January 9, 2026
