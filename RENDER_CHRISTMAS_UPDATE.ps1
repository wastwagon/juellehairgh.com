# PowerShell script to update production flash sale to Christmas content
# Run this in Render backend service shell

Write-Host "🎄 Updating Flash Sale to Christmas Content..." -ForegroundColor Green
Write-Host ""

# Navigate to backend directory
cd /opt/render/project/src/backend

# Run the update script
npm run update:flash-sale-christmas

Write-Host ""
Write-Host "✅ Update complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Verify the update worked"
Write-Host "2. Check production frontend to see Christmas content"
Write-Host "3. Clear browser cache if needed"

