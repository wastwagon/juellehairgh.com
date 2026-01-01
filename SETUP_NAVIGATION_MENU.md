# 🎯 Navigation Menu Setup Guide

## Overview
This guide helps you set up the navigation menu to match your website's menu structure exactly as shown in the images.

## Menu Structure

### Main Navigation (Top Row)
1. **Home** - `/`
2. **Shop All** - `/categories/shop-all`
3. **Braids** - `/categories/braids` (with dropdown)
4. **Ponytails** - `/categories/ponytails` (with dropdown)
5. **Lace Wigs** - `/categories/lace-wigs` (with dropdown)
6. **Clip-Ins** - `/categories/clip-ins` (with dropdown)
7. **Hair Growth Oils** - `/categories/hair-growth-oils`
8. **Brands** - `/brands` (with dropdown)

### Secondary Navigation (Bottom Row)
- **Wig Care** - `/categories/wig-care`
- **Contact Us** - `/contact`

## Sub-Menus

### Braids Subcategories
- Boho braids
- Crochet Hair
- Passion Twist braids
- Twist braids

### Ponytails Subcategories
- Drawstring/Half wigs
- Wrap Ponytails

### Lace Wigs Subcategories
- Human hair blend lace wigs
- Glueless Lace Wigs
- Synthetic Hair Wigs
- Wig Care

### Clip-Ins Subcategories
- Human Hair Blend Clip-ins
- Human Hair Clip-ins

### Brands (from database)
- Bobbi Boss
- Freetress
- Janet Collection
- Model Model
- Outre
- Sensationnel
- Shake-N-Go
- Zury Sis

## Setup Steps

### Step 1: Run the Category Setup Script

**Locally:**
```bash
cd backend
npm run ts-node scripts/setup-navigation-categories.ts
```

**In Render Shell (Backend Service):**
```bash
cd backend
npx ts-node scripts/setup-navigation-categories.ts
```

This script will:
- Create/update all main categories
- Create/update all subcategories with proper parent relationships
- Ensure categories match the exact menu structure

### Step 2: Verify Brands

The navigation menu fetches brands from the database. Make sure all brands are added:

1. Go to Admin Panel → Brands
2. Add/verify these brands exist:
   - Bobbi Boss
   - Freetress
   - Janet Collection
   - Model Model
   - Outre
   - Sensationnel
   - Shake-N-Go
   - Zury Sis

### Step 3: Verify Categories in Database

After running the script, verify categories were created:

**In Render Shell:**
```bash
psql $DATABASE_URL -c "SELECT name, slug, \"parentId\" FROM categories ORDER BY name;"
```

You should see:
- All main categories (Braids, Ponytails, Lace Wigs, Clip-Ins, etc.)
- All subcategories with their parent IDs set correctly

### Step 4: Test Navigation

1. **Visit your website**
2. **Hover over menu items** with dropdowns (Braids, Ponytails, Lace Wigs, Clip-Ins, Brands)
3. **Verify sub-menus appear** with correct items
4. **Check secondary navigation** (Wig Care, Contact Us) appears below main nav

## Frontend Changes

The header component (`frontend/components/layout/header.tsx`) has been updated to:

1. **Fetch categories dynamically** from the API
2. **Fetch brands dynamically** from the API
3. **Display dropdown menus** for categories with children
4. **Display brands dropdown** with all brands
5. **Show secondary navigation** row below main navigation
6. **Match exact order** from your website images

## Category Slugs Reference

| Display Name | Slug | Parent |
|-------------|------|--------|
| Shop All | `shop-all` | None |
| Braids | `braids` | None |
| Boho braids | `boho-braids` | Braids |
| Crochet Hair | `crochet-hair` | Braids |
| Passion Twist braids | `passion-twist-braids` | Braids |
| Twist braids | `twist-braids` | Braids |
| Ponytails | `ponytails` | None |
| Drawstring/Half wigs | `drawstring-half-wigs` | Ponytails |
| Wrap Ponytails | `wrap-ponytails` | Ponytails |
| Lace Wigs | `lace-wigs` | None |
| Human hair blend lace wigs | `human-hair-blend-lace-wigs` | Lace Wigs |
| Glueless Lace Wigs | `glueless-lace-wigs` | Lace Wigs |
| Synthetic Hair Wigs | `synthetic-hair-wigs` | Lace Wigs |
| Wig Care | `wig-care` | Lace Wigs (also standalone) |
| Clip-Ins | `clip-ins` | None |
| Human Hair Blend Clip-ins | `human-hair-blend-clip-ins` | Clip-Ins |
| Human Hair Clip-ins | `human-hair-clip-ins` | Clip-Ins |
| Hair Growth Oils | `hair-growth-oils` | None |
| Wig Care | `wig-care` | None (standalone) |

## Troubleshooting

### Categories Not Showing in Dropdown

1. **Check categories exist in database:**
   ```bash
   psql $DATABASE_URL -c "SELECT name, slug, \"parentId\" FROM categories WHERE slug IN ('braids', 'ponytails', 'lace-wigs', 'clip-ins');"
   ```

2. **Check parent-child relationships:**
   ```bash
   psql $DATABASE_URL -c "SELECT c.name, c.slug, p.name as parent_name FROM categories c LEFT JOIN categories p ON c.\"parentId\" = p.id WHERE c.\"parentId\" IS NOT NULL;"
   ```

3. **Verify API returns categories:**
   ```bash
   curl https://your-backend.onrender.com/api/categories
   ```

### Brands Not Showing in Dropdown

1. **Check brands exist:**
   ```bash
   psql $DATABASE_URL -c "SELECT name, slug FROM brands ORDER BY name;"
   ```

2. **Verify API returns brands:**
   ```bash
   curl https://your-backend.onrender.com/api/brands
   ```

3. **Ensure brands have products** (brands without products won't show)

### Dropdown Not Appearing

1. **Check browser console** for JavaScript errors
2. **Verify categories/brands are loading** (check Network tab)
3. **Clear browser cache** and hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

## Next Steps

After setting up categories:

1. **Assign products to categories** via Admin Panel
2. **Assign products to brands** via Admin Panel
3. **Test navigation** on both desktop and mobile
4. **Verify all links work** correctly

## Notes

- Categories are fetched dynamically, so changes in the database will reflect immediately
- Brands dropdown shows all brands that have products
- Secondary navigation (Wig Care, Contact Us) appears below main navigation on desktop
- Mobile menu shows all items with expandable dropdowns

