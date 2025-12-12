/**
 * Enhanced script to sync product variations with proper color swatch image handling
 * 
 * This script:
 * 1. Normalizes variant names (Option, PA Color -> Color)
 * 2. Ensures color swatch images from attribute terms are synced to variants
 * 3. Handles both combined (Color / Length) and separate variant formats
 * 4. Syncs variations from local to production
 * 
 * Usage:
 *   ts-node backend/scripts/sync-variations-with-images.ts
 * 
 * Environment Variables:
 *   DATABASE_URL - Local database URL (default: from .env)
 *   DATABASE_URL_PROD - Production database URL (optional, for direct sync)
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface VariationExport {
  productId: string;
  productSlug: string;
  productTitle: string;
  variants: Array<{
    name: string;
    value: string;
    priceGhs: number | null;
    compareAtPriceGhs: number | null;
    stock: number | null;
    sku: string | null;
    image: string | null;
    normalizedName: string; // Normalized name (Color, Length, etc.)
    normalizedValue: string; // Normalized value (extracted color if combined)
  }>;
}

// Normalize variant names (Option, PA Color -> Color)
function normalizeVariantName(name: string): string {
  const nameLower = name.toLowerCase();
  if (nameLower === "option" || 
      nameLower.includes("pa color") || 
      nameLower.includes("pa_color") || 
      nameLower.includes("pa-color")) {
    return "Color";
  }
  return name;
}

// Extract color value from combined variant value (e.g., "Black / 12 inches" -> "Black")
function extractColorValue(value: string, variantName: string): string {
  const normalizedName = normalizeVariantName(variantName);
  if (normalizedName === "Color" && value.includes(" / ")) {
    // Combined format: "Color / Length" -> extract color part
    const parts = value.split(" / ");
    return parts[0].trim();
  }
  return value;
}

// Get color swatch image from attribute terms
async function getColorSwatchImage(colorValue: string): Promise<string | null> {
  try {
    const colorAttribute = await prisma.productAttribute.findFirst({
      where: {
        name: { equals: "Color", mode: "insensitive" },
      },
      include: {
        terms: true,
      },
    });

    if (!colorAttribute) return null;

    // Try exact match first
    const exactMatch = colorAttribute.terms.find(
      (term) => term.name.toLowerCase() === colorValue.toLowerCase()
    );
    if (exactMatch?.image) return exactMatch.image;

    // Try partial match (for codes like "NBLK", "S1B/33", etc.)
    const partialMatch = colorAttribute.terms.find((term) => {
      const termLower = term.name.toLowerCase();
      const valueLower = colorValue.toLowerCase();
      return termLower.includes(valueLower) || valueLower.includes(termLower);
    });
    if (partialMatch?.image) return partialMatch.image;

    return null;
  } catch (error) {
    console.error(`Error getting color swatch for ${colorValue}:`, error);
    return null;
  }
}

async function syncVariationsWithImages() {
  console.log("🔄 Syncing Product Variations with Color Swatch Images...\n");

  try {
    // 1. Get all products with variants
    const productsWithVariants = await prisma.product.findMany({
      where: {
        variants: {
          some: {},
        },
      },
      include: {
        variants: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`📦 Found ${productsWithVariants.length} products with variations\n`);

    if (productsWithVariants.length === 0) {
      console.log("✅ No products with variations found. Nothing to sync.");
      return;
    }

    // 2. Get Color attribute with terms for image mapping
    const colorAttribute = await prisma.productAttribute.findFirst({
      where: {
        name: { equals: "Color", mode: "insensitive" },
      },
      include: {
        terms: true,
      },
    });

    const colorTermImageMap = new Map<string, string | null>();
    if (colorAttribute) {
      colorAttribute.terms.forEach((term) => {
        colorTermImageMap.set(term.name.toLowerCase(), term.image);
      });
      console.log(`🎨 Found ${colorAttribute.terms.length} color terms with images\n`);
    }

    // 3. Process and enhance variations with images
    const exportData: VariationExport[] = [];
    let imagesUpdated = 0;
    let variantsNormalized = 0;

    for (const product of productsWithVariants) {
      const enhancedVariants = await Promise.all(
        product.variants.map(async (variant) => {
          const normalizedName = normalizeVariantName(variant.name);
          const normalizedValue = extractColorValue(variant.value, variant.name);
          
          let image = variant.image;

          // If variant name is Color (or normalized to Color), try to get image from attribute terms
          if (normalizedName === "Color" && !image) {
            const swatchImage = await getColorSwatchImage(normalizedValue);
            if (swatchImage) {
              image = swatchImage;
              imagesUpdated++;
            }
          } else if (normalizedName === "Color" && image) {
            // Verify image exists, if not try to get from attribute terms
            // (In production, we'd check file existence, but for now just try to enhance)
            const swatchImage = await getColorSwatchImage(normalizedValue);
            if (swatchImage && swatchImage !== image) {
              // Prefer attribute term image if it exists
              image = swatchImage;
              imagesUpdated++;
            }
          }

          // Track if variant was normalized
          if (normalizedName !== variant.name) {
            variantsNormalized++;
          }

          return {
            name: normalizedName, // Use normalized name
            value: variant.value, // Keep original value for matching
            priceGhs: variant.priceGhs,
            compareAtPriceGhs: variant.compareAtPriceGhs,
            stock: variant.stock,
            sku: variant.sku,
            image: image,
            normalizedName: normalizedName,
            normalizedValue: normalizedValue,
          };
        })
      );

      exportData.push({
        productId: product.id,
        productSlug: product.slug,
        productTitle: product.title,
        variants: enhancedVariants,
      });
    }

    // 4. Save export to JSON file
    const exportPath = path.join(process.cwd(), "variations-export-enhanced.json");
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    console.log(`✅ Enhanced variations exported to: ${exportPath}\n`);

    // 5. Summary statistics
    const totalVariants = exportData.reduce((sum, p) => sum + p.variants.length, 0);
    const productsWithColorVariants = exportData.filter(
      (p) => p.variants.some((v) => v.normalizedName === "Color")
    ).length;
    const variantsWithImages = exportData.reduce(
      (sum, p) => sum + p.variants.filter((v) => v.image).length,
      0
    );

    console.log("📊 Export Summary:");
    console.log(`   Products with variations: ${productsWithVariants.length}`);
    console.log(`   Total variations: ${totalVariants}`);
    console.log(`   Products with Color variants: ${productsWithColorVariants}`);
    console.log(`   Variants with images: ${variantsWithImages}`);
    console.log(`   Images updated from attribute terms: ${imagesUpdated}`);
    console.log(`   Variants normalized: ${variantsNormalized}\n`);

    // 6. If DATABASE_URL_PROD is set, sync directly to production
    const prodDatabaseUrl = process.env.DATABASE_URL_PROD;
    if (prodDatabaseUrl) {
      console.log("🔄 Direct sync to production database enabled...\n");
      
      const prodPrisma = new PrismaClient({
        datasources: {
          db: {
            url: prodDatabaseUrl,
          },
        },
      });

      let syncedCount = 0;
      let createdCount = 0;
      let updatedCount = 0;
      let errorCount = 0;

      for (const productData of exportData) {
        try {
          // Find product in production by slug
          const prodProduct = await prodPrisma.product.findFirst({
            where: {
              slug: productData.productSlug,
            },
            include: {
              variants: true,
            },
          });

          if (!prodProduct) {
            console.log(`⚠️  Product not found in production: ${productData.productTitle} (${productData.productSlug})`);
            errorCount++;
            continue;
          }

          // Sync each variant
          for (const variantData of productData.variants) {
            // Check if variant already exists (match by normalized name and value)
            const existingVariant = prodProduct.variants.find(
              (v) => {
                const vNormalizedName = normalizeVariantName(v.name);
                return vNormalizedName === variantData.normalizedName && 
                       v.value === variantData.value;
              }
            );

            if (existingVariant) {
              // Update existing variant with normalized name and enhanced image
              await prodPrisma.productVariant.update({
                where: { id: existingVariant.id },
                data: {
                  name: variantData.normalizedName, // Update to normalized name
                  value: variantData.value,
                  priceGhs: variantData.priceGhs,
                  compareAtPriceGhs: variantData.compareAtPriceGhs,
                  stock: variantData.stock,
                  sku: variantData.sku,
                  image: variantData.image, // Enhanced image from attribute terms
                },
              });
              updatedCount++;
            } else {
              // Create new variant with normalized name
              await prodPrisma.productVariant.create({
                data: {
                  productId: prodProduct.id,
                  name: variantData.normalizedName, // Use normalized name
                  value: variantData.value,
                  priceGhs: variantData.priceGhs,
                  compareAtPriceGhs: variantData.compareAtPriceGhs,
                  stock: variantData.stock,
                  sku: variantData.sku,
                  image: variantData.image, // Enhanced image
                },
              });
              createdCount++;
            }
          }

          syncedCount++;
          console.log(`✅ Synced: ${productData.productTitle} (${productData.variants.length} variants)`);
        } catch (error: any) {
          console.error(`❌ Error syncing ${productData.productTitle}:`, error.message);
          errorCount++;
        }
      }

      console.log("\n📊 Sync Summary:");
      console.log(`   Products synced: ${syncedCount}`);
      console.log(`   Variants created: ${createdCount}`);
      console.log(`   Variants updated: ${updatedCount}`);
      console.log(`   Errors: ${errorCount}`);

      await prodPrisma.$disconnect();
    } else {
      console.log("💡 To sync directly to production, set DATABASE_URL_PROD environment variable");
      console.log("   Example: DATABASE_URL_PROD='postgresql://...' ts-node backend/scripts/sync-variations-with-images.ts\n");
    }

    console.log("✅ Sync completed!");
  } catch (error: any) {
    console.error("❌ Error syncing variations:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
syncVariationsWithImages()
  .then(() => {
    console.log("\n✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });

