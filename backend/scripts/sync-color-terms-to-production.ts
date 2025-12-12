/**
 * Sync Color Attribute Terms from Local to Production
 * 
 * This script migrates color attribute variation terms (names and images) 
 * from local database to production database.
 * 
 * Usage:
 *   ts-node backend/scripts/sync-color-terms-to-production.ts
 * 
 * Environment Variables:
 *   DATABASE_URL - Local database URL (default: from .env)
 *   DATABASE_URL_PROD - Production database URL (required)
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

// Get database URLs from environment
// On Render, DATABASE_URL is automatically set, but we need DATABASE_URL_PROD for production
const localDbUrl = process.env.DATABASE_URL;
const prodDbUrl = process.env.DATABASE_URL_PROD;

if (!localDbUrl) {
  console.error("❌ Error: DATABASE_URL environment variable is not set");
  console.log("\n💡 On Render, DATABASE_URL should be automatically set.");
  console.log("   If running locally, make sure .env file exists with DATABASE_URL");
  process.exit(1);
}

if (!prodDbUrl) {
  console.error("❌ Error: DATABASE_URL_PROD environment variable is not set");
  console.log("\n💡 Set it in Render Environment tab:");
  console.log("   1. Go to your backend service");
  console.log("   2. Click 'Environment' tab");
  console.log("   3. Add: DATABASE_URL_PROD = your-production-database-url");
  console.log("\n   Or export it temporarily:");
  console.log("   export DATABASE_URL_PROD='your-production-database-url'");
  process.exit(1);
}

// Local database connection (uses DATABASE_URL from environment)
const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: localDbUrl,
    },
  },
});

// Production database connection
const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: prodDbUrl,
    },
  },
});

interface ColorTermData {
  name: string;
  slug: string;
  image: string | null;
}

async function syncColorTermsToProduction() {
  console.log("🔄 Syncing Color Attribute Terms to Production...\n");

  // Environment variables are already checked at the top

  try {
    // Test local database connection
    console.log("🔍 Step 1: Connecting to local database...");
    await localPrisma.$connect();
    console.log("✅ Local database connected\n");

    // Test production database connection
    console.log("🔍 Step 2: Connecting to production database...");
    await prodPrisma.$connect();
    console.log("✅ Production database connected\n");

    // Get Color attribute from local database
    console.log("🔍 Step 3: Fetching Color attribute from local database...");
    const localColorAttribute = await localPrisma.productAttribute.findFirst({
      where: {
        name: { equals: "Color", mode: "insensitive" },
      },
      include: {
        terms: {
          orderBy: {
            name: "asc",
          },
        },
      },
    });

    if (!localColorAttribute) {
      console.error("❌ Error: Color attribute not found in local database");
      console.log("💡 Run: npm run setup:attributes");
      process.exit(1);
    }

    // Count terms with images
    const termsWithImages = localColorAttribute.terms.filter(t => t.image).length;
    console.log(`✅ Found Color attribute with ${localColorAttribute.terms.length} terms`);
    console.log(`   ${termsWithImages} terms have images in local database\n`);

    // Get or create Color attribute in production
    console.log("🔍 Step 4: Ensuring Color attribute exists in production...");
    let prodColorAttribute = await prodPrisma.productAttribute.findFirst({
      where: {
        name: { equals: "Color", mode: "insensitive" },
      },
    });

    if (!prodColorAttribute) {
      console.log("   Creating Color attribute in production...");
      prodColorAttribute = await prodPrisma.productAttribute.create({
        data: {
          name: localColorAttribute.name,
          slug: localColorAttribute.slug,
          description: localColorAttribute.description || null,
        },
      });
      console.log("✅ Color attribute created in production\n");
    } else {
      console.log("✅ Color attribute exists in production\n");
    }

    // Sync terms
    console.log("🔍 Step 5: Syncing color terms...");
    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    let imagesSynced = 0;
    for (const localTerm of localColorAttribute.terms) {
      try {
        // Normalize image URL - remove localhost/absolute URLs, keep relative paths
        let imageUrl = localTerm.image;
        if (imageUrl) {
          // Remove localhost URLs, keep relative paths like /media/swatches/ or media/swatches/
          if (imageUrl.includes("localhost") || imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
            // Extract filename from URL
            const filename = imageUrl.split("/").pop() || imageUrl.split("\\").pop() || "";
            if (filename) {
              // Use relative path format that works in production
              imageUrl = `/media/swatches/${filename}`;
            } else {
              imageUrl = localTerm.image; // Keep original if can't extract filename
            }
          }
          // Ensure consistent format: /media/swatches/filename.jpg
          if (imageUrl && !imageUrl.startsWith("/media/swatches/") && !imageUrl.startsWith("http")) {
            const filename = imageUrl.split("/").pop() || imageUrl.split("\\").pop() || imageUrl;
            imageUrl = `/media/swatches/${filename}`;
          }
        }

        // Check if term exists in production (by slug)
        const existingTerm = await prodPrisma.productAttributeTerm.findFirst({
          where: {
            attributeId: prodColorAttribute.id,
            slug: localTerm.slug,
          },
        });

        if (existingTerm) {
          // Update existing term - always update image even if it's null (to clear old images)
          await prodPrisma.productAttributeTerm.update({
            where: { id: existingTerm.id },
            data: {
              name: localTerm.name,
              image: imageUrl,
            },
          });
          updatedCount++;
          if (imageUrl) {
            imagesSynced++;
            console.log(`   ✅ Updated: ${localTerm.name} (image: ${imageUrl})`);
          } else {
            console.log(`   ✅ Updated: ${localTerm.name} (no image)`);
          }
        } else {
          // Create new term
          await prodPrisma.productAttributeTerm.create({
            data: {
              attributeId: prodColorAttribute.id,
              name: localTerm.name,
              slug: localTerm.slug,
              image: imageUrl,
            },
          });
          createdCount++;
          if (imageUrl) {
            imagesSynced++;
            console.log(`   ✅ Created: ${localTerm.name} (image: ${imageUrl})`);
          } else {
            console.log(`   ✅ Created: ${localTerm.name} (no image)`);
          }
        }
      } catch (error: any) {
        console.error(`   ❌ Error syncing term "${localTerm.name}":`, error.message);
        skippedCount++;
      }
    }

    console.log(`\n📊 Sync Summary:`);
    console.log(`   ✅ Created: ${createdCount} terms`);
    console.log(`   🔄 Updated: ${updatedCount} terms`);
    console.log(`   ⏭️  Skipped: ${skippedCount} terms`);
    console.log(`   🖼️  Images synced: ${imagesSynced} terms`);
    console.log(`   📦 Total: ${localColorAttribute.terms.length} terms processed\n`);

    // Verify sync
    console.log("🔍 Step 6: Verifying sync...");
    const prodTerms = await prodPrisma.productAttributeTerm.findMany({
      where: {
        attributeId: prodColorAttribute.id,
      },
    });

    const termsWithImages = prodTerms.filter(t => t.image).length;
    console.log(`✅ Production now has ${prodTerms.length} color terms`);
    console.log(`   ${termsWithImages} terms have images\n`);

    console.log("🎉 Color terms sync completed successfully!\n");

  } catch (error: any) {
    console.error("❌ Error syncing color terms:", error);
    if (error.message) {
      console.error("   Error message:", error.message);
    }
    process.exit(1);
  } finally {
    await localPrisma.$disconnect();
    await prodPrisma.$disconnect();
  }
}

// Run the sync
syncColorTermsToProduction()
  .then(() => {
    console.log("✅ Script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });

