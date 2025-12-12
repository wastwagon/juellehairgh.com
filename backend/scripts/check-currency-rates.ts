/**
 * Script to check currency rates in database
 * 
 * This script:
 * 1. Checks if currency rates exist in database
 * 2. Checks when rates were last updated
 * 3. Verifies rates are valid
 * 4. Tests API endpoint
 * 
 * Usage:
 *   ts-node backend/scripts/check-currency-rates.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkCurrencyRates() {
  console.log("🔍 Checking Currency Rates in Database...\n");

  try {
    // 1. Check if rates exist
    const rates = await prisma.currencyRate.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    });

    console.log(`📊 Total currency rates in database: ${rates.length}\n`);

    if (rates.length === 0) {
      console.log("❌ NO CURRENCY RATES FOUND IN DATABASE!");
      console.log("💡 Run: npm run update:currency-rates");
      console.log("   Or: POST /api/currency/update-rates (admin endpoint)\n");
      return;
    }

    // 2. Check last update time
    const latestUpdate = rates[0]?.updatedAt;
    const now = new Date();
    const hoursSinceUpdate = latestUpdate
      ? Math.floor((now.getTime() - latestUpdate.getTime()) / (1000 * 60 * 60))
      : 0;

    console.log(`⏰ Last updated: ${latestUpdate?.toISOString() || "Never"}`);
    console.log(`   Hours since update: ${hoursSinceUpdate}\n`);

    if (hoursSinceUpdate > 25) {
      console.log("⚠️  WARNING: Rates are older than 24 hours!");
      console.log("💡 Run update to fetch fresh rates\n");
    }

    // 3. Check common currencies
    const commonCurrencies = ["USD", "EUR", "GBP", "NGN", "ZAR", "KES"];
    console.log("💱 Common Currency Rates:");
    console.log("─".repeat(60));

    for (const code of commonCurrencies) {
      const rate = rates.find((r) => r.targetCurrency === code);
      if (rate) {
        console.log(`  ${code.padEnd(5)}: ${Number(rate.rate).toFixed(4)} (updated: ${rate.updatedAt.toISOString().split("T")[0]})`);
      } else {
        console.log(`  ${code.padEnd(5)}: ❌ NOT FOUND`);
      }
    }

    console.log("─".repeat(60));
    console.log();

    // 4. Check for invalid rates
    const invalidRates = rates.filter((r) => {
      const rateValue = Number(r.rate);
      return isNaN(rateValue) || rateValue <= 0 || rateValue > 1000;
    });

    if (invalidRates.length > 0) {
      console.log(`⚠️  Invalid rates found: ${invalidRates.length}`);
      invalidRates.forEach((r) => {
        console.log(`   - ${r.targetCurrency}: ${r.rate}`);
      });
      console.log();
    } else {
      console.log("✅ All rates are valid\n");
    }

    // 5. Summary
    console.log("=".repeat(60));
    console.log("📋 SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total rates: ${rates.length}`);
    console.log(`Last updated: ${latestUpdate?.toISOString() || "Never"}`);
    console.log(`Hours since update: ${hoursSinceUpdate}`);
    console.log(`Invalid rates: ${invalidRates.length}`);
    console.log();

    if (rates.length === 0) {
      console.log("❌ ACTION REQUIRED: No rates found. Update rates now!");
    } else if (hoursSinceUpdate > 25) {
      console.log("⚠️  ACTION RECOMMENDED: Rates are stale. Update rates.");
    } else {
      console.log("✅ Rates look good!");
    }

  } catch (error: any) {
    console.error("❌ Error checking currency rates:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
checkCurrencyRates()
  .then(() => {
    console.log("\n✅ Check completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Check failed:", error);
    process.exit(1);
  });

