import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

/**
 * Setup navigation categories matching the website menu structure
 * Order: Home, Shop All, Braids, Ponytails, Lace Wigs, Clip-Ins, Hair Growth Oils, Brands
 */
async function setupNavigationCategories() {
  console.log("🔄 Setting up navigation categories...\n");

  try {
    // 1. Shop All (if doesn't exist)
    const shopAll = await prisma.category.upsert({
      where: { slug: "shop-all" },
      update: { name: "Shop All" },
      create: {
        name: "Shop All",
        slug: "shop-all",
        description: "Browse all products",
      },
    });
    console.log("✅ Shop All category ready");

    // 2. Braids category with subcategories
    const braids = await prisma.category.upsert({
      where: { slug: "braids" },
      update: { name: "Braids" },
      create: {
        name: "Braids",
        slug: "braids",
        description: "Braids collection",
      },
    });
    console.log("✅ Braids category ready");

    // Braids subcategories
    const braidsSubcategories = [
      { name: "Boho braids", slug: "boho-braids" },
      { name: "Crochet Hair", slug: "crochet-hair" },
      { name: "Passion Twist braids", slug: "passion-twist-braids" },
      { name: "Twist braids", slug: "twist-braids" },
    ];

    for (const subcat of braidsSubcategories) {
      await prisma.category.upsert({
        where: { slug: subcat.slug },
        update: {
          name: subcat.name,
          parentId: braids.id,
        },
        create: {
          name: subcat.name,
          slug: subcat.slug,
          parentId: braids.id,
        },
      });
    }
    console.log(`✅ Created ${braidsSubcategories.length} Braids subcategories`);

    // 3. Ponytails category with subcategories
    const ponytails = await prisma.category.upsert({
      where: { slug: "ponytails" },
      update: { name: "Ponytails" },
      create: {
        name: "Ponytails",
        slug: "ponytails",
        description: "Ponytails collection",
      },
    });
    console.log("✅ Ponytails category ready");

    // Ponytails subcategories
    const ponytailsSubcategories = [
      { name: "Drawstring/Half wigs", slug: "drawstring-half-wigs" },
      { name: "Wrap Ponytails", slug: "wrap-ponytails" },
    ];

    for (const subcat of ponytailsSubcategories) {
      await prisma.category.upsert({
        where: { slug: subcat.slug },
        update: {
          name: subcat.name,
          parentId: ponytails.id,
        },
        create: {
          name: subcat.name,
          slug: subcat.slug,
          parentId: ponytails.id,
        },
      });
    }
    console.log(`✅ Created ${ponytailsSubcategories.length} Ponytails subcategories`);

    // 4. Lace Wigs category with subcategories
    const laceWigs = await prisma.category.upsert({
      where: { slug: "lace-wigs" },
      update: { name: "Lace Wigs" },
      create: {
        name: "Lace Wigs",
        slug: "lace-wigs",
        description: "Lace Wigs collection",
      },
    });
    console.log("✅ Lace Wigs category ready");

    // Lace Wigs subcategories
    const laceWigsSubcategories = [
      { name: "Human hair blend lace wigs", slug: "human-hair-blend-lace-wigs" },
      { name: "Glueless Lace Wigs", slug: "glueless-lace-wigs" },
      { name: "Synthetic Hair Wigs", slug: "synthetic-hair-wigs" },
      // Note: Wig Care is a standalone category but also appears in Lace Wigs dropdown
      // The navigation code will handle showing it in both places
    ];

    for (const subcat of laceWigsSubcategories) {
      await prisma.category.upsert({
        where: { slug: subcat.slug },
        update: {
          name: subcat.name,
          parentId: laceWigs.id,
        },
        create: {
          name: subcat.name,
          slug: subcat.slug,
          parentId: laceWigs.id,
        },
      });
    }
    console.log(`✅ Created ${laceWigsSubcategories.length} Lace Wigs subcategories`);

    // 5. Clip-Ins category with subcategories
    const clipIns = await prisma.category.upsert({
      where: { slug: "clip-ins" },
      update: { name: "Clip-Ins" },
      create: {
        name: "Clip-Ins",
        slug: "clip-ins",
        description: "Clip-Ins collection",
      },
    });
    console.log("✅ Clip-Ins category ready");

    // Clip-Ins subcategories
    const clipInsSubcategories = [
      { name: "Human Hair Blend Clip-ins", slug: "human-hair-blend-clip-ins" },
      { name: "Human Hair Clip-ins", slug: "human-hair-clip-ins" },
    ];

    for (const subcat of clipInsSubcategories) {
      await prisma.category.upsert({
        where: { slug: subcat.slug },
        update: {
          name: subcat.name,
          parentId: clipIns.id,
        },
        create: {
          name: subcat.name,
          slug: subcat.slug,
          parentId: clipIns.id,
        },
      });
    }
    console.log(`✅ Created ${clipInsSubcategories.length} Clip-Ins subcategories`);

    // 6. Hair Growth Oils category
    const hairGrowthOils = await prisma.category.upsert({
      where: { slug: "hair-growth-oils" },
      update: { name: "Hair Growth Oils" },
      create: {
        name: "Hair Growth Oils",
        slug: "hair-growth-oils",
        description: "Hair Growth Oils collection",
      },
    });
    console.log("✅ Hair Growth Oils category ready");

    // 7. Wig Care (standalone category for secondary nav)
    const wigCare = await prisma.category.upsert({
      where: { slug: "wig-care" },
      update: { name: "Wig Care" },
      create: {
        name: "Wig Care",
        slug: "wig-care",
        description: "Wig Care products",
      },
    });
    console.log("✅ Wig Care category ready");

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("✅ Navigation categories setup complete!");
    console.log("=".repeat(60));
    console.log("\nCategories created:");
    console.log("  - Shop All");
    console.log("  - Braids (with 4 subcategories)");
    console.log("  - Ponytails (with 2 subcategories)");
    console.log("  - Lace Wigs (with 4 subcategories)");
    console.log("  - Clip-Ins (with 2 subcategories)");
    console.log("  - Hair Growth Oils");
    console.log("  - Wig Care");
    console.log("\n💡 Note: Brands are managed separately in the brands table.");
    console.log("   Make sure all brands are added via the admin panel.");

  } catch (error: any) {
    console.error("❌ Error setting up categories:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

setupNavigationCategories()
  .then(() => {
    console.log("\n✅ Setup complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Setup failed:", error);
    process.exit(1);
  });

