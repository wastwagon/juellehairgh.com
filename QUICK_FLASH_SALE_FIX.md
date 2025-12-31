# 🚀 Quick Fix: Flash Sales on Production

## Problem
- ✅ Local has flash sale: "⚡ Christmas Mega Sale"
- ❌ Production doesn't have flash sale

## Solution: Create Flash Sale in Production

### Option 1: Via Admin Panel (Easiest)

1. Go to: `https://juelle-hair-web.onrender.com/admin/flash-sales`
2. Click "Create New Flash Sale"
3. Fill in:
   - **Title:** `⚡ Christmas Mega Sale`
   - **Description:** `Celebrate the holidays with amazing deals! Up to 30% off on selected hair products.`
   - **Start Date:** Yesterday or today
   - **End Date:** Future date (e.g., Jan 31, 2026)
   - **Discount:** `30`
   - **isActive:** ✅ Check this!
4. Add products to the flash sale
5. Save

### Option 2: Via Render Shell (SQL)

**Step 1:** Create flash sale
```bash
psql $DATABASE_URL -c "INSERT INTO flash_sales (id, title, description, \"startDate\", \"endDate\", \"discountPercent\", \"isActive\", \"createdAt\", \"updatedAt\") VALUES (gen_random_uuid(), '⚡ Christmas Mega Sale', 'Celebrate the holidays with amazing deals!', NOW() - INTERVAL '1 day', '2026-01-31 23:59:59', 30, true, NOW(), NOW()) RETURNING id, title;"
```

**Step 2:** Copy the flash sale ID from output, then add products:
```bash
# Replace FLASH_SALE_ID with the ID from Step 1
psql $DATABASE_URL -c "INSERT INTO flash_sale_products (id, \"flashSaleId\", \"productId\", \"createdAt\") SELECT gen_random_uuid(), 'FLASH_SALE_ID', id, NOW() FROM products WHERE \"isActive\" = true LIMIT 10;"
```

**Step 3:** Verify:
```bash
curl https://juelle-hair-backend.onrender.com/api/flash-sales/active
```

Should return JSON with flash sale data (not null).

## ✅ After Fix

Flash sale will appear:
- ✅ In header (top bar with countdown)
- ✅ On homepage (full flash sales section)
- ✅ With countdown timer
- ✅ Products with discounted prices

