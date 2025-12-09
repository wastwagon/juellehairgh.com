import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

/**
 * Imports products from a JSON file
 * Expected JSON format:
 * [
 *   {
 *     "title": "Product Name",
 *     "slug": "product-slug",
 *     "description": "Product description",
 *     "priceGhs": 350.00,
 *     "compareAtPriceGhs": 450.00,
 *     "stock": 10,
 *     "sku": "SKU-001",
 *     "images": ["/media/products/image1.jpg"],
 *     "badges": ["New Arrival"],
 *     "category": "wigs",
 *     "brand": "juelle-hair"
 *   }
 * ]
 */
interface ProductImportData {
  title: string;
  slug?: string;
  description?: string;
  priceGhs: number;
  compareAtPriceGhs?: number;
  stock?: number;
  sku?: string;
  images?: string[];
  badges?: string[];
  category?: string;
  brand?: string;
  isActive?: boolean;
}

async function importProductsFromJson(jsonFilePath: string) {
  console.log(`📥 Importing products from: ${jsonFilePath}`);

  try {
    // Read JSON file
    if (!fs.existsSync(jsonFilePath)) {
      console.error(`❌ JSON file not found: ${jsonFilePath}`);
      return;
    }

    const fileContent = fs.readFileSync(jsonFilePath, "utf-8");
    const products: ProductImportData[] = JSON.parse(fileContent);

    console.log(`📦 Found ${products.length} products to import`);

    // Get or create categories and brands
    const categoryMap = new Map<string, string>();
    const brandMap = new Map<string, string>();

    for (const productData of products) {
      // Handle category
      if (productData.category) {
        if (!categoryMap.has(productData.category)) {
          let category = await prisma.category.findFirst({
            where: { slug: productData.category },
          });

          if (!category) {
            category = await prisma.category.create({
              data: {
                name: productData.category
                  .split("-")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" "),
                slug: productData.category,
              },
            });
            console.log(`✅ Created category: ${category.name}`);
          }
          categoryMap.set(productData.category, category.id);
        }
      }

      // Handle brand
      if (productData.brand) {
        if (!brandMap.has(productData.brand)) {
          let brand = await prisma.brand.findFirst({
            where: { slug: productData.brand },
          });

          if (!brand) {
            brand = await prisma.brand.create({
              data: {
                name: productData.brand
                  .split("-")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" "),
                slug: productData.brand,
              },
            });
            console.log(`✅ Created brand: ${brand.name}`);
          }
          brandMap.set(productData.brand, brand.id);
        }
      }
    }

    // Import products
    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const productData of products) {
      try {
        // Generate slug if not provided
        const slug =
          productData.slug ||
          productData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");

        // Check if product already exists
        const existing = await prisma.product.findFirst({
          where: { slug },
        });

        if (existing) {
          console.log(`⏭️  Skipping existing product: ${slug}`);
          skipped++;
          continue;
        }

        // Get category and brand IDs
        const categoryId = productData.category
          ? categoryMap.get(productData.category)
          : null;
        const brandId = productData.brand ? brandMap.get(productData.brand) : null;

        if (!categoryId) {
          console.warn(`⚠️  No category found for product: ${productData.title}`);
        }

        // Create product
        const product = await prisma.product.create({
          data: {
            title: productData.title,
            slug,
            description: productData.description || "",
            priceGhs: productData.priceGhs,
            compareAtPriceGhs: productData.compareAtPriceGhs,
            stock: productData.stock || 0,
            sku: productData.sku,
            images: productData.images || [],
            badges: productData.badges || [],
            isActive: productData.isActive ?? true,
            categoryId: categoryId!,
            brandId: brandId || undefined,
          },
        });

        console.log(`✅ Imported: ${product.title}`);
        created++;
      } catch (error: any) {
        console.error(`❌ Error importing ${productData.title}:`, error.message);
        errors++;
      }
    }

    console.log("\n🎉 Import completed!");
    console.log(`✅ Created: ${created} products`);
    console.log(`⏭️  Skipped: ${skipped} products`);
    console.log(`❌ Errors: ${errors} products`);
  } catch (error) {
    console.error("❌ Error importing products:", error);
    throw error;
  }
}

// Main execution
const jsonFilePath = process.argv[2] || path.join(process.cwd(), "products.json");

async function main() {
  try {
    await importProductsFromJson(jsonFilePath);
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
