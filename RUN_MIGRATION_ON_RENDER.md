# 🚀 Run Product Migration on Render Shell

## ✅ Fix Applied

Fixed the TypeScript error - removed `description` field from Brand creation (Brand model doesn't have this field).

## 📋 Correct Commands for Render Shell

**You're already in the backend directory!** The prompt shows `~/project/src/backend$`, so you don't need `cd backend`.

### **Run Migration:**

```bash
# You're already here: ~/project/src/backend
# Just run:
npm run migrate:from-images
```

---

## 🔄 After Fix is Deployed

The fix has been committed. You need to:

### **Option 1: Pull Latest Code (Recommended)**

```bash
# In Render Shell
cd ~/project/src/backend
git pull origin main
npm run migrate:from-images
```

---

### **Option 2: Run Fixed Script Manually**

If you can't pull, create a temporary fixed script:

```bash
# In Render Shell
cat > migrate-fixed.ts << 'EOF'
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function migrateProductsFromImages() {
  console.log("🖼️  Starting product migration from images...");

  try {
    const backendDir = process.cwd();
    const mediaProductsDir = path.join(backendDir, "..", "frontend", "public", "media", "products");

    if (!fs.existsSync(mediaProductsDir)) {
      console.error(`❌ Products directory not found: ${mediaProductsDir}`);
      return;
    }

    const imageFiles = fs.readdirSync(mediaProductsDir).filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext);
    });

    console.log(`📸 Found ${imageFiles.length} image files`);

    if (imageFiles.length === 0) {
      console.log("⚠️  No images found. Nothing to migrate.");
      return;
    }

    // Ensure default category and brand exist
    let category = await prisma.category.findFirst({ where: { slug: "wigs" } });
    if (!category) {
      category = await prisma.category.create({
        data: {
          name: "Wigs",
          slug: "wigs",
          description: "Premium quality wigs",
        },
      });
      console.log("✅ Created default category: Wigs");
    }

    let brand = await prisma.brand.findFirst({ where: { slug: "juelle-hair" } });
    if (!brand) {
      brand = await prisma.brand.create({
        data: {
          name: "Juelle Hair",
          slug: "juelle-hair",
        },
      });
      console.log("✅ Created default brand: Juelle Hair");
    }

    // Group images by product
    const productImagesMap = new Map<string, string[]>();

    imageFiles.forEach((file) => {
      const baseName = path.basename(file, path.extname(file));
      const productKey = baseName.replace(/-\d+$/, "");

      if (!productImagesMap.has(productKey)) {
        productImagesMap.set(productKey, []);
      }
      productImagesMap.get(productKey)!.push(`/media/products/${file}`);
    });

    console.log(`📦 Grouped into ${productImagesMap.size} potential products`);

    // Create products
    let created = 0;
    let skipped = 0;

    for (const [productKey, images] of productImagesMap.entries()) {
      const existingProduct = await prisma.product.findFirst({
        where: { slug: productKey },
      });

      if (existingProduct) {
        console.log(`⏭️  Skipping existing product: ${productKey}`);
        skipped++;
        continue;
      }

      const title = productKey
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      try {
        const product = await prisma.product.create({
          data: {
            title,
            slug: productKey,
            description: `Premium ${title.toLowerCase()} - High quality product from Juelle Hair Ghana.`,
            priceGhs: 350.00,
            compareAtPriceGhs: 450.00,
            stock: 10,
            sku: `PROD-${productKey.toUpperCase()}`,
            images,
            badges: [],
            isActive: true,
            categoryId: category.id,
            brandId: brand.id,
          },
        });

        console.log(`✅ Created product: ${product.title} (${images.length} images)`);
        created++;
      } catch (error: any) {
        console.error(`❌ Error creating product ${productKey}:`, error.message);
      }
    }

    console.log("\n🎉 Migration completed!");
    console.log(`✅ Created: ${created} products`);
    console.log(`⏭️  Skipped: ${skipped} products (already exist)`);
  } catch (error) {
    console.error("❌ Error migrating products:", error);
    throw error;
  }
}

migrateProductsFromImages()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
EOF

# Run it
npx ts-node migrate-fixed.ts
```

---

## 🎯 Quick Fix: Update Script Directly

Or edit the file directly in Render Shell:

```bash
# Edit the file
nano scripts/migrate-products-from-images.ts

# Find line 56 and remove the description line:
# Change from:
#   description: "Premium hair products from Juelle Hair Ghana",
# To: (just remove this line)

# Save (Ctrl+X, then Y, then Enter)

# Run again
npm run migrate:from-images
```

---

## ✅ Expected Result

After running successfully:

```
📸 Found 217 image files
📦 Grouped into X potential products
✅ Created product: Product Name (3 images)
...
🎉 Migration completed!
✅ Created: X products
⏭️  Skipped: 0 products
```

---

## 🚀 Next Steps

1. **Pull latest code** (includes the fix)
2. **Run migration:** `npm run migrate:from-images`
3. **Verify:** Check `https://juelle-hair-backend.onrender.com/api/products`

---

## 📝 Note

The fix has been committed to your repo. After you pull the latest code, the migration script will work correctly!
