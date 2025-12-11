import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Check collection images in database
 * Shows which collections have images and their paths
 */
async function checkCollectionImages() {
  console.log("🔍 Checking Collection Images...\n");

  try {
    const collections = await prisma.collection.findMany({
      where: {
        isActive: true,
      },
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                images: true,
              },
            },
          },
          take: 1,
        },
      },
    });

    console.log(`📊 Found ${collections.length} active collections\n`);

    for (const collection of collections) {
      console.log(`📦 ${collection.name} (${collection.slug})`);
      console.log(`   Image: ${collection.image || "❌ No image"}`);
      
      if (collection.image) {
        // Check image path format
        if (collection.image.startsWith("http")) {
          console.log(`   ✅ External URL`);
        } else if (collection.image.startsWith("/media/")) {
          console.log(`   ✅ Media path: ${collection.image}`);
        } else if (collection.image.includes("collections")) {
          console.log(`   ✅ Contains 'collections': ${collection.image}`);
        } else {
          console.log(`   ⚠️  Unusual path format: ${collection.image}`);
        }
      } else {
        // Check if we can use product image as fallback
        if (collection.products.length > 0) {
          const firstProduct = collection.products[0].product;
          if (firstProduct.images && firstProduct.images.length > 0) {
            console.log(`   💡 Fallback: Can use product image: ${firstProduct.images[0]}`);
          }
        }
      }
      
      console.log(`   Products: ${collection.products.length}`);
      console.log("");
    }

    // Summary
    const collectionsWithImages = collections.filter(c => c.image).length;
    const collectionsWithoutImages = collections.length - collectionsWithImages;

    console.log("\n📊 Summary:");
    console.log(`   Total collections: ${collections.length}`);
    console.log(`   Collections with images: ${collectionsWithImages}`);
    console.log(`   Collections without images: ${collectionsWithoutImages}`);

    if (collectionsWithoutImages > 0) {
      console.log("\n💡 Recommendations:");
      console.log("   1. Upload images via admin panel: /admin/collections");
      console.log("   2. Or use product images as collection images");
      console.log("   3. Check image paths are in format: /media/collections/filename.jpg");
    }

  } catch (error) {
    console.error("❌ Error checking collections:", error);
    throw error;
  }
}

async function main() {
  try {
    await checkCollectionImages();
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
