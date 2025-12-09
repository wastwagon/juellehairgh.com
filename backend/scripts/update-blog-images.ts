import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Updating blog posts with featured images...");

  // Map blog titles to appropriate images from the public repository
  // Using product images that relate to the blog topics
  const blogImageMap: Record<string, string> = {
    "How to Care for Your Lace Wig: A Complete Guide": "/media/products/african-essence-control-wig-spray-4-oz-2.webp",
    "5 Protective Styles Using Braiding Hair": "/media/products/zury-sis-v11-boho.jpg",
    "Choosing the Right Hair Color: A Complete Guide": "/media/products/outre-human-hair-blend-big-beautiful-hair-clip-in-9-4a-kinky-curly-2.jpg",
    "Why Choose Glueless Lace Wigs?": "/media/products/sensationnel-hh-4c-clique.jpg",
  };

  // Get all blog posts
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
  });

  for (const post of posts) {
    const imageUrl = blogImageMap[post.title];
    if (imageUrl) {
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { featuredImage: imageUrl },
      });
      console.log(`✅ Updated "${post.title}" with image: ${imageUrl}`);
    } else {
      // Use a default image if no specific match
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { featuredImage: "/media/products/african-essence-control-wig-spray-4-oz-2.webp" },
      });
      console.log(`✅ Updated "${post.title}" with default image`);
    }
  }

  console.log("\n✅ All blog posts updated with featured images!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
