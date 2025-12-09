import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("👥 Creating customers and reviews from images...\n");

  // Customer data from all the review images
  const customersData = [
    // From first image set
    {
      name: "Ama Serwaa",
      email: "ama.serwaa@example.com",
      phone: "+233241234567",
      reviews: [
        {
          title: "Perfect for box braids!",
          comment: "This braiding hair is excellent quality! It's soft, doesn't tangle, and looks very natural. I've used it for box braids multiple times and they always come out perfect. The hair holds well and doesn't shed. Great value for money. The consistency is excellent. I'll definitely be ordering more!",
          rating: 5,
          productKeywords: ["braiding", "braid", "box"],
        },
      ],
    },
    {
      name: "Esi Boateng",
      email: "esi.boateng@example.com",
      phone: "+233241234568",
      reviews: [
        {
          title: "Saves so much time!",
          comment: "These pre-looped crochet braids are a game changer! Installation was super quick and they look amazing. The texture is perfect and they've held up really well. My protective style looks professional. The quality is excellent and they're easy to maintain. Will definitely order again for my next protective style!",
          rating: 5,
          productKeywords: ["crochet", "pre-looped"],
        },
      ],
    },
    {
      name: "Akosua Osei",
      email: "akosua.osei@example.com",
      phone: "+233241234569",
      reviews: [
        {
          title: "Absolutely stunning quality!",
          comment: "This HD lace front wig is incredible! The lace is so transparent and undetectable. The hair quality is premium and it's very comfortable to wear all day. I've worn it multiple times and it still looks brand new. The color matches perfectly and it's easy to style. Highly recommend to anyone looking for a quality wig!",
          rating: 5,
          productKeywords: ["lace", "wig", "HD"],
        },
        {
          title: "Best braiding hair I've tried!",
          comment: "This braiding hair is top quality! It's soft, doesn't tangle, and looks very natural. I've used it for various protective styles and it always comes out perfect. The hair holds well and doesn't shed. Excellent value for money. The quality is consistent throughout. Highly recommend!",
          rating: 5,
          productKeywords: ["braiding", "braid"],
        },
      ],
    },
    {
      name: "Akua Danso",
      email: "akua.danso@example.com",
      phone: "+233241234570",
      reviews: [
        {
          title: "Perfect ponytail extension!",
          comment: "This ponytail extension is gorgeous! The quality is excellent and it looks very natural. Easy to attach and stays secure. The hair is soft and manageable. I've received so many compliments. Perfect for quick styling when I need to look put together fast. Will definitely order more in different colors!",
          rating: 5,
          productKeywords: ["ponytail", "extension"],
        },
      ],
    },
    // From second image set
    {
      name: "Efua Asante",
      email: "efua.asante@example.com",
      phone: "+233241234571",
      reviews: [
        {
          title: "Keeps my braids looking fresh!",
          comment: "This spray is a game changer! It keeps my braids shiny and moisturized without making them greasy. The scent is pleasant and it doesn't leave any residue. My braids look brand new even after weeks of wear. I use it daily and it's become an essential part of my hair care routine. Highly recommend for anyone with braids or extensions!",
          rating: 5,
          productKeywords: ["spray", "braid", "sheen"],
        },
      ],
    },
    {
      name: "Adjoa Kwarteng",
      email: "adjoa.kwarteng@example.com",
      phone: "+233241234572",
      reviews: [
        {
          title: "Perfect for protective styling!",
          comment: "These crochet braids are amazing! They installed easily, look very natural, and have held up well over the past 2 months. The texture is perfect and they're not too heavy. My natural hair is thriving underneath. The quality is excellent for the price and they're easy to maintain. Will definitely order again in different colors!",
          rating: 5,
          productKeywords: ["crochet", "braid"],
        },
      ],
    },
    {
      name: "Abena Owusu",
      email: "abena.owusu@example.com",
      phone: "+233241234573",
      reviews: [
        {
          title: "Absolutely love this wig!",
          comment: "I've been wearing this lace front wig for 3 months now and it still looks amazing. The quality is excellent, very natural looking, and easy to style. The lace is undetectable and the hair feels soft and manageable. The color matches perfectly and it's comfortable to wear all day. Shipping was fast and the customer service was excellent. Highly recommend to anyone looking for a quality wig!",
          rating: 5,
          productKeywords: ["lace", "wig", "front"],
        },
      ],
    },
    {
      name: "Maame Adjei",
      email: "maame.adjei@example.com",
      phone: "+233241234574",
      reviews: [
        {
          title: "Perfect for quick styling!",
          comment: "This half wig is perfect for when I need a quick style! It blends seamlessly with my natural hair and looks very natural. The quality is great and it's easy to install. I use it all the time for quick looks. The clips are secure and comfortable. Love how versatile it is!",
          rating: 5,
          productKeywords: ["half", "wig", "clip"],
        },
      ],
    },
    // From third image set
    {
      name: "Serwaa Asare",
      email: "serwaa.asare@example.com",
      phone: "+233241234575",
      reviews: [
        {
          title: "Most comfortable wig ever!",
          comment: "This glueless wig is so comfortable! I can wear it all day without any irritation. The quality is excellent and it looks very natural. The cap construction is perfect. I've received so many compliments. The hair quality is premium. Highly recommend to anyone looking for comfort and style!",
          rating: 5,
          productKeywords: ["glueless", "wig"],
        },
      ],
    },
    {
      name: "Gilbert",
      email: "gilbert@example.com",
      phone: "+233241234576",
      reviews: [
        {
          title: "Love the texture!",
          comment: "These pre-fluffed crochet braids are fantastic! The texture is exactly what I wanted and they saved me so much time. The quality is great and they've lasted well. Easy to install and maintain. My protective style looks professional and natural. Will order more colors for variety!",
          rating: 5,
          productKeywords: ["crochet", "pre-fluffed", "braid"],
        },
      ],
    },
    {
      name: "Kukua Asare",
      email: "kukua.asare@example.com",
      phone: "+233241234577",
      reviews: [
        {
          title: "Keeps my hair smooth all day!",
          comment: "This anti-frizz serum is amazing! It keeps my hair smooth and shiny without making it greasy. The formula is lightweight and doesn't weigh my hair down. My hair looks great even in humid weather. I use it daily and it's become essential. Love how it makes my hair manageable and frizz-free!",
          rating: 5,
          productKeywords: ["serum", "anti-frizz", "frizz"],
        },
      ],
    },
  ];

  // Get all active products to match reviews
  const allProducts = await prisma.product.findMany({
    where: { isActive: true },
    take: 100,
  });

  console.log(`📦 Found ${allProducts.length} active products\n`);

  // Helper function to find matching product
  const findMatchingProduct = (keywords: string[]) => {
    for (const keyword of keywords) {
      const product = allProducts.find(
        (p) =>
          p.title.toLowerCase().includes(keyword.toLowerCase()) ||
          p.description?.toLowerCase().includes(keyword.toLowerCase())
      );
      if (product) return product;
    }
    // Fallback to first available product
    return allProducts[0];
  };

  let usersCreated = 0;
  let reviewsCreated = 0;

  for (const customerData of customersData) {
    try {
      // Check if user already exists
      let user = await prisma.user.findUnique({
        where: { email: customerData.email },
      });

      if (!user) {
        // Create user with hashed password
        const hashedPassword = await bcrypt.hash("Customer123!", 10);
        user = await prisma.user.create({
          data: {
            email: customerData.email,
            password: hashedPassword,
            name: customerData.name,
            phone: customerData.phone,
            role: "CUSTOMER",
            emailVerified: true,
          },
        });
        usersCreated++;
        console.log(`  ✅ Created user: ${customerData.name}`);
      } else {
        console.log(`  ℹ️  User exists: ${customerData.name}`);
      }

      // Create reviews for this user
      for (const reviewData of customerData.reviews) {
        const product = findMatchingProduct(reviewData.productKeywords);

        if (!product) {
          console.log(`  ⚠️  No product found for review: ${reviewData.title}`);
          continue;
        }

        // Check if review already exists
        const existingReview = await prisma.review.findFirst({
          where: {
            userId: user.id,
            productId: product.id,
            title: reviewData.title,
          },
        });

        if (!existingReview) {
          await prisma.review.create({
            data: {
              userId: user.id,
              productId: product.id,
              rating: reviewData.rating,
              title: reviewData.title,
              comment: reviewData.comment,
              isVerified: true, // All reviews from images are verified
            },
          });
          reviewsCreated++;
          console.log(`    ✅ Created review: "${reviewData.title}" for ${product.title}`);
        } else {
          console.log(`    ℹ️  Review exists: "${reviewData.title}"`);
        }
      }
    } catch (error: any) {
      console.log(`  ❌ Error with ${customerData.name}:`, error.message);
    }
  }

  // Verify existing review (Deborah D.)
  const deborahReview = await prisma.review.findFirst({
    where: { title: "Excellent Quality" },
    include: { user: true },
  });

  if (deborahReview && !deborahReview.user) {
    console.log("\n⚠️  Found review without user (Deborah D.)");
    // Create user for Deborah if needed
    const deborahUser = await prisma.user.findUnique({
      where: { email: "deborah@example.com" },
    });

    if (!deborahUser) {
      const hashedPassword = await bcrypt.hash("Customer123!", 10);
      await prisma.user.create({
        data: {
          email: "deborah@example.com",
          password: hashedPassword,
          name: "Deborah D.",
          role: "CUSTOMER",
          emailVerified: true,
        },
      });
      console.log("  ✅ Created user for Deborah D.");
    }
  }

  // Final summary
  const totalUsers = await prisma.user.count({
    where: { role: "CUSTOMER" },
  });
  const totalReviews = await prisma.review.count();

  console.log("\n✅ Customers and Reviews Creation Complete!");
  console.log(`   - Users created: ${usersCreated}`);
  console.log(`   - Reviews created: ${reviewsCreated}`);
  console.log(`   - Total customers: ${totalUsers}`);
  console.log(`   - Total reviews: ${totalReviews}`);
  console.log("\n🌐 View at:");
  console.log("   📱 Admin Customers: http://localhost:8002/admin/customers");
  console.log("   📱 Admin Reviews: http://localhost:8002/admin/reviews");
  console.log("   🌍 Frontend: http://localhost:8002 (scroll to 'What Our Customers Say')");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
