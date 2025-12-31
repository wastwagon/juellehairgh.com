# 🚀 COPY & PASTE THIS IN RENDER SHELL

## Step 1: Go to Render Shell
Render Dashboard → `juelle-hair-backend` → **Shell**

## Step 2: Copy and Paste This Entire Command:

```bash
cd backend && bash scripts/quick-fix.sh
```

**OR** if that doesn't work, copy this entire block:

```bash
cd backend
npm run fix:currency-rates
psql $DATABASE_URL << 'EOF'
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
SELECT COUNT(*) as still_350 FROM products WHERE "priceGhs" = 350.00;
SELECT COUNT(*) as total FROM products;
EOF
```

## Step 3: Wait for completion
You'll see:
- Currency rates being updated
- Product prices being updated
- Count of products still with 350.00 (should be much lower)

## Step 4: Verify
Check your production site - prices should be different now!

