/**
 * Script to check differences in variations and color swatches between local and production
 * 
 * This script:
 * 1. Checks products with missing variations
 * 2. Checks variants with missing color swatch images
 * 3. Checks variant name inconsistencies
 * 4. Reports differences that need to be synced
 * 
 * Usage:
 *   ts-node backend/scripts/check-variation-differences.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

async function checkVariationDifferences() {
  console.log("🔍 Checking Variation Differences...\n");

  try {
    // 1. Get Color attribute with terms
    const colorAttribute = await prisma.productAttribute.findFirst({
      where: {
        name: { equals: "Color", mode: "insensitive" },
      },
      include: {
        terms: true,
      },
    });

    if (!colorAttribute) {
      console.log("❌ Color attribute not found!");
      return;
    }

    console.log(`✅ Found Color attribute with ${colorAttribute.terms.length} terms\n`);

    // Create map of color values to images
    const colorTermImageMap = new Map<string, string | null>();
    colorAttribute.terms.forEach((term) => {
      colorTermImageMap.set(term.name.toLowerCase(), term.image);
    });

    const termsWithImages = Array.from(colorTermImageMap.values()).filter(img => img).length;
    console.log(`🎨 Color terms with images: ${termsWithImages}/${colorAttribute.terms.length}\n`);

    // 2. Get all products
    const allProducts = await prisma.product.findMany({
      include: {
        variants: true,
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`📦 Total products: ${allProducts.length}\n`);

    // 3. Check for issues
    const issues = {
      productsWithoutVariants: [] as any[],
      variantsWithWrongNames: [] as any[],
      colorVariantsWithoutImages: [] as any[],
      colorVariantsWithMissingSwatches: [] as any[],
      productsWithVariants: 0,
      totalVariants: 0,
    };

    for (const product of allProducts) {
      const hasVariants = product.variants.length > 0;
      
      if (hasVariants) {
        issues.productsWithVariants++;
        issues.totalVariants += product.variants.length;
      } else {
        // Check if product should have variants (has color in title or category suggests hair products)
        const titleLower = product.title.toLowerCase();
        const shouldHaveVariants = 
          titleLower.includes("hair") ||
          titleLower.includes("weave") ||
          titleLower.includes("extension") ||
          titleLower.includes("wig") ||
          product.category?.name?.toLowerCase().includes("hair");

        if (shouldHaveVariants) {
          issues.productsWithoutVariants.push({
            id: product.id,
            slug: product.slug,
            title: product.title,
            category: product.category?.name,
          });
        }
      }

      // Check variants for issues
      for (const variant of product.variants) {
        const normalizedName = normalizeVariantName(variant.name);
        
        // Check for wrong variant names
        if (normalizedName !== variant.name) {
          issues.variantsWithWrongNames.push({
            productId: product.id,
            productSlug: product.slug,
            productTitle: product.title,
            variantId: variant.id,
            currentName: variant.name,
            shouldBe: normalizedName,
            value: variant.value,
          });
        }

        // Check color variants without images
        if (normalizedName === "Color") {
          if (!variant.image) {
            issues.colorVariantsWithoutImages.push({
              productId: product.id,
              productSlug: product.slug,
              productTitle: product.title,
              variantId: variant.id,
              value: variant.value,
            });
          } else {
            // Check if image exists in color terms
            const colorValue = variant.value.toLowerCase();
            const termImage = colorTermImageMap.get(colorValue);
            
            if (termImage && termImage !== variant.image) {
              issues.colorVariantsWithMissingSwatches.push({
                productId: product.id,
                productSlug: product.slug,
                productTitle: product.title,
                variantId: variant.id,
                value: variant.value,
                currentImage: variant.image,
                shouldBeImage: termImage,
              });
            }
          }
        }
      }
    }

    // 4. Print report
    console.log("=".repeat(80));
    console.log("📊 VARIATION DIFFERENCES REPORT");
    console.log("=".repeat(80));
    console.log();

    console.log(`✅ Products with variants: ${issues.productsWithVariants}`);
    console.log(`📦 Total variants: ${issues.totalVariants}`);
    console.log();

    // Products without variants
    if (issues.productsWithoutVariants.length > 0) {
      console.log(`⚠️  Products Missing Variations (${issues.productsWithoutVariants.length}):`);
      issues.productsWithoutVariants.slice(0, 10).forEach((p) => {
        console.log(`   - ${p.title} (${p.slug})`);
        console.log(`     Category: ${p.category || "N/A"}`);
      });
      if (issues.productsWithoutVariants.length > 10) {
        console.log(`   ... and ${issues.productsWithoutVariants.length - 10} more`);
      }
      console.log();
    } else {
      console.log("✅ No products missing variations");
      console.log();
    }

    // Variants with wrong names
    if (issues.variantsWithWrongNames.length > 0) {
      console.log(`⚠️  Variants with Wrong Names (${issues.variantsWithWrongNames.length}):`);
      issues.variantsWithWrongNames.slice(0, 10).forEach((v) => {
        console.log(`   - ${v.productTitle}`);
        console.log(`     Current: "${v.currentName}" → Should be: "${v.shouldBe}"`);
        console.log(`     Value: ${v.value}`);
      });
      if (issues.variantsWithWrongNames.length > 10) {
        console.log(`   ... and ${issues.variantsWithWrongNames.length - 10} more`);
      }
      console.log();
    } else {
      console.log("✅ No variants with wrong names");
      console.log();
    }

    // Color variants without images
    if (issues.colorVariantsWithoutImages.length > 0) {
      console.log(`⚠️  Color Variants Without Images (${issues.colorVariantsWithoutImages.length}):`);
      issues.colorVariantsWithoutImages.slice(0, 10).forEach((v) => {
        console.log(`   - ${v.productTitle}`);
        console.log(`     Color: ${v.value}`);
      });
      if (issues.colorVariantsWithoutImages.length > 10) {
        console.log(`   ... and ${issues.colorVariantsWithoutImages.length - 10} more`);
      }
      console.log();
    } else {
      console.log("✅ All color variants have images");
      console.log();
    }

    // Color variants with missing swatches
    if (issues.colorVariantsWithMissingSwatches.length > 0) {
      console.log(`⚠️  Color Variants with Missing Swatch Images (${issues.colorVariantsWithMissingSwatches.length}):`);
      issues.colorVariantsWithMissingSwatches.slice(0, 5).forEach((v) => {
        console.log(`   - ${v.productTitle}`);
        console.log(`     Color: ${v.value}`);
        console.log(`     Current: ${v.currentImage || "None"}`);
        console.log(`     Should be: ${v.shouldBeImage}`);
      });
      if (issues.colorVariantsWithMissingSwatches.length > 5) {
        console.log(`   ... and ${issues.colorVariantsWithMissingSwatches.length - 5} more`);
      }
      console.log();
    } else {
      console.log("✅ All color variants have correct swatch images");
      console.log();
    }

    // Summary
    console.log("=".repeat(80));
    console.log("📋 SUMMARY");
    console.log("=".repeat(80));
    console.log(`Total Issues Found: ${issues.productsWithoutVariants.length + issues.variantsWithWrongNames.length + issues.colorVariantsWithoutImages.length + issues.colorVariantsWithMissingSwatches.length}`);
    console.log(`  - Products missing variations: ${issues.productsWithoutVariants.length}`);
    console.log(`  - Variants with wrong names: ${issues.variantsWithWrongNames.length}`);
    console.log(`  - Color variants without images: ${issues.colorVariantsWithoutImages.length}`);
    console.log(`  - Color variants with missing swatches: ${issues.colorVariantsWithMissingSwatches.length}`);
    console.log();

    if (issues.productsWithoutVariants.length > 0 || 
        issues.variantsWithWrongNames.length > 0 || 
        issues.colorVariantsWithoutImages.length > 0 ||
        issues.colorVariantsWithMissingSwatches.length > 0) {
      console.log("💡 Run sync-variations-with-images.ts to fix these issues");
    } else {
      console.log("✅ No issues found! Everything looks good.");
    }

  } catch (error: any) {
    console.error("❌ Error checking differences:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
checkVariationDifferences()
  .then(() => {
    console.log("\n✅ Check completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Check failed:", error);
    process.exit(1);
  });

