-- Update Production Prices
-- Run this in Render Shell: psql $DATABASE_URL
-- Or: Render Dashboard → juelle-hair-backend → Shell → psql $DATABASE_URL

-- First, check current prices
SELECT slug, title, "priceGhs" FROM products WHERE "priceGhs" = 350.00 LIMIT 10;

-- Update specific products based on local database prices
-- (Update these with correct prices from your local database)

-- Example updates (replace with actual prices from local):
UPDATE products SET "priceGhs" = 315.00 WHERE slug = 'zury-sis-crochet-braid-v11-boho-curly';
UPDATE products SET "priceGhs" = 160.00 WHERE slug = 'wig-it-detangler-4oz';
UPDATE products SET "priceGhs" = 120.00 WHERE slug = 'synthetic-braiding-hair-24';
UPDATE products SET "priceGhs" = 315.00 WHERE slug = 'premium-lace-front-wig-black';
UPDATE products SET "priceGhs" = 499.00 WHERE slug = 'premium-synthetic-braiding-hair-24-inches-long';
UPDATE products SET "priceGhs" = 840.00 WHERE slug = 'mane-concept-mega-brazilian-braids';

-- Verify updates
SELECT slug, title, "priceGhs" FROM products WHERE slug IN (
  'zury-sis-crochet-braid-v11-boho-curly',
  'wig-it-detangler-4oz',
  'synthetic-braiding-hair-24',
  'premium-lace-front-wig-black'
) ORDER BY slug;

-- To update ALL products, you'll need to:
-- 1. Export prices from local database
-- 2. Create UPDATE statements for each product
-- 3. Run them in production

-- Quick check: How many products need updating?
SELECT COUNT(*) as products_with_350 FROM products WHERE "priceGhs" = 350.00;

