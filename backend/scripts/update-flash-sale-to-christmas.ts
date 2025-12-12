import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const christmasContent = {
  title: "Christmas Mega Sale",
  description: "Celebrate the holidays with amazing deals! Up to 30% off on selected hair products. Perfect gifts for yourself or loved ones!",
  discountPercent: 30,
};

async function updateFlashSaleToChristmas() {
  console.log("🎄 Starting to update flash sale to Christmas content...\n");

  try {
    // Find active flash sales or any flash sale with "holiday" in the title
    const now = new Date();
    
    // First, try to find active flash sales
    let flashSales = await prisma.flashSale.findMany({
      where: {
        OR: [
          {
            isActive: true,
            startDate: { lte: now },
            endDate: { gte: now },
          },
          {
            title: {
              contains: "holiday",
              mode: "insensitive",
            },
          },
          {
            title: {
              contains: "Holiday",
            },
          },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    // If no active or holiday sales found, get the most recent active sale
    if (flashSales.length === 0) {
      flashSales = await prisma.flashSale.findMany({
        where: {
          isActive: true,
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      });
    }

    if (flashSales.length === 0) {
      console.log("⚠️  No flash sales found. Creating a new Christmas flash sale...");
      
      // Create a new Christmas flash sale
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30); // 30 days from now
      
      const newFlashSale = await prisma.flashSale.create({
        data: {
          title: christmasContent.title,
          description: christmasContent.description,
          startDate: now,
          endDate: endDate,
          discountPercent: christmasContent.discountPercent,
          isActive: true,
        },
      });

      console.log(`✅ Created new Christmas flash sale: ${newFlashSale.id}`);
      console.log(`   Title: ${newFlashSale.title}`);
      console.log(`   Discount: ${newFlashSale.discountPercent}%`);
      console.log(`   End Date: ${newFlashSale.endDate.toLocaleString()}`);
      return;
    }

    // Update existing flash sales
    for (const flashSale of flashSales) {
      console.log(`📝 Updating flash sale: ${flashSale.id}`);
      console.log(`   Current title: ${flashSale.title}`);
      
      const updated = await prisma.flashSale.update({
        where: { id: flashSale.id },
        data: {
          title: christmasContent.title,
          description: christmasContent.description,
          discountPercent: christmasContent.discountPercent,
        },
      });

      console.log(`✅ Updated successfully!`);
      console.log(`   New title: ${updated.title}`);
      console.log(`   New discount: ${updated.discountPercent}%`);
      console.log(`   Description: ${updated.description?.substring(0, 60)}...`);
      console.log("");
    }

    console.log("🎉 All flash sales updated to Christmas content!");
  } catch (error) {
    console.error("❌ Error updating flash sale:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log("✅ Database connection established\n");
    
    await updateFlashSaleToChristmas();
    console.log("\n✨ Update completed!");
  } catch (error) {
    console.error("\n💥 Update failed:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

