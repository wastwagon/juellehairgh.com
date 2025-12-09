import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("📝 Creating blog posts...\n");

  const now = new Date();
  
  const blogPosts = [
    {
      title: "How to Care for Your Lace Wig: A Complete Guide",
      slug: "how-to-care-for-your-lace-wig-complete-guide",
      excerpt: "Learn the essential tips and tricks to maintain your lace wig and keep it looking fresh and natural for longer.",
      content: "# How to Care for Your Lace Wig: A Complete Guide\n\nTaking care of your lace wig is essential to maintain its beauty and longevity.",
      category: "Hair Care Tips",
      tags: ["wig care", "maintenance", "tips"],
      isPublished: true,
      publishedAt: new Date(now.getTime() - 0),
      authorName: "Juelle Hair Team",
    },
    {
      title: "5 Protective Styles Using Braiding Hair",
      slug: "5-protective-styles-using-braiding-hair",
      excerpt: "Discover five beautiful protective hairstyles you can create with braiding hair to protect your natural hair while looking fabulous.",
      content: "# 5 Protective Styles Using Braiding Hair\n\nProtective hairstyles are essential for maintaining healthy natural hair.",
      category: "Styling Tips",
      tags: ["protective styles", "braiding", "hairstyles"],
      isPublished: true,
      publishedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      authorName: "Juelle Hair Team",
    },
    {
      title: "Choosing the Right Hair Color: A Complete Guide",
      slug: "choosing-right-hair-color-complete-guide",
      excerpt: "Not sure which hair color to choose? Our comprehensive guide will help you find the perfect shade to match your skin tone and style.",
      content: "# Choosing the Right Hair Color: A Complete Guide\n\nFinding the perfect hair color can be overwhelming.",
      category: "Buying Guide",
      tags: ["hair color", "styling", "guide"],
      isPublished: true,
      publishedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      authorName: "Juelle Hair Team",
    },
    {
      title: "Why Choose Glueless Lace Wigs?",
      slug: "why-choose-glueless-lace-wigs",
      excerpt: "Discover the benefits of glueless lace wigs and why they're becoming the preferred choice for wig wearers everywhere.",
      content: "# Why Choose Glueless Lace Wigs?\n\nGlueless lace wigs are revolutionizing the wig industry.",
      category: "Product Guide",
      tags: ["glueless wigs", "lace wigs", "benefits"],
      isPublished: true,
      publishedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      authorName: "Juelle Hair Team",
    },
  ];

  for (const postData of blogPosts) {
    try {
      const post = await prisma.blogPost.upsert({
        where: { slug: postData.slug },
        update: {
          ...postData,
        },
        create: postData,
      });
      console.log(`✅ ${post.title} (${post.category})`);
    } catch (error: any) {
      console.log(`❌ Error creating ${postData.title}:`, error.message);
    }
  }

  // Verify
  const visiblePosts = await prisma.blogPost.findMany({
    where: {
      isPublished: true,
      publishedAt: { lte: new Date() },
    },
    orderBy: { publishedAt: "desc" },
    take: 4,
  });

  console.log(`\n✅ Created/Updated ${blogPosts.length} blog posts`);
  console.log(`✅ ${visiblePosts.length} posts are visible on frontend\n`);

  visiblePosts.forEach((post, index) => {
    console.log(`   ${index + 1}. "${post.title}"`);
    console.log(`      Category: ${post.category || "N/A"}`);
    console.log(`      Published: ${post.publishedAt?.toLocaleDateString() || "N/A"}\n`);
  });
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
