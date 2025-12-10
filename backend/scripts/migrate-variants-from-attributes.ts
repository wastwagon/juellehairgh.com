import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Migrate variants from ProductAttribute to ProductVariant
 * This script creates ProductVariant records from existing ProductAttribute data
 */
async function migrateVariantsFromAttributes() {
  console.log("🔄 Migrating Variants from Attributes...\n");

  try {
    // 1. Get all products with attributes
    const productsWithAttributes = await prisma.product.findMany({
      where: {
        attributes: {
          some: {},
        },
      },
      include: {
        attributes: {
          include: {
            attribute: {
              include: {
                terms: true,
              },
            },
          },
        },
        variants: true,
      },
    });

    console.log(`📊 Found ${productsWithAttributes.length} products with attributes`);

    if (productsWithAttributes.length === 0) {
      console.log("⚠️  No products with attributes found.");
      console.log("💡 Make sure products have ProductAttribute records linked to Attribute and AttributeTerm");
      return;
    }

    let totalVariantsCreated = 0;
    let productsUpdated = 0;

    for (const product of productsWithAttributes) {
      // Skip if product already has variants
      if (product.variants.length > 0) {
        console.log(`⏭️  Skipping ${product.title} - already has ${product.variants.length} variants`);
        continue;
      }

      // Group attributes by attribute name
      const attributeGroups = new Map<string, Array<{ termId: string; termName: string }>>();

      product.attributes.forEach((pa) => {
        const attrName = pa.attribute.name;
        if (!attributeGroups.has(attrName)) {
          attributeGroups.set(attrName, []);
        }
        // Find the term
        const term = pa.attribute.terms.find((t) => t.id === pa.termId);
        if (term) {
          attributeGroups.get(attrName)!.push({
            termId: term.id,
            termName: term.name,
          });
        }
      });

      if (attributeGroups.size === 0) {
        console.log(`⚠️  Skipping ${product.title} - no valid attribute terms found`);
        continue;
      }

      // Generate all combinations of attributes
      const attributeNames = Array.from(attributeGroups.keys());
      const attributeValues = Array.from(attributeGroups.values());

      // Create cartesian product of all attribute combinations
      function cartesianProduct<T>(arrays: T[][]): T[][] {
        if (arrays.length === 0) return [[]];
        if (arrays.length === 1) return arrays[0].map((x) => [x]);
        const [first, ...rest] = arrays;
        const restProduct = cartesianProduct(rest);
        return first.flatMap((x) => restProduct.map((y) => [x, ...y]));
      }

      const combinations = cartesianProduct(attributeValues);

      // Create variants for each combination
      const variantsToCreate = combinations.map((combo, index) => {
        // Build variant name and value from combination
        const variantParts: string[] = [];
        const variantValues: string[] = [];

        combo.forEach((item, idx) => {
          const attrName = attributeNames[idx];
          variantParts.push(attrName);
          variantValues.push(item.termName);
        });

        const variantName = variantParts.join(" / ");
        const variantValue = variantValues.join(" / ");

        // Find term image if available (for color swatches)
        let variantImage: string | null = null;
        const firstTermId = combo[0]?.termId;
        if (firstTermId) {
          const term = await prisma.attributeTerm.findUnique({
            where: { id: firstTermId },
            select: { image: true },
          });
          if (term?.image) {
            variantImage = term.image;
          }
        }

        return {
          productId: product.id,
          name: variantName,
          value: variantValue,
          image: variantImage,
          priceGhs: product.priceGhs, // Use product base price
          stock: product.stock || 0, // Use product stock
          sku: product.sku ? `${product.sku}-${index + 1}` : null,
        };
      });

      // Create variants
      for (const variantData of variantsToCreate) {
        try {
          await prisma.productVariant.create({
            data: variantData,
          });
          totalVariantsCreated++;
        } catch (error: any) {
          console.error(`❌ Error creating variant for ${product.title}:`, error.message);
        }
      }

      productsUpdated++;
      console.log(`✅ Created ${variantsToCreate.length} variants for: ${product.title}`);
    }

    console.log("\n📊 Migration Summary:");
    console.log(`  Products processed: ${productsUpdated}`);
    console.log(`  Total variants created: ${totalVariantsCreated}`);

    if (totalVariantsCreated === 0) {
      console.log("\n⚠️  No variants were created.");
      console.log("💡 Possible reasons:");
      console.log("   1. Products already have variants");
      console.log("   2. Products don't have ProductAttribute records");
      console.log("   3. Attribute terms are missing");
      console.log("\n💡 Alternative: Create variants manually via admin panel");
    } else {
      console.log("\n✅ Variants migration completed successfully!");
    }
  } catch (error) {
    console.error("❌ Error migrating variants:", error);
    throw error;
  }
}

async function main() {
  try {
    await migrateVariantsFromAttributes();
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
