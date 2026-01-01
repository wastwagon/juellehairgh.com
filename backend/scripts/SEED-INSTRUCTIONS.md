# How to Seed Categories and Brands on Render Production

## Quick Steps:

### 1. Get Your Database URL

On Render, you can get the DATABASE_URL in two ways:

**Option A: From Render Dashboard**
1. Go to your Render dashboard
2. Click on your **PostgreSQL Database** service
3. Go to the **"Info"** tab
4. Copy the **"Internal Database URL"** (for same service) or **"Connection Pooling URL"**

**Option B: From Render Shell (if already connected)**
```bash
echo $DATABASE_URL
```

### 2. Run the Seed Script

**If DATABASE_URL is already set in Render:**
```bash
cd ~/project/src/backend
./scripts/seed-production.sh
```

**If you need to set it manually:**
```bash
cd ~/project/src/backend
export DATABASE_URL="postgresql://user:password@host:port/database"
./scripts/seed-production.sh
```

### 3. Verify It Worked

After running, check the output. You should see:
```
✅ Braids (braids)
   └─ ✅ Boho braids (boho-braids)
   └─ ✅ Crochet Hair (crochet-hair)
   ...
✨ Categories seeded successfully!
```

## Troubleshooting

### Error: "the URL must start with the protocol `postgresql://`"
- Make sure your DATABASE_URL starts with `postgresql://` or `postgres://`
- Don't use placeholder text like "your-production-database-url"

### Error: "No such file or directory"
- You're already in the backend directory, don't run `cd backend`
- Just run: `./scripts/seed-production.sh`

### Error: "Connection refused"
- Check your DATABASE_URL is correct
- Make sure you're using the **Internal Database URL** if running from Render shell
- Or use **Connection Pooling URL** if available

### Find DATABASE_URL in Render:
```bash
# Check if it's already set
echo $DATABASE_URL

# If not set, check Render env vars
env | grep DATABASE
env | grep POSTGRES
```

## What Gets Created

- **7 Main Categories** with subcategories
- **10 Common Hair Brands**

The script uses `upsert`, so it's safe to run multiple times - it will update existing records or create new ones.

