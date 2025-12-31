# Fix Production Prices - All Products Showing 350.00

## Problem Identified ✅

**Root Cause:** Production database has incorrect prices (most products set to 350.00)

**Evidence:**
- Production API returns: 9/10 products with price 350.00
- Only 1 product has different price (445.00)
- Local database has correct prices
- API and frontend code are working correctly

## Solution Options

### Option 1: Sync Prices from Local to Production (Recommended)

**Step 1: Get Production Database URL**
1. Go to Render Dashboard → `juelle-hair-postgres` → Info
2. Copy "Internal Database URL" or "Connection String"

**Step 2: Run Sync Script**
```bash
cd /Users/OceanCyber/Downloads/juellehairgh.com

# Set production database URL
export DATABASE_URL_PROD="postgresql://user:password@host:port/database"

# Run sync script
cd backend
ts-node scripts/sync-prices-to-production.ts
```

**Or via Render Shell:**
1. Render Dashboard → `juelle-hair-backend` → Shell
2. Upload sync script
3. Run with production DATABASE_URL

### Option 2: Update Prices via Admin Panel

1. Go to production admin panel
2. Edit each product individually
3. Update prices manually
4. Time-consuming but safe

### Option 3: Export/Import Prices

**Export from Local:**
```bash
# Export prices to JSON
cd backend
npx prisma db execute --stdin <<< "SELECT slug, \"priceGhs\", \"compareAtPriceGhs\" FROM products;" > local-prices.json
```

**Import to Production:**
- Use admin panel bulk update
- Or create import script

### Option 4: Use Render Shell to Update Directly

1. Render Dashboard → `juelle-hair-backend` → Shell
2. Connect to production database:
```bash
cd backend
npx prisma studio
# Or use psql directly
psql $DATABASE_URL
```

3. Update prices via SQL:
```sql
-- Example: Update specific product
UPDATE products SET "priceGhs" = 445.00 WHERE slug = 'product-slug';

-- Or update multiple products
UPDATE products SET "priceGhs" = 445.00 WHERE title LIKE '%Product Name%';
```

## Quick Fix: Update via Render Shell

**Fastest method:**

1. **Get Production Database URL:**
   - Render Dashboard → `juelle-hair-postgres` → Info
   - Copy connection string

2. **Connect via Render Shell:**
   - Render Dashboard → `juelle-hair-backend` → Shell
   - Run:
   ```bash
   cd backend
   psql $DATABASE_URL
   ```

3. **Check Current Prices:**
   ```sql
   SELECT slug, title, "priceGhs" FROM products LIMIT 10;
   ```

4. **Update Prices:**
   ```sql
   -- Update all products that have 350.00 (be careful!)
   -- First, check how many:
   SELECT COUNT(*) FROM products WHERE "priceGhs" = 350.00;
   
   -- Then update specific products (safer):
   UPDATE products SET "priceGhs" = 445.00 WHERE slug = 'specific-product-slug';
   ```

## Recommended Approach

**Best:** Use the sync script (`sync-prices-to-production.ts`) to:
1. ✅ Safely match products by slug
2. ✅ Only update prices that differ
3. ✅ Preserve other product data
4. ✅ Show detailed summary

**Steps:**
1. Get production DATABASE_URL from Render
2. Run sync script
3. Verify prices on production site
4. Commit script for future use

## Verification

After updating prices:
1. Check production API: `https://juelle-hair-backend.onrender.com/api/products?limit=10`
2. Verify prices are different
3. Check frontend displays correct prices
4. Test currency conversion still works

## Next Steps

1. ✅ **Diagnose:** Done - Database issue identified
2. ⏳ **Fix:** Update production database prices
3. ⏳ **Verify:** Check production site
4. ⏳ **Commit:** Save sync script for future use

