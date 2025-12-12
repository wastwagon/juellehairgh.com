# PowerShell script to sync color attribute terms from local to production on Render
# 
# Usage:
#   1. Set DATABASE_URL_PROD environment variable in Render dashboard
#   2. Run this script from Render backend shell
#
# Or run directly:
#   $env:DATABASE_URL_PROD="your-production-database-url"
#   npm run sync:color-terms

Write-Host "🔄 Syncing Color Attribute Terms to Production..." -ForegroundColor Cyan
Write-Host ""

# Check if DATABASE_URL_PROD is set
if (-not $env:DATABASE_URL_PROD) {
    Write-Host "❌ Error: DATABASE_URL_PROD environment variable is not set" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Set it in Render dashboard:" -ForegroundColor Yellow
    Write-Host "   1. Go to your backend service"
    Write-Host "   2. Go to Environment tab"
    Write-Host "   3. Add DATABASE_URL_PROD with your production database URL"
    Write-Host ""
    Write-Host "Or set it temporarily:" -ForegroundColor Yellow
    Write-Host "   `$env:DATABASE_URL_PROD='your-production-database-url'" -ForegroundColor Gray
    exit 1
}

Write-Host "✅ DATABASE_URL_PROD is set" -ForegroundColor Green
Write-Host ""

# Run the sync script
Write-Host "🚀 Running sync script..." -ForegroundColor Cyan
npm run sync:color-terms

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Sync completed successfully!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Sync failed. Check the error messages above." -ForegroundColor Red
    exit 1
}

