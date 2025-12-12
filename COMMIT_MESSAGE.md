# Git Commit Message

```
feat: Add logout button, enhance product gallery, and refactor product form

## Changes

### Admin Layout
- Add logout button to admin sidebar with confirmation dialog
- Improve navigation UX

### Product Gallery
- Remove zoom functionality on hover
- Enhance lightbox with thumbnail navigation
- Add keyboard navigation (Arrow keys, ESC)
- Show image counter in lightbox
- Improve user experience for viewing product images

### Product Form - Major Refactor
- Add product type toggle: Simple Product | Variable Product
- Simple products: Show price fields, hide variations
- Variable products: Hide price fields, show variation matrix
- Manual variation creation via modal (no auto-generation)
- Color and Length selectors with swatches from Attributes & Variations
- Variation matrix displays all Color × Length combinations
- Click combination to open modal for price/stock setup
- Support for both new and existing products

## Technical Details
- Variations stored as combined format: "Color / Length" with value "1 / 18 inches"
- Color swatches displayed from ProductAttributeTerm images
- Variations created manually only - admin must configure each combination
- Form submission handles simple vs variable products differently

## Files Changed
- frontend/components/admin/admin-layout.tsx (+64 lines)
- frontend/components/products/product-gallery.tsx (+109 lines)
- frontend/components/admin/product-form.tsx (+618 lines)

## Testing
- [ ] Logout button works
- [ ] Gallery lightbox shows thumbnails
- [ ] Simple product creation works
- [ ] Variable product creation works
- [ ] Variation modal saves correctly
- [ ] Existing products show variations correctly
```

