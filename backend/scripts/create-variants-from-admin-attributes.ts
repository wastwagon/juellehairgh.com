import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Create variants for products based on admin-defined attributes
 * This script uses the same logic as the admin panel's generateVariationsFromAttributes
 * 
 * For each product, it will:
 * 1. Check if product already has variants (skip if yes)
 * 2. Look for common attribute patterns in product title/description
 * 3. Generate variants from Color and Length attributes if they exist
 */
async function createVariantsFromAdminAttributes() {
  console.log("🔄 Creating Variants from Admin Attributes...\n");

  try {
    // 1. Get all attributes and their terms
    const colorAttribute = await prisma.productAttribute.findFirst({
      where: {
        OR: [
          { name: { equals: "Color", mode: "insensitive" } },
          { slug: { equals: "color" } },
        ],
      },
      include: {
        terms: true,
      },
    });

    const lengthAttribute = await prisma.productAttribute.findFirst({
      where: {
        OR: [
          { name: { equals: "Length", mode: "insensitive" } },
          { slug: { equals: "length" } },
        ],
      },
      include: {
        terms: true,
      },
    });

    if (!colorAttribute && !lengthAttribute) {
      console.log("⚠️  No Color or Length attributes found.");
      console.log("💡 Please create attributes via admin panel first:");
      console.log("   /admin/attributes");
      return;
    }

    console.log(`📊 Found attributes:`);
    if (colorAttribute) {
      console.log(`   Color: ${colorAttribute.terms.length} terms`);
    }
    if (lengthAttribute) {
      console.log(`   Length: ${lengthAttribute.terms.length} terms`);
    }

    // 2. Get all products without variants
    const productsWithoutVariants = await prisma.product.findMany({
      where: {
        isActive: true,
        variants: {
          none: {},
        },
      },
      include: {
        variants: true,
      },
      take: 100, // Limit to avoid overwhelming
    });

    console.log(`\n📦 Found ${productsWithoutVariants.length} products without variants`);

    if (productsWithoutVariants.length === 0) {
      console.log("✅ All products already have variants!");
      return;
    }

    let totalVariantsCreated = 0;
    let productsUpdated = 0;

    // 3. For each product, generate variants based on available attributes
    for (const product of productsWithoutVariants) {
      const attributesToUse: Array<{ name: string; terms: Array<{ id: string; name: string; image?: string }> }> = [];

      // Add Color attribute if available
      if (colorAttribute && colorAttribute.terms.length > 0) {
        // Check if product title suggests it has colors
        const titleLower = product.title.toLowerCase();
        const hasColorHint = titleLower.includes("color") || 
                           titleLower.includes("colour") ||
                           titleLower.includes("black") ||
                           titleLower.includes("brown") ||
                           titleLower.includes("blonde") ||
                           titleLower.includes("red");

        // For now, add color to all products (you can make this smarter)
        attributesToUse.push({
          name: colorAttribute.name,
          terms: colorAttribute.terms.map(t => ({
            id: t.id,
            name: t.name,
            image: t.image || undefined,
          })),
        });
      }

      // Add Length attribute if available and product title suggests lengths
      if (lengthAttribute && lengthAttribute.terms.length > 0) {
        const titleLower = product.title.toLowerCase();
        const hasLengthHint = titleLower.includes("inch") ||
                             titleLower.includes("length") ||
                             /\d+\s*(inch|in)/i.test(product.title);

        if (hasLengthHint) {
          attributesToUse.push({
            name: lengthAttribute.name,
            terms: lengthAttribute.terms.map(t => ({
              id: t.id,
              name: t.name,
              image: t.image || undefined,
            })),
          });
        }
      }

      // Skip if no attributes to use
      if (attributesToUse.length === 0) {
        continue;
      }

      // 4. Generate all combinations (Cartesian product)
      function generateCombinations(attributes: typeof attributesToUse): Array<Array<{ name: string; term: { id: string; name: string; image?: string } }>> {
        if (attributes.length === 0) return [];
        if (attributes.length === 1) {
          return attributes[0].terms.map(term => [{ name: attributes[0].name, term }]);
        }

        const [first, ...rest] = attributes;
        const restCombinations = generateCombinations(rest);
        const combinations: Array<Array<{ name: string; term: { id: string; name: string; image?: string } }>> = [];

        for (const term of first.terms) {
          if (restCombinations.length === 0) {
            combinations.push([{ name: first.name, term }]);
          } else {
            for (const restCombo of restCombinations) {
              combinations.push([{ name: first.name, term }, ...restCombo]);
            }
          }
        }

        return combinations;
      }

      const combinations = generateCombinations(attributesToUse);

      // Limit combinations to avoid creating too many variants
      const maxVariants = 50;
      const limitedCombinations = combinations.slice(0, maxVariants);

      // 5. Create variants for each combination
      for (const combo of limitedCombinations) {
        // Build variant name and value
        const variantParts: string[] = [];
        const variantValues: string[] = [];
        let variantImage: string | null = null;

        combo.forEach((item) => {
          variantParts.push(item.name);
          variantValues.push(item.term.name);
          // Use first term's image as variant image (usually color swatch)
          if (!variantImage && item.term.image) {
            variantImage = item.term.image;
          }
        });

        const variantName = variantParts.join(" / ");
        const variantValue = variantValues.join(" / ");

        try {
          await prisma.productVariant.create({
            data: {
              productId: product.id,
              name: variantName,
              value: variantValue,
              image: variantImage,
              priceGhs: product.priceGhs, // Use product base price
              stock: product.stock || 0, // Use product stock
              sku: product.sku ? `${product.sku}-${combo.map(c => c.term.name.replace(/\s+/g, '-')).join('-')}` : null,
            },
          });
          totalVariantsCreated++;
        } catch (error: any) {
          // Skip if variant already exists (duplicate check)
          if (!error.message?.includes("Unique constraint")) {
            console.error(`❌ Error creating variant for ${product.title}:`, error.message);
          }
        }
      }

      productsUpdated++;
      console.log(`✅ Created ${limitedCombinations.length} variants for: ${product.title}`);
    }

    console.log("\n📊 Summary:");
    console.log(`  Products processed: ${productsUpdated}`);
    console.log(`  Total variants created: ${totalVariantsCreated}`);

    if (totalVariantsCreated === 0) {
      console.log("\n⚠️  No variants were created.");
      console.log("💡 Possible reasons:");
      console.log("   1. Products already have variants");
      console.log("   2. No Color or Length attributes found");
      console.log("   3. Product titles don't match attribute patterns");
      console.log("\n💡 Alternative: Create variants manually via admin panel");
      console.log("   Go to /admin/products and edit each product");
    } else {
      console.log("\n✅ Variants creation completed successfully!");
      console.log("\n💡 Note: This script creates variants for all products.");
      console.log("   You may want to review and adjust variants via admin panel:");
      console.log("   /admin/products");
    }
  } catch (error) {
    console.error("❌ Error creating variants:", error);
    throw error;
  }
}

async function main() {
  try {
    await createVariantsFromAdminAttributes();
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
