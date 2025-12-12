# 🚀 Render Setup Instructions for Color Terms Sync

## ⚠️ Important: Set Environment Variables First!

Before running the sync script, you **must** set `DATABASE_URL_PROD` in Render's Environment tab.

## 📋 Step-by-Step Setup

### 1. Set Production Database URL in Render

1. Go to your **backend service** in Render dashboard
2. Click on **"Environment"** tab (in the left sidebar under "MANAGE")
3. Click **"+ Add Environment Variable"**
4. Add:
   - **Key:** `DATABASE_URL_PROD`
   - **Value:** Your production database URL (same format as DATABASE_URL)
5. Click **"Save Changes"**

### 2. Run the Sync Script

**Option A: Using npm script (after deployment)**
```bash
npm run sync:color-terms
```

**Option B: Run directly with ts-node (works immediately)**
```bash
npx ts-node scripts/sync-color-terms-to-production.ts
```

**Note:** You're already in `~/project/src/backend$` directory, so you don't need to `cd backend`.

## 🔍 Verify Environment Variables

Check if variables are set:
```bash
echo $DATABASE_URL
echo $DATABASE_URL_PROD
```

If `DATABASE_URL_PROD` is empty, you need to set it in Render's Environment tab first.

## ❌ Common Errors

### Error: "DATABASE_URL_PROD environment variable is not set"
**Solution:** Set it in Render Environment tab (see Step 1 above)

### Error: "Invalid value undefined for datasource"
**Solution:** Make sure both `DATABASE_URL` and `DATABASE_URL_PROD` are set in Render Environment tab

### Error: "Color attribute not found"
**Solution:** Run `npm run setup:attributes` first to create the Color attribute

## ✅ Success Output

When successful, you'll see:
```
🔄 Syncing Color Attribute Terms to Production...
✅ Local database connected
✅ Production database connected
✅ Found Color attribute with 33 terms
...
🎉 Color terms sync completed successfully!
```
