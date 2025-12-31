# Fix Flash Sales on Production

## 🔍 Issue
- **Local:** Has flash sale "⚡ Christmas Mega Sale" ✅
- **Production:** No flash sale (API returns null) ❌

## 🚀 Solution

Flash sales need to be created in production database. You have two options:

### Option 1: Create via Admin Panel (Recommended)

1. **Go to Production Admin Panel:**
   ```
   https://juelle-hair-web.onrender.com/admin/flash-sales
   ```

2. **Create a new Flash Sale:**
   - Title: "⚡ Christmas Mega Sale" (or any title)
   - Description: "Celebrate the holidays with amazing deals!"
   - Start Date: Set to current date/time or past date
   - End Date: Set to future date (e.g., 2026-01-31)
   - Discount Percent: 30 (or your desired discount)
   - **isActive:** ✅ Check this box (IMPORTANT!)
   - Add products to the flash sale

3. **Save** the flash sale

### Option 2: Create via Render Shell (SQL)

Run this in Render Shell to create a flash sale:

```bash
psql $DATABASE_URL << 'EOF'
-- Create a flash sale
INSERT INTO "FlashSale" (
  id,
  title,
  description,
  "startDate",
  "endDate",
  "discountPercent",
  "isActive",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  '⚡ Christmas Mega Sale',
  'Celebrate the holidays with amazing deals! Up to 30% off on selected hair products.',
  NOW() - INTERVAL '1 day',  -- Started yesterday
  NOW() + INTERVAL '30 days', -- Ends in 30 days
  30,
  true,
  NOW(),
  NOW()
) RETURNING id, title;
EOF
```

Then add products to the flash sale (replace `FLASH_SALE_ID` and `PRODUCT_ID`):

```bash
psql $DATABASE_URL << 'EOF'
-- Add products to flash sale (get product IDs first)
-- First, get the flash sale ID:
SELECT id, title FROM "FlashSale" WHERE title = '⚡ Christmas Mega Sale';

-- Then add products (replace FLASH_SALE_ID and PRODUCT_ID):
INSERT INTO "FlashSaleProduct" (
  id,
  "flashSaleId",
  "productId",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'FLASH_SALE_ID',  -- Replace with actual flash sale ID
  'PRODUCT_ID',     -- Replace with actual product ID
  NOW(),
  NOW()
);
EOF
```

## ✅ Verify

After creating the flash sale, verify it's active:

```bash
curl https://juelle-hair-backend.onrender.com/api/flash-sales/active
```

Should return JSON with flash sale data, not null.

## 📋 Requirements for Flash Sale to Show

For a flash sale to appear on the homepage and header, it must:
1. ✅ `isActive = true`
2. ✅ `startDate <= now` (already started)
3. ✅ `endDate >= now` (not expired)
4. ✅ Has at least one product added

## 🎯 Expected Result

After creating the flash sale:
- ✅ Flash sale section appears on homepage
- ✅ Flash sale banner appears in header (top bar)
- ✅ Countdown timer shows time remaining
- ✅ Products display with discount prices

