# 🚀 Migrate Products and Images - Complete Guide

## ✅ What I've Created

I've set up a complete migration system for products and images:

### 1. **Product Seed Script** (`backend/prisma/seed-products.ts`)
   - Creates sample products with images
   - Ensures categories and brands exist
   - Can be customized with your product data

### 2. **Image-Based Migration Script** (`backend/scripts/migrate-products-from-images.ts`)
   - Scans `frontend/public/media/products/` directory
   - Automatically creates products from existing images
   - Groups images by product (e.g., `product-1.jpg`, `product-2.jpg` → one product)

### 3. **JSON Import Script** (`backend/scripts/import-products-from-json.ts`)
   - Imports products from a JSON file
   - Supports full product data (prices, descriptions, categories, etc.)

---

## 🎯 Migration Options

### **Option 1: Migrate from Existing Images** (Recommended if you have images)

This will scan your existing images and create products automatically:

```bash
cd backend
npm run migrate:from-images
```

**What it does:**
- Scans `frontend/public/media/products/` for image files
- Groups images by product name (e.g., `wig-premium-1.jpg`, `wig-premium-2.jpg` → product "wig-premium")
- Creates products with default prices/stock (you'll need to update these manually)
- Links images to products

**After running:**
- Review products in admin panel
- Update prices, stock, descriptions manually
- Add variants if needed

---

### **Option 2: Import from JSON File**

If you have product data in JSON format:

1. **Create `backend/products.json`:**
```json
[
  {
    "title": "Premium Human Hair Wig",
    "slug": "premium-human-hair-wig",
    "description": "High-quality human hair wig",
    "priceGhs": 450.00,
    "compareAtPriceGhs": 550.00,
    "stock": 50,
    "sku": "WIG-001",
    "images": ["/media/products/wig-001-1.jpg"],
    "badges": ["New Arrival"],
    "category": "wigs",
    "brand": "juelle-hair"
  }
]
```

2. **Run import:**
```bash
cd backend
npm run import:products
# Or specify custom file:
npm run import:products path/to/products.json
```

---

### **Option 3: Use Seed Script**

For sample/test data:

```bash
cd backend
npm run seed:products
```

**Note:** This creates sample products. Modify `backend/prisma/seed-products.ts` with your actual product data.

---

## 📋 Step-by-Step Migration Process

### **Step 1: Ensure Database Tables Exist**

First, make sure the database migration has run:

```bash
cd backend
npm run prisma:deploy
```

Or if using Render, it should run automatically after pushing.

---

### **Step 2: Choose Your Migration Method**

**If you have images but no product data:**
```bash
npm run migrate:from-images
```

**If you have product data in JSON:**
```bash
npm run import:products
```

**If you want to start with sample data:**
```bash
npm run seed:products
```

---

### **Step 3: Verify Products**

After migration, verify:

1. **Check database:**
```bash
npm run prisma:studio
```

2. **Test API:**
```bash
curl https://juelle-hair-backend.onrender.com/api/products
```

3. **Check frontend:**
Visit: https://juelle-hair-web.onrender.com

---

## 🖼️ Image Organization

Your images should be organized like this:

```
frontend/public/media/
├── products/
│   ├── product-slug-1.jpg
│   ├── product-slug-2.jpg
│   └── product-slug-3.jpg
├── swatches/
│   └── color-swatch.jpg
├── categories/
│   └── category-image.jpg
└── brands/
    └── brand-logo.jpg
```

**Image paths in database:**
- Use relative paths: `/media/products/image.jpg`
- These will be served from: `https://yourdomain.com/media/products/image.jpg`

---

## 🔧 Customizing Migration

### **Update Default Values**

Edit `backend/scripts/migrate-products-from-images.ts`:

```typescript
// Change default price
priceGhs: 350.00, // Update this

// Change default stock
stock: 10, // Update this

// Change default description template
description: `Premium ${title.toLowerCase()} - High quality product from Juelle Hair Ghana.`,
```

### **Add More Products to Seed**

Edit `backend/prisma/seed-products.ts`:

```typescript
const sampleProducts = [
  {
    title: "Your Product Name",
    slug: "your-product-slug",
    // ... add more products
  },
];
```

---

## 📊 Expected Results

After migration:

1. **Products created** in database
2. **Images linked** to products
3. **Categories and brands** created (if needed)
4. **Products visible** in frontend
5. **Admin panel** shows all products

---

## ⚠️ Important Notes

1. **Backup First:** Always backup your database before running migrations
2. **Review Prices:** Image-based migration uses default prices - update manually
3. **Stock Levels:** Default stock is 10 - update based on actual inventory
4. **Descriptions:** Auto-generated descriptions are basic - enhance manually
5. **Variants:** Products are created without variants - add variants in admin panel

---

## 🚀 Quick Start (Recommended)

If you have existing images:

```bash
cd backend
npm run migrate:from-images
```

Then:
1. Review products in admin panel
2. Update prices, stock, descriptions
3. Add product variants if needed
4. Test frontend display

---

## 📝 Next Steps After Migration

1. **Update Product Details:**
   - Prices
   - Stock levels
   - Descriptions
   - SEO metadata

2. **Add Product Variants:**
   - Colors
   - Sizes
   - Lengths
   - Prices per variant

3. **Organize Categories:**
   - Create proper category hierarchy
   - Assign products to categories

4. **Set Up Brands:**
   - Create brand pages
   - Add brand logos

5. **Test Everything:**
   - Product pages
   - Search functionality
   - Filters
   - Cart/checkout

---

## 🆘 Troubleshooting

### **"No images found"**
- Check that `frontend/public/media/products/` exists
- Verify image file extensions (.jpg, .png, .webp)

### **"Category not found"**
- Script creates default category "Wigs"
- Modify script to create your categories

### **"Products already exist"**
- Script skips existing products
- Delete products first if you want to re-import

### **"Database connection error"**
- Check `DATABASE_URL` in `.env`
- Ensure database is accessible

---

## 📞 Need Help?

If you need to:
- Import from a different source (CSV, Excel, etc.)
- Customize the migration logic
- Handle specific image naming conventions

Let me know and I can create a custom migration script for your needs!
