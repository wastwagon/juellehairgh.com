# 🔧 Setting DATABASE_URL_PROD in Render

## Step-by-Step Instructions

### 1. Copy the External Database URL

From your PostgreSQL service page (`juelle-hair-postgres`):
- Go to **"Info"** tab
- Scroll to **"External Database URL"**
- Click the **copy icon** to copy the full URL

The URL should look like:
```
postgresql://juellehair_user:aBHT8CuQ8qADgxzDb0z3LL7b0RX5HwfK@dpg-d4s49nvdiees73djtjgg-a.oregon-postgres.render.com/juellehair_ec5x
```

### 2. Add to Backend Service Environment Variables

1. Go to your **backend service** (`juelle-hair-backend`)
2. Click **"Environment"** tab (in left sidebar under "MANAGE")
3. Click **"+ Add Environment Variable"** button
4. Add:
   - **Key:** `DATABASE_URL_PROD`
   - **Value:** Paste the External Database URL you copied
5. Click **"Save Changes"**

### 3. Verify It's Set

In Render Web Shell, run:
```bash
echo $DATABASE_URL_PROD
```

It should show the database URL.

### 4. Run the Sync Script

Once `DATABASE_URL_PROD` is set, run:
```bash
npx ts-node scripts/sync-color-terms-to-production.ts
```

Or after deployment:
```bash
npm run sync:color-terms
```

---

## ⚠️ Important Notes

- **Use External Database URL** (not Internal) - This ensures the script can connect from Render's backend service
- **Keep it secure** - Don't share this URL publicly
- **Both URLs point to the same database** - Internal is for services on Render, External is for external connections

---

## 🎯 Quick Reference

**Current Environment Variables in Backend:**
- ✅ `DATABASE_URL` - Already set (Internal URL)
- ❌ `DATABASE_URL_PROD` - **Need to add this** (External URL)

**What to add:**
- **Key:** `DATABASE_URL_PROD`
- **Value:** Copy from PostgreSQL service → Info → External Database URL

