import { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

/**
 * Simplified shipping zones based on user requirements:
 * 1. Greater Accra - specific price
 * 2. Tema - specific price (separate from Greater Accra)
 * 3. Other Ghana Regions - specific price
 * 4. International - specific price
 */
async function main() {
  console.log("🌍 Seeding shipping zones with new structure...");

  // Clear existing shipping data
  await prisma.shippingMethod.deleteMany({});
  await prisma.shippingZone.deleteMany({});

  // 1. Greater Accra Zone
  const greaterAccraZone = await prisma.shippingZone.create({
    data: {
      name: "Greater Accra",
      description: "Shipping to Greater Accra region (excluding Tema)",
      regions: ["Greater Accra"],
      isActive: true,
      position: 0,
    },
  });

  await prisma.shippingMethod.create({
    data: {
      zoneId: greaterAccraZone.id,
      name: "STANDARD SHIPPING - GREATER ACCRA",
      description: "Standard shipping to Greater Accra",
      cost: new Decimal(50), // User can update via admin panel
      freeShippingThreshold: new Decimal(950),
      estimatedDays: "1-2 business days",
      isActive: true,
      position: 0,
    },
  });

  // 2. Tema Zone (separate from Greater Accra)
  const temaZone = await prisma.shippingZone.create({
    data: {
      name: "Tema",
      description: "Shipping to Tema city (separate pricing)",
      regions: ["Greater Accra"], // Tema is in Greater Accra region but has separate pricing
      isActive: true,
      position: 1,
    },
  });

  await prisma.shippingMethod.create({
    data: {
      zoneId: temaZone.id,
      name: "STANDARD SHIPPING - TEMA",
      description: "Standard shipping to Tema",
      cost: new Decimal(40), // User can update via admin panel
      freeShippingThreshold: new Decimal(950),
      estimatedDays: "1-2 business days",
      isActive: true,
      position: 0,
    },
  });

  // 3. Other Ghana Regions Zone
  const otherGhanaZone = await prisma.shippingZone.create({
    data: {
      name: "Other Ghana Regions",
      description: "Shipping to all other regions in Ghana",
      regions: [
        "Ashanti",
        "Western",
        "Western North",
        "Eastern",
        "Volta",
        "Oti",
        "Northern",
        "North East",
        "Savannah",
        "Upper East",
        "Upper West",
        "Brong Ahafo",
        "Ahafo",
        "Bono",
        "Bono East",
        "Central",
      ],
      isActive: true,
      position: 2,
    },
  });

  await prisma.shippingMethod.create({
    data: {
      zoneId: otherGhanaZone.id,
      name: "STANDARD SHIPPING - OTHER GHANA REGIONS",
      description: "Standard shipping to all other regions in Ghana",
      cost: new Decimal(65), // User can update via admin panel
      freeShippingThreshold: new Decimal(950),
      estimatedDays: "5-10 business days",
      isActive: true,
      position: 0,
    },
  });

  // 4. International Shipping Zone
  const internationalZone = await prisma.shippingZone.create({
    data: {
      name: "International Shipping",
      description: "Shipping to all countries outside Ghana",
      regions: ["Everywhere"],
      isActive: true,
      position: 3,
    },
  });

  await prisma.shippingMethod.create({
    data: {
      zoneId: internationalZone.id,
      name: "WORLDWIDE DHL EXPRESS (3-5 working days) Duty may be charged on arrival",
      description: "DHL Express international shipping",
      cost: new Decimal(420), // User can update via admin panel
      freeShippingThreshold: null,
      estimatedDays: "3-5 working days",
      isActive: true,
      position: 0,
    },
  });

  console.log("✅ Shipping zones seeded successfully!");
  console.log("📦 Created 4 shipping zones:");
  console.log("   1. Greater Accra");
  console.log("   2. Tema");
  console.log("   3. Other Ghana Regions");
  console.log("   4. International Shipping");
  console.log("\n💡 Note: Prices are set as defaults. Update via admin panel if needed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

