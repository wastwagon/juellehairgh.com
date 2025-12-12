/**
 * Export color terms from local database to JSON file
 * This can then be imported on production
 * 
 * Usage:
 *   ts-node backend/scripts/export-color-terms.ts
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface ColorTermExport {
  name: string;
  slug: string;
  image: string | null;
}

async function exportColorTerms() {
  console.log("📤 Exporting Color Terms from Local Database...\n");

  try {
    await prisma.$connect();
    console.log("✅ Connected to local database\n");

    // Get Color attribute with all terms
    const colorAttribute = await prisma.productAttribute.findFirst({
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

    if (!colorAttribute) {
      console.error("❌ Color attribute not found in local database");
      process.exit(1);
    }

    console.log(`📊 Found ${colorAttribute.terms.length} color terms\n`);

    // Prepare export data
    const exportData: ColorTermExport[] = colorAttribute.terms.map((term) => ({
      name: term.name,
      slug: term.slug,
      image: term.image,
    }));

    // Count terms with images
    const termsWithImages = exportData.filter((t) => t.image).length;
    console.log(`✅ ${termsWithImages} terms have images\n`);

    // Save to JSON file
    const exportPath = path.join(process.cwd(), "color-terms-export.json");
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));

    console.log(`💾 Exported to: ${exportPath}\n`);
    console.log("📋 Export Summary:\n");
    console.log(`   Total terms: ${exportData.length}`);
    console.log(`   Terms with images: ${termsWithImages}`);
    console.log(`   Terms without images: ${exportData.length - termsWithImages}\n`);

    // Show preview
    console.log("📝 Preview (first 5 terms):\n");
    exportData.slice(0, 5).forEach((term) => {
      console.log(`   - ${term.name} (${term.image ? "has image" : "no image"})`);
    });
    if (exportData.length > 5) {
      console.log(`   ... and ${exportData.length - 5} more\n`);
    }

    console.log("✅ Export complete!\n");
    console.log("💡 Next step: Upload this file to Render and run import script\n");

  } catch (error: any) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

exportColorTerms()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });

