# 🚀 Migrate Color Terms to Production

## ✅ Verification Complete

**Local Database Status:**
- ✅ 33 color terms found
- ✅ All 33 terms have images
- ✅ 49 swatch image files in media folder
- ✅ All image files exist and are linked correctly

## 📋 Step-by-Step Migration

### Step 1: Get Production Database URL from Render

1. Go to your Render dashboard: https://dashboard.render.com
2. Navigate to your **backend service**
3. Click on **"Environment"** tab
4. Find `DATABASE_URL` - this is your production database URL
5. Copy the full URL (it should look like: `postgresql://user:password@host:port/database`)

### Step 2: Run Sync from Local Machine

**Option A: Run via Docker (Recommended)**

```bash
cd /Users/OceanCyber/Downloads/juellehairgh.com

# Set production database URL (replace with your actual URL from Render)
export DATABASE_URL_PROD="postgresql://your_user:your_password@your_host:port/your_database"

# Run sync inside Docker container
docker-compose exec backend npm run sync:color-terms
```

**Option B: Run Directly (if Docker connection issues)**

```bash
cd /Users/OceanCyber/Downloads/juellehairgh.com/backend

# Set production database URL
export DATABASE_URL_PROD="postgresql://your_user:your_password@your_host:port/your_database"

# Run sync
npm run sync:color-terms
```

### Step 3: Verify Sync

After sync completes, verify on Render:

```bash
# On Render backend shell, run:
npx ts-node scripts/check-color-term-images.ts
```

This should show:
- ✅ 33 terms in production
- ✅ 33 terms with images

## 📦 Image Files Migration

**Important:** The sync script only migrates the **database records** (term names and image paths). The actual **image files** need to be uploaded separately.

### Option 1: Upload via Admin Panel (Recommended)

1. Go to production admin: `https://your-domain.com/admin/attributes`
2. Click on "Color" attribute
3. For each term, click "Edit"
4. Upload the swatch image using the image picker
5. The image picker will check the media folder first, then allow upload

### Option 2: Copy Files to Render (Advanced)

If you have SSH access to Render, you can copy files:

```bash
# From your local machine
cd backend/uploads/media/swatches

# Copy all swatch images to Render
# (You'll need Render's file system access or use their file upload feature)
```

**Note:** Render uses ephemeral file systems, so uploaded files may be lost on redeploy. Consider using cloud storage (S3, Cloudinary, etc.) for production images.

## 🎯 What Will Be Synced

All 33 color terms with their images:

1. 1 → `/media/swatches/1764768189006-623915897-1-color-2.jpeg`
2. 1B → `/media/swatches/1764766921147-745166555-1b.jpeg`
3. 2 → `/media/swatches/1764616674875-872863235-2.jpeg`
4. 27 → `/media/swatches/1764766878946-808336140-27.jpeg`
5. 2T1B30 → `/media/swatches/1764618270268-225017000-2t1b30.jpeg`
... (and 28 more)

## ⚠️ Troubleshooting

### Authentication Error
- **Problem:** `Authentication failed against database server`
- **Solution:** Check that `DATABASE_URL_PROD` is correct and includes the full connection string with username, password, host, and database name

### Connection Timeout
- **Problem:** Can't connect to production database
- **Solution:** Check that your IP is whitelisted in Render's database settings, or use Render's internal network

### Images Not Showing
- **Problem:** Terms synced but images don't show
- **Solution:** Upload the image files to production media folder via admin panel or file system

## 📝 Next Steps After Sync

1. ✅ Verify all 33 terms are in production
2. ✅ Upload image files to production (via admin panel)
3. ✅ Test color swatches on production frontend
4. ✅ Verify product variations show correct color swatches

