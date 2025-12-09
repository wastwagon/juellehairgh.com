import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkColorSwatches() {
  console.log('🔍 Checking for color swatch images in database...\n');

  // Check ProductAttributeTerm (color swatches)
  console.log('1. Checking ProductAttributeTerm (attribute-based swatches):');
  const attributeTerms = await prisma.productAttributeTerm.findMany({
    where: {
      image: { not: null },
    },
    include: {
      attribute: true,
    },
  });

  console.log(`   Found ${attributeTerms.length} attribute terms with images:`);
  attributeTerms.forEach((term) => {
    console.log(`   - ${term.attribute.name}: ${term.name} → ${term.image}`);
  });

  // Check ProductVariant (variant-based swatches)
  console.log('\n2. Checking ProductVariant (variant-based swatches):');
  const variants = await prisma.productVariant.findMany({
    where: {
      image: { not: null },
    },
    include: {
      product: {
        select: { title: true, slug: true },
      },
    },
    take: 20, // Limit to first 20
  });

  console.log(`   Found ${variants.length} variants with images (showing first 20):`);
  variants.forEach((variant) => {
    console.log(`   - Product: ${variant.product.title}`);
    console.log(`     Variant: ${variant.name} = ${variant.value}`);
    console.log(`     Image: ${variant.image}`);
    console.log('');
  });

  // Count total variants with images
  const totalVariantsWithImages = await prisma.productVariant.count({
    where: {
      image: { not: null },
    },
  });

  console.log(`\n📊 Summary:`);
  console.log(`   - Attribute terms with images: ${attributeTerms.length}`);
  console.log(`   - Product variants with images: ${totalVariantsWithImages}`);
  console.log(`   - Total color swatch images: ${attributeTerms.length + totalVariantsWithImages}`);

  await prisma.$disconnect();
}

checkColorSwatches().catch(console.error);
