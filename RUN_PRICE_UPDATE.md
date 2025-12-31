# Update Production Prices - Quick Guide

## ✅ SQL Update Script Ready!

I've generated a complete SQL script with all price updates from your local database.

## How to Run

### Option 1: Via Render Shell (Recommended)

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Click: `juelle-hair-backend` → **Shell**

2. **Connect to Database**
   ```bash
   cd backend
   psql $DATABASE_URL
   ```

3. **Run the Update Script**
   ```sql
   -- Copy and paste the contents of UPDATE_ALL_PRODUCTION_PRICES.sql
   -- Or run it directly:
   \i UPDATE_ALL_PRODUCTION_PRICES.sql
   ```

4. **Or Run Individual Updates**
   ```sql
   -- Check current prices first
   SELECT slug, title, "priceGhs" FROM products WHERE "priceGhs" = 350.00 LIMIT 10;
   
   -- Then run updates from UPDATE_ALL_PRODUCTION_PRICES.sql
   ```

### Option 2: Upload and Run Script

1. **Upload Script to Render**
   - Render Dashboard → `juelle-hair-backend` → Shell
   - Upload `UPDATE_ALL_PRODUCTION_PRICES.sql`

2. **Run Script**
   ```bash
   psql $DATABASE_URL < UPDATE_ALL_PRODUCTION_PRICES.sql
   ```

### Option 3: Manual Updates (Safer, Slower)

1. **Check what needs updating:**
   ```sql
   SELECT COUNT(*) FROM products WHERE "priceGhs" = 350.00;
   ```

2. **Update products one by one:**
   ```sql
   UPDATE products SET "priceGhs" = 315.00 WHERE slug = 'zury-sis-crochet-braid-v11-boho-curly';
   UPDATE products SET "priceGhs" = 160.00 WHERE slug = 'wig-it-detangler-4oz';
   -- etc...
   ```

## Verify After Update

```sql
-- Check updated prices
SELECT slug, title, "priceGhs" FROM products ORDER BY "priceGhs" DESC LIMIT 10;

-- Check how many still have 350.00
SELECT COUNT(*) FROM products WHERE "priceGhs" = 350.00;

-- Should be 0 or very few
```

## Files Created

- ✅ `UPDATE_ALL_PRODUCTION_PRICES.sql` - Complete SQL update script
- ✅ `UPDATE_PRODUCTION_PRICES.sql` - Example/template SQL
- ✅ `RUN_PRICE_UPDATE.md` - This guide

## Next Steps

1. ✅ **Script Ready:** `UPDATE_ALL_PRODUCTION_PRICES.sql` contains all updates
2. ⏳ **Run in Render Shell:** Execute the SQL script
3. ⏳ **Verify:** Check production site shows correct prices
4. ⏳ **Test Currency Conversion:** Verify it still works with new prices

## Important Notes

- ⚠️ **Backup First:** Consider backing up production database before bulk updates
- ✅ **Script is Safe:** Only updates `priceGhs` field, matches by slug
- ✅ **Reversible:** You can revert if needed (prices are in the script)
- 💡 **Test First:** Run on a few products first to verify

