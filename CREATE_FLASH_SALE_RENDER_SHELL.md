# 🚀 Create Flash Sale in Production - Render Shell

## You're Already in Backend Directory!

Since you're already in `~/project/src/backend$`, just run:

```bash
bash scripts/create-flash-sale-production.sh
```

## Or Run Commands Directly:

### Option 1: One Command (Easiest)

```bash
FLASH_SALE_ID=$(psql $DATABASE_URL -t -c "INSERT INTO flash_sales (id, title, description, \"startDate\", \"endDate\", \"discountPercent\", \"isActive\", \"createdAt\", \"updatedAt\") VALUES (gen_random_uuid(), '⚡ Christmas Mega Sale', 'Celebrate the holidays with amazing deals!', NOW() - INTERVAL '1 day', '2026-01-31 23:59:59', 30, true, NOW(), NOW()) RETURNING id;" | tr -d ' ') && psql $DATABASE_URL -c "INSERT INTO flash_sale_products (id, \"flashSaleId\", \"productId\", \"createdAt\") SELECT gen_random_uuid(), '$FLASH_SALE_ID', id, NOW() FROM products WHERE \"isActive\" = true LIMIT 10;" && psql $DATABASE_URL -c "SELECT id, title, \"isActive\", (SELECT COUNT(*) FROM flash_sale_products WHERE \"flashSaleId\" = flash_sales.id) as products FROM flash_sales WHERE id = '$FLASH_SALE_ID';"
```

### Option 2: Step by Step

**Step 1:** Create flash sale
```bash
psql $DATABASE_URL -c "INSERT INTO flash_sales (id, title, description, \"startDate\", \"endDate\", \"discountPercent\", \"isActive\", \"createdAt\", \"updatedAt\") VALUES (gen_random_uuid(), '⚡ Christmas Mega Sale', 'Celebrate the holidays with amazing deals!', NOW() - INTERVAL '1 day', '2026-01-31 23:59:59', 30, true, NOW(), NOW()) RETURNING id, title;"
```

**Step 2:** Copy the ID from output, then add products:
```bash
# Replace FLASH_SALE_ID with the ID from Step 1
psql $DATABASE_URL -c "INSERT INTO flash_sale_products (id, \"flashSaleId\", \"productId\", \"createdAt\") SELECT gen_random_uuid(), 'FLASH_SALE_ID', id, NOW() FROM products WHERE \"isActive\" = true LIMIT 10;"
```

**Step 3:** Verify:
```bash
psql $DATABASE_URL -c "SELECT id, title, \"isActive\", \"startDate\", \"endDate\", \"discountPercent\", (SELECT COUNT(*) FROM flash_sale_products WHERE \"flashSaleId\" = flash_sales.id) as product_count FROM flash_sales WHERE \"isActive\" = true ORDER BY \"createdAt\" DESC LIMIT 1;"
```

## Verify It Works

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

