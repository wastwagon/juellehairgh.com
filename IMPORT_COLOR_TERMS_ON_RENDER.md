# 📥 Import Color Terms on Render

## ✅ Export Complete

The color terms have been exported to `color-terms-export.json`:
- ✅ 33 color terms exported
- ✅ All 33 terms have images
- ✅ File ready for import

## 🚀 Steps to Import on Render

### Step 1: Upload Export File to Render

**Option A: Via Render Shell (Recommended)**

1. Go to Render Dashboard → Your Backend Service → **Shell** tab
2. Click "Connect" to open a shell session
3. Upload the file using one of these methods:

**Method 1: Copy-paste content**
```bash
# On your local machine, copy the file content
cat color-terms-export.json | pbcopy  # macOS
# or
cat color-terms-export.json | xclip -selection clipboard  # Linux

# On Render shell, create the file:
cat > color-terms-export.json
# Paste the content, then press Ctrl+D to save
```

**Method 2: Use curl/wget to upload from a temporary URL**
```bash
# First, upload color-terms-export.json to a temporary file sharing service
# (like pastebin, gist, or your own server)
# Then on Render:
curl -o color-terms-export.json "https://your-temp-url.com/color-terms-export.json"
```

**Method 3: Use Render's file upload (if available)**
- Some Render plans allow direct file uploads via the dashboard

### Step 2: Run Import Script on Render

Once the file is on Render, run:

```bash
cd ~/project/src/backend
npm run import:color-terms color-terms-export.json
```

Or if the file is in a different location:

```bash
npm run import:color-terms /path/to/color-terms-export.json
```

### Step 3: Verify Import

After import completes, verify:

```bash
# Check how many terms are in production
npx ts-node scripts/check-color-term-images.ts
```

Or check via admin panel:
- Go to `https://your-domain.com/admin/attributes`
- Click on "Color" attribute
- Verify all 33 terms are present with images

## 📋 What Will Be Imported

All 33 color terms:
- Names and slugs
- Image paths (normalized to `/media/swatches/filename.jpg`)

**Note:** The import script only syncs database records. You'll still need to upload the actual image files to production (via admin panel or file system).

## 🔧 Troubleshooting

### File Not Found
- **Problem:** `Export file not found`
- **Solution:** Make sure the file path is correct. Use `pwd` to check current directory and `ls` to list files.

### Import Errors
- **Problem:** Some terms fail to import
- **Solution:** Check the error messages. Common issues:
  - Duplicate slugs (should update existing)
  - Invalid image paths (will be normalized automatically)

### Images Not Showing
- **Problem:** Terms imported but images don't show
- **Solution:** Upload image files to production media folder via admin panel

## ✅ Expected Output

After successful import, you should see:
```
📊 Import Summary:
   ✅ Created: X terms
   🔄 Updated: Y terms
   ⏭️  Skipped: 0 terms
   🖼️  Images synced: 33 terms
   📦 Total: 33 terms processed

✅ Production now has 33 color terms
   33 terms have images
```

