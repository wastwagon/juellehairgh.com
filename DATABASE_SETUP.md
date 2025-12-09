# Database Setup Guide

## ✅ Blueprint Configuration Updated

I've updated `render.yaml` to **automatically create a new PostgreSQL database** and link it to your backend service.

## What Happens When You Deploy

1. **Render creates the database** (`juelle-hair-postgres`)
2. **Render creates the web service** (`juelle-hair-backend`)
3. **Render automatically links them** - `DATABASE_URL` is set automatically
4. **No manual linking needed!**

## After Blueprint Deployment

### Step 1: Run Database Migrations

After the service is deployed, you need to run Prisma migrations to create your database schema:

**Option A: Using Render Shell (Recommended)**

1. Go to `juelle-hair-backend` service in Render
2. Click **"Shell"** tab
3. Run:
   ```bash
   cd backend
   npm run prisma:migrate deploy
   ```

**Option B: Using Local Machine**

```bash
cd /Users/OceanCyber/Downloads/juellehairgh.com/backend

# Set DATABASE_URL (get it from Render dashboard → Database → Internal Database URL)
export DATABASE_URL="postgresql://user:password@host:5432/database"

# Deploy migrations
npm run prisma:migrate deploy
```

**Option C: Add to Build Command (Automatic)**

I can update the build command to run migrations automatically. Would you like me to do that?

### Step 2: Seed Database (Optional)

If you have seed data:

```bash
# In Render Shell or locally
npm run prisma:seed
```

## Database Connection String

After deployment, you can find the connection string in:
- Render Dashboard → `juelle-hair-postgres` database → **"Connections"** tab
- It's automatically set as `DATABASE_URL` in your web service

## Important Notes

✅ **Database is created automatically** - No manual setup needed
✅ **Auto-linked to backend** - `DATABASE_URL` is set automatically
✅ **Migrations needed** - Run `prisma migrate deploy` after first deployment
✅ **Fresh database** - You'll need to migrate your schema

## Migration Options

### Option 1: Run Migrations Manually (After Deployment)
```bash
# In Render Shell
cd backend
npm run prisma:migrate deploy
```

### Option 2: Auto-Run Migrations (I can add this)
Update build command to:
```yaml
buildCommand: npm ci && npm run prisma:generate && npm run build && npm run prisma:migrate deploy
```

**Which do you prefer?** I can update the Blueprint to auto-run migrations if you want.

## Next Steps

1. ✅ Push `render.yaml` to GitHub
2. ✅ Create Blueprint in Render
3. ✅ Render creates database + service automatically
4. ✅ Run migrations (manually or auto)
5. ✅ Add environment variables (JWT_SECRET, PAYSTACK_SECRET_KEY)
6. ✅ Test deployment

---

**Everything is configured!** The Blueprint will create everything automatically.
