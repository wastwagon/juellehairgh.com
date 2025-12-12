/**
 * Export shipping zones and methods from local database to JSON file
 * 
 * Usage:
 *   ts-node backend/scripts/export-shipping-data.ts
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface ShippingMethodExport {
  name: string;
  description?: string | null;
  cost?: number | null;
  freeShippingThreshold?: number | null;
  estimatedDays?: string | null;
  isActive: boolean;
  position: number;
}

interface ShippingZoneExport {
  name: string;
  description?: string | null;
  regions: string[];
  isActive: boolean;
  position: number;
  methods: ShippingMethodExport[];
}

async function exportShippingData() {
  console.log("📤 Exporting Shipping Zones and Methods from Local Database...\n");

  try {
    await prisma.$connect();
    console.log("✅ Connected to local database\n");

    // Get all shipping zones with their methods
    const zones = await prisma.shippingZone.findMany({
      include: {
        methods: {
          orderBy: {
            position: "asc",
          },
        },
      },
      orderBy: {
        position: "asc",
      },
    });

    console.log(`📊 Found ${zones.length} shipping zones\n`);

    // Prepare export data
    const exportData: ShippingZoneExport[] = zones.map((zone) => ({
      name: zone.name,
      description: zone.description,
      regions: zone.regions,
      isActive: zone.isActive,
      position: zone.position,
      methods: zone.methods.map((method) => ({
        name: method.name,
        description: method.description,
        cost: method.cost ? Number(method.cost) : null,
        freeShippingThreshold: method.freeShippingThreshold
          ? Number(method.freeShippingThreshold)
          : null,
        estimatedDays: method.estimatedDays,
        isActive: method.isActive,
        position: method.position,
      })),
    }));

    // Count total methods
    const totalMethods = exportData.reduce((sum, zone) => sum + zone.methods.length, 0);
    console.log(`📦 Total shipping methods: ${totalMethods}\n`);

    // Show summary
    console.log("📋 Export Summary:\n");
    exportData.forEach((zone) => {
      console.log(`   ✅ ${zone.name}`);
      console.log(`      Regions: ${zone.regions.join(", ")}`);
      console.log(`      Methods: ${zone.methods.length}`);
      zone.methods.forEach((method) => {
        const cost = method.cost !== null ? `GH₵${method.cost.toFixed(2)}` : "Free";
        console.log(`         - ${method.name} (${cost})`);
      });
      console.log("");
    });

    // Save to JSON file
    const exportPath = path.join(process.cwd(), "shipping-data-export.json");
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));

    console.log(`💾 Exported to: ${exportPath}\n`);
    console.log("✅ Export complete!\n");

  } catch (error: any) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

exportShippingData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });

