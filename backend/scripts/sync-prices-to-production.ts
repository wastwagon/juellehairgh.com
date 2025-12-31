/**
 * Script to sync product prices from local database to production
 * 
 * This script:
 * 1. Reads prices from local database
 * 2. Updates production database with correct prices
 * 
 * Usage:
 *   DATABASE_URL="postgresql://..." ts-node backend/scripts/sync-prices-to-production.ts
 * 
 * Or set production DATABASE_URL in .env.production
 */

import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" }); // Local database
const prodEnv = dotenv.config({ path: ".env.production" }); // Production database

// Local database URL - use Docker database if available, otherwise use DATABASE_URL
const localDatabaseUrl = process.env.LOCAL_DATABASE_URL || 
  "postgresql://postgres:postgres@localhost:5432/juellehair" ||
  process.env.DATABASE_URL;

const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: localDatabaseUrl, // Local database
    },
  },
});

// Production Prisma client - use DATABASE_URL_PROD if set, otherwise prompt
const prodDatabaseUrl = process.env.DATABASE_URL_PROD || process.argv[2];

if (!prodDatabaseUrl) {
  console.error("❌ Production DATABASE_URL not provided!");
  console.log("\nUsage:");
  console.log("  DATABASE_URL_PROD='postgresql://...' ts-node backend/scripts/sync-prices-to-production.ts");
  console.log("  OR");
  console.log("  ts-node backend/scripts/sync-prices-to-production.ts 'postgresql://production-url'");
  process.exit(1);
}

const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: prodDatabaseUrl,
    },
  },
});

async function syncPrices() {
  console.log("🔄 Syncing Product Prices from Local to Production...\n");

  try {
    // 1. Get all products from local database
    console.log("📥 Fetching products from local database...");
    const localProducts = await localPrisma.product.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        priceGhs: true,
        compareAtPriceGhs: true,
      },
      orderBy: {
        title: "asc",
      },
    });

    console.log(`✅ Found ${localProducts.length} products in local database\n`);

    if (localProducts.length === 0) {
      console.log("⚠️  No products found in local database!");
      return;
    }

    // 2. Get production products
    console.log("📥 Fetching products from production database...");
    const prodProducts = await prodPrisma.product.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        priceGhs: true,
        compareAtPriceGhs: true,
      },
    });

    console.log(`✅ Found ${prodProducts.length} products in production database\n`);

    // 3. Match products by slug and update prices
    console.log("🔄 Matching and updating prices...\n");
    let updated = 0;
    let skipped = 0;
    let notFound = 0;

    for (const localProduct of localProducts) {
      const prodProduct = prodProducts.find((p) => p.slug === localProduct.slug);

      if (!prodProduct) {
        console.log(`⚠️  Not found in production: ${localProduct.title} (${localProduct.slug})`);
        notFound++;
        continue;
      }

      const localPrice = Number(localProduct.priceGhs);
      const prodPrice = Number(prodProduct.priceGhs);

      // Check if price needs updating
      if (localPrice !== prodPrice) {
        try {
          await prodPrisma.product.update({
            where: { id: prodProduct.id },
            data: {
              priceGhs: localPrice,
              compareAtPriceGhs: localProduct.compareAtPriceGhs
                ? Number(localProduct.compareAtPriceGhs)
                : null,
            },
          });

          console.log(
            `✅ Updated: ${localProduct.title.substring(0, 40)}... (${prodPrice} → ${localPrice})`
          );
          updated++;
        } catch (error: any) {
          console.error(`❌ Error updating ${localProduct.title}:`, error.message);
        }
      } else {
        skipped++;
      }
    }

    // 4. Summary
    console.log("\n" + "=".repeat(60));
    console.log("📋 SYNC SUMMARY");
    console.log("=".repeat(60));
    console.log(`✅ Updated: ${updated} products`);
    console.log(`⏭️  Skipped: ${skipped} products (same price)`);
    console.log(`⚠️  Not found: ${notFound} products`);
    console.log(`📊 Total processed: ${localProducts.length} products`);
    console.log("=".repeat(60));

    if (updated > 0) {
      console.log("\n✅ Price sync completed successfully!");
      console.log("💡 Prices should now be correct on production.");
    } else {
      console.log("\n💡 No prices needed updating.");
    }
  } catch (error: any) {
    console.error("❌ Error syncing prices:", error);
    throw error;
  } finally {
    await localPrisma.$disconnect();
    await prodPrisma.$disconnect();
  }
}

// Run the sync
syncPrices()
  .then(() => {
    console.log("\n✅ Sync completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Sync failed:", error);
    process.exit(1);
  });

