# 🚀 Create Flash Sale Now - One Command

## Quick Fix

Run this **single command** in Render Shell:

```bash
cd backend && bash scripts/create-flash-sale-production.sh
```

This will:
1. ✅ Create the flash sale
2. ✅ Add 10 products to it
3. ✅ Verify it was created
4. ✅ Show you the results

## Or Run Manually

If the script doesn't work, run these commands one by one:

```bash
# Step 1: Create flash sale
FLASH_SALE_ID=$(psql $DATABASE_URL -t -c "INSERT INTO flash_sales (id, title, description, \"startDate\", \"endDate\", \"discountPercent\", \"isActive\", \"createdAt\", \"updatedAt\") VALUES (gen_random_uuid(), '⚡ Christmas Mega Sale', 'Celebrate the holidays with amazing deals!', NOW() - INTERVAL '1 day', '2026-01-31 23:59:59', 30, true, NOW(), NOW()) RETURNING id;" | tr -d ' ')

# Step 2: Add products (uses FLASH_SALE_ID from Step 1)
psql $DATABASE_URL -c "INSERT INTO flash_sale_products (id, \"flashSaleId\", \"productId\", \"createdAt\") SELECT gen_random_uuid(), '$FLASH_SALE_ID', id, NOW() FROM products WHERE \"isActive\" = true LIMIT 10;"

# Step 3: Verify
psql $DATABASE_URL -c "SELECT id, title, \"isActive\", (SELECT COUNT(*) FROM flash_sale_products WHERE \"flashSaleId\" = flash_sales.id) as products FROM flash_sales WHERE \"isActive\" = true ORDER BY \"createdAt\" DESC LIMIT 1;"
```

## Verify It Works

After creating, test:
```bash
curl https://juelle-hair-backend.onrender.com/api/flash-sales/active
```

Should return JSON with flash sale data (not null).

## Expected Result

After creating:
- ✅ Flash sale appears in header (top bar)
- ✅ Flash sale section appears on homepage
- ✅ Countdown timer shows
- ✅ Products display with discount prices

