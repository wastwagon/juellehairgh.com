/**
 * Import shipping zones and methods from JSON file to production database
 * 
 * Usage:
 *   ts-node backend/scripts/import-shipping-data.ts [path-to-export.json]
 * 
 * Environment Variables:
 *   DATABASE_URL_PROD - Production database URL (required)
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { Decimal } from "@prisma/client/runtime/library";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const prodDbUrl = process.env.DATABASE_URL_PROD;

if (!prodDbUrl) {
  console.error("❌ Error: DATABASE_URL_PROD environment variable is not set");
  console.log("\n💡 Set it in your .env file or export it:");
  console.log("   export DATABASE_URL_PROD='your-production-database-url'");
  process.exit(1);
}

const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: prodDbUrl,
    },
  },
});

interface ShippingMethodImport {
  name: string;
  description?: string | null;
  cost?: number | null;
  freeShippingThreshold?: number | null;
  estimatedDays?: string | null;
  isActive: boolean;
  position: number;
}

interface ShippingZoneImport {
  name: string;
  description?: string | null;
  regions: string[];
  isActive: boolean;
  position: number;
  methods: ShippingMethodImport[];
}

async function importShippingData(exportFilePath: string) {
  console.log("📥 Importing Shipping Zones and Methods to Production Database...\n");

  try {
    await prodPrisma.$connect();
    console.log("✅ Connected to production database\n");

    // Read export file
    if (!fs.existsSync(exportFilePath)) {
      console.error(`❌ Export file not found: ${exportFilePath}`);
      process.exit(1);
    }

    const exportData: ShippingZoneImport[] = JSON.parse(
      fs.readFileSync(exportFilePath, "utf-8")
    );

    console.log(`📊 Found ${exportData.length} shipping zones to import\n`);

    let zonesCreated = 0;
    let zonesUpdated = 0;
    let methodsCreated = 0;
    let methodsUpdated = 0;

    for (const zoneData of exportData) {
      try {
        // Check if zone exists (by name)
        const existingZone = await prodPrisma.shippingZone.findFirst({
          where: {
            name: zoneData.name,
          },
          include: {
            methods: true,
          },
        });

        let zoneId: string;

        if (existingZone) {
          // Update existing zone
          await prodPrisma.shippingZone.update({
            where: { id: existingZone.id },
            data: {
              name: zoneData.name,
              description: zoneData.description,
              regions: zoneData.regions,
              isActive: zoneData.isActive,
              position: zoneData.position,
            },
          });
          zoneId = existingZone.id;
          zonesUpdated++;
          console.log(`   🔄 Updated zone: ${zoneData.name}`);
        } else {
          // Create new zone
          const newZone = await prodPrisma.shippingZone.create({
            data: {
              name: zoneData.name,
              description: zoneData.description,
              regions: zoneData.regions,
              isActive: zoneData.isActive,
              position: zoneData.position,
            },
          });
          zoneId = newZone.id;
          zonesCreated++;
          console.log(`   ✅ Created zone: ${zoneData.name}`);
        }

        // Import methods
        for (const methodData of zoneData.methods) {
          try {
            // Check if method exists (by name and zoneId)
            const existingMethod = await prodPrisma.shippingMethod.findFirst({
              where: {
                zoneId,
                name: methodData.name,
              },
            });

            if (existingMethod) {
              // Update existing method
              await prodPrisma.shippingMethod.update({
                where: { id: existingMethod.id },
                data: {
                  name: methodData.name,
                  description: methodData.description,
                  cost: methodData.cost !== null && methodData.cost !== undefined
                    ? new Decimal(methodData.cost)
                    : null,
                  freeShippingThreshold:
                    methodData.freeShippingThreshold !== null &&
                    methodData.freeShippingThreshold !== undefined
                      ? new Decimal(methodData.freeShippingThreshold)
                      : null,
                  estimatedDays: methodData.estimatedDays,
                  isActive: methodData.isActive,
                  position: methodData.position,
                },
              });
              methodsUpdated++;
              console.log(`      🔄 Updated method: ${methodData.name}`);
            } else {
              // Create new method
              await prodPrisma.shippingMethod.create({
                data: {
                  zoneId,
                  name: methodData.name,
                  description: methodData.description,
                  cost: methodData.cost !== null && methodData.cost !== undefined
                    ? new Decimal(methodData.cost)
                    : null,
                  freeShippingThreshold:
                    methodData.freeShippingThreshold !== null &&
                    methodData.freeShippingThreshold !== undefined
                      ? new Decimal(methodData.freeShippingThreshold)
                      : null,
                  estimatedDays: methodData.estimatedDays,
                  isActive: methodData.isActive,
                  position: methodData.position,
                },
              });
              methodsCreated++;
              console.log(`      ✅ Created method: ${methodData.name}`);
            }
          } catch (error: any) {
            console.error(`      ❌ Error importing method "${methodData.name}":`, error.message);
          }
        }
      } catch (error: any) {
        console.error(`   ❌ Error importing zone "${zoneData.name}":`, error.message);
      }
    }

    console.log(`\n📊 Import Summary:`);
    console.log(`   ✅ Zones created: ${zonesCreated}`);
    console.log(`   🔄 Zones updated: ${zonesUpdated}`);
    console.log(`   ✅ Methods created: ${methodsCreated}`);
    console.log(`   🔄 Methods updated: ${methodsUpdated}`);
    console.log(`   📦 Total zones: ${zonesCreated + zonesUpdated}`);
    console.log(`   📦 Total methods: ${methodsCreated + methodsUpdated}\n`);

    // Verify import
    const prodZones = await prodPrisma.shippingZone.findMany({
      include: {
        methods: true,
      },
    });

    const totalProdMethods = prodZones.reduce((sum, zone) => sum + zone.methods.length, 0);
    console.log(`✅ Production now has ${prodZones.length} shipping zones`);
    console.log(`   ${totalProdMethods} shipping methods\n`);

    console.log("🎉 Import complete!\n");

  } catch (error: any) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prodPrisma.$disconnect();
  }
}

// Get export file path from command line or use default
const exportFilePath = process.argv[2] || path.join(process.cwd(), "shipping-data-export.json");

importShippingData(exportFilePath)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });

