import { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

/**
 * All 16 regions of Ghana
 */
const GHANA_REGIONS = [
  "Greater Accra",
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
];

async function main() {
  console.log("🌍 Seeding shipping zones and methods...");

  // Clear existing shipping data
  await prisma.shippingMethod.deleteMany({});
  await prisma.shippingZone.deleteMany({});

  // 1. Create "Greater Accra & Tema" zone for same-day and local delivery
  const greaterAccraZone = await prisma.shippingZone.create({
    data: {
      name: "Greater Accra & Tema",
      description: "Same-day and next-day delivery within Greater Accra and Tema",
      regions: ["Greater Accra"],
      isActive: true,
      position: 0,
    },
  });

  await prisma.shippingMethod.create({
    data: {
      zoneId: greaterAccraZone.id,
      name: "SAME DAY EXPRESS (WITHIN ACCRA)",
      description: "Same day delivery within Accra",
      cost: new Decimal(100),
      freeShippingThreshold: null,
      estimatedDays: "Same day",
      isActive: true,
      position: 0,
    },
  });

  await prisma.shippingMethod.create({
    data: {
      zoneId: greaterAccraZone.id,
      name: "LOCAL PICK-UP FROM DANSOMAN SHOP",
      description: "Pick up from our Dansoman shop",
      cost: new Decimal(0),
      freeShippingThreshold: null,
      estimatedDays: "Available during shop hours",
      isActive: true,
      position: 1,
    },
  });

  await prisma.shippingMethod.create({
    data: {
      zoneId: greaterAccraZone.id,
      name: "PAY TO RIDER ON ARRIVAL - ACCRA, TEMA (Ships Next Day)",
      description: "Pay on delivery for Accra and Tema. Free for orders GHS 950+",
      cost: new Decimal(0),
      freeShippingThreshold: new Decimal(950),
      estimatedDays: "Next day",
      isActive: true,
      position: 2,
    },
  });

  // 2. Create "All Ghana Regions" zone for nationwide shipping
  const ghanaZone = await prisma.shippingZone.create({
    data: {
      name: "All Ghana Regions",
      description: "Shipping to all regions in Ghana",
      regions: GHANA_REGIONS,
      isActive: true,
      position: 1,
    },
  });

  await prisma.shippingMethod.create({
    data: {
      zoneId: ghanaZone.id,
      name: "FREE SHIPPING WITHIN GHANA (GHS 950+ Orders)",
      description: "Free shipping for orders GHS 950 and above",
      cost: null,
      freeShippingThreshold: new Decimal(950),
      estimatedDays: "3-7 business days",
      isActive: true,
      position: 0,
    },
  });

  await prisma.shippingMethod.create({
    data: {
      zoneId: ghanaZone.id,
      name: "STANDARD SHIPPING - ALL REGIONS",
      description: "Standard shipping to all regions in Ghana",
      cost: new Decimal(65),
      freeShippingThreshold: new Decimal(950),
      estimatedDays: "5-10 business days",
      isActive: true,
      position: 1,
    },
  });

  // 3. Create regional zones for better shipping cost management
  // Major regions (Ashanti, Eastern, Central) - faster delivery
  const majorRegionsZone = await prisma.shippingZone.create({
    data: {
      name: "Major Regions (Ashanti, Eastern, Central)",
      description: "Faster shipping to major regions",
      regions: ["Ashanti", "Eastern", "Central"],
      isActive: true,
      position: 2,
    },
  });

  await prisma.shippingMethod.create({
    data: {
      zoneId: majorRegionsZone.id,
      name: "EXPRESS SHIPPING - MAJOR REGIONS",
      description: "Express shipping to Ashanti, Eastern, and Central regions",
      cost: new Decimal(80),
      freeShippingThreshold: new Decimal(950),
      estimatedDays: "3-5 business days",
      isActive: true,
      position: 0,
    },
  });

  // Northern regions - standard delivery
  const northernRegionsZone = await prisma.shippingZone.create({
    data: {
      name: "Northern Regions",
      description: "Shipping to northern regions",
      regions: ["Northern", "North East", "Savannah", "Upper East", "Upper West"],
      isActive: true,
      position: 3,
    },
  });

  await prisma.shippingMethod.create({
    data: {
      zoneId: northernRegionsZone.id,
      name: "STANDARD SHIPPING - NORTHERN REGIONS",
      description: "Standard shipping to northern regions",
      cost: new Decimal(75),
      freeShippingThreshold: new Decimal(950),
      estimatedDays: "7-12 business days",
      isActive: true,
      position: 0,
    },
  });

  // Western and Volta regions
  const westernVoltaZone = await prisma.shippingZone.create({
    data: {
      name: "Western & Volta Regions",
      description: "Shipping to Western, Western North, Volta, and Oti regions",
      regions: ["Western", "Western North", "Volta", "Oti"],
      isActive: true,
      position: 4,
    },
  });

  await prisma.shippingMethod.create({
    data: {
      zoneId: westernVoltaZone.id,
      name: "STANDARD SHIPPING - WESTERN & VOLTA",
      description: "Standard shipping to Western and Volta regions",
      cost: new Decimal(70),
      freeShippingThreshold: new Decimal(950),
      estimatedDays: "5-8 business days",
      isActive: true,
      position: 0,
    },
  });

  // Brong Ahafo regions
  const brongAhafoZone = await prisma.shippingZone.create({
    data: {
      name: "Brong Ahafo Regions",
      description: "Shipping to Brong Ahafo, Bono, Bono East, and Ahafo regions",
      regions: ["Brong Ahafo", "Bono", "Bono East", "Ahafo"],
      isActive: true,
      position: 5,
    },
  });

  await prisma.shippingMethod.create({
    data: {
      zoneId: brongAhafoZone.id,
      name: "STANDARD SHIPPING - BRONG AHAFO REGIONS",
      description: "Standard shipping to Brong Ahafo regions",
      cost: new Decimal(70),
      freeShippingThreshold: new Decimal(950),
      estimatedDays: "5-9 business days",
      isActive: true,
      position: 0,
    },
  });

  // 4. International shipping zone
  const internationalZone = await prisma.shippingZone.create({
    data: {
      name: "International Shipping",
      description: "Worldwide shipping",
      regions: ["Everywhere"],
      isActive: true,
      position: 6,
    },
  });

  await prisma.shippingMethod.create({
    data: {
      zoneId: internationalZone.id,
      name: "WORLDWIDE DHL EXPRESS (3-5 working days) Duty may be charged on arrival",
      description: "DHL Express international shipping",
      cost: new Decimal(420),
      freeShippingThreshold: null,
      estimatedDays: "3-5 working days",
      isActive: true,
      position: 0,
    },
  });

  console.log("✅ Shipping zones and methods seeded successfully!");
  console.log(`📦 Created ${GHANA_REGIONS.length} Ghana regions in shipping zones`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
