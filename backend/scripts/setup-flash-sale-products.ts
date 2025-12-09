import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🎄 Setting up Christmas Mega Sale with 10 products...\n");

  // Get existing categories or use default
  const getCategoryId = async (name: string, fallbackName?: string) => {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    let category = await prisma.category.findUnique({
      where: { slug },
    });
    if (!category && fallbackName) {
      const fallbackSlug = fallbackName.toLowerCase().replace(/\s+/g, "-");
      category = await prisma.category.findUnique({
        where: { slug: fallbackSlug },
      });
    }
    if (!category) {
      // Use "Shop All" as fallback
      category = await prisma.category.findFirst({
        where: { name: { contains: "All", mode: "insensitive" } },
      });
    }
    if (!category) {
      throw new Error(`Category not found: ${name}`);
    }
    return category.id;
  };

  const wigsCategoryId = await getCategoryId("Lace Wigs", "Wigs");
  const braidingCategoryId = await getCategoryId("Braids", "Braiding Hair");
  const extensionsCategoryId = await getCategoryId("Clip-ins", "Extensions");
  const hairCareCategoryId = await getCategoryId("Wig Care", "Hair Care");

  // Product data from the image
  const productData = [
    {
      title: "Premium Lace Front Wig - Black",
      slug: "premium-lace-front-wig-black",
      priceGhs: 315.00,
      compareAtPriceGhs: 450.00, // Original price (30% off = 315)
      description: "Premium quality lace front wig in black. Natural looking hairline with comfortable cap construction.",
      categoryId: wigsCategoryId,
      isActive: true,
    },
    {
      title: "Zury Sis Crochet Braid - V11 Boho CURLY 12/13/14 inch",
      slug: "zury-sis-crochet-braid-v11-boho-curly",
      priceGhs: 315.00,
      compareAtPriceGhs: 450.00,
      description: "Beautiful boho curly crochet braid hair in 12/13/14 inch lengths. Perfect for protective styling.",
      categoryId: braidingCategoryId,
      isActive: true,
    },
    {
      title: "African Pride Braid Sheen Spray 12oz",
      slug: "african-pride-braid-sheen-spray-12oz",
      priceGhs: 136.50,
      compareAtPriceGhs: 195.00,
      description: "Keep your braids looking fresh and shiny with this nourishing braid sheen spray. Rosemary & mint formula.",
      categoryId: hairCareCategoryId,
      isActive: true,
    },
    {
      title: "Outre X-Pression LiL Looks 3X Crochet Braid - SPRINGY AFR...",
      slug: "outre-xpression-lil-looks-3x-crochet-braid",
      priceGhs: 525.00,
      compareAtPriceGhs: 750.00,
      description: "Springy afro-textured crochet braid hair. Easy to install and style. Natural looking texture.",
      categoryId: braidingCategoryId,
      isActive: true,
    },
    {
      title: "Outre Human Hair Blend Big Beautiful Hair Clip In 9 - 4A...",
      slug: "outre-human-hair-blend-clip-in-9",
      priceGhs: 455.00,
      compareAtPriceGhs: 650.00,
      description: "Human hair blend clip-in extensions in 4A texture. Instant volume and length. Easy to apply.",
      categoryId: extensionsCategoryId,
      isActive: true,
    },
    {
      title: "Mane Concept Mega Brazilian Human Hair Blend Braids -...",
      slug: "mane-concept-mega-brazilian-braids",
      priceGhs: 840.00,
      compareAtPriceGhs: 1200.00,
      description: "Premium Brazilian human hair blend braids. Full density for a natural, voluminous look.",
      categoryId: braidingCategoryId,
      isActive: true,
    },
    {
      title: "Vivica A Fox 100% Brazilian Human Hair Blend Drawstring...",
      slug: "vivica-a-fox-brazilian-hair-blend-drawstring",
      priceGhs: 350.00,
      compareAtPriceGhs: 500.00,
      description: "Luxurious Brazilian human hair blend drawstring ponytail. Easy to install and style.",
      categoryId: wigsCategoryId,
      isActive: true,
    },
    {
      title: "Sensationnel Curls Kinks Textured Glueless HD 13x6...",
      slug: "sensationnel-curls-kinks-textured-glueless-hd",
      priceGhs: 840.00,
      compareAtPriceGhs: 1200.00,
      description: "Glueless HD lace wig with curls and kinks texture. Natural looking hairline. 13x6 lace part.",
      categoryId: wigsCategoryId,
      isActive: true,
    },
    {
      title: "NEW! Wild Growth \"Never Before Now Growth\" Hair Oil ...",
      slug: "wild-growth-never-before-now-growth-hair-oil",
      priceGhs: 129.50,
      compareAtPriceGhs: 185.00,
      description: "Revolutionary hair growth oil formula. Promotes healthy hair growth and strengthens hair follicles.",
      categoryId: hairCareCategoryId,
      isActive: true,
    },
    {
      title: "Sensationnel OCEAN WAVE 30 inches BUTTA Human Hair...",
      slug: "sensationnel-ocean-wave-30-inches-butta",
      priceGhs: 350.00,
      compareAtPriceGhs: 500.00,
      description: "Beautiful ocean wave texture in 30 inches. Butta human hair blend for a silky, natural look.",
      categoryId: braidingCategoryId,
      isActive: true,
    },
  ];

  console.log("📦 Creating/updating products...\n");

  const productIds: string[] = [];

  for (const data of productData) {
    try {
      // Check if product exists by slug
      const existing = await prisma.product.findUnique({
        where: { slug: data.slug },
      });

      if (existing) {
        // Update existing product
        const updated = await prisma.product.update({
          where: { id: existing.id },
          data: {
            title: data.title,
            priceGhs: data.priceGhs,
            compareAtPriceGhs: data.compareAtPriceGhs,
            description: data.description,
            categoryId: data.categoryId,
            isActive: data.isActive,
          },
        });
        productIds.push(updated.id);
        console.log(`  ✅ Updated: ${data.title}`);
      } else {
        // Create new product
        const { categoryId, ...productData } = data;
        const created = await prisma.product.create({
          data: {
            ...productData,
            categoryId,
            sku: `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            stock: 100,
            images: [],
            badges: [],
          },
        });
        productIds.push(created.id);
        console.log(`  ✅ Created: ${data.title}`);
      }
    } catch (error: any) {
      console.log(`  ❌ Error with ${data.title}:`, error.message);
    }
  }

  console.log(`\n✅ Created/updated ${productIds.length} products\n`);

  // Create or update flash sale
  console.log("🎄 Setting up Christmas Mega Sale...\n");

  const now = new Date();
  const endDate = new Date("2025-12-31T23:59:59Z");

  let flashSale = await prisma.flashSale.findFirst({
    where: { isActive: true },
    include: {
      products: true,
    },
  });

  if (flashSale) {
    console.log(`  📋 Found existing flash sale: "${flashSale.title}"`);
    console.log(`  🔄 Updating to Christmas Mega Sale...`);

    await prisma.flashSale.update({
      where: { id: flashSale.id },
      data: {
        title: "⚡ Christmas Mega Sale",
        description: "Celebrate the holidays with amazing deals! Up to 30% off on selected hair products. Perfect gifts for yourself or loved ones!",
        startDate: now,
        endDate: endDate,
        discountPercent: 30.0,
        isActive: true,
      },
    });
    console.log(`  ✅ Updated flash sale`);
  } else {
    console.log(`  ➕ Creating new flash sale...`);
    flashSale = await prisma.flashSale.create({
      data: {
        title: "⚡ Christmas Mega Sale",
        description: "Celebrate the holidays with amazing deals! Up to 30% off on selected hair products. Perfect gifts for yourself or loved ones!",
        startDate: now,
        endDate: endDate,
        discountPercent: 30.0,
        isActive: true,
      },
      include: {
        products: true,
      },
    });
    console.log(`  ✅ Created flash sale`);
  }

  // Remove existing products from flash sale
  console.log(`  🗑️  Clearing existing products from flash sale...`);
  await prisma.flashSaleProduct.deleteMany({
    where: { flashSaleId: flashSale.id },
  });

  // Add the 10 products to flash sale
  console.log(`  ➕ Adding ${productIds.length} products to flash sale...`);
  await prisma.flashSaleProduct.createMany({
    data: productIds.map((productId) => ({
      flashSaleId: flashSale!.id,
      productId,
    })),
    skipDuplicates: true,
  });
  console.log(`  ✅ Added ${productIds.length} products to flash sale`);

  // Verify final state
  const finalFlashSale = await prisma.flashSale.findUnique({
    where: { id: flashSale.id },
    include: {
      products: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              priceGhs: true,
              compareAtPriceGhs: true,
            },
          },
        },
      },
    },
  });

  console.log("\n✅ Flash Sale Setup Complete!");
  console.log(`   - Title: ${finalFlashSale?.title}`);
  console.log(`   - Description: ${finalFlashSale?.description}`);
  console.log(`   - Discount: ${finalFlashSale?.discountPercent}%`);
  console.log(`   - Products: ${finalFlashSale?.products.length}`);
  console.log(`   - End Date: ${finalFlashSale?.endDate}`);
  console.log("\n📋 Products in Flash Sale:");
  finalFlashSale?.products.forEach((fp, index) => {
    const p = fp.product;
    console.log(`   ${index + 1}. ${p.title}`);
    console.log(`      Price: GHC${p.priceGhs} (Was: GHC${p.compareAtPriceGhs})`);
  });

  console.log("\n🎉 All done! Flash sale is now visible on frontend!");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
