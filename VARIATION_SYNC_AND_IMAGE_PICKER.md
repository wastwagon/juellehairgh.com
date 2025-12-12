# Variation Sync & Image Picker Improvements

## Overview
This document describes the solutions implemented for two issues:
1. **Missing variations in production** - Products have variations locally but not in live production
2. **Improved color swatch image upload** - Better UI for selecting/uploading swatch images

---

## 1. Variation Sync Scripts

### File: `backend/scripts/sync-variations-to-production.ts` (Basic)

A basic script to sync product variations from local database to production.

### File: `backend/scripts/sync-variations-with-images.ts` (Enhanced) ⭐ RECOMMENDED

An enhanced script that resolves differences between local and production variation logic:

**Key Features:**
- **Normalizes variant names**: Converts "Option", "PA Color", "Pa Color" → "Color"
- **Syncs color swatch images**: Automatically links variant images from `ProductAttributeTerm.image`
- **Handles combined variants**: Extracts color from "Color / Length" format variants
- **Image enhancement**: If variant has no image, tries to get it from color attribute terms
- **Production-ready**: Ensures consistent variant naming and images across environments

**Why This Script?**
- Local database may have variations with old naming ("Option", "PA Color")
- Production needs standardized "Color" naming
- Color swatch images exist in attribute terms but may not be linked to variants
- This script bridges the gap and ensures consistency

### Features:
- Exports all product variations to JSON file
- Can sync directly to production database if `DATABASE_URL_PROD` is set
- Matches products by slug (more reliable than ID)
- Creates new variants or updates existing ones
- Provides detailed statistics and error reporting

### Usage:

#### Enhanced Script (Recommended):
```bash
cd backend
# Export only (creates variations-export-enhanced.json)
ts-node scripts/sync-variations-with-images.ts

# Direct sync to production (with normalization and image enhancement)
DATABASE_URL_PROD='postgresql://user:pass@host:port/dbname' ts-node backend/scripts/sync-variations-with-images.ts
```

#### Basic Script (Simple sync without normalization):
```bash
cd backend
# Export only
ts-node scripts/sync-variations-to-production.ts

# Direct sync
DATABASE_URL_PROD='postgresql://...' ts-node backend/scripts/sync-variations-to-production.ts
```

### What Enhanced Script Does:
1. Fetches all products with variations from local database
2. **Normalizes variant names**: "Option" → "Color", "PA Color" → "Color"
3. **Enhances images**: Links color swatch images from `ProductAttributeTerm` to variants
4. **Handles combined variants**: Extracts color from "Color / Length" format
5. Exports enhanced variation data (normalized name, value, price, stock, SKU, enhanced image)
6. If `DATABASE_URL_PROD` is set:
   - Connects to production database
   - Finds products by slug
   - Creates or updates variants with normalized names and enhanced images
   - Reports sync statistics including image updates and name normalizations

### Output (Enhanced Script):
- `variations-export-enhanced.json` - JSON file with normalized and enhanced variation data
- Console output with detailed statistics:
  - Products with variations
  - Total variations
  - Products with Color/Length variants
  - Variants with images (before and after enhancement)
  - Images updated from attribute terms
  - Variants normalized (name changes)
  - Sync results (created/updated/errors)

### Key Differences Resolved:

1. **Variant Name Normalization**:
   - Local may have: "Option", "PA Color", "Pa Color"
   - Production needs: "Color"
   - Script normalizes all to "Color"

2. **Color Swatch Images**:
   - Images exist in `ProductAttributeTerm.image` (Attributes & Variations page)
   - Variants may not have these images linked
   - Script automatically links images from attribute terms to variants

3. **Combined Variants**:
   - Some variants may be "Color / Length: Black / 12 inches"
   - Script extracts color part for image matching
   - Handles both combined and separate formats

---

## 2. Improved Swatch Image Picker

### File: `frontend/components/admin/swatch-image-picker.tsx`

A new component that improves the image selection experience for color swatches.

### Features:
- **Media Library Tab**: Shows all existing swatch images from media folder
- **Upload Tab**: Allows uploading new images from desktop
- **Search**: Search through existing images
- **Preview**: Shows current selected image with remove option
- **Better UX**: Modal interface with tabs for easy navigation

### How It Works:

1. **Media Library Tab (Default)**:
   - Fetches all swatch images from `/admin/upload/media?category=swatches&type=image`
   - Displays images in a grid
   - Click to select an image
   - Search to filter images

2. **Upload Tab**:
   - Click "Choose File from Desktop"
   - Uploads to `/admin/upload/swatch` endpoint
   - Automatically switches to library tab after upload
   - Shows upload progress

3. **Manual URL Entry**:
   - Still available as fallback option
   - Input field below the picker

### Integration:

The component is now used in:
- `frontend/components/admin/admin-attributes.tsx`
  - When adding new color terms
  - When editing existing color terms

### Usage Example:
```tsx
<SwatchImagePicker
  value={imageUrl}
  onChange={(url) => setImageUrl(url)}
  onClose={() => console.log('Picker closed')}
/>
```

---

## 3. Backend Updates

### File: `backend/src/admin/upload.controller.ts`

Added `category` query parameter to media listing endpoint:

```typescript
@Get("media")
async listMedia(
  @Query("category") category?: string, // NEW: Filter by category
  // ... other params
)
```

Now you can filter media by category:
- `/admin/upload/media?category=swatches&type=image` - Only swatch images
- `/admin/upload/media?category=products` - Only product images
- `/admin/upload/media` - All media (default)

---

## Testing

### Test Variation Sync:
1. Run export script locally:
   ```bash
   ts-node backend/scripts/sync-variations-to-production.ts
   ```
2. Review `variations-export.json`
3. Test direct sync (if you have production DB access):
   ```bash
   DATABASE_URL_PROD='...' ts-node backend/scripts/sync-variations-to-production.ts
   ```

### Test Image Picker:
1. Navigate to Admin → Attributes & Variations
2. Click "Add Term" for Color attribute
3. Click "Select Image" button
4. Verify:
   - Media Library tab shows existing swatch images
   - Search works
   - Upload tab allows desktop upload
   - Selected image appears in preview
   - Manual URL entry still works

---

## Files Changed

### New Files:
- `backend/scripts/sync-variations-to-production.ts`
- `frontend/components/admin/swatch-image-picker.tsx`
- `VARIATION_SYNC_AND_IMAGE_PICKER.md` (this file)

### Modified Files:
- `frontend/components/admin/admin-attributes.tsx`
  - Added import for `SwatchImagePicker`
  - Replaced file input with `SwatchImagePicker` component (2 locations)
  
- `backend/src/admin/upload.controller.ts`
  - Added `category` query parameter to `listMedia` endpoint
  - Added category filtering logic

---

## Next Steps

1. **Test locally**:
   - Test image picker in admin attributes page
   - Run variation sync script to export data

2. **Deploy to production**:
   - Push changes to GitHub
   - Deploy frontend and backend
   - Run sync script on production server (or use exported JSON)

3. **Sync variations**:
   - Option A: Use exported JSON file to manually import
   - Option B: Run script with `DATABASE_URL_PROD` set
   - Option C: Create admin UI endpoint for syncing (future enhancement)

---

## Notes

- The sync script matches products by **slug** (not ID) for reliability
- Image picker automatically handles different URL formats
- Media library shows up to 100 images (configurable via `limit` param)
- Upload supports JPG, PNG, GIF, WebP (max 5MB)

