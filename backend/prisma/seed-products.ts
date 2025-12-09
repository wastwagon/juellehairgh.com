import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

// Sample product data - Replace with your actual product data
const sampleProducts = [
  {
    title: "Premium Human Hair Wig",
    slug: "premium-human-hair-wig",
    description: "High-quality human hair wig with natural look and feel.",
    priceGhs: 450.00,
    compareAtPriceGhs: 550.00,
    stock: 50,
    sku: "WIG-001",
    images: ["/media/products/wig-001-1.jpg", "/media/products/wig-001-2.jpg"],
    badges: ["New Arrival", "Best Seller"],
    isActive: true,
  },
  {
    title: "Lace Front Wig - Black",
    slug: "lace-front-wig-black",
    description: "Natural-looking lace front wig in classic black color.",
    priceGhs: 380.00,
    compareAtPriceGhs: 450.00,
    stock: 30,
    sku: "WIG-002",
    images: ["/media/products/wig-002-1.jpg"],
    badges: ["Popular"],
    isActive: true,
  },
  // Add more products here or import from JSON/CSV
];

async function seedProducts() {
  console.log("🌱 Starting product seeding...");

  try {
    // Check if products already exist
    const existingProducts = await prisma.product.count();
    if (existingProducts > 0) {
      console.log(`⚠️  Found ${existingProducts} existing products. Skipping seed.`);
      console.log("💡 To re-seed, delete all products first or modify this script.");
      return;
    }

    // Ensure categories exist
    let category = await prisma.category.findFirst({
      where: { slug: "wigs" },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: "Wigs",
          slug: "wigs",
          description: "Premium quality wigs",
        },
      });
      console.log("✅ Created default category: Wigs");
    }

    // Ensure brand exists
    let brand = await prisma.brand.findFirst({
      where: { slug: "juelle-hair" },
    });

    if (!brand) {
      brand = await prisma.brand.create({
        data: {
          name: "Juelle Hair",
          slug: "juelle-hair",
          description: "Premium hair products from Juelle Hair Ghana",
        },
      });
      console.log("✅ Created default brand: Juelle Hair");
    }

    // Create products
    console.log(`📦 Creating ${sampleProducts.length} products...`);
    for (const productData of sampleProducts) {
      const product = await prisma.product.create({
        data: {
          ...productData,
          categoryId: category.id,
          brandId: brand.id,
        },
      });
      console.log(`✅ Created product: ${product.title} (${product.slug})`);
    }

    console.log("🎉 Product seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding products:", error);
    throw error;
  }
}

async function main() {
  try {
    await seedProducts();
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
