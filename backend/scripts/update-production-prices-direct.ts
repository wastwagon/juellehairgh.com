/**
 * Script to update production prices directly
 * This script connects ONLY to production database
 * 
 * Usage:
 *   DATABASE_URL_PROD="postgresql://..." ts-node backend/scripts/update-production-prices-direct.ts
 */

import { PrismaClient } from "@prisma/client";

// Production database URL - set via environment variable or command line
const prodDatabaseUrl = process.env.DATABASE_URL_PROD || process.argv[2];

if (!prodDatabaseUrl) {
  console.error("❌ Production DATABASE_URL not provided!");
  console.log("\nUsage:");
  console.log("  DATABASE_URL_PROD='postgresql://...' ts-node backend/scripts/update-production-prices-direct.ts");
  process.exit(1);
}

const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: prodDatabaseUrl,
    },
  },
});

async function checkAndUpdatePrices() {
  console.log("🔍 Checking Production Database Prices...\n");

  try {
    // 1. Get all products from production
    console.log("📥 Fetching products from production database...");
    const products = await prodPrisma.product.findMany({
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

    console.log(`✅ Found ${products.length} products in production database\n`);

    if (products.length === 0) {
      console.log("⚠️  No products found!");
      return;
    }

    // 2. Show products with price 350.00
    const productsWith350 = products.filter((p) => Number(p.priceGhs) === 350);
    console.log(`📊 Products with price 350.00: ${productsWith350.length}\n`);

    if (productsWith350.length === 0) {
      console.log("✅ No products with price 350.00 found!");
      console.log("💡 All prices look correct.");
      return;
    }

    // 3. Show sample of products that need updating
    console.log("📋 Sample products with price 350.00:");
    console.log("─".repeat(60));
    productsWith350.slice(0, 10).forEach((p) => {
      console.log(`  • ${p.title.substring(0, 50)}... (${p.slug})`);
    });
    if (productsWith350.length > 10) {
      console.log(`  ... and ${productsWith350.length - 10} more`);
    }
    console.log("─".repeat(60));

    // 4. Show unique prices
    const uniquePrices = [...new Set(products.map((p) => Number(p.priceGhs)))].sort();
    console.log(`\n💰 Unique prices in database: ${uniquePrices.join(", ")}`);

    // 5. Ask user what to do
    console.log("\n" + "=".repeat(60));
    console.log("⚠️  MANUAL UPDATE REQUIRED");
    console.log("=".repeat(60));
    console.log("\nTo update prices, you have two options:\n");
    console.log("Option 1: Update via Admin Panel");
    console.log("  1. Go to production admin panel");
    console.log("  2. Edit each product");
    console.log("  3. Update prices manually\n");
    console.log("Option 2: Update via SQL (Render Shell)");
    console.log("  1. Render Dashboard → juelle-hair-backend → Shell");
    console.log("  2. Run: psql $DATABASE_URL");
    console.log("  3. Update specific products:");
    console.log('     UPDATE products SET "priceGhs" = NEW_PRICE WHERE slug = \'product-slug\';');
    console.log("\nOption 3: Export from local and import");
    console.log("  1. Export prices from local database");
    console.log("  2. Create import script");
    console.log("  3. Run import script\n");

    // 6. Show SQL commands for common updates
    console.log("💡 Quick SQL Update Examples:");
    console.log("─".repeat(60));
    console.log("-- Update specific product:");
    console.log('UPDATE products SET "priceGhs" = 445.00 WHERE slug = \'product-slug\';');
    console.log("\n-- Update all products with 350.00 to a new price (CAREFUL!):");
    console.log('UPDATE products SET "priceGhs" = 445.00 WHERE "priceGhs" = 350.00;');
    console.log("─".repeat(60));

  } catch (error: any) {
    console.error("❌ Error checking prices:", error);
    throw error;
  } finally {
    await prodPrisma.$disconnect();
  }
}

// Run the check
checkAndUpdatePrices()
  .then(() => {
    console.log("\n✅ Check completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Check failed:", error);
    process.exit(1);
  });

