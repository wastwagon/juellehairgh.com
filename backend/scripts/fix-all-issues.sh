#!/bin/bash

# Comprehensive fix script for Render Shell
# Fixes: Prices, Currency Rates, and checks variants
# Usage: bash scripts/fix-all-issues.sh

echo "🔧 Fixing All Production Issues..."
echo "=================================="
echo ""

# 1. Update Currency Rates
echo "1️⃣  Updating Currency Rates..."
cd backend
npm run fix:currency-rates
echo ""

# 2. Update Product Prices
echo "2️⃣  Updating Product Prices..."
psql $DATABASE_URL << 'PRICE_UPDATE_EOF'
-- Update prices (key products first)
UPDATE products SET "priceGhs" = 315.00 WHERE slug = 'zury-sis-crochet-braid-v11-boho-curly';
UPDATE products SET "priceGhs" = 160.00 WHERE slug = 'wig-it-detangler-4oz';
UPDATE products SET "priceGhs" = 195.00 WHERE slug = 'african-essence-control-wig-spray-4-oz';
UPDATE products SET "priceGhs" = 120.00 WHERE slug = 'african-essence-weave-spray-6-in-1-12oz';
UPDATE products SET "priceGhs" = 136.50 WHERE slug = 'african-pride-braid-sheen-spray-12oz';
UPDATE products SET "priceGhs" = 170.00 WHERE slug = 'difeel-rosemary-and-mint-infused-with-biotin-root-stimulator-7-1-oz';
UPDATE products SET "priceGhs" = 175.00 WHERE slug = 'difeel-rosemary-mint-infused-biotin-root-stimulator';
UPDATE products SET "priceGhs" = 220.00 WHERE slug = 'freetress-100-human-hair-braid-water-bulk-18-inches';
UPDATE products SET "priceGhs" = 840.00 WHERE slug = 'mane-concept-mega-brazilian-braids';
UPDATE products SET "priceGhs" = 500.00 WHERE slug = 'new';
UPDATE products SET "priceGhs" = 455.00 WHERE slug = 'outre-human-hair-blend-clip-in-9';
UPDATE products SET "priceGhs" = 650.00 WHERE slug = 'outre-x-pression-braid-natural-kinky-twist-18-inches';
UPDATE products SET "priceGhs" = 525.00 WHERE slug = 'outre-xpression-lil-looks-3x-crochet-braid';
UPDATE products SET "priceGhs" = 315.00 WHERE slug = 'premium-lace-front-wig-black';
UPDATE products SET "priceGhs" = 499.00 WHERE slug = 'premium-synthetic-braiding-hair-24-inches-long';
UPDATE products SET "priceGhs" = 840.00 WHERE slug = 'sensationnel-curls-kinks-textured-glueless-hd';
UPDATE products SET "priceGhs" = 170.00 WHERE slug = 'swing-it-wig-it-leave-in-conditioner-4oz';
UPDATE products SET "priceGhs" = 120.00 WHERE slug = 'synthetic-braiding-hair-24';
UPDATE products SET "priceGhs" = 129.50 WHERE slug = 'wild-growth-never-before-now-growth-hair-oil';

-- Check results
SELECT COUNT(*) as products_with_350 FROM products WHERE "priceGhs" = 350.00;
SELECT COUNT(*) as total_products FROM products;
PRICE_UPDATE_EOF
echo ""

# 3. Check Variants Status
echo "3️⃣  Checking Product Variants..."
psql $DATABASE_URL << 'VARIANTS_CHECK_EOF'
SELECT 
  COUNT(DISTINCT p.id) as products_with_variants,
  COUNT(v.id) as total_variants,
  COUNT(DISTINCT p.id) FILTER (WHERE v.id IS NULL) as products_without_variants
FROM products p
LEFT JOIN product_variants v ON p.id = v."productId"
WHERE p."isActive" = true;
VARIANTS_CHECK_EOF
echo ""

# 4. Check Currency Rates
echo "4️⃣  Checking Currency Rates..."
psql $DATABASE_URL << 'CURRENCY_CHECK_EOF'
SELECT 
  COUNT(*) as total_rates,
  MIN("updatedAt") as oldest_rate,
  MAX("updatedAt") as newest_rate
FROM currency_rates;
CURRENCY_CHECK_EOF
echo ""

echo "✅ All fixes completed!"
echo "💡 Check the results above"

