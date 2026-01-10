# 🇬🇭 Ghana Regions Shipping Configuration

## All 16 Regions of Ghana

The following are all 16 regions of Ghana that are configured in the shipping system:

1. **Greater Accra** - Capital region (Accra, Tema)
2. **Ashanti** - Kumasi and surrounding areas
3. **Western** - Takoradi and surrounding areas
4. **Western North** - New region (2018)
5. **Eastern** - Koforidua and surrounding areas
6. **Volta** - Ho and surrounding areas
7. **Oti** - New region (2018)
8. **Northern** - Tamale and surrounding areas
9. **North East** - New region (2018)
10. **Savannah** - New region (2018)
11. **Upper East** - Bolgatanga and surrounding areas
12. **Upper West** - Wa and surrounding areas
13. **Brong Ahafo** - Sunyani and surrounding areas
14. **Ahafo** - New region (2018)
15. **Bono** - New region (2018)
16. **Bono East** - New region (2018)
17. **Central** - Cape Coast and surrounding areas

## Shipping Zones Configuration

### Zone 1: Greater Accra & Tema
- **Regions:** Greater Accra
- **Methods:**
  - Same Day Express (Within Accra) - GHS 100
  - Local Pick-up from Dansoman Shop - FREE
  - Pay to Rider on Arrival - FREE (GHS 950+ orders)

### Zone 2: All Ghana Regions
- **Regions:** All 17 regions listed above
- **Methods:**
  - Free Shipping (GHS 950+ orders) - FREE
  - Standard Shipping - GHS 65 (FREE for GHS 950+ orders)

### Zone 3: Major Regions
- **Regions:** Ashanti, Eastern, Central
- **Methods:**
  - Express Shipping - GHS 80 (FREE for GHS 950+ orders)
  - 3-5 business days

### Zone 4: Northern Regions
- **Regions:** Northern, North East, Savannah, Upper East, Upper West
- **Methods:**
  - Standard Shipping - GHS 75 (FREE for GHS 950+ orders)
  - 7-12 business days

### Zone 5: Western & Volta Regions
- **Regions:** Western, Western North, Volta, Oti
- **Methods:**
  - Standard Shipping - GHS 70 (FREE for GHS 950+ orders)
  - 5-8 business days

### Zone 6: Brong Ahafo Regions
- **Regions:** Brong Ahafo, Bono, Bono East, Ahafo
- **Methods:**
  - Standard Shipping - GHS 70 (FREE for GHS 950+ orders)
  - 5-9 business days

### Zone 7: International
- **Regions:** Everywhere
- **Methods:**
  - DHL Express - GHS 420
  - 3-5 working days (duty may be charged on arrival)

## Free Shipping Threshold

**All orders over GHS 950 qualify for FREE shipping** within Ghana (except same-day express).

## How to Update Shipping Zones

### Option 1: Run Seed Script (Recommended for Fresh Setup)
```bash
cd backend
npm run prisma:seed:shipping
```

### Option 2: Update Existing Zones
```bash
cd backend
npx ts-node scripts/update-shipping-zones.ts
```

### Option 3: Manual Update via Admin Panel
1. Log into admin panel
2. Go to Shipping Settings
3. Edit each zone
4. Add all 17 Ghana regions to applicable zones
5. Save changes

## Frontend Changes

The checkout and address forms now use **dropdown selects** instead of text inputs for regions. This ensures:
- ✅ Consistent region names
- ✅ Better user experience
- ✅ Accurate shipping cost calculation
- ✅ Data validation

### Region Selection in Forms

All region dropdowns include:
- A "Select Region" placeholder option
- All 17 Ghana regions in alphabetical order
- Required field validation

## API Endpoint

The shipping API automatically matches regions when calculating shipping costs:

```
GET /api/shipping/methods?region=Greater Accra&orderTotal=1000
```

The API will:
1. Find all active zones that include the specified region
2. Return all applicable shipping methods
3. Calculate costs based on order total (applying free shipping threshold)

## Testing

To test shipping configuration:

1. **Check shipping methods for a region:**
   ```bash
   curl "http://localhost:3001/api/shipping/methods?region=Greater%20Accra&orderTotal=500"
   ```

2. **Check all zones:**
   ```bash
   curl "http://localhost:3001/api/shipping/zones"
   ```

3. **Test in frontend:**
   - Go to checkout
   - Select a region from the dropdown
   - Verify shipping methods appear correctly
   - Test with orders above and below GHS 950

## Notes

- All shipping costs are in GHS (Ghana Cedis)
- Free shipping threshold applies to all regions except same-day express
- Regional zones allow for more granular shipping cost management
- International shipping is available but requires manual configuration for specific countries
