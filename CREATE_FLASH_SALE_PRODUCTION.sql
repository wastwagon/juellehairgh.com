-- Create Flash Sale in Production Database
-- Run in Render Shell: psql $DATABASE_URL < CREATE_FLASH_SALE_PRODUCTION.sql

-- Step 1: Create the flash sale
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
  'Celebrate the holidays with amazing deals! Up to 30% off on selected hair products. Perfect gifts for yourself or loved ones!',
  NOW() - INTERVAL '1 day',  -- Started yesterday (so it's active now)
  '2026-01-31 23:59:59',     -- Ends Jan 31, 2026
  30,
  true,
  NOW(),
  NOW()
) RETURNING id, title;

-- Step 2: Get the flash sale ID (from above) and add products
-- Replace FLASH_SALE_ID with the ID returned above

-- Get some product IDs to add (first 10 active products)
-- SELECT id, slug, title FROM "Product" WHERE "isActive" = true LIMIT 10;

-- Step 3: Add products to flash sale (uncomment and replace FLASH_SALE_ID and PRODUCT_IDs)
/*
INSERT INTO "FlashSaleProduct" (
  id,
  "flashSaleId",
  "productId",
  "createdAt",
  "updatedAt"
)
SELECT 
  gen_random_uuid(),
  'FLASH_SALE_ID',  -- Replace with actual flash sale ID from Step 1
  id,
  NOW(),
  NOW()
FROM "Product"
WHERE "isActive" = true
LIMIT 10;  -- Add first 10 active products
*/

-- Verify flash sale was created
SELECT 
  id,
  title,
  "isActive",
  "startDate",
  "endDate",
  "discountPercent",
  (SELECT COUNT(*) FROM "FlashSaleProduct" WHERE "flashSaleId" = "FlashSale".id) as product_count
FROM "FlashSale"
WHERE "isActive" = true
ORDER BY "createdAt" DESC
LIMIT 1;

