# Render Migration Setup Instructions

## ⚠️ IMPORTANT: Run on BACKEND Service

These scripts **MUST be run on the BACKEND service** in Render, not the frontend.

**Why?**
- Scripts use Prisma to connect to the database
- Scripts are located in `backend/scripts/`
- Backend has access to database connection
- Frontend is a Next.js app and doesn't have database access

---

## Step-by-Step Instructions

### 1. Access Render Dashboard

1. Go to https://dashboard.render.com
2. Login to your account
3. Select your project/workspace

### 2. Open Backend Service Shell

1. Find your **Backend** service (not Frontend)
   - Usually named: `juelle-hair-backend` or similar
   - Look for the service that runs NestJS/Node.js backend
   
2. Click on the **Backend** service

3. Click on **"Shell"** tab (or look for "Open Shell" button)

4. A terminal window will open - this is your backend shell

### 3. Navigate to Backend Directory

In the Render shell, you should already be in the backend directory, but verify:

```powershell
# Check current directory
pwd

# Should show something like: /opt/render/project/src/backend
# or: /app/backend

# If not in backend, navigate there
cd backend

# Verify you're in the right place
ls scripts/
# Should show: check-variation-differences.ts, sync-variations-with-images.ts, etc.
```

### 4. Run Migration Commands

Now run the migration commands:

```powershell
# Option 1: Run quick fix script (if you uploaded it)
.\RENDER_QUICK_FIX.ps1

# Option 2: Run commands manually
npm run check:variation-differences
npm run fix:variations
npm run sync:variations-enhanced
```

---

## How to Identify Backend vs Frontend Service

### Backend Service Characteristics:
- ✅ Service type: "Web Service" or "Background Worker"
- ✅ Build command: `npm install && npm run build` (NestJS)
- ✅ Start command: `npm run start:prod` or `node dist/main.js`
- ✅ Has `backend/` folder structure
- ✅ Has `prisma/` folder
- ✅ Has `scripts/` folder with TypeScript files
- ✅ Environment variables include `DATABASE_URL`

### Frontend Service Characteristics:
- ❌ Service type: "Web Service" (Next.js)
- ❌ Build command: `npm run build` (Next.js)
- ❌ Start command: `npm start` (Next.js)
- ❌ Has `frontend/` folder structure
- ❌ Has `.next/` folder
- ❌ No database connection
- ❌ Environment variables include `NEXT_PUBLIC_*` variables

---

## Quick Verification

Before running scripts, verify you're on the backend:

```powershell
# Check if Prisma is available
npx prisma --version
# Should show: @prisma/client version

# Check if scripts exist
ls scripts/check-variation-differences.ts
# Should show the file

# Check database connection
npm run prisma:studio
# Should open Prisma Studio (if GUI available) or show connection info
```

---

## Troubleshooting

### "Script not found" Error

If scripts are not found, you might be in the wrong directory:

```powershell
# Find backend directory
find . -name "check-variation-differences.ts" -type f

# Navigate to the directory containing the script
cd /path/to/backend
```

### "Prisma Client not found" Error

```powershell
# Generate Prisma client
npm run prisma:generate

# Or
npx prisma generate
```

### "Database connection failed" Error

```powershell
# Check DATABASE_URL environment variable
echo $env:DATABASE_URL

# Should show PostgreSQL connection string
# If empty, check Render environment variables in dashboard
```

### "ts-node not found" Error

```powershell
# Use npx (recommended - uses local version)
npx ts-node scripts/check-variation-differences.ts

# Or install globally
npm install -g ts-node typescript
```

---

## Complete Command Sequence

Here's the complete sequence to run in Render Backend Shell:

```powershell
# 1. Navigate to backend (if not already there)
cd backend

# 2. Verify you're in the right place
ls scripts/check-variation-differences.ts

# 3. Check differences first
Write-Host "Checking differences..." -ForegroundColor Cyan
npm run check:variation-differences

# 4. Fix existing variations
Write-Host "Fixing variations..." -ForegroundColor Cyan
npm run fix:variations

# 5. Sync with images
Write-Host "Syncing variations with images..." -ForegroundColor Cyan
npm run sync:variations-enhanced

# 6. Done!
Write-Host "Migration completed!" -ForegroundColor Green
```

---

## Alternative: Using API Endpoints

If you can't access the backend shell, you can use API endpoints from **anywhere** (including frontend or external tool):

### Update Variant Images
```powershell
# From any PowerShell/terminal
$token = "YOUR_ADMIN_TOKEN"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "https://your-backend.onrender.com/api/admin/variants/update-images" `
    -Method POST `
    -Headers $headers
```

### Migrate Variants to Color
```powershell
Invoke-RestMethod -Uri "https://your-backend.onrender.com/api/admin/migrate-variants-to-color" `
    -Method POST `
    -Headers $headers
```

**Note:** API endpoints require admin authentication token.

---

## Summary

✅ **Run on:** Backend Service  
❌ **Don't run on:** Frontend Service  

**Location:** Render Dashboard → Your Backend Service → Shell Tab  
**Directory:** `backend/` (or wherever your backend code is)  
**Commands:** Use npm scripts or npx ts-node directly

