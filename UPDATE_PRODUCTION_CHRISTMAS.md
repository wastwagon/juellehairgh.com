# Update Production Flash Sale to Christmas Content

## Issue
Production is showing "Holiday Sale" instead of "Christmas Mega Sale" because the production database has a flash sale with "Holiday Sale" as the title.

## Solution

### Option 1: Update via Admin Panel (Recommended)

1. **Access Production Admin:**
   - Go to: `https://your-production-url.com/admin/flash-sales`
   - Login with admin credentials

2. **Edit Flash Sale:**
   - Find the active flash sale (or the one showing "Holiday Sale")
   - Click "Edit"
   - Update:
     - **Title:** "Christmas Mega Sale"
     - **Description:** "Celebrate the holidays with amazing deals! Up to 30% off on selected hair products. Perfect gifts for yourself or loved ones!"
     - **Discount:** 30%
   - Click "Update Flash Sale"

### Option 2: Run Update Script on Production

**On Render Backend Service:**

1. **Access Render Shell:**
   - Go to Render Dashboard → Your Backend Service
   - Click "Shell" tab

2. **Run Update Script:**
   ```bash
   cd /opt/render/project/src/backend
   npm run update:flash-sale-christmas
   ```

**Or using Docker (if using Docker on Render):**
```bash
docker exec -it juelle-hair-backend npm run update:flash-sale-christmas
```

### Option 3: Direct Database Update (Advanced)

If you have direct database access:

```sql
-- Find the flash sale
SELECT id, title, description, discount_percent, is_active, start_date, end_date 
FROM flash_sales 
WHERE title ILIKE '%holiday%' OR is_active = true
ORDER BY created_at DESC
LIMIT 1;

-- Update it (replace 'YOUR_FLASH_SALE_ID' with actual ID)
UPDATE flash_sales
SET 
  title = 'Christmas Mega Sale',
  description = 'Celebrate the holidays with amazing deals! Up to 30% off on selected hair products. Perfect gifts for yourself or loved ones!',
  discount_percent = 30
WHERE id = 'YOUR_FLASH_SALE_ID';
```

## What the Script Does

The update script (`update-flash-sale-to-christmas.ts`):

1. **Finds Flash Sales:**
   - Active flash sales (currently running)
   - Flash sales with "holiday" in the title
   - Most recent active flash sale (if no matches)

2. **Updates Content:**
   - Title → "Christmas Mega Sale"
   - Description → Christmas message
   - Discount → 30%

3. **Creates New Sale (if none exists):**
   - Creates a new Christmas flash sale
   - Sets dates (starts now, ends in 30 days)
   - Sets discount to 30%

## Verification

After updating, verify:

1. **Check Frontend:**
   - Visit production homepage
   - Check flash sale banner section
   - Should show "Christmas Mega Sale" with sparkle icons

2. **Check Header:**
   - Top bar should show "Christmas Mega Sale"
   - Countdown timer should be visible

3. **Check API:**
   ```bash
   curl https://your-production-backend.com/api/flash-sales/active
   ```
   Should return:
   ```json
   {
     "title": "Christmas Mega Sale",
     "description": "Celebrate the holidays...",
     "discountPercent": 30
   }
   ```

## Notes

- **Code Changes:** Frontend code changes need to be deployed to production
- **Database:** Flash sale content is stored in database, needs to be updated
- **Cache:** Production frontend may cache the API response, clear cache if needed
- **Timing:** Changes should reflect immediately after database update

## Quick Fix Commands

**For Render Backend:**
```bash
# In Render Shell
cd /opt/render/project/src/backend
npm run update:flash-sale-christmas
```

**For Docker:**
```bash
docker exec -it juelle-hair-backend npm run update:flash-sale-christmas
```

**For Local Testing:**
```bash
cd backend
npm run update:flash-sale-christmas
```

