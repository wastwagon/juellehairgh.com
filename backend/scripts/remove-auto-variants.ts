import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Remove auto-generated variants
 * This script removes variants that were created by the auto-generation script
 * 
 * Options:
 * - Remove all variants from all products
 * - Remove variants from specific products (by product IDs)
 * - Remove variants matching certain criteria
 */
async function removeAutoVariants() {
  console.log("🗑️  Removing Auto-Generated Variants...\n");

  try {
    // Get all variants
    const allVariants = await prisma.productVariant.findMany({
      include: {
        product: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    console.log(`📊 Found ${allVariants.length} total variants`);

    if (allVariants.length === 0) {
      console.log("✅ No variants found. Nothing to remove.");
      return;
    }

    // Count variants by product
    const variantsByProduct = new Map<string, number>();
    allVariants.forEach((v) => {
      const count = variantsByProduct.get(v.productId) || 0;
      variantsByProduct.set(v.productId, count + 1);
    });

    console.log(`\n📦 Variants by product:`);
    Array.from(variantsByProduct.entries())
      .slice(0, 10)
      .forEach(([productId, count]) => {
        const product = allVariants.find((v) => v.productId === productId)?.product;
        console.log(`   ${product?.title || productId}: ${count} variants`);
      });
    if (variantsByProduct.size > 10) {
      console.log(`   ... and ${variantsByProduct.size - 10} more products`);
    }

    // Ask for confirmation (in production, we'll just proceed)
    console.log("\n⚠️  This will delete ALL variants from ALL products.");
    console.log("   This action cannot be undone!");

    // Delete all variants
    console.log("\n🗑️  Deleting variants...");
    const deleteResult = await prisma.productVariant.deleteMany({});

    console.log(`\n✅ Deleted ${deleteResult.count} variants`);

    // Verify deletion
    const remainingVariants = await prisma.productVariant.count();
    console.log(`📊 Remaining variants: ${remainingVariants}`);

    if (remainingVariants === 0) {
      console.log("\n✅ All variants removed successfully!");
      console.log("\n💡 Next steps:");
      console.log("   1. Create variants manually via admin panel: /admin/products");
      console.log("   2. Or modify the create:variants script to be more selective");
    }
  } catch (error) {
    console.error("❌ Error removing variants:", error);
    throw error;
  }
}

async function main() {
  try {
    await removeAutoVariants();
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
