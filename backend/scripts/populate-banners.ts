import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Populate banners with Option 1: Product Category Showcase content
 * Creates 4 distinctive banners for homepage
 */
async function populateBanners() {
  console.log("📝 Populating Banners (Option 1: Product Category Showcase)...\n");

  try {
    // Check existing banners
    const existingBanners = await prisma.banner.findMany();
    console.log(`📊 Found ${existingBanners.length} existing banners`);

    const banners = [
      {
        title: "Premium Lace Wigs",
        subtitle: "Undetectable hairlines, natural movement, premium quality",
        image: "/media/banners/lace-wigs.jpg", // Will be uploaded via admin panel
        link: "/categories/lace-wigs",
        isActive: true,
        position: 0,
      },
      {
        title: "Protective Styles",
        subtitle: "Long-lasting braids for healthy hair growth",
        image: "/media/banners/braiding-hair.jpg", // Will be uploaded via admin panel
        link: "/categories/braids",
        isActive: true,
        position: 1,
      },
      {
        title: "Hair Care Products",
        subtitle: "Nourish and protect your natural hair",
        image: "/media/banners/hair-care.jpg", // Will be uploaded via admin panel
        link: "/categories/hair-care",
        isActive: true,
        position: 2,
      },
      {
        title: "Instant Style",
        subtitle: "Quick and easy ponytails for any occasion",
        image: "/media/banners/ponytails.jpg", // Will be uploaded via admin panel
        link: "/categories/ponytails",
        isActive: true,
        position: 3,
      },
    ];

    let created = 0;
    let updated = 0;

    for (const bannerData of banners) {
      // Check if banner with same position exists
      const existing = await prisma.banner.findFirst({
        where: {
          position: bannerData.position,
        },
      });

      if (existing) {
        // Update existing banner
        await prisma.banner.update({
          where: { id: existing.id },
          data: bannerData,
        });
        updated++;
        console.log(`✅ Updated banner at position ${bannerData.position}: ${bannerData.title}`);
      } else {
        // Create new banner
        await prisma.banner.create({
          data: bannerData,
        });
        created++;
        console.log(`✅ Created banner at position ${bannerData.position}: ${bannerData.title}`);
      }
    }

    console.log("\n📊 Summary:");
    console.log(`   Created: ${created} banners`);
    console.log(`   Updated: ${updated} banners`);
    console.log(`   Total: ${banners.length} banners`);

    // Verify banners
    const allBanners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { position: "asc" },
    });

    console.log(`\n✅ Active banners: ${allBanners.length}`);
    console.log("\n💡 Next steps:");
    console.log("   1. Upload banner images via admin panel: /admin/banners");
    console.log("   2. Edit each banner and upload the corresponding image:");
    console.log("      - Position 0: Lace wigs image");
    console.log("      - Position 1: Braiding hair image");
    console.log("      - Position 2: Hair care products image");
    console.log("      - Position 3: Ponytails image");
    console.log("   3. Images will display automatically on homepage");

  } catch (error) {
    console.error("❌ Error populating banners:", error);
    throw error;
  }
}

async function main() {
  try {
    await populateBanners();
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
