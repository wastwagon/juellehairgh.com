# 🔄 Syncing Color Terms from LOCAL to PRODUCTION

## ⚠️ Important: Run from LOCAL Machine

The sync script needs to connect to:
- **Local database** (your Docker/local database)
- **Production database** (Render's database)

## 🚀 Correct Way to Run

### Option 1: Run from Your Local Machine (Recommended)

1. **Make sure your local Docker database is running:**
   ```bash
   docker-compose ps
   ```

2. **Set production database URL:**
   ```bash
   export DATABASE_URL_PROD="postgresql://juellehair_user:aBHT8CuQ8qADgxzDb0z3LL7b0RX5HwfK@dpg-d4s49nvdiees73djtjgg-a.oregon-postgres.render.com/juellehair_ec5x"
   ```

3. **Run the sync script:**
   ```bash
   cd backend
   npm run sync:color-terms
   ```

### Option 2: Run on Render (Advanced)

If you must run on Render, you need to:
1. Set `DATABASE_URL_LOCAL` to your local database URL
2. Keep `DATABASE_URL` as production (Render's default)
3. Modify the script to use `DATABASE_URL_LOCAL` for local connection

**But this won't work** because Render can't connect to your local database directly.

## 🔍 Why Only 1 Term Shows Images?

If you ran the script on Render, it's comparing:
- `DATABASE_URL` (Render's production database) 
- `DATABASE_URL_PROD` (also production database)

So it's syncing production → production, which is why you only see 1 term with images.

## ✅ Solution

**Run the script from your LOCAL machine** where:
- `DATABASE_URL` points to your local Docker database (with all 33 terms and images)
- `DATABASE_URL_PROD` points to Render's production database

Then it will sync: **Local (33 terms with images) → Production**

