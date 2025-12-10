import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Check product variants in database
 * Shows which products have variants and which don't
 */
async function checkProductVariants() {
  console.log("🔍 Checking Product Variants...\n");

  try {
    // 1. Get all products with variants
    const productsWithVariants = await prisma.product.findMany({
      where: {
        variants: {
          some: {},
        },
      },
      include: {
        variants: true,
        _count: {
          select: {
            variants: true,
          },
        },
      },
    });

    console.log(`📊 Products with variants: ${productsWithVariants.length}`);

    if (productsWithVariants.length > 0) {
      console.log("\n📦 Products with Variants:");
      productsWithVariants.slice(0, 10).forEach((product, index) => {
        console.log(`\n  ${index + 1}. ${product.title}`);
        console.log(`     Variants: ${product._count.variants}`);
        console.log(`     Variant details:`);
        product.variants.slice(0, 5).forEach((variant) => {
          console.log(`       - ${variant.name}: ${variant.value} (Stock: ${variant.stock}, Price: ${variant.priceGhs || 'N/A'})`);
        });
        if (product.variants.length > 5) {
          console.log(`       ... and ${product.variants.length - 5} more`);
        }
      });
    }

    // 2. Get products without variants
    const productsWithoutVariants = await prisma.product.findMany({
      where: {
        variants: {
          none: {},
        },
      },
      take: 20,
    });

    console.log(`\n📊 Products without variants: ${productsWithoutVariants.length}`);

    if (productsWithoutVariants.length > 0) {
      console.log("\n📦 Sample Products without Variants:");
      productsWithoutVariants.slice(0, 10).forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.title} (ID: ${product.id})`);
      });
    }

    // 3. Check variant attributes
    console.log("\n📋 Variant Attributes Analysis:");
    const allVariants = await prisma.productVariant.findMany({
      take: 100,
    });

    const variantNames = new Set<string>();
    const variantValues = new Map<string, Set<string>>();

    allVariants.forEach((variant) => {
      variantNames.add(variant.name);
      if (!variantValues.has(variant.name)) {
        variantValues.set(variant.name, new Set());
      }
      variantValues.get(variant.name)!.add(variant.value);
    });

    console.log(`\n  Unique Variant Names: ${variantNames.size}`);
    variantNames.forEach((name) => {
      const values = variantValues.get(name) || new Set();
      console.log(`    ${name}: ${values.size} unique values`);
      if (values.size <= 10) {
        console.log(`      Values: ${Array.from(values).join(", ")}`);
      }
    });

    // 4. Summary
    console.log("\n📊 Summary:");
    const totalProducts = await prisma.product.count();
    const totalVariants = await prisma.productVariant.count();
    const productsWithVariantsCount = await prisma.product.count({
      where: {
        variants: {
          some: {},
        },
      },
    });

    console.log(`  Total Products: ${totalProducts}`);
    console.log(`  Products with Variants: ${productsWithVariantsCount}`);
    console.log(`  Products without Variants: ${totalProducts - productsWithVariantsCount}`);
    console.log(`  Total Variants: ${totalVariants}`);
    console.log(`  Average Variants per Product: ${productsWithVariantsCount > 0 ? (totalVariants / productsWithVariantsCount).toFixed(2) : 0}`);

    // 5. Check if variants are being fetched in API
    console.log("\n💡 API Check:");
    console.log("  Products API should include variants in response");
    console.log("  Check: GET /api/products/:id");
    console.log("  Should include: { variants: [...] }");

    if (totalVariants === 0) {
      console.log("\n⚠️  No variants found in database!");
      console.log("💡 You may need to:");
      console.log("   1. Create variants via admin panel");
      console.log("   2. Import variants from existing data");
      console.log("   3. Generate variants from product attributes");
    }
  } catch (error) {
    console.error("❌ Error checking variants:", error);
    throw error;
  }
}

async function main() {
  try {
    await checkProductVariants();
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
