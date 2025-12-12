# Page Content Management Testing Guide

## Prerequisites

1. **Backend Server Running:**
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Frontend Server Running:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Database Connected:**
   - Ensure DATABASE_URL is set in backend/.env
   - Database should be accessible

## Testing Steps

### 1. Seed Default Content

**Run the seed script:**
```bash
cd backend
npm run seed:page-content
```

**Expected Output:**
```
🌱 Starting to seed page content...

📝 Seeding TERMS_CONDITIONS...
✅ TERMS_CONDITIONS seeded successfully

📝 Seeding PRIVACY_POLICY...
✅ PRIVACY_POLICY seeded successfully

📝 Seeding ABOUT_US...
✅ ABOUT_US seeded successfully

📝 Seeding SHIPPING_POLICY...
✅ SHIPPING_POLICY seeded successfully

📝 Seeding RETURNS_POLICY...
✅ RETURNS_POLICY seeded successfully

📝 Seeding FAQ_CONTENT...
✅ FAQ_CONTENT seeded successfully

🎉 All page content seeded successfully!
```

**If Database Connection Error:**
- Check that backend server is running
- Verify DATABASE_URL in backend/.env
- Try running: `cd backend && npx prisma generate`

### 2. Test Backend API Endpoints

**Test each endpoint:**

```bash
# Terms
curl http://localhost:3000/settings/terms

# Privacy
curl http://localhost:3000/settings/privacy

# About
curl http://localhost:3000/settings/about

# Shipping
curl http://localhost:3000/settings/shipping

# Returns
curl http://localhost:3000/settings/returns

# FAQ
curl http://localhost:3000/settings/faq
```

**Expected Response:**
```json
{
  "content": "<h2>Terms & Conditions</h2>..."
}
```

### 3. Test Frontend Pages

**Visit each page in browser:**

1. **Terms & Conditions:** http://localhost:3001/terms
   - Should display formatted HTML content
   - Should show "Last updated" date

2. **Privacy Policy:** http://localhost:3001/privacy
   - Should display formatted HTML content
   - Should show "Last updated" date

3. **About Us:** http://localhost:3001/about
   - Should display company information
   - Should show mission, values, story

4. **Shipping Policy:** http://localhost:3001/shipping
   - Should display shipping information
   - Should show free shipping threshold (GHS 950)
   - Should show delivery times and areas

5. **Return & Refund Policy:** http://localhost:3001/returns
   - Should display return policy details
   - Should show 14-day return period
   - Should show return process steps

6. **FAQ:** http://localhost:3001/faq
   - Should display FAQ items
   - Should be expandable/collapsible
   - Should show 15 FAQ items

### 4. Test Admin Content Management

**Access Admin Panel:**
1. Go to: http://localhost:3001/admin/pages
2. Login if required

**Test Editing:**

1. **Edit Terms & Conditions:**
   - Click "Edit" button
   - Modify HTML content in textarea
   - Click "Save Changes"
   - Verify success message
   - Check frontend page updates

2. **Edit FAQ:**
   - Click "Edit" on FAQ card
   - Add a new FAQ item
   - Edit existing FAQ items
   - Remove an FAQ item
   - Click "Save Changes"
   - Verify frontend FAQ page updates

3. **Edit Other Pages:**
   - Test editing Privacy, About, Shipping, Returns
   - Verify HTML content saves correctly
   - Check frontend displays updated content

### 5. Test Dynamic Footer Links

**Check Footer:**
1. Visit homepage: http://localhost:3001
2. Scroll to footer
3. Check "Shop" section:
   - Should show categories from database
   - Should prioritize common categories
   - Links should work

4. Check "Collections" section:
   - Should show collections from database
   - Should prioritize common collections
   - Links should work

**If Links Don't Show:**
- Check that categories/collections exist in database
- Verify API endpoints: `/categories` and `/collections`
- Check browser console for errors

### 6. Test API Error Handling

**Test Fallback Content:**
1. Stop backend server temporarily
2. Visit frontend pages
3. Should show fallback content (not crash)
4. Restart backend
5. Content should load from API

## Common Issues & Solutions

### Issue: Database Connection Error
**Solution:**
- Ensure backend is running
- Check DATABASE_URL in backend/.env
- Run `npx prisma generate` in backend directory

### Issue: API Returns Empty Content
**Solution:**
- Run seed script: `npm run seed:page-content`
- Check database: `SELECT * FROM settings WHERE category = 'content';`
- Verify settings exist

### Issue: Frontend Shows Loading Forever
**Solution:**
- Check browser console for errors
- Verify backend API is accessible
- Check CORS settings if needed

### Issue: Admin Can't Save Content
**Solution:**
- Check authentication token
- Verify admin role permissions
- Check backend logs for errors

### Issue: Footer Links Not Showing
**Solution:**
- Verify categories/collections exist in database
- Check API endpoints return data
- Clear browser cache

## Verification Checklist

- [ ] Seed script runs successfully
- [ ] All 6 API endpoints return content
- [ ] All 6 frontend pages display content
- [ ] Admin can edit all pages
- [ ] FAQ editor works (add/edit/remove)
- [ ] Changes save and reflect on frontend
- [ ] Footer shows dynamic categories
- [ ] Footer shows dynamic collections
- [ ] Fallback content works if API fails
- [ ] No console errors in browser
- [ ] No errors in backend logs

## Manual Database Verification

**Check if content exists:**
```sql
SELECT key, LENGTH(value) as content_length, category, updated_at 
FROM settings 
WHERE category = 'content' 
ORDER BY key;
```

**Expected:**
- 6 rows (TERMS_CONDITIONS, PRIVACY_POLICY, ABOUT_US, SHIPPING_POLICY, RETURNS_POLICY, FAQ_CONTENT)
- Each with content_length > 0
- Category = 'content'

## Next Steps After Testing

1. **If all tests pass:**
   - Content is ready for production
   - Can customize content through admin panel
   - Footer links will update automatically

2. **If issues found:**
   - Check error messages
   - Review logs
   - Verify database connection
   - Ensure all dependencies installed

