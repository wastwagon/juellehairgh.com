/**
 * Script to fix currency rates - fetches and stores rates
 * 
 * This script:
 * 1. Fetches rates from free API (exchangerate-api.com)
 * 2. Stores rates in database
 * 3. Verifies rates were stored correctly
 * 
 * Usage:
 *   ts-node backend/scripts/fix-currency-rates.ts
 */

import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { ALL_CURRENCIES } from "../src/currency/currencies.data";

const prisma = new PrismaClient();
const baseCurrency = "GHS";

async function fixCurrencyRates() {
  console.log("🔄 Fixing Currency Rates...\n");

  try {
    // 1. Fetch rates from free API
    console.log("📡 Fetching rates from exchangerate-api.com...");
    const apiUrl = `https://v6.exchangerate-api.com/v6/latest/${baseCurrency}`;
    
    const response = await axios.get(apiUrl, {
      timeout: 30000,
      headers: {
        "User-Agent": "JuelleHair-Ecommerce/1.0",
      },
    });

    if (!response.data || !response.data.rates) {
      throw new Error("Invalid API response: rates not found");
    }

    const rates = response.data.rates;
    const conversionDate = response.data.date || new Date().toISOString().split("T")[0];
    
    console.log(`✅ Received rates for ${Object.keys(rates).length} currencies`);
    console.log(`📅 Conversion date: ${conversionDate}\n`);

    // 2. Get supported currency codes
    const supportedCurrencyCodes = ALL_CURRENCIES.map((c) => c.code);
    console.log(`💱 Supported currencies: ${supportedCurrencyCodes.length}\n`);

    // 3. Store rates
    let updatedCount = 0;
    let createdCount = 0;
    let errorCount = 0;

    console.log("💾 Storing rates in database...\n");

    for (const [currencyCode, rate] of Object.entries(rates)) {
      if (supportedCurrencyCodes.includes(currencyCode) && typeof rate === "number") {
        try {
          const result = await prisma.currencyRate.upsert({
            where: {
              baseCurrency_targetCurrency: {
                baseCurrency: baseCurrency,
                targetCurrency: currencyCode,
              },
            },
            update: {
              rate: rate as number,
            },
            create: {
              baseCurrency: baseCurrency,
              targetCurrency: currencyCode,
              rate: rate as number,
            },
          });

          // Check if it was created or updated
          const existing = await prisma.currencyRate.findUnique({
            where: {
              baseCurrency_targetCurrency: {
                baseCurrency: baseCurrency,
                targetCurrency: currencyCode,
              },
            },
          });

          if (existing) {
            const now = new Date();
            const updatedAt = existing.updatedAt;
            // If updated within last second, consider it created
            if (Math.abs(now.getTime() - updatedAt.getTime()) < 1000) {
              createdCount++;
            } else {
              updatedCount++;
            }
          }
        } catch (error: any) {
          console.error(`   ❌ Error storing ${currencyCode}:`, error.message);
          errorCount++;
        }
      }
    }

    // 4. Verify stored rates
    console.log("\n🔍 Verifying stored rates...");
    const storedRates = await prisma.currencyRate.findMany({
      where: {
        baseCurrency: baseCurrency,
      },
    });

    console.log(`✅ Stored rates: ${storedRates.length}`);
    console.log(`   Created: ${createdCount}`);
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   Errors: ${errorCount}\n`);

    // 5. Show sample rates
    const commonCurrencies = ["USD", "EUR", "GBP", "NGN", "ZAR", "KES"];
    console.log("💱 Sample Rates:");
    console.log("─".repeat(60));
    for (const code of commonCurrencies) {
      const stored = storedRates.find((r) => r.targetCurrency === code);
      if (stored) {
        console.log(`  ${code.padEnd(5)}: ${Number(stored.rate).toFixed(4)}`);
      }
    }
    console.log("─".repeat(60));
    console.log();

    // 6. Summary
    console.log("=".repeat(60));
    console.log("📋 SUMMARY");
    console.log("=".repeat(60));
    console.log(`✅ Rates fetched successfully`);
    console.log(`📅 Conversion date: ${conversionDate}`);
    console.log(`💾 Total rates stored: ${storedRates.length}`);
    console.log(`   Created: ${createdCount}`);
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log();

    if (storedRates.length === 0) {
      console.log("❌ WARNING: No rates were stored!");
    } else {
      console.log("✅ Currency rates fixed successfully!");
      console.log("💡 Frontend should now be able to fetch rates from /api/currency/rates");
    }

  } catch (error: any) {
    console.error("❌ Error fixing currency rates:", error);
    if (error.response) {
      console.error("API Response:", error.response.status, error.response.data);
    }
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixCurrencyRates()
  .then(() => {
    console.log("\n✅ Fix completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Fix failed:", error);
    process.exit(1);
  });

