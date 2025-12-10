import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

/**
 * Categorizes products based on product name keywords
 * Creates categories if they don't exist and assigns products to them
 */
interface CategoryMapping {
  keywords: string[];
  categoryName: string;
  categorySlug: string;
  parentSlug?: string;
}

// Category mappings based on product name keywords
const categoryMappings: CategoryMapping[] = [
  {
    keywords: ["wig", "wigs", "lace", "hd lace", "glueless", "synthetic wig", "human hair wig"],
    categoryName: "Lace Wigs",
    categorySlug: "lace-wigs",
  },
  {
    keywords: ["braid", "braids", "crochet", "twist", "afro", "kinky", "boho"],
    categoryName: "Braids",
    categorySlug: "braids",
  },
  {
    keywords: ["ponytail", "ponytails", "drawstring"],
    categoryName: "Ponytails",
    categorySlug: "ponytails",
  },
  {
    keywords: ["clip", "clip-in", "clip ins", "extension"],
    categoryName: "Clip-ins",
    categorySlug: "clip-ins",
  },
  {
    keywords: ["oil", "spray", "conditioner", "serum", "detangler", "leave-in", "hair care", "hair growth"],
    categoryName: "Hair Care",
    categorySlug: "wig-care",
  },
  {
    keywords: ["half wig", "updo"],
    categoryName: "Half Wigs",
    categorySlug: "half-wigs",
  },
];

async function categorizeProducts() {
  console.log("🏷️  Starting product categorization...");

  try {
    // Get all products
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
    });

    console.log(`📦 Found ${products.length} products to categorize`);

    // Create category map
    const categoryMap = new Map<string, { id: string; name: string; slug: string }>();

    // Ensure all categories exist
    for (const mapping of categoryMappings) {
      let category = await prisma.category.findFirst({
        where: { slug: mapping.categorySlug },
      });

      if (!category) {
        // Check if parent exists
        let parentId: string | undefined;
        if (mapping.parentSlug) {
          const parent = await prisma.category.findFirst({
            where: { slug: mapping.parentSlug },
          });
          parentId = parent?.id;
        }

        category = await prisma.category.create({
          data: {
            name: mapping.categoryName,
            slug: mapping.categorySlug,
            parentId,
          },
        });
        console.log(`✅ Created category: ${category.name}`);
      }

      categoryMap.set(mapping.categorySlug, {
        id: category.id,
        name: category.name,
        slug: category.slug,
      });
    }

    // Categorize products
    let categorized = 0;
    let skipped = 0;
    let errors = 0;

    for (const product of products) {
      try {
        // Skip if already in a proper category (not "Wigs" default)
        if (product.category && product.category.slug !== "wigs") {
          console.log(`⏭️  Skipping ${product.title} - already in category: ${product.category.name}`);
          skipped++;
          continue;
        }

        // Find matching category based on product name
        const productNameLower = product.title.toLowerCase();
        let matchedCategory: { id: string; name: string; slug: string } | null = null;

        for (const mapping of categoryMappings) {
          const hasKeyword = mapping.keywords.some((keyword) =>
            productNameLower.includes(keyword.toLowerCase())
          );

          if (hasKeyword) {
            matchedCategory = categoryMap.get(mapping.categorySlug)!;
            break; // Use first match
          }
        }

        // If no match found, check if it's a general hair product
        if (!matchedCategory) {
          // Default to "Shop All" or keep in "Wigs" if it's wig-related
          if (productNameLower.includes("wig")) {
            matchedCategory = categoryMap.get("lace-wigs")!;
          } else {
            // Create or get "Shop All" category
            let shopAll = await prisma.category.findFirst({
              where: { slug: "shop-all" },
            });

            if (!shopAll) {
              shopAll = await prisma.category.create({
                data: {
                  name: "Shop All",
                  slug: "shop-all",
                  description: "All products",
                },
              });
              console.log(`✅ Created category: Shop All`);
            }

            matchedCategory = {
              id: shopAll.id,
              name: shopAll.name,
              slug: shopAll.slug,
            };
          }
        }

        // Update product category
        await prisma.product.update({
          where: { id: product.id },
          data: {
            categoryId: matchedCategory.id,
          },
        });

        console.log(`✅ Categorized: ${product.title} → ${matchedCategory.name}`);
        categorized++;
      } catch (error: any) {
        console.error(`❌ Error categorizing ${product.title}:`, error.message);
        errors++;
      }
    }

    console.log("\n🎉 Categorization completed!");
    console.log(`✅ Categorized: ${categorized} products`);
    console.log(`⏭️  Skipped: ${skipped} products`);
    console.log(`❌ Errors: ${errors} products`);

    // Print category summary
    console.log("\n📊 Category Summary:");
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    for (const cat of categories) {
      console.log(`  ${cat.name}: ${cat._count.products} products`);
    }
  } catch (error) {
    console.error("❌ Error categorizing products:", error);
    throw error;
  }
}

async function main() {
  try {
    await categorizeProducts();
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
