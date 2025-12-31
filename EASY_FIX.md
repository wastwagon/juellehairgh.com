# 🚀 Easy Fix - Copy These Commands One at a Time

Since pasting the big block doesn't work, here are **smaller chunks** you can paste:

## Option 1: Upload SQL File (Easiest!)

1. **Upload the file** `fix-prices-simple.sql` to Render Shell
2. **Run:** `psql $DATABASE_URL < fix-prices-simple.sql`

## Option 2: Copy Small Chunks

Copy and paste these **one at a time** (press Enter after each):

### Chunk 1 (First 10 products):
```sql
psql $DATABASE_URL -c "UPDATE products SET \"priceGhs\" = 195.00 WHERE slug = 'african-essence-control-wig-spray-4-oz'; UPDATE products SET \"priceGhs\" = 120.00 WHERE slug = 'african-essence-weave-spray-6-in-1-12oz'; UPDATE products SET \"priceGhs\" = 136.50 WHERE slug = 'african-pride-braid-sheen-spray-12oz'; UPDATE products SET \"priceGhs\" = 0.00 WHERE slug = 'aftress-syn-afro-kinky-bulk'; UPDATE products SET \"priceGhs\" = 0.00 WHERE slug = 'bobbi-boss-3x-brazilian-soft-water-wave-braid-26-inches'; UPDATE products SET \"priceGhs\" = 0.00 WHERE slug = 'bobbi-boss-human-hair-blend-drawstring-ponytail-kinky-blow-out-20-inches'; UPDATE products SET \"priceGhs\" = 0.00 WHERE slug = 'bobbi-boss-loc-twist-afro-twista-ponytail-18-inches'; UPDATE products SET \"priceGhs\" = 0.00 WHERE slug = 'bobbi-boss-miss-origin-designer-mix-tress-up-ocean-wave-28-inches'; UPDATE products SET \"priceGhs\" = 0.00 WHERE slug = 'bobbi-boss-miss-origin-designer-mix-tress-up-ocean-wave-28-inches-ponytail-mod021'; UPDATE products SET \"priceGhs\" = 170.00 WHERE slug = 'difeel-rosemary-and-mint-infused-with-biotin-root-stimulator-7-1-oz';"
```

### Chunk 2 (Next 10):
```sql
psql $DATABASE_URL -c "UPDATE products SET \"priceGhs\" = 175.00 WHERE slug = 'difeel-rosemary-mint-infused-biotin-root-stimulator'; UPDATE products SET \"priceGhs\" = 220.00 WHERE slug = 'freetress-100-human-hair-braid-water-bulk-18-inches'; UPDATE products SET \"priceGhs\" = 0.00 WHERE slug = 'freetress-3x-pre-fluffed-poppin-twist-16'; UPDATE products SET \"priceGhs\" = 0.00 WHERE slug = 'freetress-braid-synthetic-hair-3x-braid-french-curl-22'; UPDATE products SET \"priceGhs\" = 0.00 WHERE slug = 'freetress-crochet-braids-3x-pre-fluffed-poppin-twist-20-inches'; UPDATE products SET \"priceGhs\" = 0.00 WHERE slug = 'freetress-equal-3x-cuban-twist-soft-natural-16-inches'; UPDATE products SET \"priceGhs\" = 0.00 WHERE slug = 'glossy-100-virgin-remy-hair-deep-wave-18-20-22-natural-black'; UPDATE products SET \"priceGhs\" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-18'; UPDATE products SET \"priceGhs\" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-18-inches'; UPDATE products SET \"priceGhs\" = 0.00 WHERE slug = 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-20';"
```

### Chunk 3 (Mane Concept products):
```sql
psql $DATABASE_URL -c "UPDATE products SET \"priceGhs\" = 0.00 WHERE slug LIKE 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-%';"
```

### Chunk 4 (Other products):
```sql
psql $DATABASE_URL -c "UPDATE products SET \"priceGhs\" = 500.00 WHERE slug = 'new'; UPDATE products SET \"priceGhs\" = 185.00 WHERE slug = 'new-wild-growth-never-before-now-growth-hair-oil-4-oz'; UPDATE products SET \"priceGhs\" = 0.00 WHERE slug = 'outre-human-hair-blend-big-beautiful-hair-clip-in-9-4a-kinky-curly'; UPDATE products SET \"priceGhs\" = 0.00 WHERE slug = 'outre-x-pression-4-in-1-pre-loop-crochet-braid-bahamas-curl-14-inch'; UPDATE products SET \"priceGhs\" = 0.00 WHERE slug = 'outre-x-pression-lil-looks-3x-crochet-braid-springy-afro-twist-10'; UPDATE products SET \"priceGhs\" = 0.00 WHERE slug = 'outre-x-pression-twisted-up-crochet-braids-swicy-afro-twist-3x-18'; UPDATE products SET \"priceGhs\" = 0.00 WHERE slug = 'premium-synthetic-braiding-hair-24-inches-long-1'; UPDATE products SET \"priceGhs\" = 0.00 WHERE slug LIKE 'sensationnel-%'; UPDATE products SET \"priceGhs\" = 0.00 WHERE slug = 'stay-on-satin-anti-breakage'; UPDATE products SET \"priceGhs\" = 0.00 WHERE slug = 'vivica-a-fox-100-brazilian-human-hair-blend-drawstring-ponytail'; UPDATE products SET \"priceGhs\" = 0.00 WHERE slug = 'wild-growth-hair-oil-4-oz'; UPDATE products SET \"priceGhs\" = 0.00 WHERE slug = 'zury-sis-crochet-braid-v11-boho-curly-12-13-14-inch';"
```

### Check Results:
```sql
psql $DATABASE_URL -c "SELECT COUNT(*) as still_350 FROM products WHERE \"priceGhs\" = 350.00; SELECT slug, title, \"priceGhs\" FROM products WHERE \"priceGhs\" = 350.00 LIMIT 10;"
```

## Option 3: Use Pattern Matching (Fastest!)

This updates all products with patterns:

```sql
psql $DATABASE_URL -c "UPDATE products SET \"priceGhs\" = 0.00 WHERE slug LIKE 'mane-concept-mega-brazilian-human-hair-blend-braids-deep-wave-bulk-%' AND \"priceGhs\" = 350.00; UPDATE products SET \"priceGhs\" = 0.00 WHERE slug LIKE 'sensationnel-%' AND \"priceGhs\" = 350.00 AND slug NOT IN ('sensationnel-ocean-wave-30-inches-butta', 'sensationnel-curls-kinks-textured-glueless-hd'); UPDATE products SET \"priceGhs\" = 0.00 WHERE slug LIKE 'bobbi-boss-%' AND \"priceGhs\" = 350.00; UPDATE products SET \"priceGhs\" = 0.00 WHERE slug LIKE 'freetress-%' AND \"priceGhs\" = 350.00; UPDATE products SET \"priceGhs\" = 0.00 WHERE slug LIKE 'outre-x-pression-%' AND \"priceGhs\" = 350.00 AND slug NOT IN ('outre-x-pression-braid-natural-kinky-twist-18-inches'); SELECT COUNT(*) as still_350 FROM products WHERE \"priceGhs\" = 350.00;"
```

This should fix most of them quickly!

