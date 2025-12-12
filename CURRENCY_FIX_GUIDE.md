# Currency Conversion Fix Guide

## Problem
- Local currency conversion works ✅
- Production frontend currency conversion NOT working ❌
- Using free currency API (exchangerate-api.com)
- Should fetch rates every 24 hours
- Only converts display, checkout stays in GHS ✅

## Root Causes

1. **Rates not in production database** - Most likely cause
2. **API endpoint not accessible** - CORS or URL issue
3. **Rates not being fetched** - Scheduler not running
4. **Frontend not getting rates** - API call failing

---

## Quick Fix (Render Backend)

### Step 1: Check Current Status

```powershell
# In Render Backend Shell
cd backend
npm run check:currency-rates
```

**Expected Output:**
- Shows number of rates in database
- Shows last update time
- Shows sample rates (USD, EUR, etc.)

**If rates are missing or old:**
- You'll see "NO CURRENCY RATES FOUND" or "Rates are older than 24 hours"

### Step 2: Fix Currency Rates

```powershell
# Fetch and store rates
npm run fix:currency-rates
```

**This will:**
- Fetch rates from exchangerate-api.com (free API)
- Store rates in database
- Verify rates were stored correctly

### Step 3: Verify Frontend Can Access Rates

```powershell
# Test API endpoint (from backend shell)
curl http://localhost:3001/api/currency/rates

# Should return JSON with rates:
# {"USD": 0.065, "EUR": 0.060, ...}
```

---

## API Endpoint Test

### From Frontend (Browser Console)

```javascript
// Open browser console on production site
fetch('/api/currency/rates')
  .then(r => r.json())
  .then(data => {
    console.log('Currency rates:', data);
    console.log('Number of rates:', Object.keys(data).length);
  })
  .catch(err => console.error('Error:', err));
```

**Expected:**
- Should return object with currency codes as keys and rates as values
- Example: `{USD: 0.065, EUR: 0.060, GBP: 0.051, ...}`

**If empty `{}`:**
- Rates not in database → Run `fix:currency-rates`
- API endpoint not working → Check backend logs

---

## Database Verification

### Check Rates in Database

```powershell
# In Render Backend Shell
cd backend
npm run prisma:studio

# Or use script
npm run check:currency-rates
```

**What to check:**
1. `currency_rates` table exists
2. Has records with `baseCurrency = "GHS"`
3. Has `targetCurrency` values (USD, EUR, etc.)
4. `rate` values are numbers > 0
5. `updatedAt` is recent (within 24 hours)

---

## Frontend Debugging

### Check Browser Console

1. Open production site
2. Open browser DevTools (F12)
3. Go to Console tab
4. Look for:
   - `🔧 API Base URL configured: ...` - Should show backend URL
   - API errors when fetching `/currency/rates`
   - Currency store errors

### Check Network Tab

1. Open DevTools → Network tab
2. Filter by "rates" or "currency"
3. Look for request to `/api/currency/rates`
4. Check:
   - Status: Should be 200
   - Response: Should have rates object
   - If 404/500: Backend issue
   - If CORS error: Backend CORS config issue

---

## Common Issues & Fixes

### Issue 1: Empty Rates Object `{}`

**Symptom:** Frontend gets `{}` from `/api/currency/rates`

**Fix:**
```powershell
# Run fix script
npm run fix:currency-rates
```

### Issue 2: Rates Not Updating (Older than 24 hours)

**Symptom:** Rates exist but are stale

**Fix:**
```powershell
# Manually update rates
npm run fix:currency-rates

# Or use API endpoint (requires admin token)
curl -X POST https://your-backend.onrender.com/api/currency/update-rates \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Issue 3: API Endpoint Not Found (404)

**Symptom:** Frontend gets 404 when fetching rates

**Check:**
1. Backend is running
2. Route is registered: `/api/currency/rates`
3. CORS is configured correctly

**Fix:**
- Check backend logs
- Verify backend service is up
- Check API base URL in frontend

### Issue 4: CORS Error

**Symptom:** Browser console shows CORS error

**Fix:**
- Check backend CORS configuration
- Ensure frontend URL is in allowed origins
- Check `FRONTEND_URL` environment variable

---

## Scheduler Verification

The currency rates should update automatically every 24 hours at 2 AM UTC.

### Check if Scheduler is Running

```powershell
# Check backend logs for scheduler messages
# Look for:
# "🔄 [Currency Scheduler] Updating currency rates..."
# "✅ [Currency Scheduler] Currency rates updated successfully"
```

### Manual Trigger (if scheduler not working)

```powershell
# Option 1: Use script
npm run fix:currency-rates

# Option 2: Use API endpoint
curl -X POST https://your-backend.onrender.com/api/currency/update-rates \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Frontend Code Flow

1. **Currency Selector Component** (`currency-selector.tsx`):
   - Fetches rates from `/api/currency/rates`
   - Stores rates in Zustand store
   - Updates every hour (staleTime: 1 hour)

2. **Currency Store** (`currency-store.ts`):
   - Stores `displayCurrency` and `rates`
   - `convert()` function multiplies GHS amount by rate
   - Persisted to localStorage

3. **Usage**:
   - Display: `convert(priceGhs)` shows converted price
   - Checkout: Always uses `totalGhs` (GHS amount)

---

## Verification Checklist

- [ ] Rates exist in database (`check:currency-rates`)
- [ ] Rates are recent (< 24 hours old)
- [ ] API endpoint returns rates (`/api/currency/rates`)
- [ ] Frontend can fetch rates (check Network tab)
- [ ] Currency selector shows currencies
- [ ] Prices convert correctly when currency changed
- [ ] Checkout still uses GHS (verify in checkout form)

---

## Commands Summary

```powershell
# Check rates status
npm run check:currency-rates

# Fix/update rates
npm run fix:currency-rates

# Check via API
curl http://localhost:3001/api/currency/rates

# Manual update (admin)
curl -X POST https://your-backend.onrender.com/api/currency/update-rates \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Files Involved

**Backend:**
- `backend/src/currency/currency.service.ts` - Rate fetching & storage
- `backend/src/currency/currency.controller.ts` - API endpoints
- `backend/src/currency/currency.scheduler.ts` - Daily updates
- `backend/scripts/check-currency-rates.ts` - Diagnostic script
- `backend/scripts/fix-currency-rates.ts` - Fix script

**Frontend:**
- `frontend/store/currency-store.ts` - Currency state management
- `frontend/components/layout/currency-selector.tsx` - Currency selector UI
- `frontend/lib/api.ts` - API client configuration

---

## Next Steps After Fix

1. **Verify rates are in database**
2. **Test API endpoint** returns rates
3. **Check frontend** can fetch rates
4. **Test currency conversion** on product pages
5. **Verify checkout** still uses GHS
6. **Monitor scheduler** runs daily

---

## Notes

- Rates are fetched from **exchangerate-api.com** (free, no API key needed)
- Rates update **every 24 hours** at 2 AM UTC via scheduler
- Frontend caches rates for **1 hour** (staleTime)
- Checkout **always uses GHS** - conversion is display-only
- Rates stored in `currency_rates` table with `baseCurrency = "GHS"`

