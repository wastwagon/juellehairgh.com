# Diagnose Price Issue - All Products Showing 350.00

## Problem
- Live site shows same price (350.00) for all products
- Currency conversion works but prices are wrong
- Local environment works correctly

## Root Cause Analysis

### Found in Code:
`backend/scripts/migrate-products-from-images.ts` line 106:
```typescript
priceGhs: 350.00, // Default price - update manually
```

This suggests products may have been created with default price 350.00.

## Diagnostic Steps

### Step 1: Check Render Logs (Quickest)
1. Go to Render Dashboard → `juelle-hair-backend` → Logs
2. Check API responses when fetching products
3. Look for: `/api/products` endpoint responses
4. Verify if `priceGhs` values are being returned correctly

### Step 2: Test Production API Directly
```bash
# Test production API
curl https://juelle-hair-backend.onrender.com/api/products?limit=5

# Check if prices are different
# Look for "priceGhs" field in response
```

### Step 3: Compare Local vs Production Database
- Local database likely has correct prices
- Production database may have all products with 350.00

### Step 4: Check Product Data in Production
Use Render Shell to check database:
1. Render Dashboard → `juelle-hair-backend` → Shell
2. Run:
```bash
cd backend
npm run prisma:studio
# Or check directly:
npx prisma db execute --stdin <<< "SELECT id, title, \"priceGhs\" FROM products LIMIT 10;"
```

## Solution Options

### Option A: Database Issue (Most Likely)
If production database has wrong prices:
1. Export correct prices from local database
2. Update production database with correct prices
3. Or re-sync products from local to production

### Option B: API Response Issue
If API is returning wrong data:
1. Check backend products service
2. Verify Prisma queries
3. Check for caching issues

### Option C: Frontend Display Issue
If API returns correct data but frontend shows wrong:
1. Check browser console for errors
2. Verify API response parsing
3. Check currency conversion logic

## Quick Fix Commands

### Check Production Database Prices:
```bash
# Via Render Shell
cd backend
npx prisma studio
# Or via SQL:
psql $DATABASE_URL -c "SELECT title, \"priceGhs\" FROM products LIMIT 10;"
```

### Export Local Prices:
```bash
# Export from local
npx prisma db execute --stdin <<< "SELECT id, title, \"priceGhs\" FROM products;" > local-prices.json
```

### Update Production Prices:
```bash
# Import to production (after verifying)
# Use Prisma client or direct SQL update
```

## Recommended Approach

1. **First:** Check Render logs (5 minutes) - See what API returns
2. **Then:** Test production API directly (2 minutes) - Verify data
3. **If needed:** Check production database via Render Shell (10 minutes)
4. **Fix:** Update prices or fix data fetching issue
5. **Commit:** Push fix if code issue, or update database if data issue

