import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Short review comments (some can be empty for rating-only reviews)
const shortReviews = [
  "Excellent quality!",
  "Very satisfied with my purchase.",
  "Great product, highly recommend!",
  "Love it!",
  "Perfect for my needs.",
  "Amazing quality and fast shipping.",
  "Will definitely order again!",
  "Exceeded my expectations.",
  "Great value for money.",
  "Highly recommend this product!",
  "", // Empty for rating-only
  "", // Empty for rating-only
  "", // Empty for rating-only
  "", // Empty for rating-only
  "", // Empty for rating-only
];

async function main() {
  console.log("🚀 Starting review distribution to products...\n");

  // Get all active products
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, title: true, slug: true },
  });

  if (products.length === 0) {
    console.error("❌ No active products found!");
    return;
  }

  console.log(`📦 Found ${products.length} active products\n`);

  // Get all existing users
  const users = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    select: { id: true, name: true, email: true },
  });

  if (users.length === 0) {
    console.error("❌ No users found! Please create users first.");
    return;
  }

  console.log(`👥 Found ${users.length} existing users\n`);

  // Get current review count per product
  const productReviewCounts = await prisma.review.groupBy({
    by: ["productId"],
    where: { isVerified: true },
    _count: { id: true },
  });

  const reviewCountMap = new Map<string, number>();
  productReviewCounts.forEach((item) => {
    reviewCountMap.set(item.productId, item._count.id);
  });

  console.log(`📊 Current review distribution:\n`);
  productReviewCounts.forEach((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (product) {
      console.log(`  ${product.title}: ${item._count.id} reviews`);
    }
  });
  console.log("");

  // Target: Distribute reviews so products have 2-6 reviews each
  // We want to add more reviews to products that have fewer reviews
  let totalReviewsAdded = 0;
  const targetMinReviews = 2;
  const targetMaxReviews = 6;

  for (const product of products) {
    const currentCount = reviewCountMap.get(product.id) || 0;
    const targetCount = Math.floor(Math.random() * (targetMaxReviews - targetMinReviews + 1)) + targetMinReviews;
    const reviewsNeeded = Math.max(0, targetCount - currentCount);

    if (reviewsNeeded > 0) {
      console.log(`📝 Adding ${reviewsNeeded} reviews to: ${product.title} (currently has ${currentCount})`);

      for (let i = 0; i < reviewsNeeded; i++) {
        // Pick a random user
        const randomUser = users[Math.floor(Math.random() * users.length)];

        // Check if this user already reviewed this product
        const existingReview = await prisma.review.findFirst({
          where: {
            userId: randomUser.id,
            productId: product.id,
          },
        });

        if (existingReview) {
          console.log(`  ⚠️  User ${randomUser.name} already reviewed this product, skipping...`);
          continue;
        }

        // Randomly decide if this review has text or is rating-only
        const hasText = Math.random() > 0.3; // 70% have text, 30% rating-only
        const reviewText = hasText
          ? shortReviews[Math.floor(Math.random() * shortReviews.length)]
          : "";

        // Create review
        await prisma.review.create({
          data: {
            userId: randomUser.id,
            productId: product.id,
            rating: 5, // All 5-star
            title: hasText && reviewText ? reviewText.substring(0, 50) : undefined,
            comment: hasText && reviewText ? reviewText : undefined,
            isVerified: true,
          },
        });

        totalReviewsAdded++;
        console.log(`  ✅ Added review by ${randomUser.name}${hasText ? `: "${reviewText}"` : " (rating only)"}`);
      }
    } else {
      console.log(`✓ ${product.title} already has ${currentCount} reviews (target: ${targetCount})`);
    }
  }

  // Final statistics
  const finalCounts = await prisma.review.groupBy({
    by: ["productId"],
    where: { isVerified: true },
    _count: { id: true },
  });

  console.log(`\n✅ Complete! Added ${totalReviewsAdded} new reviews\n`);
  console.log(`📊 Final review distribution:\n`);
  
  const distribution = new Map<number, number>();
  finalCounts.forEach((item) => {
    const count = item._count.id;
    distribution.set(count, (distribution.get(count) || 0) + 1);
  });

  const sortedDistribution = Array.from(distribution.entries()).sort((a, b) => a[0] - b[0]);
  sortedDistribution.forEach(([reviewCount, productCount]) => {
    console.log(`  ${productCount} products with ${reviewCount} review${reviewCount !== 1 ? "s" : ""}`);
  });

  const totalReviews = await prisma.review.count({
    where: { isVerified: true },
  });
  console.log(`\n📈 Total verified reviews: ${totalReviews}`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
