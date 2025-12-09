import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Creating homepage content from screenshots...\n");

  // ============================================
  // 1. CREATE BLOG POSTS
  // ============================================
  console.log("📝 Creating blog posts...");

  const blogPosts = [
    {
      title: "How to Care for Your Lace Wig: A Complete Guide",
      slug: "how-to-care-for-your-lace-wig-complete-guide",
      excerpt: "Learn the essential tips and tricks to maintain your lace wig and keep it looking fresh and natural for longer.",
      content: `
# How to Care for Your Lace Wig: A Complete Guide

Taking care of your lace wig is essential to maintain its beauty and longevity. Here are some essential tips and tricks to keep your lace wig looking fresh and natural for longer.

## Washing Your Lace Wig

1. **Use the Right Products**: Always use sulfate-free shampoos and conditioners specifically designed for synthetic or human hair wigs.
2. **Gentle Washing**: Wash your wig in cool water, gently massaging the shampoo through the hair strands.
3. **Condition Properly**: Apply conditioner from mid-shaft to ends, avoiding the roots and lace.

## Styling Tips

- Use low heat settings when styling
- Avoid excessive brushing
- Store your wig on a wig stand when not in use
- Protect from direct sunlight and heat

## Maintenance

Regular maintenance will extend the life of your lace wig significantly. Follow these guidelines for best results.
      `,
      category: "Hair Care Tips",
      tags: ["wig care", "maintenance", "tips"],
      isPublished: true,
      publishedAt: new Date("2025-12-06"),
      authorName: "Juelle Hair Team",
    },
    {
      title: "5 Protective Styles Using Braiding Hair",
      slug: "5-protective-styles-using-braiding-hair",
      excerpt: "Discover five beautiful protective hairstyles you can create with braiding hair to protect your natural hair while looking fabulous.",
      content: `
# 5 Protective Styles Using Braiding Hair

Protective hairstyles are essential for maintaining healthy natural hair. Here are five beautiful styles you can create with braiding hair.

## 1. Box Braids

Classic and timeless, box braids offer excellent protection and versatility.

## 2. Cornrows

Perfect for a sleek, low-maintenance look that protects your edges.

## 3. Twists

Gentle on your hair while providing a beautiful, natural look.

## 4. Crochet Braids

Quick installation with endless styling possibilities.

## 5. Faux Locs

Achieve the loc look without the long-term commitment.

Each of these styles offers unique benefits for protecting your natural hair while keeping you looking fabulous!
      `,
      category: "Styling Tips",
      tags: ["protective styles", "braiding", "hairstyles"],
      isPublished: true,
      publishedAt: new Date("2025-12-04"),
      authorName: "Juelle Hair Team",
    },
    {
      title: "Choosing the Right Hair Color: A Complete Guide",
      slug: "choosing-right-hair-color-complete-guide",
      excerpt: "Not sure which hair color to choose? Our comprehensive guide will help you find the perfect shade to match your skin tone and style.",
      content: `
# Choosing the Right Hair Color: A Complete Guide

Finding the perfect hair color can be overwhelming with so many options available. Our comprehensive guide will help you find the perfect shade to match your skin tone and style.

## Understanding Your Skin Tone

### Warm Undertones
- Look for golden, honey, or caramel tones
- Avoid ashy or cool colors

### Cool Undertones
- Opt for ash, platinum, or cool brown shades
- Avoid warm, golden tones

### Neutral Undertones
- You can pull off both warm and cool tones
- Experiment with different shades

## Color Selection Tips

1. **Consider Your Lifestyle**: Choose colors that match your daily routine
2. **Maintenance Level**: Some colors require more upkeep than others
3. **Seasonal Changes**: Consider how colors look in different lighting
4. **Professional Setting**: Ensure your color choice is appropriate for your workplace

## Popular Color Options

- **Natural Black**: Classic and timeless
- **Brown Shades**: Versatile and low-maintenance
- **Highlights**: Add dimension without full commitment
- **Bold Colors**: Express your personality with vibrant shades

With this guide, you'll be able to choose the perfect hair color that complements your skin tone and reflects your personal style!
      `,
      category: "Buying Guide",
      tags: ["hair color", "styling", "guide"],
      isPublished: true,
      publishedAt: new Date("2025-12-01"),
      authorName: "Juelle Hair Team",
      // Note: Featured image would need to be uploaded separately
    },
    {
      title: "Why Choose Glueless Lace Wigs?",
      slug: "why-choose-glueless-lace-wigs",
      excerpt: "Discover the benefits of glueless lace wigs and why they're becoming the preferred choice for wig wearers everywhere.",
      content: `
# Why Choose Glueless Lace Wigs?

Glueless lace wigs are revolutionizing the wig industry, offering convenience and comfort like never before. Discover why they're becoming the preferred choice for wig wearers everywhere.

## Benefits of Glueless Lace Wigs

### 1. Easy Application
- No messy adhesives required
- Quick installation process
- Perfect for beginners

### 2. Comfortable Wear
- Breathable construction
- Lightweight design
- No irritation from adhesives

### 3. Versatile Styling
- Can be styled in multiple ways
- Easy to remove and reapply
- Perfect for daily wear

### 4. Hair Protection
- Protects your natural hair
- Allows for easy maintenance
- Reduces damage from styling

## Who Should Consider Glueless Wigs?

- First-time wig wearers
- Those with sensitive skin
- People who want quick style changes
- Anyone looking for low-maintenance options

Glueless lace wigs offer the perfect combination of style, comfort, and convenience. Experience the difference today!
      `,
      category: "Product Guide",
      tags: ["glueless wigs", "lace wigs", "benefits"],
      isPublished: true,
      publishedAt: new Date("2025-11-29"),
      authorName: "Juelle Hair Team",
    },
  ];

  for (const postData of blogPosts) {
    // Check if post already exists
    const existing = await prisma.blogPost.findUnique({
      where: { slug: postData.slug },
    });

    if (existing) {
      console.log(`  ⚠️  Blog post "${postData.title}" already exists, updating...`);
      await prisma.blogPost.update({
        where: { id: existing.id },
        data: {
          title: postData.title,
          excerpt: postData.excerpt,
          content: postData.content,
          category: postData.category,
          tags: postData.tags,
          isPublished: postData.isPublished,
          publishedAt: postData.publishedAt,
          authorName: postData.authorName,
        },
      });
      console.log(`  ✅ Updated: ${postData.title}`);
    } else {
      await prisma.blogPost.create({
        data: postData,
      });
      console.log(`  ✅ Created: ${postData.title}`);
    }
  }

  console.log("\n✅ Blog posts created/updated successfully!\n");

  // ============================================
  // 2. CREATE/UPDATE CHRISTMAS MEGA SALE
  // ============================================
  console.log("🎄 Creating/updating Christmas Mega Sale...");

  // Calculate end date (25 days from now, or use a specific date)
  const now = new Date();
  const endDate = new Date("2025-12-31T23:59:59Z"); // End of December 2025

  // Find existing active flash sale or create new one
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

  // Get all active products to add to flash sale
  const allProducts = await prisma.product.findMany({
    where: { isActive: true },
    take: 50,
  });

  if (allProducts.length === 0) {
    console.log("  ⚠️  No active products found. Please create products first.");
  } else {
    // Get current product IDs in flash sale
    const currentProductIds = flashSale.products.map((p) => p.productId);

    // Get products not already in the flash sale
    const availableProducts = allProducts.filter(
      (p) => !currentProductIds.includes(p.id)
    );

    // Add up to 10 products total (or fill remaining slots)
    const targetCount = 10;
    const needed = Math.max(0, targetCount - currentProductIds.length);
    const productsToAdd = availableProducts.slice(0, needed);

    if (productsToAdd.length > 0) {
      console.log(`  ➕ Adding ${productsToAdd.length} products to flash sale...`);
      await prisma.flashSaleProduct.createMany({
        data: productsToAdd.map((product) => ({
          flashSaleId: flashSale!.id,
          productId: product.id,
        })),
        skipDuplicates: true,
      });
      console.log(`  ✅ Added ${productsToAdd.length} products`);
    } else if (currentProductIds.length >= targetCount) {
      console.log(`  ✅ Flash sale already has ${currentProductIds.length} products`);
    } else {
      console.log(`  ⚠️  Only ${currentProductIds.length} products in flash sale (target: ${targetCount})`);
    }

    // Update products to have sale prices (set compareAtPriceGhs > priceGhs)
    const flashSaleProducts = await prisma.flashSaleProduct.findMany({
      where: { flashSaleId: flashSale.id },
      include: { product: true },
    });

    console.log(`  💰 Updating product prices for flash sale...`);
    let updatedCount = 0;
    for (const flashSaleProduct of flashSaleProducts) {
      const product = flashSaleProduct.product;
      const currentPrice = Number(product.priceGhs);
      
      // Only update if compareAtPriceGhs is not already set or is less than current price
      if (!product.compareAtPriceGhs || Number(product.compareAtPriceGhs) <= currentPrice) {
        // Set compareAtPriceGhs to original price, and priceGhs to discounted price
        const originalPrice = currentPrice;
        const discount = (originalPrice * 30) / 100; // 30% discount
        const salePrice = originalPrice - discount;

        await prisma.product.update({
          where: { id: product.id },
          data: {
            compareAtPriceGhs: originalPrice,
            priceGhs: salePrice,
          },
        });
        updatedCount++;
      }
    }
    console.log(`  ✅ Updated ${updatedCount} product prices`);
  }

  // Verify final state
  const finalFlashSale = await prisma.flashSale.findUnique({
    where: { id: flashSale.id },
    include: {
      products: {
        include: {
          product: true,
        },
      },
    },
  });

  console.log("\n✅ Christmas Mega Sale setup complete!");
  console.log(`   - Title: ${finalFlashSale?.title}`);
  console.log(`   - Description: ${finalFlashSale?.description}`);
  console.log(`   - Discount: ${finalFlashSale?.discountPercent}%`);
  console.log(`   - Products: ${finalFlashSale?.products.length}`);
  console.log(`   - End Date: ${finalFlashSale?.endDate}`);

  console.log("\n🎉 All homepage content created successfully!");
  console.log("\n📋 Summary:");
  console.log(`   - Blog Posts: ${blogPosts.length} created/updated`);
  console.log(`   - Flash Sale: Created/updated with ${finalFlashSale?.products.length || 0} products`);
  console.log("\n💡 Note: You may need to upload featured images for blog posts through the admin dashboard.");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
