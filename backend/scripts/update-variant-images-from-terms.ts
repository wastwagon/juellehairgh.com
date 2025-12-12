/**
 * Update product variant images from ProductAttributeTerm images
 * This ensures color swatches show correctly on the frontend
 * 
 * Usage:
 *   ts-node backend/scripts/update-variant-images-from-terms.ts [productId]
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateVariantImages(productId?: string) {
  console.log("🔄 Updating Variant Images from Attribute Terms...\n");

  try {
    await prisma.$connect();
    console.log("✅ Connected to database\n");

    // Get Color attribute with all terms
    const colorAttribute = await prisma.productAttribute.findFirst({
      where: {
        name: { equals: "Color", mode: "insensitive" },
      },
      include: {
        terms: true,
      },
    });

    if (!colorAttribute) {
      console.error("❌ Color attribute not found");
      process.exit(1);
    }

    console.log(`🎨 Found Color attribute with ${colorAttribute.terms.length} terms\n`);

    // Create a map of term names to images
    const termImageMap = new Map<string, string | null>();
    colorAttribute.terms.forEach((term) => {
      termImageMap.set(term.name.toLowerCase(), term.image);
    });

    // Get all Color variants (optionally filtered by productId)
    const whereClause: any = {
      name: { equals: "Color", mode: "insensitive" },
    };
    if (productId) {
      whereClause.productId = productId;
    }

    const variants = await prisma.productVariant.findMany({
      where: whereClause,
      include: {
        product: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    console.log(`📦 Found ${variants.length} Color variants${productId ? ` for product ${productId}` : ""}\n`);

    let updated = 0;
    let skipped = 0;

    for (const variant of variants) {
      const variantValueLower = variant.value.toLowerCase();
      const termImage = termImageMap.get(variantValueLower);

      // Try exact match first
      if (termImage && termImage !== variant.image) {
        await prisma.productVariant.update({
          where: { id: variant.id },
          data: { image: termImage },
        });
        updated++;
        console.log(`   ✅ Updated: ${variant.product.title} - ${variant.value} → ${termImage.split('/').pop()}`);
      } else if (!termImage) {
        // Try partial match (for codes like "2T1B30", "S1B/33", etc.)
        let foundImage: string | null = null;
        for (const [termName, image] of termImageMap.entries()) {
          if (variantValueLower.includes(termName) || termName.includes(variantValueLower)) {
            foundImage = image;
            break;
          }
        }

        if (foundImage && foundImage !== variant.image) {
          await prisma.productVariant.update({
            where: { id: variant.id },
            data: { image: foundImage },
          });
          updated++;
          console.log(`   ✅ Updated (partial match): ${variant.product.title} - ${variant.value} → ${foundImage.split('/').pop()}`);
        } else {
          skipped++;
          console.log(`   ⏭️  Skipped: ${variant.product.title} - ${variant.value} (no matching term image)`);
        }
      } else {
        skipped++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Updated: ${updated} variants`);
    console.log(`   ⏭️  Skipped: ${skipped} variants`);
    console.log(`   📦 Total: ${variants.length} variants processed\n`);

    console.log("🎉 Variant images update complete!\n");

  } catch (error: any) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const productId = process.argv[2];
updateVariantImages(productId)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });

