# 🎨 Sync Color Attribute Terms to Production

This guide explains how to migrate color attribute variation terms (names and images) from your local database to production.

## 📋 Prerequisites

1. **Local database** with color attribute terms and images
2. **Production database URL** (DATABASE_URL_PROD)
3. **Access to Render backend shell** (for production sync)

## 🚀 Quick Start

### Option 1: Run Locally (Recommended for Testing)

1. **Set production database URL:**
   ```bash
   export DATABASE_URL_PROD="your-production-database-url"
   ```

2. **Run the sync script:**
   ```bash
   cd backend
   npm run sync:color-terms
   ```

### Option 2: Run on Render Backend

1. **Set DATABASE_URL_PROD in Render:**
   - Go to your backend service in Render dashboard
   - Navigate to **Environment** tab
   - Add environment variable:
     - **Key:** `DATABASE_URL_PROD`
     - **Value:** Your production database URL

2. **Open Render backend shell:**
   - Go to your backend service
   - Click **Shell** tab

3. **Run the sync:**
   ```bash
   npm run sync:color-terms
   ```

   Or use the PowerShell script:
   ```powershell
   .\RENDER_SYNC_COLOR_TERMS.ps1
   ```

## 📊 What the Script Does

1. ✅ Connects to local database
2. ✅ Connects to production database
3. ✅ Fetches Color attribute and all terms from local
4. ✅ Creates Color attribute in production if it doesn't exist
5. ✅ Syncs each term:
   - Creates new terms that don't exist
   - Updates existing terms with latest name and image
   - Preserves image URLs from local database

## 📝 Example Output

```
🔄 Syncing Color Attribute Terms to Production...

🔍 Step 1: Connecting to local database...
✅ Local database connected

🔍 Step 2: Connecting to production database...
✅ Production database connected

🔍 Step 3: Fetching Color attribute from local database...
✅ Found Color attribute with 33 terms

🔍 Step 4: Ensuring Color attribute exists in production...
✅ Color attribute exists in production

🔍 Step 5: Syncing color terms...
   ✅ Created: 1B (with image)
   ✅ Updated: 27 (with image)
   ✅ Created: 2T1BRDCP (with image)
   ...

📊 Sync Summary:
   ✅ Created: 15 terms
   🔄 Updated: 18 terms
   ⏭️  Skipped: 0 terms
   📦 Total: 33 terms processed

🔍 Step 6: Verifying sync...
✅ Production now has 33 color terms
   33 terms have images

🎉 Color terms sync completed successfully!
```

## 🔧 Troubleshooting

### Error: DATABASE_URL_PROD not set
**Solution:** Set the environment variable in Render dashboard or export it before running:
```bash
export DATABASE_URL_PROD="your-production-database-url"
```

### Error: Color attribute not found
**Solution:** Run the setup script first:
```bash
npm run setup:attributes
```

### Error: Connection timeout
**Solution:** 
- Check your production database URL is correct
- Ensure your Render service can access the production database
- Check firewall/network settings

### Terms not syncing
**Solution:**
- Check that terms exist in local database
- Verify image URLs are valid
- Check console output for specific error messages

## 📦 Files

- **Script:** `backend/scripts/sync-color-terms-to-production.ts`
- **NPM Script:** `npm run sync:color-terms`
- **PowerShell Helper:** `RENDER_SYNC_COLOR_TERMS.ps1`

## ⚠️ Important Notes

1. **Images:** The script syncs image URLs, not the actual image files. Ensure image files are accessible from production (e.g., via CDN or shared storage).

2. **Slug Conflicts:** Terms are matched by slug. If a term with the same slug exists, it will be updated.

3. **Non-Destructive:** The script only creates/updates terms. It doesn't delete terms that exist in production but not in local.

4. **Idempotent:** Safe to run multiple times. It will update existing terms and create missing ones.

## 🎯 Next Steps

After syncing color terms:
1. Verify terms appear in production admin panel (`/admin/attributes`)
2. Check that images load correctly
3. Test product variation selection on frontend
4. Sync product variations if needed: `npm run sync:variations-enhanced`

