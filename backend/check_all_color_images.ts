import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function checkAllColorImages() {
  console.log('🔍 Comprehensive check for color swatch images...\n');

  // 1. Check ProductVariant images
  console.log('1. Checking ProductVariant images:');
  const variants = await prisma.productVariant.findMany({
    where: {
      name: { contains: 'color', mode: 'insensitive' },
    },
    select: {
      value: true,
      image: true,
    },
  });
  console.log(`   Found ${variants.length} color variants`);
  const variantsWithImages = variants.filter(v => v.image);
  console.log(`   ${variantsWithImages.length} have images:`);
  variantsWithImages.slice(0, 10).forEach(v => {
    console.log(`     - ${v.value} → ${v.image}`);
  });
  if (variantsWithImages.length > 10) {
    console.log(`     ... and ${variantsWithImages.length - 10} more`);
  }

  // 2. Check ProductAttributeTerm images
  console.log('\n2. Checking ProductAttributeTerm images:');
  const colorAttribute = await prisma.productAttribute.findFirst({
    where: { name: { equals: 'Color', mode: 'insensitive' } },
    include: { terms: true },
  });
  if (colorAttribute) {
    const termsWithImages = colorAttribute.terms.filter(t => t.image);
    console.log(`   Found ${colorAttribute.terms.length} color terms`);
    console.log(`   ${termsWithImages.length} have images:`);
    termsWithImages.slice(0, 10).forEach(t => {
      console.log(`     - ${t.name} → ${t.image}`);
    });
    if (termsWithImages.length > 10) {
      console.log(`     ... and ${termsWithImages.length - 10} more`);
    }
  }

  // 3. Check product images that might be color swatches
  console.log('\n3. Checking product images for potential color references:');
  const products = await prisma.product.findMany({
    select: {
      title: true,
      images: true,
    },
    take: 50,
  });
  const colorKeywords = ['black', 'brown', 'blonde', 'red', 'blue', 'green', 'purple', 'caramel', 'honey', 'mocha', 'auburn', 'hazelnut', 'chocolate', 'sand', 'gold', 'copper', 'burgundy'];
  const potentialSwatches: Array<{ color: string; image: string }> = [];
  products.forEach(p => {
    if (p.images && p.images.length > 0) {
      const titleLower = p.title.toLowerCase();
      colorKeywords.forEach(keyword => {
        if (titleLower.includes(keyword)) {
          p.images.forEach(img => {
            potentialSwatches.push({ color: keyword, image: img });
          });
        }
      });
    }
  });
  console.log(`   Found ${potentialSwatches.length} potential color swatch images from product titles`);
  const uniqueSwatches = new Map<string, string>();
  potentialSwatches.forEach(s => {
    if (!uniqueSwatches.has(s.color)) {
      uniqueSwatches.set(s.color, s.image);
    }
  });
  console.log(`   Unique colors found: ${uniqueSwatches.size}`);
  uniqueSwatches.forEach((image, color) => {
    console.log(`     - ${color} → ${image}`);
  });

  // 4. Check file system for swatch images
  console.log('\n4. Checking file system for swatch images:');
  const publicDir = path.join(__dirname, '../frontend/public');
  const checkDirs = ['swatches', 'colors', 'color-swatches', 'swatch'];
  checkDirs.forEach(dir => {
    const dirPath = path.join(publicDir, dir);
    if (fs.existsSync(dirPath)) {
      console.log(`   ✅ Found directory: ${dir}`);
      const files = fs.readdirSync(dirPath);
      console.log(`      Files: ${files.length}`);
      files.slice(0, 10).forEach(file => {
        console.log(`        - ${file}`);
      });
    }
  });

  await prisma.$disconnect();
}

checkAllColorImages().catch(console.error);
