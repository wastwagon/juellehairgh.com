import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Comprehensive setup script for:
 * - Collections (New Arrivals, Best Sellers, Clearance, Wigs Under GH₵ 500)
 * - Sample Reviews (with sample users if needed)
 * - Social Media Settings (Facebook, Instagram, Twitter)
 */
async function setupCollectionsReviewsSocial() {
  console.log("🚀 Setting up Collections, Reviews, and Social Media...\n");

  try {
    // 1. Setup Collections
    console.log("📋 Step 1: Setting up collections...");
    
    const collections = [
      {
        name: "New Arrivals",
        slug: "new-arrivals",
        description: "Check out our latest products",
        image: null, // Can be set later
      },
      {
        name: "Best Sellers",
        slug: "best-sellers",
        description: "Our most popular products",
        image: null,
      },
      {
        name: "Clearance",
        slug: "clearance",
        description: "Limited time clearance deals",
        image: null,
      },
      {
        name: "Wigs Under GH₵ 500",
        slug: "wigs-under-ghc-500",
        description: "Affordable wigs under GH₵ 500",
        image: null,
      },
    ];

    const createdCollections: { [key: string]: any } = {};

    for (const collectionData of collections) {
      let collection = await prisma.collection.findFirst({
        where: { slug: collectionData.slug },
      });

      if (!collection) {
        collection = await prisma.collection.create({
          data: collectionData,
        });
        console.log(`✅ Created collection: ${collection.name}`);
      } else {
        console.log(`✅ Collection '${collection.name}' already exists`);
      }

      createdCollections[collectionData.slug] = collection;
    }

    // 2. Populate Collections with Products
    console.log("\n📦 Step 2: Populating collections with products...");

    // Get all active products
    const allProducts = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    console.log(`Found ${allProducts.length} active products`);

    // New Arrivals: Latest 8 products
    if (createdCollections["new-arrivals"] && allProducts.length > 0) {
      const newArrivals = allProducts.slice(0, 8);
      for (let i = 0; i < newArrivals.length; i++) {
        await prisma.collectionProduct.upsert({
          where: {
            collectionId_productId: {
              collectionId: createdCollections["new-arrivals"].id,
              productId: newArrivals[i].id,
            },
          },
          create: {
            collectionId: createdCollections["new-arrivals"].id,
            productId: newArrivals[i].id,
            position: i,
          },
          update: {
            position: i,
          },
        });
      }
      console.log(`✅ Added ${newArrivals.length} products to New Arrivals`);
    }

    // Best Sellers: Random 8 products (or products with reviews)
    if (createdCollections["best-sellers"] && allProducts.length > 0) {
      // Get products with reviews first, then fill with random
      const productsWithReviews = await prisma.review.groupBy({
        by: ["productId"],
        _count: { productId: true },
        orderBy: { _count: { productId: "desc" } },
        take: 8,
      });

      const bestSellerIds = productsWithReviews.map((r) => r.productId);
      const remaining = allProducts
        .filter((p) => !bestSellerIds.includes(p.id))
        .slice(0, 8 - bestSellerIds.length);
      const bestSellers = [
        ...allProducts.filter((p) => bestSellerIds.includes(p.id)),
        ...remaining,
      ].slice(0, 8);

      for (let i = 0; i < bestSellers.length; i++) {
        await prisma.collectionProduct.upsert({
          where: {
            collectionId_productId: {
              collectionId: createdCollections["best-sellers"].id,
              productId: bestSellers[i].id,
            },
          },
          create: {
            collectionId: createdCollections["best-sellers"].id,
            productId: bestSellers[i].id,
            position: i,
          },
          update: {
            position: i,
          },
        });
      }
      console.log(`✅ Added ${bestSellers.length} products to Best Sellers`);
    }

    // Clearance: Products with compareAtPriceGhs (on sale)
    if (createdCollections["clearance"] && allProducts.length > 0) {
      const clearanceProducts = allProducts
        .filter((p) => p.compareAtPriceGhs && p.compareAtPriceGhs < p.priceGhs)
        .slice(0, 8);

      if (clearanceProducts.length === 0) {
        // If no clearance products, use random products
        const randomProducts = allProducts.slice(0, 8);
        for (let i = 0; i < randomProducts.length; i++) {
          await prisma.collectionProduct.upsert({
            where: {
              collectionId_productId: {
                collectionId: createdCollections["clearance"].id,
                productId: randomProducts[i].id,
              },
            },
            create: {
              collectionId: createdCollections["clearance"].id,
              productId: randomProducts[i].id,
              position: i,
            },
            update: {
              position: i,
            },
          });
        }
        console.log(`✅ Added ${randomProducts.length} products to Clearance (fallback)`);
      } else {
        for (let i = 0; i < clearanceProducts.length; i++) {
          await prisma.collectionProduct.upsert({
            where: {
              collectionId_productId: {
                collectionId: createdCollections["clearance"].id,
                productId: clearanceProducts[i].id,
              },
            },
            create: {
              collectionId: createdCollections["clearance"].id,
              productId: clearanceProducts[i].id,
              position: i,
            },
            update: {
              position: i,
            },
          });
        }
        console.log(`✅ Added ${clearanceProducts.length} products to Clearance`);
      }
    }

    // Wigs Under GH₵ 500: Products with price <= 500
    if (createdCollections["wigs-under-ghc-500"] && allProducts.length > 0) {
      const affordableProducts = allProducts
        .filter((p) => Number(p.priceGhs) <= 500)
        .slice(0, 8);

      if (affordableProducts.length === 0) {
        // If no products under 500, use cheapest products
        const cheapestProducts = [...allProducts]
          .sort((a, b) => Number(a.priceGhs) - Number(b.priceGhs))
          .slice(0, 8);

        for (let i = 0; i < cheapestProducts.length; i++) {
          await prisma.collectionProduct.upsert({
            where: {
              collectionId_productId: {
                collectionId: createdCollections["wigs-under-ghc-500"].id,
                productId: cheapestProducts[i].id,
              },
            },
            create: {
              collectionId: createdCollections["wigs-under-ghc-500"].id,
              productId: cheapestProducts[i].id,
              position: i,
            },
            update: {
              position: i,
            },
          });
        }
        console.log(`✅ Added ${cheapestProducts.length} products to Wigs Under GH₵ 500 (fallback)`);
      } else {
        for (let i = 0; i < affordableProducts.length; i++) {
          await prisma.collectionProduct.upsert({
            where: {
              collectionId_productId: {
                collectionId: createdCollections["wigs-under-ghc-500"].id,
                productId: affordableProducts[i].id,
              },
            },
            create: {
              collectionId: createdCollections["wigs-under-ghc-500"].id,
              productId: affordableProducts[i].id,
              position: i,
            },
            update: {
              position: i,
            },
          });
        }
        console.log(`✅ Added ${affordableProducts.length} products to Wigs Under GH₵ 500`);
      }
    }

    // 3. Setup Social Media Settings
    console.log("\n📱 Step 3: Setting up social media settings...");

    const socialSettings = [
      {
        key: "SOCIAL_FACEBOOK",
        value: "https://www.facebook.com/juellehairgh",
        description: "Facebook page URL",
      },
      {
        key: "SOCIAL_INSTAGRAM",
        value: "https://www.instagram.com/juellehairgh",
        description: "Instagram profile URL",
      },
      {
        key: "SOCIAL_TWITTER",
        value: "https://www.twitter.com/juellehairgh",
        description: "Twitter profile URL",
      },
    ];

    for (const setting of socialSettings) {
      await prisma.setting.upsert({
        where: { key: setting.key },
        create: setting,
        update: {
          value: setting.value,
          description: setting.description,
        },
      });
      console.log(`✅ Set ${setting.key}: ${setting.value}`);
    }

    // 4. Setup Sample Reviews
    console.log("\n⭐ Step 4: Setting up sample reviews...");

    // Check if we have any users
    const users = await prisma.user.findMany({
      take: 5,
    });

    if (users.length === 0) {
      console.log("⚠️  No users found. Creating sample users for reviews...");
      
      // Create sample users
      const bcrypt = require("bcrypt");
      const sampleUsers = [
        {
          email: "customer1@example.com",
          password: await bcrypt.hash("password123", 10),
          name: "Sarah Mensah",
          role: "CUSTOMER" as const,
          emailVerified: true,
        },
        {
          email: "customer2@example.com",
          password: await bcrypt.hash("password123", 10),
          name: "Ama Asante",
          role: "CUSTOMER" as const,
          emailVerified: true,
        },
        {
          email: "customer3@example.com",
          password: await bcrypt.hash("password123", 10),
          name: "Kofi Osei",
          role: "CUSTOMER" as const,
          emailVerified: true,
        },
      ];

      for (const userData of sampleUsers) {
        const user = await prisma.user.create({
          data: userData,
        });
        users.push(user);
        console.log(`✅ Created sample user: ${user.name}`);
      }
    }

    // Get products for reviews
    const productsForReviews = allProducts.slice(0, 10);

    if (productsForReviews.length > 0 && users.length > 0) {
      const sampleReviews = [
        {
          userId: users[0].id,
          productId: productsForReviews[0].id,
          rating: 5,
          title: "Amazing quality!",
          comment: "I love this product! The quality is excellent and it looks exactly like the pictures. Highly recommend!",
          isVerified: true,
        },
        {
          userId: users[1].id,
          productId: productsForReviews[0].id,
          rating: 5,
          title: "Perfect fit",
          comment: "Fits perfectly and looks natural. Great value for money!",
          isVerified: true,
        },
        {
          userId: users[0].id,
          productId: productsForReviews[1]?.id || productsForReviews[0].id,
          rating: 4,
          title: "Very satisfied",
          comment: "Good quality product. Delivery was fast and packaging was secure.",
          isVerified: true,
        },
        {
          userId: users[2]?.id || users[0].id,
          productId: productsForReviews[2]?.id || productsForReviews[0].id,
          rating: 5,
          title: "Exceeded expectations",
          comment: "This product exceeded my expectations. The quality is outstanding and I will definitely order again!",
          isVerified: true,
        },
        {
          userId: users[1].id,
          productId: productsForReviews[3]?.id || productsForReviews[0].id,
          rating: 4,
          title: "Great product",
          comment: "Really happy with my purchase. The product is as described and arrived on time.",
          isVerified: false,
        },
        {
          userId: users[0].id,
          productId: productsForReviews[4]?.id || productsForReviews[0].id,
          rating: 5,
          title: "Best purchase ever!",
          comment: "I've tried many products but this one is by far the best. Quality is top-notch!",
          isVerified: true,
        },
      ];

      let createdCount = 0;
      for (const reviewData of sampleReviews) {
        try {
          await prisma.review.create({
            data: reviewData,
          });
          createdCount++;
        } catch (error: any) {
          // Skip if review already exists
          if (!error.message?.includes("Unique constraint")) {
            console.error(`Error creating review: ${error.message}`);
          }
        }
      }
      console.log(`✅ Created ${createdCount} sample reviews`);
    } else {
      console.log("⚠️  Skipping reviews: Need products and users");
    }

    // 5. Summary
    console.log("\n📊 Summary:");
    const stats = {
      collections: await prisma.collection.count({ where: { isActive: true } }),
      collectionProducts: await prisma.collectionProduct.count(),
      reviews: await prisma.review.count(),
      socialSettings: await prisma.setting.count({
        where: {
          key: {
            in: ["SOCIAL_FACEBOOK", "SOCIAL_INSTAGRAM", "SOCIAL_TWITTER"],
          },
        },
      }),
    };

    console.log(`  Collections: ${stats.collections}`);
    console.log(`  Collection Products: ${stats.collectionProducts}`);
    console.log(`  Reviews: ${stats.reviews}`);
    console.log(`  Social Media Settings: ${stats.socialSettings}`);

    console.log("\n🎉 Setup complete!");
  } catch (error) {
    console.error("❌ Error setting up:", error);
    throw error;
  }
}

async function main() {
  try {
    await setupCollectionsReviewsSocial();
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
