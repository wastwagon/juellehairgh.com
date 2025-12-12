# Render Migration Commands (PowerShell)

Commands to run in Render's PowerShell environment to fix variation differences and sync color swatches.

## Prerequisites

1. Connect to Render Shell (via Render Dashboard → Shell)
2. Navigate to backend directory: `cd backend`

---

## Step 1: Check Current Differences

First, check what differences exist:

```powershell
# Check variation differences
npm run check:variants

# Or run directly with ts-node
npx ts-node scripts/check-variation-differences.ts
```

---

## Step 2: Fix Existing Variations

Fix existing variations (normalize names, link images):

```powershell
# Fix existing variations
npm run fix:variations

# Or run directly
npx ts-node scripts/fix-existing-variations.ts
```

---

## Step 3: Sync Variations with Images

Sync variations with proper color swatch images:

```powershell
# Export enhanced variations (creates variations-export-enhanced.json)
npx ts-node scripts/sync-variations-with-images.ts

# This will:
# - Normalize variant names (Option/PA Color → Color)
# - Link color swatch images from attribute terms
# - Export to JSON file
```

---

## Step 4: Update Variant Images from Terms

Update variant images from color attribute terms:

```powershell
# Update variant images from attribute terms
curl -X POST https://your-app.onrender.com/api/admin/variants/update-images \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"

# Or via script (if you have access to production DB)
npx ts-node scripts/sync-variations-with-images.ts
```

---

## Step 5: Migrate Variants to Color

Migrate old variant names to "Color":

```powershell
# Migrate variants (Option, PA Color → Color)
curl -X POST https://your-app.onrender.com/api/admin/migrate-variants-to-color \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"

# Or for specific product
curl -X POST https://your-app.onrender.com/api/admin/migrate-variants-to-color \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"productId": "product-id-here"}'
```

---

## Complete Migration Script (All-in-One)

Run this complete script to fix everything:

```powershell
# Navigate to backend
cd backend

# 1. Check differences
Write-Host "Step 1: Checking differences..." -ForegroundColor Cyan
npx ts-node scripts/check-variation-differences.ts

# 2. Fix existing variations
Write-Host "Step 2: Fixing existing variations..." -ForegroundColor Cyan
npx ts-node scripts/fix-existing-variations.ts

# 3. Sync with images
Write-Host "Step 3: Syncing variations with images..." -ForegroundColor Cyan
npx ts-node scripts/sync-variations-with-images.ts

Write-Host "Migration completed!" -ForegroundColor Green
```

---

## API Endpoints (Alternative to Scripts)

If you prefer using API endpoints instead of scripts:

### 1. Update Variant Images
```powershell
$token = "YOUR_ADMIN_TOKEN"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Update all variant images
Invoke-RestMethod -Uri "https://your-app.onrender.com/api/admin/variants/update-images" `
    -Method POST `
    -Headers $headers

# Update for specific product
$body = @{ productId = "product-id" } | ConvertTo-Json
Invoke-RestMethod -Uri "https://your-app.onrender.com/api/admin/variants/update-images" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

### 2. Migrate Variants to Color
```powershell
# Migrate all variants
Invoke-RestMethod -Uri "https://your-app.onrender.com/api/admin/migrate-variants-to-color" `
    -Method POST `
    -Headers $headers

# Migrate for specific product
$body = @{ productId = "product-id" } | ConvertTo-Json
Invoke-RestMethod -Uri "https://your-app.onrender.com/api/admin/migrate-variants-to-color" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

---

## Environment Variables

If running scripts that need production database:

```powershell
# Set production database URL (if syncing from local to production)
$env:DATABASE_URL_PROD = "postgresql://user:pass@host:port/dbname"

# Then run sync script
npx ts-node scripts/sync-variations-with-images.ts
```

---

## Troubleshooting

### If ts-node is not found:
```powershell
# Install ts-node globally
npm install -g ts-node typescript

# Or use npx (recommended)
npx ts-node scripts/check-variation-differences.ts
```

### If scripts fail:
```powershell
# Check Node version (should be 18+)
node --version

# Check if dependencies are installed
npm install

# Check database connection
npm run prisma:studio
```

### Check logs:
```powershell
# View recent logs
Get-Content logs/app.log -Tail 50

# Or check Render logs in dashboard
```

---

## Quick Fix Commands (Copy-Paste Ready)

```powershell
# Quick fix - Run all steps
cd backend
npx ts-node scripts/check-variation-differences.ts
npx ts-node scripts/fix-existing-variations.ts
npx ts-node scripts/sync-variations-with-images.ts
```

---

## Notes

- All scripts are safe to run multiple times (idempotent)
- Scripts will not delete existing data, only update/fix
- Always check differences first before running fixes
- Export JSON files are created in `backend/` directory
- API endpoints require admin authentication token

