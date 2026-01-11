# 🧪 Testing Shipping Calculation Locally

## Prerequisites
1. Ensure backend and frontend services are running
2. Database is accessible
3. Run the new seed script to update shipping zones

## Step 1: Update Shipping Zones

Run the new seed script to create the shipping zones with the new structure:

```bash
cd backend
npx ts-node prisma/seed-shipping-simple.ts
```

This will create:
- Greater Accra zone (GHS 50)
- Tema zone (GHS 40)
- Other Ghana Regions zone (GHS 65)
- International Shipping zone (GHS 420)

## Step 2: Start Services

### Backend
```bash
cd backend
npm run start:dev
# or
docker-compose up backend
```

### Frontend
```bash
cd frontend
npm run dev
```

## Step 3: Test Scenarios

### Test 1: Greater Accra (not Tema)
1. Go to checkout page
2. Select Country: "Ghana"
3. Enter City: "Accra" (or any city except "Tema")
4. Select Region: "Greater Accra"
5. **Expected**: Should show shipping method for "Greater Accra" zone (GHS 50)

### Test 2: Tema
1. Go to checkout page
2. Select Country: "Ghana"
3. Enter City: "Tema"
4. Select Region: "Greater Accra" (or any region)
5. **Expected**: Should show shipping method for "Tema" zone (GHS 40)

### Test 3: Other Ghana Region
1. Go to checkout page
2. Select Country: "Ghana"
3. Enter City: "Kumasi" (or any city)
4. Select Region: "Ashanti" (or any region except Greater Accra)
5. **Expected**: Should show shipping method for "Other Ghana Regions" zone (GHS 65)

### Test 4: International (Non-Ghana)
1. Go to checkout page
2. Select Country: "Nigeria" (or any country except "Ghana")
3. **Expected**: 
   - Region field should NOT be visible
   - Should show shipping method for "International Shipping" zone (GHS 420)

## Step 4: Verify API Endpoints

Test the shipping API directly:

```bash
# Greater Accra
curl "http://localhost:3001/api/shipping/methods?country=Ghana&region=Greater%20Accra&city=Accra&orderTotal=500"

# Tema
curl "http://localhost:3001/api/shipping/methods?country=Ghana&region=Greater%20Accra&city=Tema&orderTotal=500"

# Other Ghana Region
curl "http://localhost:3001/api/shipping/methods?country=Ghana&region=Ashanti&city=Kumasi&orderTotal=500"

# International
curl "http://localhost:3001/api/shipping/methods?country=Nigeria&orderTotal=500"
```

## Step 5: Check Console Logs

1. Open browser DevTools (F12)
2. Check Console for any errors
3. Check Network tab for API calls to `/shipping/methods`
4. Verify parameters are being sent correctly

## Common Issues

### Issue: "No shipping methods available"
**Solution**: Make sure you ran the seed script and zones are active

### Issue: Wrong zone being selected
**Solution**: 
- Check city name is exactly "Tema" (case-insensitive)
- Verify region is exactly "Greater Accra"
- Check backend logs for zone matching

### Issue: Region field shows for non-Ghana countries
**Solution**: Check that the conditional rendering is working in checkout-form.tsx

## Testing Checklist

- [ ] Seed script runs without errors
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Country dropdown appears in checkout form
- [ ] Region field only shows when country is "Ghana"
- [ ] Greater Accra shows correct price
- [ ] Tema shows correct price (different from Greater Accra)
- [ ] Other Ghana regions show correct price
- [ ] International shipping shows for non-Ghana countries
- [ ] API endpoints return correct methods
- [ ] No console errors
- [ ] Shipping cost calculates correctly in order total

