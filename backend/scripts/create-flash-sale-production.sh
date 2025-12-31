#!/bin/bash

# Create Flash Sale in Production Database
# Run in Render Shell: bash scripts/create-flash-sale-production.sh

echo "🎯 Creating Flash Sale in Production..."
echo ""

# Step 1: Create the flash sale
echo "Step 1: Creating flash sale..."
FLASH_SALE_ID=$(psql $DATABASE_URL -t -c "INSERT INTO flash_sales (id, title, description, \"startDate\", \"endDate\", \"discountPercent\", \"isActive\", \"createdAt\", \"updatedAt\") VALUES (gen_random_uuid(), '⚡ Christmas Mega Sale', 'Celebrate the holidays with amazing deals! Up to 30% off on selected hair products. Perfect gifts for yourself or loved ones!', NOW() - INTERVAL '1 day', '2026-01-31 23:59:59', 30, true, NOW(), NOW()) RETURNING id;" | tr -d ' ')

if [ -z "$FLASH_SALE_ID" ]; then
  echo "❌ Failed to create flash sale"
  exit 1
fi

echo "✅ Flash Sale Created!"
echo "   ID: $FLASH_SALE_ID"
echo ""

# Step 2: Add products to flash sale
echo "Step 2: Adding products to flash sale..."
PRODUCT_COUNT=$(psql $DATABASE_URL -t -c "INSERT INTO flash_sale_products (id, \"flashSaleId\", \"productId\", \"createdAt\") SELECT gen_random_uuid(), '$FLASH_SALE_ID', id, NOW() FROM products WHERE \"isActive\" = true LIMIT 10;" | wc -l)

echo "✅ Added products to flash sale"
echo ""

# Step 3: Verify
echo "Step 3: Verifying flash sale..."
psql $DATABASE_URL -c "SELECT id, title, \"isActive\", \"startDate\", \"endDate\", \"discountPercent\", (SELECT COUNT(*) FROM flash_sale_products WHERE \"flashSaleId\" = flash_sales.id) as product_count FROM flash_sales WHERE id = '$FLASH_SALE_ID';"

echo ""
echo "✅ Flash Sale Created Successfully!"
echo "💡 Flash sale should now appear on homepage and header"
echo "🔗 Test: curl https://juelle-hair-backend.onrender.com/api/flash-sales/active"

