# 🔐 Update Database Password - Quick Guide

## Generated Secure Password

I've generated a secure password for you. **Save this password securely:**

```
lneSKPhplZp7TemPeFnFmFd4C
```

## Option 1: Automatic Update (Recommended)

I've created a script that will update the password for you:

```bash
./scripts/update-db-password.sh 'lneSKPhplZp7TemPeFnFmFd4C'
```

This will:
1. ✅ Update the password in PostgreSQL
2. ✅ Show you instructions for updating environment variables
3. ✅ Test the connection

## Option 2: Manual Update

### Step 1: Update Password in Database

**If you have SSH access to your server:**

```bash
# Connect to database container
docker exec -it juelle-hair-db-prod bash

# Connect to PostgreSQL
psql -U postgres -d juellehair

# Update password
ALTER USER postgres WITH PASSWORD 'lneSKPhplZp7TemPeFnFmFd4C';

# Exit
\q
exit
```

**Or use the one-liner:**
```bash
docker exec juelle-hair-db-prod psql -U postgres -d juellehair -c "ALTER USER postgres WITH PASSWORD 'lneSKPhplZp7TemPeFnFmFd4C';"
```

### Step 2: Update Environment Variable in Coolify

1. **Log in to Coolify**
2. **Go to your project** (Juelle Hair Backend)
3. **Navigate to "Environment Variables"** section
4. **Find `POSTGRES_PASSWORD`**
5. **Update the value to:** `lneSKPhplZp7TemPeFnFmFd4C`
6. **Save the changes**
7. **Restart the backend service:**
   - Go to the service
   - Click "Restart" or "Redeploy"

### Step 3: Verify Connection

After updating, check the backend logs:

```bash
docker logs juelle-hair-backend-prod --tail 50
```

You should see:
```
✓ Database environment configured
✓ Database is ready
✓ Database credentials are valid
✓ Environment variables OK
```

## Option 3: Use Different Password

If you want to use your own password:

```bash
# Generate a secure password
openssl rand -base64 32 | tr -d "=+/" | cut -c1-25

# Update using the script
./scripts/update-db-password.sh 'YOUR_PASSWORD_HERE'
```

Or manually:
1. Update password in database (see Step 1 above)
2. Update `POSTGRES_PASSWORD` in Coolify
3. Restart backend service

## Troubleshooting

### If you can't connect to update the password:

The database might be using a different password. Try:

1. **Check database logs:**
   ```bash
   docker logs juelle-hair-db-prod | grep -i password
   ```

2. **Check if database accepts connections:**
   ```bash
   docker exec juelle-hair-db-prod pg_isready -U postgres
   ```

3. **If you have the old password**, connect with it:
   ```bash
   PGPASSWORD='old_password' docker exec -it juelle-hair-db-prod psql -U postgres -d juellehair
   ```

4. **If nothing works**, you may need to reset the database (⚠️ **WARNING: This will delete all data**):
   ```bash
   docker-compose -f docker-compose.backend.yml down
   docker volume rm $(docker volume ls | grep postgres | awk '{print $2}')
   # Then restart with new password in environment
   ```

## After Updating

✅ Password updated in database  
✅ `POSTGRES_PASSWORD` updated in Coolify  
✅ Backend service restarted  

The connection errors should now be resolved!

## Important Notes

- ⚠️ **Save the password securely** - you'll need it for database backups and maintenance
- ⚠️ **Don't commit passwords to git** - always use environment variables
- ⚠️ **The `DATABASE_URL` is automatically generated** - you don't need to update it manually with the new `fix-db-env.js` script
