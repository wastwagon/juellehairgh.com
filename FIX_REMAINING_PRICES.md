# Fix Remaining Product Prices

## ✅ Progress So Far
- ✅ Currency rates: **96 rates created** (FIXED!)
- ✅ Product prices: **20 products updated**
- ⚠️ Still **48 products** with price 350.00

## 🚀 Fix Remaining Products

Run this in Render Shell to update ALL remaining products:

```bash
psql $DATABASE_URL << 'EOF'
-- Update all remaining products from UPDATE_ALL_PRODUCTION_PRICES.sql
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
UPDATE products SET "priceGhs" = 500.00 WHERE slug = 'new';
UPDATE products SET "priceGhs" = 185.00 WHERE slug = 'new-wild-growth-never-before-now-growth-hair-oil-4-oz';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'outre-human-hair-blend-big-beautiful-hair-clip-in-9-4a-kinky-curly';
UPDATE products SET "priceGhs" = 455.00 WHERE slug = 'outre-human-hair-blend-clip-in-9';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'outre-x-pression-4-in-1-pre-loop-crochet-braid-bahamas-curl-14-inch';
UPDATE products SET "priceGhs" = 650.00 WHERE slug = 'outre-x-pression-braid-natural-kinky-twist-18-inches';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'outre-x-pression-lil-looks-3x-crochet-braid-springy-afro-twist-10';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'outre-x-pression-twisted-up-crochet-braids-swicy-afro-twist-3x-18';
UPDATE products SET "priceGhs" = 525.00 WHERE slug = 'outre-xpression-lil-looks-3x-crochet-braid';
UPDATE products SET "priceGhs" = 315.00 WHERE slug = 'premium-lace-front-wig-black';
UPDATE products SET "priceGhs" = 499.00 WHERE slug = 'premium-synthetic-braiding-hair-24-inches-long';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'premium-synthetic-braiding-hair-24-inches-long-1';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'sensationnel-bare-lace-glueless-extra-transparent-luxe-13x6-lace-front-wig-13x6-unit-3';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'sensationnel-butta-lace-synthetic-hair-hd-lace-wig-butta-unit-5';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'sensationnel-cloud9-glueless-what-lace-13-6-hd-lace-front-wig-zelena';
UPDATE products SET "priceGhs" = 840.00 WHERE slug = 'sensationnel-curls-kinks-textured-glueless-hd';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'sensationnel-curls-kinks-textured-glueless-hd-13-6-lace-front-wig-13-6-kinky-bob-9-kinky-edges';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'sensationnel-curs-kinks-co-glueless-synthetic-kinky-edges-13-6-hd-lace-front-wig-13-6-kinky-body-wave-14';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'sensationnel-human-hair-curls-kinks-co-textured-clip-in-extension-hh-4c-clique';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'sensationnel-human-hair-curls-kinks-co-textured-clip-in-extension-hh-4c-clique-9pcs-14-inch';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'sensationnel-instant-weave-synthetic-half-wig-with-drawstring-cap-iwd-4';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'sensationnel-lulutress-crochet-braid-water-wave-18-inches';
UPDATE products SET "priceGhs" = 350.00 WHERE slug = 'sensationnel-ocean-wave-30-inches-butta';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'sensationnel-ocean-wave-30-inches-butta-human-hair-blend-hd-lace-wig';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'sensationnel-premium-fiber-curls-kinks-co-textured-clip-in-alpha-woman-12-inches';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'sensationnel-synthetic-cloud9-what-lace-wig-latisha';
UPDATE products SET "priceGhs" = 350.00 WHERE slug = 'simply-stylin-silk-serum-anti-frizz-heat-protectant-for-synthetic-wigs-pure-silicone-serum-for-dry-and-frizzy-hair-detangler-4-fl-oz';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'stay-on-satin-anti-breakage';
UPDATE products SET "priceGhs" = 170.00 WHERE slug = 'swing-it-wig-it-leave-in-conditioner-4oz';
UPDATE products SET "priceGhs" = 120.00 WHERE slug = 'synthetic-braiding-hair-24';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'vivica-a-fox-100-brazilian-human-hair-blend-drawstring-ponytail';
UPDATE products SET "priceGhs" = 350.00 WHERE slug = 'vivica-a-fox-brazilian-hair-blend-drawstring';
UPDATE products SET "priceGhs" = 160.00 WHERE slug = 'wig-it-detangler-4oz';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'wild-growth-hair-oil-4-oz';
UPDATE products SET "priceGhs" = 129.50 WHERE slug = 'wild-growth-never-before-now-growth-hair-oil';
UPDATE products SET "priceGhs" = 315.00 WHERE slug = 'zury-sis-crochet-braid-v11-boho-curly';
UPDATE products SET "priceGhs" = 0.00 WHERE slug = 'zury-sis-crochet-braid-v11-boho-curly-12-13-14-inch';

-- Check results
SELECT COUNT(*) as still_350 FROM products WHERE "priceGhs" = 350.00;
SELECT slug, title, "priceGhs" FROM products WHERE "priceGhs" = 350.00 LIMIT 10;
EOF
```

This will update all remaining products and show which ones still have 350.00 (should only be products that legitimately should be 350.00).

