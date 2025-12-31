/**
 * Generate ProductVariants from ProductAttributes for all products
 * This converts Color and Length attributes into variants so products show as variable
 * 
 * Usage: ts-node backend/scripts/generate-variants-from-attributes.ts
 */

import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function generateVariantsFromAttributes() {
  console.log("🔄 Generating ProductVariants from ProductAttributes...\n");

  try {
    // 1. Get Color and Length attributes
    const colorAttribute = await prisma.productAttribute.findFirst({
      where: { name: { equals: "Color", mode: "insensitive" } },
      include: { terms: true },
    });

    const lengthAttribute = await prisma.productAttribute.findFirst({
      where: { name: { equals: "Length", mode: "insensitive" } },
      include: { terms: true },
    });

    if (!colorAttribute && !lengthAttribute) {
      console.log("⚠️  No Color or Length attributes found!");
      return;
    }

    console.log(`✅ Found Color attribute: ${colorAttribute?.terms.length || 0} terms`);
    console.log(`✅ Found Length attribute: ${lengthAttribute?.terms.length || 0} terms\n`);

    // 2. Get all active products
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        variants: true,
      },
    });

    console.log(`📦 Found ${products.length} active products\n`);

    let totalCreated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    // 3. For each product, generate variants from attributes
    for (const product of products) {
      // Skip if product already has variants
      if (product.variants && product.variants.length > 0) {
        totalSkipped++;
        continue;
      }

      try {
        const variantsToCreate: Array<{
          name: string;
          value: string;
          priceGhs?: number;
          stock?: number;
          image?: string | null;
        }> = [];

        // Generate Color variants
        if (colorAttribute && colorAttribute.terms.length > 0) {
          for (const colorTerm of colorAttribute.terms) {
            variantsToCreate.push({
              name: "Color",
              value: colorTerm.name,
              priceGhs: Number(product.priceGhs),
              stock: product.stock || 0,
              image: colorTerm.image,
            });
          }
        }

        // Generate Length variants
        if (lengthAttribute && lengthAttribute.terms.length > 0) {
          for (const lengthTerm of lengthAttribute.terms) {
            variantsToCreate.push({
              name: "Length",
              value: lengthTerm.name,
              priceGhs: Number(product.priceGhs),
              stock: product.stock || 0,
              image: null,
            });
          }
        }

        // Create variants
        if (variantsToCreate.length > 0) {
          await prisma.productVariant.createMany({
            data: variantsToCreate.map((v) => ({
              productId: product.id,
              name: v.name,
              value: v.value,
              priceGhs: v.priceGhs,
              stock: v.stock,
              image: v.image,
            })),
          });

          totalCreated += variantsToCreate.length;
          console.log(`✅ ${product.title.substring(0, 40)}... - Created ${variantsToCreate.length} variants`);
        }
      } catch (error: any) {
        console.error(`❌ Error for ${product.title}:`, error.message);
        totalErrors++;
      }
    }

    // 4. Summary
    console.log("\n" + "=".repeat(60));
    console.log("📋 SUMMARY");
    console.log("=".repeat(60));
    console.log(`✅ Created: ${totalCreated} variants`);
    console.log(`⏭️  Skipped: ${totalSkipped} products (already have variants)`);
    console.log(`❌ Errors: ${totalErrors} products`);
    console.log(`📊 Total processed: ${products.length} products`);
    console.log("=".repeat(60));

    if (totalCreated > 0) {
      console.log("\n✅ Variants generated successfully!");
      console.log("💡 Products should now show as variable products with 'View Options' button");
    } else {
      console.log("\n💡 No variants needed to be created.");
    }
  } catch (error: any) {
    console.error("❌ Error generating variants:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the generation
generateVariantsFromAttributes()
  .then(() => {
    console.log("\n✅ Script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });

