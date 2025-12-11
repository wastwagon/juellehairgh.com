import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Match products to their color and length variations based on:
 * 1. Existing ProductVariant records (if any)
 * 2. Product title/description patterns
 * 3. ProductAttributeTerm records with images
 * 
 * This script:
 * - Extracts color swatch images from existing variants
 * - Matches them to ProductAttributeTerm records
 * - Creates variants for products based on their data
 */
async function matchProductsToVariations() {
  console.log("🔄 Matching Products to Variations...\n");

  try {
    // 1. Get Color and Length attributes
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

    if (!colorAttribute) {
      console.log("⚠️  Color attribute not found. Run: npm run setup:attributes");
      return;
    }

    console.log(`📊 Found attributes:`);
    console.log(`   Color: ${colorAttribute.terms.length} terms`);
    if (lengthAttribute) {
      console.log(`   Length: ${lengthAttribute.terms.length} terms`);
    }

    // 2. Extract color swatch images from existing variants
    console.log("\n🔍 Step 1: Extracting color swatch images from existing variants...");
    const variantsWithImages = await prisma.productVariant.findMany({
      where: {
        image: { not: null },
        name: { contains: "color", mode: "insensitive" },
      },
      select: {
        value: true,
        image: true,
      },
    });

    const colorImageMap = new Map<string, { image: string; count: number }>();
    variantsWithImages.forEach((v) => {
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

    console.log(`   Found ${colorImageMap.size} unique color images from variants`);

    // 3. Match color swatch images to ProductAttributeTerm records
    console.log("\n🔍 Step 2: Matching color swatch images to attribute terms...");
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
          console.log(`   ✅ Matched image for: ${term.name}`);
        } catch (error) {
          console.error(`   ❌ Error updating term "${term.name}":`, error);
        }
      }
    }

    console.log(`\n✅ Updated ${colorTermsUpdated} color terms with swatch images`);

    // 4. Get all products
    console.log("\n🔍 Step 3: Matching products to variations...");
    const allProducts = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      include: {
        variants: true,
      },
    });

    console.log(`   Found ${allProducts.length} active products`);

    // 5. For each product, determine which variations it should have
    let productsWithVariants = 0;
    let productsWithoutVariants = 0;
    let variantsCreated = 0;

    for (const product of allProducts) {
      // Skip if already has variants
      if (product.variants.length > 0) {
        productsWithVariants++;
        continue;
      }

      productsWithoutVariants++;
      const attributesToUse: Array<{ name: string; terms: string[] }> = [];

      // Check for color variations
      const titleLower = product.title.toLowerCase();
      const descriptionLower = (product.description || "").toLowerCase();
      const combinedText = `${titleLower} ${descriptionLower}`;

      // Check if product mentions colors or has color-related keywords
      const hasColorMention = colorKeywords.some(keyword => 
        combinedText.includes(keyword)
      ) || titleLower.includes("color") || titleLower.includes("colour");

      if (hasColorMention && colorAttribute.terms.length > 0) {
        // Find matching color terms from product title/description
        const matchingColors: string[] = [];
        
        for (const term of colorAttribute.terms) {
          const termLower = term.name.toLowerCase();
          // Check if product mentions this color
          if (combinedText.includes(termLower) || 
              termLower.split(/[\s\/-]+/).some(word => 
                word.length > 2 && combinedText.includes(word)
              )) {
            matchingColors.push(term.name);
          }
        }

        // If no specific colors found, use common colors (first 5-10)
        if (matchingColors.length === 0 && hasColorMention) {
          // Use first 10 color terms as default
          const defaultColors = colorAttribute.terms
            .slice(0, 10)
            .map(t => t.name);
          attributesToUse.push({
            name: "Color",
            terms: defaultColors,
          });
        } else if (matchingColors.length > 0) {
          attributesToUse.push({
            name: "Color",
            terms: matchingColors,
          });
        }
      }

      // Check for length variations
      if (lengthAttribute && lengthAttribute.terms.length > 0) {
        const lengthPattern = /\b(\d+)\s*(inch|in|")\b/i;
        const lengthMatch = product.title.match(lengthPattern);
        
        if (lengthMatch || titleLower.includes("inch") || titleLower.includes("length")) {
          // Extract mentioned lengths
          const mentionedLengths: string[] = [];
          const lengthMatches = product.title.matchAll(/\b(\d+)\s*(inch|in|")\b/gi);
          
          for (const match of lengthMatches) {
            const inches = parseInt(match[1]);
            const lengthTerm = `${inches} inches`;
            if (lengthAttribute.terms.some(t => t.name === lengthTerm)) {
              mentionedLengths.push(lengthTerm);
            }
          }

          // If specific lengths found, use them; otherwise use all common lengths
          if (mentionedLengths.length > 0) {
            attributesToUse.push({
              name: "Length",
              terms: mentionedLengths,
            });
          } else if (titleLower.includes("inch") || titleLower.includes("length")) {
            // Use common lengths (12-30 inches)
            const commonLengths = lengthAttribute.terms
              .filter(t => {
                const match = t.name.match(/\b(\d+)\s*inch/i);
                if (match) {
                  const inches = parseInt(match[1]);
                  return inches >= 12 && inches <= 30;
                }
                return false;
              })
              .map(t => t.name);
            attributesToUse.push({
              name: "Length",
              terms: commonLengths.slice(0, 5), // Limit to 5 lengths
            });
          }
        }
      }

      // Create variants if attributes found
      if (attributesToUse.length > 0) {
        // Use the same logic as admin panel's generateVariationsFromAttributes
        for (const attr of attributesToUse) {
          const dbAttr = attr.name === "Color" ? colorAttribute : lengthAttribute;
          if (!dbAttr) continue;

          const termImageMap = new Map<string, string | null>();
          dbAttr.terms.forEach((term) => {
            termImageMap.set(term.name, term.image);
          });

          for (const termName of attr.terms) {
            const variantImage = termImageMap.get(termName) || null;
            
            // Check if variant already exists
            const existing = product.variants.find(
              (v) => v.name.toLowerCase() === attr.name.toLowerCase() && v.value === termName
            );

            if (!existing) {
              try {
                await prisma.productVariant.create({
                  data: {
                    productId: product.id,
                    name: dbAttr.name,
                    value: termName,
                    image: variantImage,
                    stock: product.stock || 0,
                  },
                });
                variantsCreated++;
              } catch (error) {
                console.error(`   ❌ Error creating variant for ${product.title}:`, error);
              }
            }
          }
        }
        
        if (variantsCreated > 0) {
          console.log(`   ✅ Created variants for: ${product.title}`);
        }
      }
    }

    // 6. Summary
    console.log("\n📊 Summary:");
    console.log(`   Products with variants: ${productsWithVariants}`);
    console.log(`   Products without variants: ${productsWithoutVariants}`);
    console.log(`   Color terms updated with images: ${colorTermsUpdated}`);
    console.log(`   New variants created: ${variantsCreated}`);

    console.log("\n✅ Product matching completed!");
    console.log("\n💡 Next steps:");
    console.log("   1. Review variants via admin panel: /admin/products");
    console.log("   2. Upload missing color swatch images: /admin/attributes");
    console.log("   3. Adjust variants as needed");

  } catch (error) {
    console.error("❌ Error matching products:", error);
    throw error;
  }
}

async function main() {
  try {
    await matchProductsToVariations();
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
