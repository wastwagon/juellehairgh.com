/**
 * Check flash sales in database
 * Usage: ts-node backend/scripts/check-flash-sales.ts
 */

import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function checkFlashSales() {
  console.log("🔍 Checking Flash Sales...\n");

  try {
    // Get all flash sales
    const allFlashSales = await prisma.flashSale.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    console.log(`📊 Total Flash Sales: ${allFlashSales.length}\n`);

    if (allFlashSales.length === 0) {
      console.log("⚠️  No flash sales found in database!");
      return;
    }

    // Check active flash sales
    const now = new Date();
    const activeFlashSales = allFlashSales.filter((fs) => {
      const startDate = new Date(fs.startDate);
      const endDate = new Date(fs.endDate);
      return fs.isActive && startDate <= now && endDate >= now;
    });

    console.log(`✅ Active Flash Sales: ${activeFlashSales.length}\n`);

    allFlashSales.forEach((fs, index) => {
      const startDate = new Date(fs.startDate);
      const endDate = new Date(fs.endDate);
      const isCurrentlyActive = fs.isActive && startDate <= now && endDate >= now;

      console.log(`${index + 1}. ${fs.title}`);
      console.log(`   ID: ${fs.id}`);
      console.log(`   Active: ${fs.isActive ? "✅" : "❌"}`);
      console.log(`   Currently Active: ${isCurrentlyActive ? "✅ YES" : "❌ NO"}`);
      console.log(`   Start: ${startDate.toLocaleString()}`);
      console.log(`   End: ${endDate.toLocaleString()}`);
      console.log(`   Discount: ${fs.discountPercent}%`);
      console.log(`   Products: ${fs.products.length}`);
      console.log("");
    });

    if (activeFlashSales.length === 0) {
      console.log("⚠️  No active flash sales found!");
      console.log("💡 To create a flash sale:");
      console.log("   1. Go to admin panel: /admin/flash-sales");
      console.log("   2. Create a new flash sale");
      console.log("   3. Set isActive = true");
      console.log("   4. Set startDate <= now");
      console.log("   5. Set endDate >= now");
      console.log("   6. Add products to the flash sale");
    } else {
      console.log("✅ Active flash sale found!");
      activeFlashSales.forEach((fs) => {
        console.log(`   Title: ${fs.title}`);
        console.log(`   Products: ${fs.products.length}`);
      });
    }
  } catch (error: any) {
    console.error("❌ Error checking flash sales:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkFlashSales();

