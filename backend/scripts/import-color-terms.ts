/**
 * Import color terms from JSON file to production database
 * Run this on Render after exporting from local
 * 
 * Usage:
 *   ts-node backend/scripts/import-color-terms.ts [path-to-export.json]
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface ColorTermImport {
  name: string;
  slug: string;
  image: string | null;
}

async function importColorTerms(exportFilePath: string) {
  console.log("📥 Importing Color Terms to Production Database...\n");

  try {
    await prisma.$connect();
    console.log("✅ Connected to production database\n");

    // Read export file
    if (!fs.existsSync(exportFilePath)) {
      console.error(`❌ Export file not found: ${exportFilePath}`);
      process.exit(1);
    }

    const exportData: ColorTermImport[] = JSON.parse(
      fs.readFileSync(exportFilePath, "utf-8")
    );

    console.log(`📊 Found ${exportData.length} color terms to import\n`);

    // Get or create Color attribute
    let colorAttribute = await prisma.productAttribute.findFirst({
      where: {
        name: { equals: "Color", mode: "insensitive" },
      },
    });

    if (!colorAttribute) {
      console.log("➕ Creating Color attribute...");
      colorAttribute = await prisma.productAttribute.create({
        data: {
          name: "Color",
          slug: "color",
          description: "Product color variations",
        },
      });
      console.log("✅ Color attribute created\n");
    } else {
      console.log("✅ Color attribute exists\n");
    }

    // Import terms
    console.log("🔄 Importing color terms...\n");
    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let imagesSynced = 0;

    for (const termData of exportData) {
      try {
        // Normalize image URL
        let imageUrl = termData.image;
        if (imageUrl) {
          // Remove localhost URLs, keep relative paths
          if (imageUrl.includes("localhost") || imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
            const filename = imageUrl.split("/").pop() || imageUrl.split("\\").pop() || "";
            if (filename) {
              imageUrl = `/media/swatches/${filename}`;
            }
          }
          // Ensure consistent format
          if (imageUrl && !imageUrl.startsWith("/media/swatches/") && !imageUrl.startsWith("http")) {
            const filename = imageUrl.split("/").pop() || imageUrl.split("\\").pop() || imageUrl;
            imageUrl = `/media/swatches/${filename}`;
          }
        }

        // Check if term exists
        const existingTerm = await prisma.productAttributeTerm.findFirst({
          where: {
            attributeId: colorAttribute.id,
            slug: termData.slug,
          },
        });

        if (existingTerm) {
          // Update existing term
          await prisma.productAttributeTerm.update({
            where: { id: existingTerm.id },
            data: {
              name: termData.name,
              image: imageUrl,
            },
          });
          updatedCount++;
          if (imageUrl) {
            imagesSynced++;
            console.log(`   ✅ Updated: ${termData.name} (image: ${imageUrl})`);
          } else {
            console.log(`   ✅ Updated: ${termData.name} (no image)`);
          }
        } else {
          // Create new term
          await prisma.productAttributeTerm.create({
            data: {
              attributeId: colorAttribute.id,
              name: termData.name,
              slug: termData.slug,
              image: imageUrl,
            },
          });
          createdCount++;
          if (imageUrl) {
            imagesSynced++;
            console.log(`   ✅ Created: ${termData.name} (image: ${imageUrl})`);
          } else {
            console.log(`   ✅ Created: ${termData.name} (no image)`);
          }
        }
      } catch (error: any) {
        console.error(`   ❌ Error importing term "${termData.name}":`, error.message);
        skippedCount++;
      }
    }

    console.log(`\n📊 Import Summary:`);
    console.log(`   ✅ Created: ${createdCount} terms`);
    console.log(`   🔄 Updated: ${updatedCount} terms`);
    console.log(`   ⏭️  Skipped: ${skippedCount} terms`);
    console.log(`   🖼️  Images synced: ${imagesSynced} terms`);
    console.log(`   📦 Total: ${exportData.length} terms processed\n`);

    // Verify import
    const prodTerms = await prisma.productAttributeTerm.findMany({
      where: {
        attributeId: colorAttribute.id,
      },
    });

    const prodTermsWithImages = prodTerms.filter((t) => t.image).length;
    console.log(`✅ Production now has ${prodTerms.length} color terms`);
    console.log(`   ${prodTermsWithImages} terms have images\n`);

    console.log("🎉 Import complete!\n");

  } catch (error: any) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Get export file path from command line or use default
const exportFilePath = process.argv[2] || path.join(process.cwd(), "color-terms-export.json");

importColorTerms(exportFilePath)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });

