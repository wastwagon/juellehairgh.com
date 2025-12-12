/**
 * Diagnostic script to check color term images in local vs production
 * 
 * Usage:
 *   ts-node backend/scripts/check-color-term-images.ts
 * 
 * Environment Variables:
 *   DATABASE_URL - Local database URL
 *   DATABASE_URL_PROD - Production database URL (required)
 */

import { PrismaClient } from "@prisma/client";

// Local database connection
const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Production database connection
const prodDbUrl = process.env.DATABASE_URL_PROD;
if (!prodDbUrl) {
  console.error("❌ Error: DATABASE_URL_PROD environment variable is not set");
  process.exit(1);
}

const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: prodDbUrl,
    },
  },
});

async function checkColorTermImages() {
  console.log("🔍 Checking Color Term Images...\n");

  try {
    await localPrisma.$connect();
    await prodPrisma.$connect();

    // Get local color terms
    const localColorAttribute = await localPrisma.productAttribute.findFirst({
      where: { name: { equals: "Color", mode: "insensitive" } },
      include: { terms: { orderBy: { name: "asc" } } },
    });

    // Get production color terms
    const prodColorAttribute = await prodPrisma.productAttribute.findFirst({
      where: { name: { equals: "Color", mode: "insensitive" } },
      include: { terms: { orderBy: { name: "asc" } } },
    });

    if (!localColorAttribute || !prodColorAttribute) {
      console.error("❌ Color attribute not found in one or both databases");
      process.exit(1);
    }

    console.log(`📊 Local: ${localColorAttribute.terms.length} terms`);
    console.log(`📊 Production: ${prodColorAttribute.terms.length} terms\n`);

    // Create maps for comparison
    const localMap = new Map(localColorAttribute.terms.map(t => [t.slug, t]));
    const prodMap = new Map(prodColorAttribute.terms.map(t => [t.slug, t]));

    console.log("🔍 Terms with images in LOCAL:\n");
    let localWithImages = 0;
    for (const term of localColorAttribute.terms) {
      if (term.image) {
        localWithImages++;
        console.log(`   ${term.name}: ${term.image}`);
      }
    }
    console.log(`\n   Total: ${localWithImages} terms with images\n`);

    console.log("🔍 Terms with images in PRODUCTION:\n");
    let prodWithImages = 0;
    for (const term of prodColorAttribute.terms) {
      if (term.image) {
        prodWithImages++;
        console.log(`   ${term.name}: ${term.image}`);
      }
    }
    console.log(`\n   Total: ${prodWithImages} terms with images\n`);

    console.log("🔍 Missing images in PRODUCTION (should have images):\n");
    let missingCount = 0;
    for (const [slug, localTerm] of localMap.entries()) {
      const prodTerm = prodMap.get(slug);
      if (localTerm.image && (!prodTerm || !prodTerm.image)) {
        missingCount++;
        console.log(`   ❌ ${localTerm.name} (slug: ${slug})`);
        console.log(`      Local image: ${localTerm.image}`);
        if (prodTerm) {
          console.log(`      Prod image: ${prodTerm.image || "(none)"}`);
        } else {
          console.log(`      Prod term: (does not exist)`);
        }
      }
    }
    console.log(`\n   Total: ${missingCount} terms missing images\n`);

    console.log("🔍 Image URL differences:\n");
    let diffCount = 0;
    for (const [slug, localTerm] of localMap.entries()) {
      const prodTerm = prodMap.get(slug);
      if (localTerm.image && prodTerm && prodTerm.image && localTerm.image !== prodTerm.image) {
        diffCount++;
        console.log(`   ⚠️  ${localTerm.name} (slug: ${slug})`);
        console.log(`      Local: ${localTerm.image}`);
        console.log(`      Prod:  ${prodTerm.image}`);
      }
    }
    console.log(`\n   Total: ${diffCount} terms with different image URLs\n`);

  } catch (error: any) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await localPrisma.$disconnect();
    await prodPrisma.$disconnect();
  }
}

checkColorTermImages()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });

