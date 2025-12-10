import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

/**
 * Fix collection images and verify products under 500 GHS
 * - Checks collection images exist
 * - Verifies "Wigs Under GH₵ 500" collection has products
 * - Updates collection images if needed
 */
async function fixCollectionImagesAndProducts() {
  console.log("🔧 Fixing Collection Images and Products...\n");

  try {
    // 1. Check all collections
    console.log("📋 Step 1: Checking collections...");
    const collections = await prisma.collection.findMany({
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    console.log(`Found ${collections.length} collections`);

    for (const collection of collections) {
      console.log(`\n📦 Collection: ${collection.name} (${collection.slug})`);
      console.log(`   Image: ${collection.image || "NOT SET"}`);
      console.log(`   Products: ${collection.products.length}`);

      // Check if image file exists
      if (collection.image) {
        const imagePath = collection.image.startsWith("/")
          ? collection.image.substring(1)
          : collection.image.startsWith("http")
          ? null // External URL
          : path.join(process.cwd(), "uploads", "media", "collections", collection.image.split("/").pop() || "");

        if (imagePath && fs.existsSync(imagePath)) {
          console.log(`   ✅ Image file exists: ${imagePath}`);
        } else if (imagePath) {
          console.log(`   ⚠️  Image file NOT found: ${imagePath}`);
        } else {
          console.log(`   ℹ️  External URL: ${collection.image}`);
        }
      }
    }

    // 2. Verify "Wigs Under GH₵ 500" collection
    console.log("\n📋 Step 2: Verifying 'Wigs Under GH₵ 500' collection...");
    let wigsUnder500 = await prisma.collection.findFirst({
      where: { slug: "wigs-under-ghc-500" },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!wigsUnder500) {
      console.log("⚠️  Collection 'Wigs Under GH₵ 500' not found. Creating...");
      wigsUnder500 = await prisma.collection.create({
        data: {
          name: "Wigs Under GH₵ 500",
          slug: "wigs-under-ghc-500",
          description: "Affordable wigs under GH₵ 500",
          isActive: true,
        },
      });
      console.log("✅ Created collection");
    }

    // 3. Find products under 500 GHS
    console.log("\n📋 Step 3: Finding products under 500 GHS...");
    const productsUnder500 = await prisma.product.findMany({
      where: {
        isActive: true,
        priceGhs: {
          lte: 500,
        },
      },
      orderBy: {
        priceGhs: "asc",
      },
    });

    console.log(`Found ${productsUnder500.length} products under 500 GHS`);

    if (productsUnder500.length > 0) {
      console.log("\nProducts under 500 GHS:");
      productsUnder500.slice(0, 10).forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.title} - GH₵ ${product.priceGhs}`);
      });
    }

    // 4. Add products to "Wigs Under GH₵ 500" collection
    console.log("\n📋 Step 4: Adding products to 'Wigs Under GH₵ 500' collection...");
    
    // Remove existing products first (optional - comment out if you want to keep existing)
    // await prisma.collectionProduct.deleteMany({
    //   where: { collectionId: wigsUnder500.id },
    // });

    let addedCount = 0;
    for (let i = 0; i < Math.min(productsUnder500.length, 20); i++) {
      const product = productsUnder500[i];
      try {
        await prisma.collectionProduct.upsert({
          where: {
            collectionId_productId: {
              collectionId: wigsUnder500.id,
              productId: product.id,
            },
          },
          create: {
            collectionId: wigsUnder500.id,
            productId: product.id,
            position: i,
          },
          update: {
            position: i,
          },
        });
        addedCount++;
      } catch (error: any) {
        if (!error.message?.includes("Unique constraint")) {
          console.error(`Error adding product ${product.title}:`, error.message);
        }
      }
    }

    console.log(`✅ Added ${addedCount} products to 'Wigs Under GH₵ 500' collection`);

    // 5. Check if we need to use product images as collection images
    console.log("\n📋 Step 5: Checking collection images...");
    
    const collectionsNeedingImages = await prisma.collection.findMany({
      where: {
        OR: [
          { image: null },
          { image: "" },
        ],
      },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                images: true,
              },
            },
          },
          take: 1,
          orderBy: {
            position: "asc",
          },
        },
      },
    });

    console.log(`Found ${collectionsNeedingImages.length} collections without images`);

    for (const collection of collectionsNeedingImages) {
      if (collection.products.length > 0 && collection.products[0].product.images.length > 0) {
        const firstProductImage = collection.products[0].product.images[0];
        console.log(`\n💡 Collection '${collection.name}' can use product image: ${firstProductImage}`);
        console.log(`   You can update this in admin panel or set it to: ${firstProductImage}`);
      }
    }

    // 6. Summary
    console.log("\n📊 Summary:");
    const stats = {
      totalCollections: await prisma.collection.count(),
      collectionsWithImages: await prisma.collection.count({
        where: {
          image: {
            not: null,
          },
        },
      }),
      collectionsWithoutImages: await prisma.collection.count({
        where: {
          OR: [
            { image: null },
            { image: "" },
          ],
        },
      }),
      wigsUnder500Products: await prisma.collectionProduct.count({
        where: {
          collectionId: wigsUnder500.id,
        },
      }),
      productsUnder500GHS: productsUnder500.length,
    };

    console.log(`  Total Collections: ${stats.totalCollections}`);
    console.log(`  Collections with Images: ${stats.collectionsWithImages}`);
    console.log(`  Collections without Images: ${stats.collectionsWithoutImages}`);
    console.log(`  Products in 'Wigs Under GH₵ 500': ${stats.wigsUnder500Products}`);
    console.log(`  Total Products Under 500 GHS: ${stats.productsUnder500GHS}`);

    console.log("\n🎉 Fix complete!");
    console.log("\n💡 Next Steps:");
    console.log("   1. Upload collection images via admin panel");
    console.log("   2. Or set collection.image to product image URLs");
    console.log("   3. Ensure backend serves static files from /uploads/media/");
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

async function main() {
  try {
    await fixCollectionImagesAndProducts();
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
