# Render Quick Fix Script for Variations and Color Swatches
# Run this in Render PowerShell Shell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Variation & Color Swatch Migration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to backend directory
Set-Location backend

# Step 1: Check differences
Write-Host "Step 1: Checking variation differences..." -ForegroundColor Yellow
Write-Host ""
npx ts-node scripts/check-variation-differences.ts
Write-Host ""

# Step 2: Fix existing variations
Write-Host "Step 2: Fixing existing variations..." -ForegroundColor Yellow
Write-Host ""
npx ts-node scripts/fix-existing-variations.ts
Write-Host ""

# Step 3: Sync variations with images
Write-Host "Step 3: Syncing variations with color swatch images..." -ForegroundColor Yellow
Write-Host ""
npx ts-node scripts/sync-variations-with-images.ts
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "Migration Completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

