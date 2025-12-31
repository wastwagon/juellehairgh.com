# Fix Last 13 Products

## ✅ Progress
- ✅ **44 products updated!**
- ⚠️ **13 products** still have price 350.00

## 🔍 Check Which Products Still Need Fixing

Run this to see which products still have 350.00:

```bash
psql $DATABASE_URL -c "SELECT slug, title, \"priceGhs\" FROM products WHERE \"priceGhs\" = 350.00 ORDER BY slug;"
```

## 🚀 Fix Remaining Products

After you see the list, run this to fix them:

```bash
psql $DATABASE_URL -c "UPDATE products SET \"priceGhs\" = 0.00 WHERE \"priceGhs\" = 350.00 AND slug NOT IN ('allday-locks-synthetic-wig-spray-8-oz-revitalizing-refreshing-leave-in-conditioner-smoothens-detangles-nourishes-cleanses-softens-and-revitalizes-synthetic-hair-8-oz', 'sensationnel-ocean-wave-30-inches-butta', 'simply-stylin-silk-serum-anti-frizz-heat-protectant-for-synthetic-wigs-pure-silicone-serum-for-dry-and-frizzy-hair-detangler-4-fl-oz', 'vivica-a-fox-brazilian-hair-blend-drawstring'); SELECT COUNT(*) as still_350 FROM products WHERE \"priceGhs\" = 350.00;"
```

This will:
- Set all remaining 350.00 products to 0.00
- **EXCEPT** the 4 products that legitimately should be 350.00:
  - `allday-locks-synthetic-wig-spray-8-oz...`
  - `sensationnel-ocean-wave-30-inches-butta`
  - `simply-stylin-silk-serum...`
  - `vivica-a-fox-brazilian-hair-blend-drawstring`

After this, you should have only **4 products** with price 350.00 (the ones that should be 350.00).

