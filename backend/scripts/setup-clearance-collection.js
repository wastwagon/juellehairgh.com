const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Check if Clearance collection exists
    let clearanceCollection = await prisma.collection.findFirst({
      where: {
        OR: [
          { slug: 'clearance' },
          { name: { contains: 'Clearance', mode: 'insensitive' } }
        ]
      }
    });

    // Create if it doesn't exist
    if (!clearanceCollection) {
      clearanceCollection = await prisma.collection.create({
        data: {
          name: 'Clearance',
          slug: 'clearance',
          description: 'Special clearance items with great discounts',
          isActive: true,
        }
      });
      console.log('✅ Created Clearance collection:', clearanceCollection.id);
    } else {
      console.log('✅ Clearance collection already exists:', clearanceCollection.id);
    }

    // Find products with sale prices (compareAtPriceGhs) - these are good for clearance
    const productsWithSales = await prisma.product.findMany({
      where: {
        AND: [
          { compareAtPriceGhs: { not: null } },
          { isActive: true },
        ]
      },
      take: 8, // Get up to 8 products
      orderBy: {
        compareAtPriceGhs: 'desc', // Products with highest original prices first
      }
    });

    console.log(`📦 Found ${productsWithSales.length} products with sale prices`);

    // Add products to clearance collection
    let addedCount = 0;
    for (const product of productsWithSales) {
      // Check if product is already in collection
      const existing = await prisma.collectionProduct.findFirst({
        where: {
          collectionId: clearanceCollection.id,
          productId: product.id,
        }
      });

      if (!existing) {
        await prisma.collectionProduct.create({
          data: {
            collectionId: clearanceCollection.id,
            productId: product.id,
          }
        });
        addedCount++;
        console.log(`  ✓ Added: ${product.title.substring(0, 50)}...`);
      }
    }

    console.log(`\n✅ Setup complete!`);
    console.log(`   - Collection: ${clearanceCollection.name} (${clearanceCollection.slug})`);
    console.log(`   - Products added: ${addedCount}`);
    console.log(`   - Total products in collection: ${productsWithSales.length}`);

  } catch (error) {
    console.error('❌ Error setting up clearance collection:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
