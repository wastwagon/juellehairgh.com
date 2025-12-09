const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Check if "Wigs Under 500" collection exists
    let wigsCollection = await prisma.collection.findFirst({
      where: {
        OR: [
          { slug: 'wigs-under-500' },
          { slug: 'wigs-under-ghc-500' },
          { name: { contains: 'Wigs Under', mode: 'insensitive' } }
        ]
      }
    });

    // Create if it doesn't exist
    if (!wigsCollection) {
      wigsCollection = await prisma.collection.create({
        data: {
          name: 'Wigs Under GH¢ 500',
          slug: 'wigs-under-ghc-500',
          description: 'Affordable wigs under GH¢ 500',
          isActive: true,
        }
      });
      console.log('✅ Created "Wigs Under GH¢ 500" collection:', wigsCollection.id);
    } else {
      console.log('✅ "Wigs Under GH¢ 500" collection already exists:', wigsCollection.id);
    }

    // Find products that are wigs and priced under 500
    const wigsUnder500 = await prisma.product.findMany({
      where: {
        AND: [
          {
            OR: [
              { category: { slug: 'lace-wigs' } },
              { category: { slug: 'wigs' } },
              { title: { contains: 'wig', mode: 'insensitive' } },
            ]
          },
          {
            OR: [
              { priceGhs: { lte: 500 } },
              { compareAtPriceGhs: { lte: 500 } },
            ]
          },
          { isActive: true },
        ]
      },
      take: 20,
      orderBy: {
        priceGhs: 'asc', // Cheapest first
      }
    });

    console.log(`📦 Found ${wigsUnder500.length} wigs priced under GH¢ 500`);

    // Add products to collection
    let addedCount = 0;
    for (const product of wigsUnder500) {
      // Check if product is already in collection
      const existing = await prisma.collectionProduct.findFirst({
        where: {
          collectionId: wigsCollection.id,
          productId: product.id,
        }
      });

      if (!existing) {
        await prisma.collectionProduct.create({
          data: {
            collectionId: wigsCollection.id,
            productId: product.id,
          }
        });
        addedCount++;
        console.log(`  ✓ Added: ${product.title.substring(0, 50)}... (GH¢ ${product.priceGhs})`);
      }
    }

    console.log(`\n✅ Setup complete!`);
    console.log(`   - Collection: ${wigsCollection.name} (${wigsCollection.slug})`);
    console.log(`   - Products added: ${addedCount}`);
    console.log(`   - Total products in collection: ${wigsUnder500.length}`);

  } catch (error) {
    console.error('❌ Error setting up "Wigs Under 500" collection:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
