import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Fix existing product variations to ensure they work correctly
 * - Ensures color swatch images are linked to ProductAttributeTerm
 * - Verifies variants have proper structure
 * - Updates variant images from ProductAttributeTerm if needed
 * - Does NOT create new variants - only fixes existing ones
 */
async function fixExistingVariations() {
  console.log("🔧 Fixing Existing Product Variations...\n");

  try {
    // 1. Get all products with variants
    const productsWithVariants = await prisma.product.findMany({
      where: {
        isActive: true,
        variants: {
          some: {},
        },
      },
      include: {
        variants: true,
      },
    });

    console.log(`📊 Found ${productsWithVariants.length} products with existing variants`);

    if (productsWithVariants.length === 0) {
      console.log("✅ No products with variants found. Nothing to fix.");
      return;
    }

    // 2. Get Color attribute and terms
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

    if (!colorAttribute) {
      console.log("⚠️  Color attribute not found. Run: npm run setup:attributes");
      return;
    }

    console.log(`📊 Color attribute: ${colorAttribute.terms.length} terms`);

    // 3. Extract color swatch images from existing variants
    console.log("\n🔍 Step 1: Extracting color swatch images from existing variants...");
    const colorVariants = productsWithVariants.flatMap(p => 
      p.variants.filter(v => 
        v.name.toLowerCase().includes("color") && v.image
      )
    );

    const colorImageMap = new Map<string, { image: string; count: number }>();
    colorVariants.forEach((v) => {
      if (v.value && v.image) {
        const key = v.value.toLowerCase().trim();
        const existing = colorImageMap.get(key);
        if (!existing) {
          colorImageMap.set(key, { image: v.image, count: 1 });
        } else {
          existing.count++;
        }
      }
    });

    console.log(`   Found ${colorImageMap.size} unique color swatch images from variants`);

    // 4. Match color swatch images to ProductAttributeTerm records
    console.log("\n🔍 Step 2: Linking color swatch images to attribute terms...");
    let colorTermsUpdated = 0;
    const colorKeywords = [
      "black", "brown", "blonde", "red", "blue", "green", "purple",
      "caramel", "honey", "mocha", "auburn", "hazelnut", "chocolate",
      "sand", "gold", "copper", "burgundy", "off black", "natural black",
      "light brown", "dark brown", "triple tone", "balayage", "flamboyage",
      "1b", "2", "27", "nblk", "nbrn", "s1b", "t530", "tcopper"
    ];

    for (const term of colorAttribute.terms) {
      // Skip if already has image
      if (term.image) {
        continue;
      }

      const termNameLower = term.name.toLowerCase().trim();
      let imageUrl: string | null = null;

      // Try exact match first
      if (colorImageMap.has(termNameLower)) {
        imageUrl = colorImageMap.get(termNameLower)!.image;
      } else {
        // Try partial match
        for (const [variantColor, data] of colorImageMap.entries()) {
          if (
            termNameLower.includes(variantColor) ||
            variantColor.includes(termNameLower)
          ) {
            imageUrl = data.image;
            break;
          }
        }
      }

      // Try word-by-word matching
      if (!imageUrl) {
        const words = termNameLower.split(/[\s\/-]+/);
        for (const word of words) {
          if (word.length > 2 && colorImageMap.has(word)) {
            imageUrl = colorImageMap.get(word)!.image;
            break;
          }
        }
      }

      // Try keyword matching
      if (!imageUrl) {
        for (const keyword of colorKeywords) {
          if (termNameLower.includes(keyword) && colorImageMap.has(keyword)) {
            imageUrl = colorImageMap.get(keyword)!.image;
            break;
          }
        }
      }

      if (imageUrl) {
        try {
          await prisma.productAttributeTerm.update({
            where: { id: term.id },
            data: { image: imageUrl },
          });
          colorTermsUpdated++;
          console.log(`   ✅ Linked swatch image for: ${term.name}`);
        } catch (error) {
          console.error(`   ❌ Error updating term "${term.name}":`, error);
        }
      }
    }

    console.log(`\n✅ Updated ${colorTermsUpdated} color terms with swatch images`);

    // 5. Update variant images from ProductAttributeTerm if variant image is missing
    console.log("\n🔍 Step 3: Updating variant images from attribute terms...");
    let variantsUpdated = 0;

    // Create term image map
    const termImageMap = new Map<string, string | null>();
    colorAttribute.terms.forEach((term) => {
      termImageMap.set(term.name.toLowerCase(), term.image);
    });

    for (const product of productsWithVariants) {
      for (const variant of product.variants) {
        // Only update Color variants that don't have images
        if (variant.name.toLowerCase().includes("color") && !variant.image) {
          const termImage = termImageMap.get(variant.value.toLowerCase());
          if (termImage) {
            try {
              await prisma.productVariant.update({
                where: { id: variant.id },
                data: { image: termImage },
              });
              variantsUpdated++;
            } catch (error) {
              console.error(`   ❌ Error updating variant "${variant.value}":`, error);
            }
          }
        }
      }
    }

    console.log(`\n✅ Updated ${variantsUpdated} variants with swatch images`);

    // 6. Verify variants structure
    console.log("\n🔍 Step 4: Verifying variants structure...");
    let validVariants = 0;
    let invalidVariants = 0;

    for (const product of productsWithVariants) {
      for (const variant of product.variants) {
        if (variant.name && variant.value) {
          validVariants++;
        } else {
          invalidVariants++;
          console.log(`   ⚠️  Invalid variant found: Product "${product.title}", Variant ID: ${variant.id}`);
        }
      }
    }

    // 7. Summary
    const totalVariants = productsWithVariants.reduce((sum, p) => sum + p.variants.length, 0);
    const colorVariantsCount = productsWithVariants.reduce((sum, p) => 
      sum + p.variants.filter(v => v.name.toLowerCase().includes("color")).length, 0
    );
    const lengthVariantsCount = productsWithVariants.reduce((sum, p) => 
      sum + p.variants.filter(v => v.name.toLowerCase().includes("length")).length, 0
    );

    console.log("\n📊 Summary:");
    console.log(`   Products with variants: ${productsWithVariants.length}`);
    console.log(`   Total variants: ${totalVariants}`);
    console.log(`   Color variants: ${colorVariantsCount}`);
    console.log(`   Length variants: ${lengthVariantsCount}`);
    console.log(`   Valid variants: ${validVariants}`);
    console.log(`   Invalid variants: ${invalidVariants}`);
    console.log(`   Color terms updated with images: ${colorTermsUpdated}`);
    console.log(`   Variants updated with images: ${variantsUpdated}`);

    console.log("\n✅ Existing variations fixed!");
    console.log("\n💡 Next steps:");
    console.log("   1. Verify variants on frontend");
    console.log("   2. Check color swatches display correctly");
    console.log("   3. Upload missing swatch images via admin panel if needed");

  } catch (error) {
    console.error("❌ Error fixing variations:", error);
    throw error;
  }
}

async function main() {
  try {
    await fixExistingVariations();
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
