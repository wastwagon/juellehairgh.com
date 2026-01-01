import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Categories structure based on navigation menu
const categoriesData = [
  {
    name: 'Braids',
    slug: 'braids',
    description: 'Premium braids and braiding hair',
    children: [
      { name: 'Boho braids', slug: 'boho-braids' },
      { name: 'Crochet Hair', slug: 'crochet-hair' },
      { name: 'Passion Twist braids', slug: 'passion-twist-braids' },
      { name: 'Twist braids', slug: 'twist-braids' },
    ],
  },
  {
    name: 'Ponytails',
    slug: 'ponytails',
    description: 'Stylish ponytail extensions',
    children: [
      { name: 'Drawstring/Half wigs', slug: 'drawstring-half-wigs' },
      { name: 'Wrap Ponytails', slug: 'wrap-ponytails' },
    ],
  },
  {
    name: 'Lace Wigs',
    slug: 'lace-wigs',
    description: 'High-quality lace front wigs',
    children: [
      { name: 'Human hair blend lace wigs', slug: 'human-hair-blend-lace-wigs' },
      { name: 'Glueless Lace Wigs', slug: 'glueless-lace-wigs' },
      { name: 'Synthetic Hair Wigs', slug: 'synthetic-hair-wigs' },
    ],
  },
  {
    name: 'Clip-Ins',
    slug: 'clip-ins',
    description: 'Easy-to-use clip-in hair extensions',
    children: [
      { name: 'Human Hair Blend Clip-ins', slug: 'human-hair-blend-clip-ins' },
      { name: 'Human Hair Clip-ins', slug: 'human-hair-clip-ins' },
    ],
  },
  {
    name: 'Hair Growth Oils',
    slug: 'hair-growth-oils',
    description: 'Natural hair growth and care products',
    children: [],
  },
  {
    name: 'Wig Care',
    slug: 'wig-care',
    description: 'Wig maintenance and care products',
    children: [],
  },
  {
    name: 'Shop All',
    slug: 'shop-all',
    description: 'All products',
    children: [],
  },
];

// Common brands in the hair industry
const brandsData = [
  { name: 'Sensationnel', slug: 'sensationnel' },
  { name: 'Outre', slug: 'outre' },
  { name: 'Freetress', slug: 'freetress' },
  { name: 'Bobbi Boss', slug: 'bobbi-boss' },
  { name: 'Model Model', slug: 'model-model' },
  { name: 'Zury', slug: 'zury' },
  { name: 'X-Pression', slug: 'x-pression' },
  { name: 'Kanekalon', slug: 'kanekalon' },
  { name: 'Marley', slug: 'marley' },
  { name: 'Afro Kinky', slug: 'afro-kinky' },
];

async function seedCategories() {
  console.log('🌱 Seeding categories...\n');

  for (const categoryData of categoriesData) {
    const { children, ...parentData } = categoryData;

    // Create or update parent category
    const parent = await prisma.category.upsert({
      where: { slug: parentData.slug },
      update: {
        name: parentData.name,
        description: parentData.description || null,
      },
      create: {
        name: parentData.name,
        slug: parentData.slug,
        description: parentData.description || null,
      },
    });

    console.log(`✅ ${parent.name} (${parent.slug})`);

    // Create or update child categories
    for (const childData of children) {
      const child = await prisma.category.upsert({
        where: { slug: childData.slug },
        update: {
          name: childData.name,
          slug: childData.slug,
          parentId: parent.id,
        },
        create: {
          name: childData.name,
          slug: childData.slug,
          parentId: parent.id,
        },
      });

      console.log(`   └─ ✅ ${child.name} (${child.slug})`);
    }
  }

  console.log('\n✨ Categories seeded successfully!\n');
}

async function seedBrands() {
  console.log('🏷️  Seeding brands...\n');

  for (const brandData of brandsData) {
    const brand = await prisma.brand.upsert({
      where: { slug: brandData.slug },
      update: {
        name: brandData.name,
      },
      create: {
        name: brandData.name,
        slug: brandData.slug,
      },
    });

    console.log(`✅ ${brand.name} (${brand.slug})`);
  }

  console.log('\n✨ Brands seeded successfully!\n');
}

async function main() {
  try {
    console.log('🚀 Starting database seeding...\n');
    console.log('📊 Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    console.log('');

    await seedCategories();
    await seedBrands();

    console.log('🎉 All seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

