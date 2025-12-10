import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Comprehensive setup script for all features:
 * - Categories (ensure Shop All exists)
 * - Reviews (sample data if needed)
 * - Blog posts (sample posts)
 * - Flash sales (sample flash sale)
 */
async function setupAllFeatures() {
  console.log("🚀 Setting up all features...\n");

  try {
    // 1. Ensure Shop All category exists
    console.log("📋 Step 1: Setting up categories...");
    let shopAll = await prisma.category.findFirst({
      where: { slug: "shop-all" },
    });

    if (!shopAll) {
      shopAll = await prisma.category.create({
        data: {
          name: "Shop All",
          slug: "shop-all",
          description: "All products",
        },
      });
      console.log("✅ Created category: Shop All");
    } else {
      console.log("✅ Category 'Shop All' already exists");
    }

    // Ensure other main categories exist
    const mainCategories = [
      { name: "Lace Wigs", slug: "lace-wigs", description: "Lace front wigs" },
      { name: "Braids", slug: "braids", description: "Braiding extensions" },
      { name: "Ponytails", slug: "ponytails", description: "Ponytail extensions" },
      { name: "Clip-ins", slug: "clip-ins", description: "Clip-in hair extensions" },
      { name: "Hair Care", slug: "wig-care", description: "Hair care products" },
    ];

    for (const catData of mainCategories) {
      let category = await prisma.category.findFirst({
        where: { slug: catData.slug },
      });

      if (!category) {
        category = await prisma.category.create({
          data: catData,
        });
        console.log(`✅ Created category: ${category.name}`);
      }
    }

    // 2. Setup sample blog posts
    console.log("\n📝 Step 2: Setting up blog posts...");
    const existingBlogPosts = await prisma.blogPost.count();
    
    if (existingBlogPosts === 0) {
      const samplePosts = [
        {
          title: "How to Care for Your Human Hair Wig",
          slug: "how-to-care-for-human-hair-wig",
          excerpt: "Learn the best practices for maintaining your human hair wig to keep it looking beautiful and lasting longer.",
          content: `
# How to Care for Your Human Hair Wig

Proper care is essential to maintain the quality and longevity of your human hair wig. Here are some expert tips:

## Washing Your Wig

1. **Use the Right Products**: Always use sulfate-free shampoo and conditioner designed for human hair wigs.
2. **Gentle Washing**: Fill a basin with cool water and gently swish the wig. Avoid rubbing or twisting.
3. **Conditioning**: Apply conditioner from mid-length to ends, avoiding the roots.
4. **Rinse Thoroughly**: Rinse with cool water until all product is removed.

## Drying

- Gently pat dry with a towel
- Place on a wig stand to air dry
- Never use high heat or direct sunlight

## Styling

- Use heat protectant before styling
- Keep heat tools below 350°F
- Use wide-tooth combs for detangling

With proper care, your human hair wig can last for years!
          `,
          category: "Tips",
          tags: ["wig care", "maintenance", "tips"],
          isPublished: true,
          publishedAt: new Date(),
        },
        {
          title: "Best Braiding Styles for 2025",
          slug: "best-braiding-styles-2025",
          excerpt: "Discover the trending braiding styles that are taking 2025 by storm.",
          content: `
# Best Braiding Styles for 2025

2025 brings exciting new trends in braiding styles. Here are the top styles to try:

## Trending Styles

1. **Boho Box Braids**: Natural, free-flowing braids with a bohemian vibe
2. **Kinky Twists**: Perfect for a natural look with added texture
3. **Water Wave Braids**: Beautiful waves that mimic natural hair texture
4. **Springy Afro Twists**: Bold and voluminous for a statement look

## Choosing the Right Length

- **Short (12-16 inches)**: Perfect for everyday wear
- **Medium (18-22 inches)**: Versatile and easy to style
- **Long (24+ inches)**: Dramatic and eye-catching

Find your perfect style at Juelle Hair Ghana!
          `,
          category: "Trends",
          tags: ["braids", "trends", "2025", "styles"],
          isPublished: true,
          publishedAt: new Date(),
        },
      ];

      for (const postData of samplePosts) {
        await prisma.blogPost.create({
          data: postData,
        });
        console.log(`✅ Created blog post: ${postData.title}`);
      }
    } else {
      console.log(`✅ Blog posts already exist (${existingBlogPosts} posts)`);
    }

    // 3. Setup sample flash sale
    console.log("\n⚡ Step 3: Setting up flash sales...");
    const existingFlashSales = await prisma.flashSale.count({
      where: {
        isActive: true,
        endDate: {
          gte: new Date(),
        },
      },
    });

    if (existingFlashSales === 0) {
      const flashSale = await prisma.flashSale.create({
        data: {
          title: "Holiday Flash Sale",
          description: "Limited time offer on selected products",
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          discountPercent: 25.00, // Decimal(5,2) format
          isActive: true,
        },
      });
      console.log(`✅ Created flash sale: ${flashSale.title} (${flashSale.discountPercent}% off)`);

      // Add some products to flash sale (first 5 products)
      const products = await prisma.product.findMany({
        where: { isActive: true },
        take: 5,
      });

      for (const product of products) {
        await prisma.flashSaleProduct.create({
          data: {
            flashSaleId: flashSale.id,
            productId: product.id,
          },
        });
      }
      console.log(`✅ Added ${products.length} products to flash sale`);
    } else {
      console.log(`✅ Active flash sales already exist (${existingFlashSales} sales)`);
    }

    // 4. Verify reviews feature (just check if it's working)
    console.log("\n⭐ Step 4: Checking reviews feature...");
    const reviewCount = await prisma.review.count();
    console.log(`✅ Reviews feature ready (${reviewCount} reviews in database)`);

    // 5. Summary
    console.log("\n📊 Feature Summary:");
    const stats = {
      categories: await prisma.category.count(),
      products: await prisma.product.count({ where: { isActive: true } }),
      blogPosts: await prisma.blogPost.count({ where: { isPublished: true } }),
      flashSales: await prisma.flashSale.count({ where: { isActive: true } }),
      reviews: await prisma.review.count(),
    };

    console.log(`  Categories: ${stats.categories}`);
    console.log(`  Active Products: ${stats.products}`);
    console.log(`  Published Blog Posts: ${stats.blogPosts}`);
    console.log(`  Active Flash Sales: ${stats.flashSales}`);
    console.log(`  Reviews: ${stats.reviews}`);

    console.log("\n🎉 All features setup complete!");
  } catch (error) {
    console.error("❌ Error setting up features:", error);
    throw error;
  }
}

async function main() {
  try {
    await setupAllFeatures();
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
