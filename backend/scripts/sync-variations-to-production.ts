/**
 * Script to sync product variations from local database to production
 * 
 * This script:
 * 1. Fetches all products with variations from local database
 * 2. Exports variation data in a format that can be imported to production
 * 3. Can also directly sync to production database if DATABASE_URL_PROD is set
 * 
 * NOTE: For enhanced sync with color swatch image handling and variant normalization,
 * use sync-variations-with-images.ts instead.
 * 
 * Usage:
 *   ts-node backend/scripts/sync-variations-to-production.ts
 * 
 * Environment Variables:
 *   DATABASE_URL - Local database URL (default: from .env)
 *   DATABASE_URL_PROD - Production database URL (optional, for direct sync)
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface VariationExport {
  productId: string;
  productSlug: string;
  productTitle: string;
  variants: Array<{
    name: string;
    value: string;
    priceGhs: number | null;
    compareAtPriceGhs: number | null;
    stock: number | null;
    sku: string | null;
    image: string | null;
  }>;
}

async function syncVariationsToProduction() {
  console.log("🔄 Syncing Product Variations to Production...\n");

  try {
    // 1. Get all products with variants
    const productsWithVariants = await prisma.product.findMany({
      where: {
        variants: {
          some: {},
        },
      },
      include: {
        variants: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`📦 Found ${productsWithVariants.length} products with variations\n`);

    if (productsWithVariants.length === 0) {
      console.log("✅ No products with variations found. Nothing to sync.");
      return;
    }

    // 2. Export variations data
    const exportData: VariationExport[] = productsWithVariants.map((product) => ({
      productId: product.id,
      productSlug: product.slug,
      productTitle: product.title,
      variants: product.variants.map((variant) => ({
        name: variant.name,
        value: variant.value,
        priceGhs: variant.priceGhs,
        compareAtPriceGhs: variant.compareAtPriceGhs,
        stock: variant.stock,
        sku: variant.sku,
        image: variant.image,
      })),
    }));

    // 3. Save export to JSON file
    const exportPath = path.join(process.cwd(), "variations-export.json");
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    console.log(`✅ Variations exported to: ${exportPath}\n`);

    // 4. Summary statistics
    const totalVariants = exportData.reduce((sum, p) => sum + p.variants.length, 0);
    const productsWithColorVariants = exportData.filter(
      (p) => p.variants.some((v) => v.name.toLowerCase().includes("color"))
    ).length;
    const productsWithLengthVariants = exportData.filter(
      (p) => p.variants.some((v) => v.name.toLowerCase().includes("length"))
    ).length;

    console.log("📊 Export Summary:");
    console.log(`   Products with variations: ${productsWithVariants.length}`);
    console.log(`   Total variations: ${totalVariants}`);
    console.log(`   Products with Color variants: ${productsWithColorVariants}`);
    console.log(`   Products with Length variants: ${productsWithLengthVariants}\n`);

    // 5. If DATABASE_URL_PROD is set, sync directly to production
    const prodDatabaseUrl = process.env.DATABASE_URL_PROD;
    if (prodDatabaseUrl) {
      console.log("🔄 Direct sync to production database enabled...\n");
      
      const prodPrisma = new PrismaClient({
        datasources: {
          db: {
            url: prodDatabaseUrl,
          },
        },
      });

      let syncedCount = 0;
      let createdCount = 0;
      let updatedCount = 0;
      let errorCount = 0;

      for (const productData of exportData) {
        try {
          // Find product in production by slug (more reliable than ID)
          const prodProduct = await prodPrisma.product.findFirst({
            where: {
              slug: productData.productSlug,
            },
            include: {
              variants: true,
            },
          });

          if (!prodProduct) {
            console.log(`⚠️  Product not found in production: ${productData.productTitle} (${productData.productSlug})`);
            errorCount++;
            continue;
          }

          // Sync each variant
          for (const variantData of productData.variants) {
            // Check if variant already exists
            const existingVariant = prodProduct.variants.find(
              (v) => v.name === variantData.name && v.value === variantData.value
            );

            if (existingVariant) {
              // Update existing variant
              await prodPrisma.productVariant.update({
                where: { id: existingVariant.id },
                data: {
                  priceGhs: variantData.priceGhs,
                  compareAtPriceGhs: variantData.compareAtPriceGhs,
                  stock: variantData.stock,
                  sku: variantData.sku,
                  image: variantData.image,
                },
              });
              updatedCount++;
            } else {
              // Create new variant
              await prodPrisma.productVariant.create({
                data: {
                  productId: prodProduct.id,
                  name: variantData.name,
                  value: variantData.value,
                  priceGhs: variantData.priceGhs,
                  compareAtPriceGhs: variantData.compareAtPriceGhs,
                  stock: variantData.stock,
                  sku: variantData.sku,
                  image: variantData.image,
                },
              });
              createdCount++;
            }
          }

          syncedCount++;
          console.log(`✅ Synced: ${productData.productTitle} (${productData.variants.length} variants)`);
        } catch (error: any) {
          console.error(`❌ Error syncing ${productData.productTitle}:`, error.message);
          errorCount++;
        }
      }

      console.log("\n📊 Sync Summary:");
      console.log(`   Products synced: ${syncedCount}`);
      console.log(`   Variants created: ${createdCount}`);
      console.log(`   Variants updated: ${updatedCount}`);
      console.log(`   Errors: ${errorCount}`);

      await prodPrisma.$disconnect();
    } else {
      console.log("💡 To sync directly to production, set DATABASE_URL_PROD environment variable");
      console.log("   Example: DATABASE_URL_PROD='postgresql://...' ts-node backend/scripts/sync-variations-to-production.ts\n");
    }

    console.log("✅ Sync completed!");
  } catch (error: any) {
    console.error("❌ Error syncing variations:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
syncVariationsToProduction()
  .then(() => {
    console.log("\n✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });

