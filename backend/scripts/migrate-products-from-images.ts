import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

/**
 * Migrates products from existing image files in the media/products directory
 * This script scans the images folder and creates products based on image filenames
 */
async function migrateProductsFromImages() {
  console.log("🖼️  Starting product migration from images...");

  try {
    // Get media directory path
    const backendDir = process.cwd();
    const mediaProductsDir = path.join(backendDir, "..", "frontend", "public", "media", "products");

    if (!fs.existsSync(mediaProductsDir)) {
      console.error(`❌ Products directory not found: ${mediaProductsDir}`);
      return;
    }

    // Read all image files
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

    // Group images by product (assuming naming convention: product-slug-1.jpg, product-slug-2.jpg)
    const productImagesMap = new Map<string, string[]>();

    imageFiles.forEach((file) => {
      // Extract product identifier from filename
      // Example: "wig-premium-1.jpg" -> "wig-premium"
      const baseName = path.basename(file, path.extname(file));
      const productKey = baseName.replace(/-\d+$/, ""); // Remove trailing numbers

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
      // Check if product already exists
      const existingProduct = await prisma.product.findFirst({
        where: { slug: productKey },
      });

      if (existingProduct) {
        console.log(`⏭️  Skipping existing product: ${productKey}`);
        skipped++;
        continue;
      }

      // Generate product data from key
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
            priceGhs: 350.00, // Default price - update manually
            compareAtPriceGhs: 450.00, // Default compare price
            stock: 10, // Default stock - update manually
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
    console.log(`\n💡 Note: Review and update prices, stock, and descriptions manually.`);
  } catch (error) {
    console.error("❌ Error migrating products:", error);
    throw error;
  }
}

async function main() {
  try {
    await migrateProductsFromImages();
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
