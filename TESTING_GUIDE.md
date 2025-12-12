# Testing Guide - Product Variations & Admin Features

## Services Status
- ✅ Frontend: http://localhost:8002
- ✅ Backend: http://localhost:8001
- ✅ Database: Connected

## Test Checklist

### 1. Admin Dashboard - Logout Button
**Location:** Admin Dashboard Sidebar

**Steps:**
1. Navigate to http://localhost:8002/admin
2. Login with admin credentials
3. Check the bottom of the sidebar navigation
4. Verify "Sign Out" button is visible with LogOut icon
5. Click "Sign Out" button
6. Verify confirmation dialog appears
7. Confirm logout and verify redirect to login page

**Expected Result:** Logout button appears at bottom of sidebar, works correctly

---

### 2. Product Creation - Simple Product
**Location:** Admin → Products → Add New Product

**Steps:**
1. Navigate to Admin → Products
2. Click "Add New Product"
3. Select "Simple Product" radio button
4. Fill in:
   - Title: "Test Simple Product"
   - Description: "Test description"
   - Category: Select any category
   - Brand: Select any brand
   - Regular Price: 100.00
   - Sale Price: 80.00 (optional)
   - Stock: 50
5. Upload product images
6. Click "Save"

**Expected Result:** 
- Product-level price/stock fields are visible
- Product saves successfully
- Product appears in products list

---

### 3. Product Creation - Variable Product (NEW FEATURE)
**Location:** Admin → Products → Add New Product

**Steps:**
1. Navigate to Admin → Products
2. Click "Add New Product"
3. Select "Variable Product" radio button
4. Verify product-level price/stock fields are HIDDEN
5. Fill in basic product info (title, description, category, brand)
6. Upload product images

**Variation Setup:**
7. In "Product Variations" section:
   - Select Color attribute terms (e.g., "Black", "Brown", "Blonde")
   - Verify color swatches appear for each color
   - Select Length attribute terms (e.g., "12 inches", "14 inches", "16 inches")
8. Verify "Variation Combinations" matrix appears showing all combinations
9. Click on a variation combination (e.g., "Black / 12 inches")
10. Verify variation modal opens ABOVE the product form
11. In the modal, fill in:
    - Regular Price: 120.00
    - Sale Price: 100.00 (optional)
    - Stock Quantity: 25
    - SKU: "TEST-BLK-12" (optional)
12. Click "Save" in modal
13. Verify modal closes
14. Verify the variation combination button shows green border (indicating configured)
15. Repeat steps 9-14 for other combinations
16. Click "Save" on main product form

**Expected Result:**
- Product-level price/stock fields hidden for variable products
- Color swatches display correctly
- Variation combinations matrix shows all combinations
- Variation modal appears above product form (z-index working)
- Each variation can be configured individually
- Variations save correctly

---

### 4. Edit Existing Variable Product
**Location:** Admin → Products → Edit Product

**Steps:**
1. Navigate to Admin → Products
2. Find an existing variable product
3. Click "Edit"
4. Verify "Variable Product" is selected
5. Verify existing variations are shown in the combinations matrix
6. Click on an existing variation combination
7. Verify modal opens with existing variation data pre-filled
8. Modify price/stock/SKU
9. Save and verify changes persist

**Expected Result:**
- Existing variations load correctly
- Variation data pre-fills in modal
- Updates work correctly

---

### 5. Frontend - Single Product View
**Location:** Product Detail Page

**Steps:**
1. Navigate to a product page (e.g., http://localhost:8002/products/[slug])
2. For variable products:
   - Verify color swatches appear for color selection
   - Verify length options appear
   - Select different variations
   - Verify price updates based on selected variation
   - Verify stock status updates
3. Click on product images
4. Verify lightbox opens showing all gallery images
5. Verify thumbnail strip at bottom of lightbox
6. Verify image counter (e.g., "1 / 4")
7. Use arrow keys (← →) to navigate images
8. Press Escape to close lightbox
9. Verify NO zoom functionality on hover (removed)

**Expected Result:**
- Variations display correctly
- Color swatches show
- Lightbox works with all images
- Keyboard navigation works
- No zoom on hover

---

### 6. Frontend - Quick View Modal
**Location:** Product Quick View (from product grid)

**Steps:**
1. Navigate to shop page or category page
2. Hover over a product and click "Quick View"
3. For variable products:
   - Verify color swatches appear
   - Verify length options appear
   - Select variations
   - Verify price updates
4. Click on product images in quick view
5. Verify lightbox opens (same as single product view)
6. Test add to cart with selected variations

**Expected Result:**
- Quick view shows variations correctly
- Lightbox works in quick view
- Add to cart works with variations

---

### 7. Color Swatch Images
**Location:** Admin → Attributes & Variations → Color Terms

**Steps:**
1. Navigate to Admin → Attributes & Variations
2. Verify color terms have images uploaded
3. Go to Product Form → Variable Product
4. Verify color swatches display images correctly
5. Check browser console for any image loading errors

**Expected Result:**
- All color swatches show images
- Images load from `/api/media/swatches/` route
- No broken image icons

---

## Common Issues & Troubleshooting

### Issue: Variation Modal Not Appearing
**Solution:** 
- Check browser console for errors
- Verify React Portal is working (check DOM - modal should be in `<body>`)
- Verify z-index is `z-[100]` in modal

### Issue: Color Swatches Not Showing
**Solution:**
- Check image paths in Attributes & Variations page
- Verify images are in `backend/uploads/media/swatches/` folder
- Check `/api/media/swatches/[filename]` route is working

### Issue: Lightbox Not Working
**Solution:**
- Check browser console for JavaScript errors
- Verify images array is populated
- Test keyboard navigation (Arrow keys, Escape)

### Issue: Variations Not Saving
**Solution:**
- Check backend logs for API errors
- Verify authentication token is valid
- Check database connection

---

## API Endpoints to Test

### Product Variants
- `GET /api/admin/product-variants?productId={id}` - Get variants for product
- `POST /api/admin/product-variants` - Create variant
- `PUT /api/admin/product-variants/{id}` - Update variant

### Media
- `GET /api/media/swatches/{filename}` - Get color swatch image
- `GET /api/media/products/{filename}` - Get product image

---

## Browser Testing Checklist

Test in:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on Mac)

Test:
- [ ] Desktop view
- [ ] Mobile view (responsive)
- [ ] Tablet view

---

## Notes

- All changes are committed and ready to push
- Commits:
  - `78d6b98` - Logout button, gallery enhancements, product form updates
  - `3ac3051` - React Portal for variation modal
  - `f76951a` - Improved portal rendering with error handling

