/**
 * Export product prices from local database to JSON
 * This can then be used to update production
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

// Use Docker database URL
const localDatabaseUrl = "postgresql://postgres:postgres@localhost:5432/juellehair";

const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: localDatabaseUrl,
    },
  },
});

async function exportPrices() {
  console.log("📥 Exporting product prices from local database...\n");

  try {
    const products = await localPrisma.product.findMany({
      select: {
        slug: true,
        title: true,
        priceGhs: true,
        compareAtPriceGhs: true,
      },
      orderBy: {
        title: "asc",
      },
    });

    console.log(`✅ Found ${products.length} products\n`);

    // Export to JSON
    const exportData = products.map((p) => ({
      slug: p.slug,
      title: p.title,
      priceGhs: Number(p.priceGhs),
      compareAtPriceGhs: p.compareAtPriceGhs ? Number(p.compareAtPriceGhs) : null,
    }));

    const outputPath = path.join(__dirname, "../../local-prices-export.json");
    fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));

    console.log(`✅ Exported ${exportData.length} products to: ${outputPath}`);
    console.log("\n📊 Price Summary:");
    const prices = exportData.map((p) => p.priceGhs);
    const uniquePrices = [...new Set(prices)].sort();
    console.log(`   Unique prices: ${uniquePrices.join(", ")}`);
    console.log(`   Products with 350.00: ${prices.filter((p) => p === 350).length}`);

  } catch (error: any) {
    console.error("❌ Error exporting prices:", error.message);
    throw error;
  } finally {
    await localPrisma.$disconnect();
  }
}

exportPrices()
  .then(() => {
    console.log("\n✅ Export completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Export failed:", error);
    process.exit(1);
  });

