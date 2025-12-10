import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Update flash sale to include 10 products instead of 5
 */
async function updateFlashSaleProducts() {
  console.log("⚡ Updating Flash Sale Products...\n");

  try {
    // Find active flash sale
    const flashSale = await prisma.flashSale.findFirst({
      where: {
        isActive: true,
        endDate: {
          gte: new Date(),
        },
      },
      include: {
        products: true,
      },
    });

    if (!flashSale) {
      console.log("⚠️  No active flash sale found. Creating one...");
      
      const newFlashSale = await prisma.flashSale.create({
        data: {
          title: "Holiday Flash Sale",
          description: "Limited time offer on selected products",
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          discountPercent: 25.00,
          isActive: true,
        },
      });

      // Add 10 products
      const products = await prisma.product.findMany({
        where: { isActive: true },
        take: 10,
      });

      for (const product of products) {
        await prisma.flashSaleProduct.create({
          data: {
            flashSaleId: newFlashSale.id,
            productId: product.id,
          },
        });
      }

      console.log(`✅ Created flash sale with ${products.length} products`);
      return;
    }

    console.log(`Found active flash sale: ${flashSale.title}`);
    console.log(`Current products: ${flashSale.products.length}`);

    // If already has 10+ products, we're good
    if (flashSale.products.length >= 10) {
      console.log(`✅ Flash sale already has ${flashSale.products.length} products (target: 10)`);
      return;
    }

    // Get products not already in flash sale
    const existingProductIds = flashSale.products.map((fp) => fp.productId);
    const availableProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        id: {
          notIn: existingProductIds,
        },
      },
      take: 10 - flashSale.products.length,
    });

    if (availableProducts.length === 0) {
      console.log("⚠️  No additional products available to add");
      return;
    }

    // Add products to reach 10 total
    for (const product of availableProducts) {
      await prisma.flashSaleProduct.create({
        data: {
          flashSaleId: flashSale.id,
          productId: product.id,
        },
      });
    }

    const updatedFlashSale = await prisma.flashSale.findUnique({
      where: { id: flashSale.id },
      include: {
        products: true,
      },
    });

    console.log(`✅ Updated flash sale: ${updatedFlashSale?.products.length || 0} products`);
    console.log(`   Added ${availableProducts.length} new products`);

    // Summary
    console.log("\n📊 Flash Sale Summary:");
    console.log(`   Title: ${flashSale.title}`);
    console.log(`   Discount: ${flashSale.discountPercent}%`);
    console.log(`   Products: ${updatedFlashSale?.products.length || 0}`);
    console.log(`   End Date: ${flashSale.endDate.toISOString().split("T")[0]}`);

    console.log("\n🎉 Flash sale updated!");
  } catch (error) {
    console.error("❌ Error updating flash sale:", error);
    throw error;
  }
}

async function main() {
  try {
    await updateFlashSaleProducts();
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
