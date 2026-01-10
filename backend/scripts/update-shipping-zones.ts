/**
 * Script to update existing shipping zones with all Ghana regions
 * Run this script after the initial seed to update existing zones
 */

import { PrismaClient } from "@prisma/client";
import { GHANA_REGIONS } from "../src/shipping/ghana-regions";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Updating shipping zones with all Ghana regions...");

  // Get all existing shipping zones
  const zones = await prisma.shippingZone.findMany();

  for (const zone of zones) {
    // If zone is for Ghana but doesn't have all regions, update it
    if (
      zone.regions.includes("Ghana") ||
      zone.regions.some((r) => r.toLowerCase().includes("ghana"))
    ) {
      console.log(`📦 Updating zone: ${zone.name}`);
      console.log(`   Old regions: ${zone.regions.join(", ")}`);
      console.log(`   New regions: ${GHANA_REGIONS.join(", ")}`);

      await prisma.shippingZone.update({
        where: { id: zone.id },
        data: {
          regions: GHANA_REGIONS,
        },
      });

      console.log(`   ✅ Updated successfully!`);
    } else if (
      zone.regions.length > 0 &&
      !zone.regions.includes("Everywhere") &&
      zone.regions.some((r) => GHANA_REGIONS.some((gr) => gr.toLowerCase() === r.toLowerCase()))
    ) {
      // Zone has some Ghana regions but not all
      const existingRegions = zone.regions.filter((r) =>
        GHANA_REGIONS.some((gr) => gr.toLowerCase() === r.toLowerCase())
      );
      const missingRegions = GHANA_REGIONS.filter(
        (gr) => !existingRegions.some((er) => er.toLowerCase() === gr.toLowerCase())
      );

      if (missingRegions.length > 0) {
        console.log(`📦 Updating zone: ${zone.name}`);
        console.log(`   Adding missing regions: ${missingRegions.join(", ")}`);

        await prisma.shippingZone.update({
          where: { id: zone.id },
          data: {
            regions: [...existingRegions, ...missingRegions],
          },
        });

        console.log(`   ✅ Updated successfully!`);
      }
    }
  }

  console.log(`\n✅ Shipping zones update completed!`);
  console.log(`📊 Total Ghana regions: ${GHANA_REGIONS.length}`);
  console.log(`📋 Regions: ${GHANA_REGIONS.join(", ")}`);
}

main()
  .catch((e) => {
    console.error("❌ Error updating shipping zones:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
