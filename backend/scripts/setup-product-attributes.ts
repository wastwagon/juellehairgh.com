import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Setup Product Attributes (Color and Length) with their terms
 * This script creates the Color and Length attributes if they don't exist
 * and populates them with common terms
 */
async function setupProductAttributes() {
  console.log("🔄 Setting up Product Attributes...\n");

  try {
    // 1. Check if Color attribute exists
    let colorAttribute = await prisma.productAttribute.findFirst({
      where: {
        OR: [
          { name: { equals: "Color", mode: "insensitive" } },
          { slug: { equals: "color" } },
        ],
      },
      include: {
        terms: true,
      },
    });

    if (!colorAttribute) {
      console.log("📝 Creating Color attribute...");
      colorAttribute = await prisma.productAttribute.create({
        data: {
          name: "Color",
          slug: "color",
          description: "Product color variations",
        },
        include: {
          terms: true,
        },
      });
      console.log("✅ Created Color attribute");
    } else {
      console.log(`✅ Color attribute exists (${colorAttribute.terms.length} terms)`);
    }

    // 2. Check if Length attribute exists
    let lengthAttribute = await prisma.productAttribute.findFirst({
      where: {
        OR: [
          { name: { equals: "Length", mode: "insensitive" } },
          { slug: { equals: "length" } },
        ],
      },
      include: {
        terms: true,
      },
    });

    if (!lengthAttribute) {
      console.log("📝 Creating Length attribute...");
      lengthAttribute = await prisma.productAttribute.create({
        data: {
          name: "Length",
          slug: "length",
          description: "Product length variations",
        },
        include: {
          terms: true,
        },
      });
      console.log("✅ Created Length attribute");
    } else {
      console.log(`✅ Length attribute exists (${lengthAttribute.terms.length} terms)`);
    }

    // 3. Add common color terms if they don't exist
    const colorTerms = [
      { name: "Black", slug: "black" },
      { name: "Brown", slug: "brown" },
      { name: "Light Brown", slug: "light-brown" },
      { name: "Dark Brown", slug: "dark-brown" },
      { name: "Blonde", slug: "blonde" },
      { name: "Red", slug: "red" },
      { name: "Auburn", slug: "auburn" },
      { name: "Caramel", slug: "caramel" },
      { name: "Honey", slug: "honey" },
      { name: "Chocolate", slug: "chocolate" },
      { name: "Mocha", slug: "mocha" },
      { name: "Hazelnut", slug: "hazelnut" },
      { name: "Latte", slug: "latte" },
      { name: "Copper", slug: "copper" },
      { name: "Burgundy", slug: "burgundy" },
      { name: "Platinum", slug: "platinum" },
      { name: "Ombre", slug: "ombre" },
      { name: "Balayage", slug: "balayage" },
      { name: "Highlights", slug: "highlights" },
      { name: "Natural", slug: "natural" },
    ];

    console.log("\n📝 Adding color terms...");
    let colorTermsAdded = 0;
    for (const term of colorTerms) {
      const existing = await prisma.productAttributeTerm.findFirst({
        where: {
          attributeId: colorAttribute.id,
          slug: term.slug,
        },
      });

      if (!existing) {
        await prisma.productAttributeTerm.create({
          data: {
            attributeId: colorAttribute.id,
            name: term.name,
            slug: term.slug,
          },
        });
        colorTermsAdded++;
      }
    }
    console.log(`✅ Added ${colorTermsAdded} new color terms`);

    // 4. Add common length terms if they don't exist
    const lengthTerms = [
      { name: "12 inches", slug: "12-inches" },
      { name: "13 inches", slug: "13-inches" },
      { name: "14 inches", slug: "14-inches" },
      { name: "16 inches", slug: "16-inches" },
      { name: "18 inches", slug: "18-inches" },
      { name: "20 inches", slug: "20-inches" },
      { name: "22 inches", slug: "22-inches" },
      { name: "24 inches", slug: "24-inches" },
      { name: "26 inches", slug: "26-inches" },
      { name: "28 inches", slug: "28-inches" },
      { name: "30 inches", slug: "30-inches" },
    ];

    console.log("\n📝 Adding length terms...");
    let lengthTermsAdded = 0;
    for (const term of lengthTerms) {
      const existing = await prisma.productAttributeTerm.findFirst({
        where: {
          attributeId: lengthAttribute.id,
          slug: term.slug,
        },
      });

      if (!existing) {
        await prisma.productAttributeTerm.create({
          data: {
            attributeId: lengthAttribute.id,
            name: term.name,
            slug: term.slug,
          },
        });
        lengthTermsAdded++;
      }
    }
    console.log(`✅ Added ${lengthTermsAdded} new length terms`);

    // 5. Summary
    const finalColorAttribute = await prisma.productAttribute.findUnique({
      where: { id: colorAttribute.id },
      include: { terms: true },
    });

    const finalLengthAttribute = await prisma.productAttribute.findUnique({
      where: { id: lengthAttribute.id },
      include: { terms: true },
    });

    console.log("\n📊 Final Summary:");
    console.log(`  Color attribute: ${finalColorAttribute?.terms.length || 0} terms`);
    console.log(`  Length attribute: ${finalLengthAttribute?.terms.length || 0} terms`);

    console.log("\n✅ Product attributes setup completed!");
    console.log("\n💡 Next steps:");
    console.log("   1. Upload color swatch images via admin panel: /admin/attributes");
    console.log("   2. Run: npm run create:variants");
    console.log("   3. Or create variants manually via admin panel: /admin/products");

  } catch (error) {
    console.error("❌ Error setting up attributes:", error);
    throw error;
  }
}

async function main() {
  try {
    await setupProductAttributes();
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
