# Migration Summary - Variations & Color Swatches

## Quick Start

### For Render PowerShell:

**Option 1: Run Quick Fix Script (Recommended)**
```powershell
# Copy RENDER_QUICK_FIX.ps1 to Render and run:
.\RENDER_QUICK_FIX.ps1
```

**Option 2: Run Commands Manually**
```powershell
cd backend

# Check differences
npm run check:variation-differences

# Fix existing variations
npm run fix:variations

# Sync with images
npm run sync:variations-enhanced
```

---

## What These Scripts Do

### 1. `check-variation-differences.ts`
- ✅ Checks products missing variations
- ✅ Checks variants with wrong names (Option/PA Color → Color)
- ✅ Checks color variants without images
- ✅ Checks color variants with missing swatch images
- ✅ Reports all differences

### 2. `fix-existing-variations.ts`
- ✅ Fixes existing variations
- ✅ Links color swatch images from attribute terms
- ✅ Updates variant images if missing
- ✅ Verifies variant structure

### 3. `sync-variations-with-images.ts` ⭐
- ✅ Normalizes variant names (Option/PA Color → Color)
- ✅ Syncs color swatch images from attribute terms
- ✅ Handles combined variants (Color / Length)
- ✅ Exports enhanced variation data
- ✅ Can sync directly to production database

---

## Commands Reference

### Check Differences
```powershell
npm run check:variation-differences
# or
npx ts-node scripts/check-variation-differences.ts
```

### Fix Variations
```powershell
npm run fix:variations
# or
npx ts-node scripts/fix-existing-variations.ts
```

### Sync with Images
```powershell
npm run sync:variations-enhanced
# or
npx ts-node scripts/sync-variations-with-images.ts
```

### Basic Sync (without enhancement)
```powershell
npm run sync:variations
# or
npx ts-node scripts/sync-variations-to-production.ts
```

---

## API Endpoints (Alternative)

If you prefer API endpoints:

### Update Variant Images
```powershell
$token = "YOUR_ADMIN_TOKEN"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "https://your-app.onrender.com/api/admin/variants/update-images" `
    -Method POST `
    -Headers $headers
```

### Migrate Variants to Color
```powershell
Invoke-RestMethod -Uri "https://your-app.onrender.com/api/admin/migrate-variants-to-color" `
    -Method POST `
    -Headers $headers
```

---

## Expected Output

### Check Differences Output:
```
📊 VARIATION DIFFERENCES REPORT
================================

✅ Products with variants: 150
📦 Total variants: 450

⚠️  Products Missing Variations (5):
   - Product Name 1 (slug-1)
   - Product Name 2 (slug-2)

⚠️  Variants with Wrong Names (20):
   - Product Name
     Current: "Option" → Should be: "Color"
     Value: Black

⚠️  Color Variants Without Images (15):
   - Product Name
     Color: Black

📋 SUMMARY
Total Issues Found: 40
```

### Fix Variations Output:
```
🔧 Fixing Existing Product Variations...

📊 Found 150 products with existing variants
📊 Color attribute: 30 terms

✅ Updated 45 variants with swatch images
✅ Fixed 20 variant names
```

### Sync with Images Output:
```
🔄 Syncing Product Variations with Color Swatch Images...

📦 Found 150 products with variations
🎨 Found 30 color terms with images

📊 Export Summary:
   Products with variations: 150
   Total variations: 450
   Products with Color variants: 120
   Variants with images: 420
   Images updated from attribute terms: 30
   Variants normalized: 20

✅ Enhanced variations exported to: variations-export-enhanced.json
```

---

## Troubleshooting

### Database Connection Error
```powershell
# Check if database is accessible
npm run prisma:studio

# Check DATABASE_URL
echo $env:DATABASE_URL
```

### ts-node Not Found
```powershell
# Use npx (recommended)
npx ts-node scripts/check-variation-differences.ts

# Or install globally
npm install -g ts-node typescript
```

### Script Fails
```powershell
# Check Node version (should be 18+)
node --version

# Install dependencies
npm install

# Check Prisma client
npm run prisma:generate
```

---

## Files Created

- ✅ `backend/scripts/check-variation-differences.ts` - Check differences
- ✅ `backend/scripts/sync-variations-with-images.ts` - Enhanced sync
- ✅ `RENDER_MIGRATION_COMMANDS.md` - Detailed commands guide
- ✅ `RENDER_QUICK_FIX.ps1` - Quick fix PowerShell script
- ✅ `MIGRATION_SUMMARY.md` - This file

---

## Next Steps

1. **Test Locally** (if possible):
   ```bash
   npm run check:variation-differences
   ```

2. **Run on Render**:
   - Connect to Render Shell
   - Run `.\RENDER_QUICK_FIX.ps1` or manual commands

3. **Verify Results**:
   - Check admin panel → Products
   - Verify variations show correctly
   - Verify color swatches display

4. **Monitor**:
   - Check Render logs
   - Verify no errors in console

---

## Notes

- All scripts are **safe to run multiple times** (idempotent)
- Scripts **will not delete** existing data, only update/fix
- Always **check differences first** before running fixes
- Export JSON files are created in `backend/` directory
- API endpoints require **admin authentication token**

