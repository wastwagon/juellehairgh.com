/**
 * Verification script to check color terms in local database
 * and compare with swatch images in media folder
 * 
 * Usage:
 *   ts-node backend/scripts/verify-local-color-terms.ts
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function verifyLocalColorTerms() {
  console.log("🔍 Verifying Local Color Terms and Images...\n");

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

    // Check swatch images in media folder
    const swatchDirs = [
      path.join(process.cwd(), "uploads", "media", "swatches"),
      path.join(process.cwd(), "..", "frontend", "public", "media", "swatches"),
      path.join(process.cwd(), "..", "backend", "uploads", "media", "swatches"),
    ];

    let swatchFiles: string[] = [];
    let swatchDir = "";

    for (const dir of swatchDirs) {
      const resolvedDir = path.resolve(dir);
      if (fs.existsSync(resolvedDir)) {
        swatchDir = resolvedDir;
        const files = fs.readdirSync(resolvedDir).filter(
          (f) => /\.(jpg|jpeg|png|gif|webp)$/i.test(f)
        );
        swatchFiles = files;
        console.log(`📁 Found swatch images in: ${resolvedDir}`);
        console.log(`   Total files: ${files.length}\n`);
        break;
      }
    }

    if (swatchFiles.length === 0) {
      console.log("⚠️  No swatch images found in media folders\n");
    }

    // Analyze terms with images
    const termsWithImages = colorAttribute.terms.filter((t) => t.image);
    const termsWithoutImages = colorAttribute.terms.filter((t) => !t.image);

    console.log("📋 Color Terms Analysis:\n");
    console.log(`   ✅ Terms with images: ${termsWithImages.length}`);
    console.log(`   ❌ Terms without images: ${termsWithoutImages.length}\n`);

    // Show terms with images
    if (termsWithImages.length > 0) {
      console.log("🎨 Terms WITH Images:\n");
      for (const term of termsWithImages) {
        const imagePath = term.image || "";
        const filename = imagePath.split("/").pop() || imagePath.split("\\").pop() || "";
        const fileExists = filename ? swatchFiles.includes(filename) : false;
        const status = fileExists ? "✅" : "⚠️ ";
        console.log(`   ${status} ${term.name}`);
        console.log(`      Image: ${term.image}`);
        console.log(`      File exists: ${fileExists ? "Yes" : "No"} (${filename})\n`);
      }
    }

    // Show terms without images
    if (termsWithoutImages.length > 0) {
      console.log("❌ Terms WITHOUT Images:\n");
      for (const term of termsWithoutImages) {
        console.log(`   - ${term.name} (slug: ${term.slug})`);
      }
      console.log("");
    }

    // Check for orphaned swatch files (files not linked to any term)
    if (swatchFiles.length > 0) {
      const linkedFilenames = new Set(
        colorAttribute.terms
          .filter((t) => t.image)
          .map((t) => {
            const img = t.image || "";
            return img.split("/").pop() || img.split("\\").pop() || "";
          })
          .filter((f) => f)
      );

      const orphanedFiles = swatchFiles.filter((f) => !linkedFilenames.has(f));

      if (orphanedFiles.length > 0) {
        console.log("📦 Orphaned Swatch Files (not linked to any term):\n");
        orphanedFiles.forEach((f) => console.log(`   - ${f}`));
        console.log("");
      }
    }

    // Summary
    console.log("\n📊 Summary:\n");
    console.log(`   Total terms: ${colorAttribute.terms.length}`);
    console.log(`   Terms with images: ${termsWithImages.length}`);
    console.log(`   Terms without images: ${termsWithoutImages.length}`);
    console.log(`   Swatch files found: ${swatchFiles.length}`);
    console.log(`   Terms ready to sync: ${termsWithImages.length}\n`);

    // Show what will be synced
    if (termsWithImages.length > 0) {
      console.log("🚀 Ready to sync to production:\n");
      termsWithImages.forEach((term) => {
        console.log(`   ✅ ${term.name} → ${term.image}`);
      });
      console.log("");
    }

  } catch (error: any) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyLocalColorTerms()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });

