-- Add compareAtPriceGhs column to product_variants table
-- This migration adds support for sale prices on product variants

ALTER TABLE "product_variants" 
ADD COLUMN IF NOT EXISTS "compareAtPriceGhs" DECIMAL(10,2);

-- Add a comment to the column
COMMENT ON COLUMN "product_variants"."compareAtPriceGhs" IS 'Sale price for this variant';
