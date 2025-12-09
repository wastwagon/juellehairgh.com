import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Updating flash sale to Christmas theme and adding products...");

  // Find the active flash sale
  const flashSale = await prisma.flashSale.findFirst({
    where: { isActive: true },
    include: {
      products: true,
    },
  });

  if (!flashSale) {
    console.log("No active flash sale found. Creating a new one...");
    return;
  }

  // Get all active products
  const allProducts = await prisma.product.findMany({
    where: { isActive: true },
    take: 50,
  });

  // Get current product IDs in flash sale
  const currentProductIds = flashSale.products.map((p) => p.productId);

  // Get products not already in the flash sale
  const availableProducts = allProducts.filter(
    (p) => !currentProductIds.includes(p.id)
  );

  // Select 4 more products to add (we need 10 total, currently have 6)
  const productsToAdd = availableProducts.slice(0, 4);

  console.log(`Current products in flash sale: ${currentProductIds.length}`);
  console.log(`Adding ${productsToAdd.length} more products...`);

  // Add new products to flash sale
  if (productsToAdd.length > 0) {
    await prisma.flashSaleProduct.createMany({
      data: productsToAdd.map((product) => ({
        flashSaleId: flashSale.id,
        productId: product.id,
      })),
      skipDuplicates: true,
    });
  }

  // Update flash sale to Christmas theme
  const christmasEndDate = new Date("2025-12-31T23:59:59Z"); // End of December

  await prisma.flashSale.update({
    where: { id: flashSale.id },
    data: {
      title: "Christmas Mega Sale",
      description: "Celebrate the holidays with amazing deals! Up to 30% off on selected hair products. Perfect gifts for yourself or loved ones!",
      endDate: christmasEndDate,
      discountPercent: 30.0,
    },
  });

  // Verify final count
  const updatedFlashSale = await prisma.flashSale.findUnique({
    where: { id: flashSale.id },
    include: {
      products: true,
    },
  });

  console.log("\n✅ Flash sale updated successfully!");
  console.log(`- Title: ${updatedFlashSale?.title}`);
  console.log(`- Total products: ${updatedFlashSale?.products.length}`);
  console.log(`- End date: ${updatedFlashSale?.endDate}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
