# Fix Attributes & Variations - Shell Commands

## Quick Fix Commands

### For Local Development

```bash
cd backend

# Step 1: Check what differences exist
npm run check:variation-differences

# Step 2: Fix existing variations (normalize names, link images)
npm run fix:variations

# Step 3: Sync variations with color swatch images
npm run sync:variations-enhanced
```

### For Production (Render Backend)

**Option 1: Using npm scripts**
```bash
cd backend

# Check differences
npm run check:variation-differences

# Fix variations
npm run fix:variations

# Sync with images
npm run sync:variations-enhanced
```

**Option 2: Using ts-node directly**
```bash
cd backend

# Check differences
npx ts-node scripts/check-variation-differences.ts

# Fix variations
npx ts-node scripts/fix-existing-variations.ts

# Sync with images
npx ts-node scripts/sync-variations-with-images.ts
```

**Option 3: All-in-one (copy-paste ready)**
```bash
cd backend && npm run check:variation-differences && npm run fix:variations && npm run sync:variations-enhanced
```

## What Each Command Does

### 1. Check Variation Differences
```bash
npm run check:variation-differences
```
- Checks for products missing variations
- Identifies variants with incorrect names
- Finds color variants without images
- Shows comparison between expected and actual

### 2. Fix Existing Variations
```bash
npm run fix:variations
```
- Normalizes variant names (Option/PA Color → Color)
- Links color swatch images from ProductAttributeTerm
- Updates variant images if missing
- Fixes combined variants (Color / Length)

### 3. Sync Variations with Images
```bash
npm run sync:variations-enhanced
```
- Normalizes all variant names
- Links color swatch images to variants
- Handles combined variants properly
- Exports enhanced data to JSON
- Can sync directly to production database

## Docker Commands (If Using Docker)

```bash
# Check differences
docker exec juelle-hair-backend npm run check:variation-differences

# Fix variations
docker exec juelle-hair-backend npm run fix:variations

# Sync with images
docker exec juelle-hair-backend npm run sync:variations-enhanced
```

## PowerShell Commands (For Render)

```powershell
# Navigate to backend
cd backend

# Check differences
npm run check:variation-differences

# Fix variations
npm run fix:variations

# Sync with images
npm run sync:variations-enhanced
```

## Complete Fix Script (Copy-Paste)

**Bash/Zsh:**
```bash
cd backend && \
echo "Step 1: Checking differences..." && \
npm run check:variation-differences && \
echo "" && \
echo "Step 2: Fixing variations..." && \
npm run fix:variations && \
echo "" && \
echo "Step 3: Syncing with images..." && \
npm run sync:variations-enhanced && \
echo "" && \
echo "✅ All done!"
```

**PowerShell:**
```powershell
cd backend
Write-Host "Step 1: Checking differences..." -ForegroundColor Yellow
npm run check:variation-differences
Write-Host ""
Write-Host "Step 2: Fixing variations..." -ForegroundColor Yellow
npm run fix:variations
Write-Host ""
Write-Host "Step 3: Syncing with images..." -ForegroundColor Yellow
npm run sync:variations-enhanced
Write-Host ""
Write-Host "✅ All done!" -ForegroundColor Green
```

## Expected Output

After running all commands, you should see:
- ✅ Variant names normalized (Color, Length)
- ✅ Color swatch images linked to variants
- ✅ Products showing variations correctly
- ✅ Frontend displaying color swatches properly

## Troubleshooting

**If scripts fail:**
```bash
# Install dependencies
npm install

# Check Node version (should be 18+)
node --version

# Check database connection
npm run prisma:studio
```

**If variations still don't show:**
1. Clear browser cache
2. Restart frontend server
3. Check browser console for errors
4. Verify API returns variation data

