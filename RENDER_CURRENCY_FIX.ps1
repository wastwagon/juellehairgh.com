# Render Currency Fix Script
# Run this in Render Backend Shell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Currency Rates Fix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to backend directory
Set-Location backend

# Step 1: Check current status
Write-Host "Step 1: Checking currency rates status..." -ForegroundColor Yellow
Write-Host ""
npm run check:currency-rates
Write-Host ""

# Step 2: Fix currency rates
Write-Host "Step 2: Fetching and storing currency rates..." -ForegroundColor Yellow
Write-Host ""
npm run fix:currency-rates
Write-Host ""

# Step 3: Verify fix
Write-Host "Step 3: Verifying rates were stored..." -ForegroundColor Yellow
Write-Host ""
npm run check:currency-rates
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "Currency Fix Completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Check frontend can access /api/currency/rates" -ForegroundColor White
Write-Host "2. Test currency conversion on product pages" -ForegroundColor White
Write-Host "3. Verify checkout still uses GHS" -ForegroundColor White

