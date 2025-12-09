const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Find the Featured Products collection
    const collection = await prisma.collection.findFirst({
      where: {
        OR: [
          { slug: 'featured-products' },
          { name: 'Featured Products' }
        ]
      },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!collection) {
      console.log('❌ Featured Products collection not found');
      return;
    }

    console.log(`Found collection: ${collection.name} (${collection.slug})`);
    console.log(`Products in collection: ${collection._count.products}`);

    // Delete the collection (CollectionProduct records will be deleted automatically due to onDelete: Cascade)
    await prisma.collection.delete({
      where: { id: collection.id }
    });

    console.log('✅ Featured Products collection deleted successfully');
    console.log(`   - Collection ID: ${collection.id}`);
    console.log(`   - Products removed from collection: ${collection._count.products}`);
  } catch (error) {
    console.error('❌ Error deleting collection:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
