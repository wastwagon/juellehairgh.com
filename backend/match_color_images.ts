import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Common color name mappings and their potential image paths
const colorImageMap: Record<string, string[]> = {
  'black': ['/swatches/black.png', '/swatches/black.jpg', '/colors/black.png', '/colors/black.jpg', 'black.png', 'black.jpg'],
  'brown': ['/swatches/brown.png', '/swatches/brown.jpg', '/colors/brown.png', '/colors/brown.jpg', 'brown.png', 'brown.jpg'],
  'blonde': ['/swatches/blonde.png', '/swatches/blonde.jpg', '/colors/blonde.png', '/colors/blonde.jpg', 'blonde.png', 'blonde.jpg'],
  'red': ['/swatches/red.png', '/swatches/red.jpg', '/colors/red.png', '/colors/red.jpg', 'red.png', 'red.jpg'],
  'blue': ['/swatches/blue.png', '/swatches/blue.jpg', '/colors/blue.png', '/colors/blue.jpg', 'blue.png', 'blue.jpg'],
  'green': ['/swatches/green.png', '/swatches/green.jpg', '/colors/green.png', '/colors/green.jpg', 'green.png', 'green.jpg'],
  'purple': ['/swatches/purple.png', '/swatches/purple.jpg', '/colors/purple.png', '/colors/purple.jpg', 'purple.png', 'purple.jpg'],
  'burgundy': ['/swatches/burgundy.png', '/swatches/burgundy.jpg', '/colors/burgundy.png', '/colors/burgundy.jpg', 'burgundy.png', 'burgundy.jpg'],
  'honey': ['/swatches/honey.png', '/swatches/honey.jpg', '/colors/honey.png', '/colors/honey.jpg', 'honey.png', 'honey.jpg'],
  'caramel': ['/swatches/caramel.png', '/swatches/caramel.jpg', '/colors/caramel.png', '/colors/caramel.jpg', 'caramel.png', 'caramel.jpg'],
  'mocha': ['/swatches/mocha.png', '/swatches/mocha.jpg', '/colors/mocha.png', '/colors/mocha.jpg', 'mocha.png', 'mocha.jpg'],
  'auburn': ['/swatches/auburn.png', '/swatches/auburn.jpg', '/colors/auburn.png', '/colors/auburn.jpg', 'auburn.png', 'auburn.jpg'],
  'hazelnut': ['/swatches/hazelnut.png', '/swatches/hazelnut.jpg', '/colors/hazelnut.png', '/colors/hazelnut.jpg', 'hazelnut.png', 'hazelnut.jpg'],
  'chocolate': ['/swatches/chocolate.png', '/swatches/chocolate.jpg', '/colors/chocolate.png', '/colors/chocolate.jpg', 'chocolate.png', 'chocolate.jpg'],
  'sand': ['/swatches/sand.png', '/swatches/sand.jpg', '/colors/sand.png', '/colors/sand.jpg', 'sand.png', 'sand.jpg'],
  'gold': ['/swatches/gold.png', '/swatches/gold.jpg', '/colors/gold.png', '/colors/gold.jpg', 'gold.png', 'gold.jpg'],
  'copper': ['/swatches/copper.png', '/swatches/copper.jpg', '/colors/copper.png', '/colors/copper.jpg', 'copper.png', 'copper.jpg'],
};

async function matchColorImages() {
  console.log('🔍 Checking for color swatch images and matching to color terms...\n');

  // Get Color attribute
  const colorAttribute = await prisma.productAttribute.findFirst({
    where: {
      name: { equals: 'Color', mode: 'insensitive' },
    },
    include: {
      terms: true,
    },
  });

  if (!colorAttribute) {
    console.log('❌ Color attribute not found');
    await prisma.$disconnect();
    return;
  }

  console.log(`✅ Found Color attribute with ${colorAttribute.terms.length} terms\n`);

  // Check ProductVariant for existing color images
  const variantsWithImages = await prisma.productVariant.findMany({
    where: {
      image: { not: null },
      name: { contains: 'color', mode: 'insensitive' },
    },
    select: {
      value: true,
      image: true,
    },
    take: 100,
  });

  console.log(`📦 Found ${variantsWithImages.length} product variants with color images\n`);

  // Create a map of color values to images from variants
  const variantImageMap = new Map<string, string>();
  variantsWithImages.forEach((v) => {
    if (v.value && v.image) {
      const key = v.value.toLowerCase().trim();
      if (!variantImageMap.has(key)) {
        variantImageMap.set(key, v.image);
      }
    }
  });

  console.log('📋 Variant color-to-image mappings:');
  variantImageMap.forEach((image, color) => {
    console.log(`   ${color} → ${image}`);
  });
  console.log('');

  // Check existing attribute terms with images
  const termsWithImages = await prisma.productAttributeTerm.findMany({
    where: {
      attributeId: colorAttribute.id,
      image: { not: null },
    },
  });

  console.log(`🖼️  Found ${termsWithImages.length} color terms that already have images\n`);

  // Match and update terms
  let updated = 0;
  let skipped = 0;

  for (const term of colorAttribute.terms) {
    const termNameLower = term.name.toLowerCase().trim();

    // Skip if already has image
    if (term.image) {
      skipped++;
      continue;
    }

    // Try to find image from variants
    let imageUrl: string | null = null;

    // Direct match
    if (variantImageMap.has(termNameLower)) {
      imageUrl = variantImageMap.get(termNameLower)!;
    } else {
      // Partial match (e.g., "honey blonde" contains "honey")
      for (const [variantColor, image] of variantImageMap.entries()) {
        if (termNameLower.includes(variantColor) || variantColor.includes(termNameLower)) {
          imageUrl = image;
          break;
        }
      }
    }

    // Try color name mapping
    if (!imageUrl) {
      for (const [colorKey, imagePaths] of Object.entries(colorImageMap)) {
        if (termNameLower.includes(colorKey)) {
          // Check if any of these paths might exist (we'll need to verify)
          // For now, we'll use the first path as a suggestion
          imageUrl = imagePaths[0];
          break;
        }
      }
    }

    if (imageUrl) {
      try {
        await prisma.productAttributeTerm.update({
          where: { id: term.id },
          data: { image: imageUrl },
        });
        console.log(`✅ Updated "${term.name}" with image: ${imageUrl}`);
        updated++;
      } catch (error) {
        console.error(`❌ Error updating "${term.name}":`, error);
      }
    } else {
      console.log(`⚠️  No image found for "${term.name}"`);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Updated: ${updated} terms`);
  console.log(`   ⏭️  Skipped (already have images): ${skipped} terms`);
  console.log(`   ⚠️  No image found: ${colorAttribute.terms.length - updated - skipped} terms`);

  await prisma.$disconnect();
}

matchColorImages().catch(console.error);
