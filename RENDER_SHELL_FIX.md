# Render Shell Fix - Complete Guide

## 🔍 Issues Found

1. ❌ **Currency Rates:** Production has 0 currency rates (empty)
2. ❌ **Product Prices:** 56/57 products have price 350.00 (wrong)
3. ⚠️ **Variants:** Some products missing variants

## 🚀 Quick Fix - Run in Render Shell

### Step 1: Go to Render Shell
1. Render Dashboard → `juelle-hair-backend` → **Shell**
2. You'll see: `render@srv-...:~/project/src/backend$`

### Step 2: Run Fix Script

```bash
cd backend
bash scripts/fix-all-issues.sh
```

**This will:**
- ✅ Update currency rates (fetch from API)
- ✅ Update product prices (fix 350.00 issue)
- ✅ Check variants status
- ✅ Show summary

### Step 3: Or Run Individual Fixes

**Fix Currency Rates:**
```bash
cd backend
npm run fix:currency-rates
```

**Fix Prices:**
```bash
cd backend
bash scripts/run-price-update.sh
```

**Or Update Prices Manually:**
```bash
psql $DATABASE_URL
```
Then paste SQL from `UPDATE_ALL_PRODUCTION_PRICES.sql`

## 📋 What Gets Fixed

### Currency Rates
- Fetches from exchangerate-api.com Open Access
- Stores 96 currency rates in database
- Updates every 12 hours automatically

### Product Prices
- Updates 60 products with correct prices
- Fixes "all products showing 350.00" issue
- Prices range from 0.00 to 840.00

### Variants
- Shows status of products with/without variants
- Helps identify which products need variants

## ✅ Verification

After running fixes, verify:

**1. Currency Rates:**
```bash
curl https://juelle-hair-backend.onrender.com/api/currency/rates
# Should return object with rates, not {}
```

**2. Product Prices:**
```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM products WHERE \"priceGhs\" = 350.00;"
# Should be much lower (ideally 0-2)
```

**3. Check Production Site:**
- Prices should be different (not all 350.00)
- Currency conversion should work
- Variants should display for products that have them

## 🎯 Expected Results

**Before:**
- Currency rates: 0 (empty)
- Products with 350.00: 56/57
- Currency conversion: Not working

**After:**
- Currency rates: 96 rates
- Products with 350.00: 0-2 (only products that should be 350)
- Currency conversion: Working ✅

