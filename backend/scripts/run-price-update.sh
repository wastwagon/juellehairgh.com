#!/bin/bash

# Script to update production prices - can be run in Render Shell
# Usage: bash scripts/run-price-update.sh

echo "🔄 Updating Production Prices..."
echo ""

# Connect to database and run SQL updates
psql $DATABASE_URL << 'EOF'

-- Update prices from local database
UPDATE products SET "priceGhs" = 195.00 WHERE slug = 'african-essence-control-wig-spray-4-oz';
UPDATE products SET "priceGhs" = 120.00 WHERE slug = 'african-essence-weave-spray-6-in-1-12oz';
UPDATE products SET "priceGhs" = 136.50 WHERE slug = 'african-pride-braid-sheen-spray-12oz';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'aftress-syn-afro-kinky-bulk';
UPDATE products SET "priceGhs" = 350.00 WHERE slug = 'allday-locks-synthetic-wig-spray-8-oz-revitalizing-refreshing-leave-in-conditioner-smoothens-detangles-nourishes-cleanses-softens-and-revitalizes-synthetic-hair-8-oz';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'bobbi-boss-3x-brazilian-soft-water-wave-braid-26-inches';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'bobbi-boss-human-hair-blend-drawstring-ponytail-kinky-blow-out-20-inches';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'bobbi-boss-loc-twist-afro-twista-ponytail-18-inches';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'bobbi-boss-miss-origin-designer-mix-tress-up-ocean-wave-28-inches';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'bobbi-boss-miss-origin-designer-mix-tress-up-ocean-wave-28-inches-ponytail-mod021';
UPDATE products SET "priceGhs" = 170.00 WHERE slug = 'difeel-rosemary-and-mint-infused-with-biotin-root-stimulator-7-1-oz';
UPDATE products SET "priceGhs" = 175.00 WHERE slug = 'difeel-rosemary-mint-infused-biotin-root-stimulator';
UPDATE products SET "priceGhs" = 220.00 WHERE slug = 'freetress-100-human-hair-braid-water-bulk-18-inches';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'freetress-3x-pre-fluffed-poppin-twist-16';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'freetress-braid-synthetic-hair-3x-braid-french-curl-22';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'freetress-crochet-braids-3x-pre-fluffed-poppin-twist-20-inches';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'freetress-equal-3x-cuban-twist-soft-natural-16-inches';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'glossy-100-virgin-remy-hair-deep-wave-18-20-22-natural-black';
UPDATE products SET "priceGhs" = 840.00 WHERE slug = 'mane-concept-mega-brazilian-braids';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-18';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-18-inches';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-20';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-22';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-24';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-26';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-28';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-30';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-32';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-34';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-36';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-38';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-40';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-42';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-44';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-46';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-48';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-50';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-52';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-54';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-56';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-58';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-60';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-62';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-64';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-66';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-68';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-70';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-72';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-74';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-76';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-78';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-80';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-82';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-84';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-86';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-88';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-90';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-92';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-94';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-96';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-98';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-100';
UPDATE products SET "priceGhs" = 160.00 WHERE slug = 'wig-it-detangler-4oz';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'wild-growth-hair-oil-4-oz';
UPDATE products SET "priceGhs" = 129.50 WHERE slug = 'wild-growth-never-before-now-growth-hair-oil';
UPDATE products SET "priceGhs" = 315.00 WHERE slug = 'zury-sis-crochet-braid-v11-boho-curly';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'zury-sis-crochet-braid-v11-boho-curly-12-13-14-inch';

-- Verify updates
SELECT COUNT(*) as still_350 FROM products WHERE "priceGhs" = 350.00;
SELECT COUNT(*) as total_products FROM products;

EOF

echo ""
echo "✅ Price update completed!"
echo "💡 Check the counts above - products with 350.00 should be much lower now"

