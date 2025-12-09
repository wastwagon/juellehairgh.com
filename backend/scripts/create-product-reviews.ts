import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Natural 5-star product reviews for hair products
const reviewTemplates = [
  {
    name: "Ama Mensah",
    email: "ama.mensah@example.com",
    productTitle: "Premium Lace Front Wig",
    title: "Absolutely love this wig!",
    comment: "I've been wearing this lace front wig for 3 months now and it still looks amazing. The quality is excellent, very natural looking, and easy to style. The lace is undetectable and the hair feels soft and manageable. Highly recommend!",
  },
  {
    name: "Efua Asante",
    email: "efua.asante@example.com",
    productTitle: "Zury Sis Crochet Braid",
    title: "Perfect for protective styling!",
    comment: "These crochet braids are amazing! They installed easily, look very natural, and have held up well over the past 2 months. The texture is perfect and they're not too heavy. My natural hair is thriving underneath. Will definitely order again!",
  },
  {
    name: "Akosua Osei",
    email: "akosua.osei@example.com",
    productTitle: "African Pride Braid Sheen Spray",
    title: "Keeps my braids looking fresh!",
    comment: "This spray is a game changer! It keeps my braids shiny and moisturized without making them greasy. The scent is pleasant and it doesn't leave any residue. My braids look brand new even after weeks of wear. Highly recommend for anyone with braids!",
  },
  {
    name: "Adjoa Kwarteng",
    email: "adjoa.kwarteng@example.com",
    title: "Great quality clip-in extensions!",
    comment: "These clip-in extensions blend perfectly with my natural hair. The texture matches well and they're easy to install. The quality is excellent for the price. I've worn them multiple times and they still look great. Very satisfied with my purchase!",
  },
  {
    name: "Yaa Boateng",
    email: "yaa.boateng@example.com",
    productTitle: "Outre X-Pression Crochet Braid",
    title: "Love the texture and durability!",
    comment: "These crochet braids are fantastic! The texture is exactly what I wanted and they've lasted much longer than I expected. Easy to install and maintain. My friends keep asking where I got them from. Will definitely be ordering more colors!",
  },
  {
    name: "Maame Adjei",
    email: "maame.adjei@example.com",
    productTitle: "Sensationnel Lace Front Wig",
    title: "Most natural looking wig I've owned!",
    comment: "This wig is absolutely stunning! The lace front is so natural and undetectable. The hair quality is excellent and it's very comfortable to wear. I've received so many compliments. The color matches perfectly and it's easy to style. Worth every cedi!",
  },
  {
    name: "Abena Owusu",
    email: "abena.owusu@example.com",
    productTitle: "Bobbi Boss Braiding Hair",
    title: "Perfect for box braids!",
    comment: "This braiding hair is soft, doesn't tangle easily, and looks very natural. I've used it for box braids and they came out beautifully. The hair holds well and doesn't shed. Great value for money. I'll definitely be ordering more!",
  },
  {
    name: "Akua Danso",
    email: "akua.danso@example.com",
    productTitle: "Outre Human Hair Blend Clip-In",
    title: "Amazing quality extensions!",
    comment: "These clip-in extensions are fantastic! They blend seamlessly with my natural hair and the quality is excellent. Easy to install and remove. The hair feels soft and looks very natural. I've worn them multiple times and they still look great. Highly recommend!",
  },
  {
    name: "Esi Ampofo",
    email: "esi.ampofo@example.com",
    productTitle: "Simply Stylin Wig Spray",
    title: "Keeps my wigs looking brand new!",
    comment: "This wig spray is a must-have! It keeps my synthetic wigs looking fresh and prevents them from getting frizzy. The formula is lightweight and doesn't leave any buildup. My wigs look brand new even after months of wear. Excellent product!",
  },
  {
    name: "Afi Mensah",
    email: "afi.mensah@example.com",
    productTitle: "Freetress Crochet Braids",
    title: "Love the pre-fluffed texture!",
    comment: "These crochet braids are perfect! The pre-fluffed texture saves me so much time and they look amazing. The quality is great and they've held up well. Easy to install and maintain. My protective style looks professional. Will order again!",
  },
  {
    name: "Kukua Asare",
    email: "kukua.asare@example.com",
    productTitle: "Mane Concept Braiding Hair",
    title: "Best braiding hair I've used!",
    comment: "This braiding hair is top quality! It's soft, doesn't tangle, and looks very natural. I've used it for various protective styles and it always comes out perfect. The hair holds well and doesn't shed. Great value for money. Highly recommend!",
  },
  {
    name: "Serwaa Bonsu",
    email: "serwaa.bonsu@example.com",
    productTitle: "Vivica A. Fox Ponytail",
    title: "Perfect ponytail extension!",
    comment: "This ponytail extension is gorgeous! The quality is excellent and it looks very natural. Easy to attach and stays secure. The hair is soft and manageable. I've received so many compliments. Perfect for quick styling. Will definitely order more!",
  },
  {
    name: "Ama Serwaa",
    email: "ama.serwaa@example.com",
    productTitle: "Sensationnel Butta HD Lace Front Wig",
    title: "Absolutely stunning quality!",
    comment: "This HD lace front wig is incredible! The lace is so transparent and undetectable. The hair quality is premium and it's very comfortable to wear all day. I've worn it multiple times and it still looks brand new. Highly recommend!",
  },
  {
    name: "Efua Mensah",
    email: "efua.mensah@example.com",
    productTitle: "Outre X-Pression Pre-Loop Crochet Braid",
    title: "Saves so much time!",
    comment: "These pre-looped crochet braids are a game changer! Installation was super quick and they look amazing. The texture is perfect and they've held up really well. My protective style looks professional. Will definitely order again!",
  },
  {
    name: "Akosua Adjei",
    email: "akosua.adjei@example.com",
    productTitle: "Bobbi Boss Synthetic Braiding Hair",
    title: "Perfect for box braids!",
    comment: "This braiding hair is excellent quality! It's soft, doesn't tangle, and looks very natural. I've used it for box braids multiple times and they always come out perfect. Great value for money. Highly recommend!",
  },
  {
    name: "Adjoa Ampofo",
    email: "adjoa.ampofo@example.com",
    productTitle: "Simply Stylin Anti-Frizz Serum",
    title: "Keeps my hair smooth all day!",
    comment: "This anti-frizz serum is amazing! It keeps my hair smooth and shiny without making it greasy. The formula is lightweight and doesn't weigh my hair down. My hair looks great even in humid weather. Love it!",
  },
  {
    name: "Yaa Owusu",
    email: "yaa.owusu@example.com",
    productTitle: "Freetress Pre-Fluffed Crochet Braids",
    title: "Love the texture!",
    comment: "These pre-fluffed crochet braids are fantastic! The texture is exactly what I wanted and they saved me so much time. The quality is great and they've lasted well. Easy to install and maintain. Will order more colors!",
  },
  {
    name: "Maame Asante",
    email: "maame.asante@example.com",
    productTitle: "Mane Concept Human Hair Blend Braids",
    title: "Best braiding hair I've tried!",
    comment: "This braiding hair is top quality! It's soft, doesn't tangle, and looks very natural. I've used it for various protective styles and it always comes out perfect. The hair holds well and doesn't shed. Excellent value!",
  },
  {
    name: "Abena Danso",
    email: "abena.danso@example.com",
    productTitle: "Sensationnel Cloud9 Glueless Wig",
    title: "Most comfortable wig ever!",
    comment: "This glueless wig is so comfortable! I can wear it all day without any irritation. The quality is excellent and it looks very natural. The cap construction is perfect. I've received so many compliments. Highly recommend!",
  },
  {
    name: "Akua Kwarteng",
    email: "akua.kwarteng@example.com",
    productTitle: "Outre Synthetic Half Wig",
    title: "Perfect for quick styling!",
    comment: "This half wig is perfect for when I need a quick style! It blends seamlessly with my natural hair and looks very natural. The quality is great and it's easy to install. I use it all the time. Love it!",
  },
  {
    name: "Esi Boateng",
    email: "esi.boateng@example.com",
    productTitle: "African Pride Braid Sheen Spray",
    title: "Keeps my braids looking fresh!",
    comment: "This braid sheen spray is essential! It keeps my braids shiny and moisturized without making them greasy. The scent is pleasant and it doesn't leave any residue. My braids look brand new even after weeks. Highly recommend!",
  },
  {
    name: "Afi Osei",
    email: "afi.osei@example.com",
    productTitle: "Zury Sis Synthetic Crochet Braid",
    title: "Amazing texture and quality!",
    comment: "These crochet braids are fantastic! The texture is perfect and they look very natural. Installation was easy and they've held up really well. My protective style looks professional. Will definitely order more!",
  },
  {
    name: "Kukua Mensah",
    email: "kukua.mensah@example.com",
    productTitle: "Bobbi Boss Ponytail Extension",
    title: "Perfect for quick styles!",
    comment: "This ponytail extension is gorgeous! The quality is excellent and it looks very natural. Easy to attach and stays secure. The hair is soft and manageable. I've received so many compliments. Perfect for quick styling!",
  },
  {
    name: "Serwaa Asare",
    email: "serwaa.asare@example.com",
    productTitle: "Sensationnel Human Hair Blend Wig",
    title: "Most natural looking wig!",
    comment: "This human hair blend wig is absolutely stunning! The quality is excellent and it looks very natural. It's comfortable to wear and easy to style. I've received so many compliments. Worth every cedi!",
  },
  {
    name: "Ama Adjei",
    email: "ama.adjei@example.com",
    productTitle: "Outre X-Pression Twisted Up Crochet Braid",
    title: "Love the unique texture!",
    comment: "These twisted crochet braids are amazing! The texture is unique and looks very natural. Installation was easy and they've held up really well. My protective style looks professional. Will order more colors!",
  },
  {
    name: "Efua Ampofo",
    email: "efua.ampofo@example.com",
    productTitle: "Freetress Synthetic Braiding Hair",
    title: "Perfect for protective styles!",
    comment: "This braiding hair is excellent quality! It's soft, doesn't tangle, and looks very natural. I've used it for various protective styles and they always come out perfect. Great value for money. Highly recommend!",
  },
  {
    name: "Akosua Owusu",
    email: "akosua.owusu@example.com",
    productTitle: "Simply Stylin Wig Detangler",
    title: "Makes detangling so easy!",
    comment: "This wig detangler is a lifesaver! It makes detangling so much easier and faster. The formula is gentle and doesn't damage the hair. My wigs look great after using this. Highly recommend for anyone with wigs!",
  },
  {
    name: "Adjoa Asante",
    email: "adjoa.asante@example.com",
    productTitle: "Mane Concept Crochet Braids",
    title: "Best crochet braids I've used!",
    comment: "These crochet braids are top quality! The texture is perfect and they look very natural. Installation was easy and they've held up really well. My protective style looks professional. Will definitely order more!",
  },
  {
    name: "Yaa Danso",
    email: "yaa.danso@example.com",
    productTitle: "Sensationnel Instant Weave Half Wig",
    title: "Perfect for quick styling!",
    comment: "This instant weave half wig is perfect! It blends seamlessly with my natural hair and looks very natural. The quality is great and it's easy to install. I use it all the time for quick styles. Love it!",
  },
  {
    name: "Maame Kwarteng",
    email: "maame.kwarteng@example.com",
    productTitle: "Bobbi Boss Synthetic Wig",
    title: "Great quality synthetic wig!",
    comment: "This synthetic wig is excellent quality! It looks very natural and is easy to style. The cap construction is comfortable and the hair feels soft. I've worn it multiple times and it still looks great. Highly recommend!",
  },
  {
    name: "Abena Boateng",
    email: "abena.boateng@example.com",
    productTitle: "Outre Human Hair Blend Clip-In Extensions",
    title: "Amazing quality extensions!",
    comment: "These clip-in extensions are fantastic! They blend seamlessly with my natural hair and the quality is excellent. Easy to install and remove. The hair feels soft and looks very natural. I've worn them multiple times and they still look great!",
  },
  {
    name: "Akua Osei",
    email: "akua.osei@example.com",
    productTitle: "Zury Sis Synthetic Braiding Hair",
    title: "Perfect for box braids!",
    comment: "This braiding hair is perfect for box braids! It's soft, doesn't tangle, and looks very natural. I've used it multiple times and the braids always come out perfect. Great value for money. Will definitely order more!",
  },
];

async function main() {
  console.log("🚀 Starting product reviews creation...\n");

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

  // Check existing verified reviews count
  const existingReviewsCount = await prisma.review.count({
    where: { isVerified: true },
  });

  console.log(`📊 Current verified reviews: ${existingReviewsCount}\n`);

  // Calculate how many reviews we need (32 total - existing)
  const reviewsNeeded = 32 - existingReviewsCount;
  console.log(`✨ Need to create ${reviewsNeeded} new reviews (target: 32 total)\n`);

  // Testimonials have already been migrated, skipping this step
  const migratedCount = 0;

  // Create new reviews - use all templates to ensure we get 32 total
  const reviewsToCreate = Math.max(reviewsNeeded - migratedCount, 0);
  console.log(`📝 Creating ${reviewsToCreate} new reviews...\n`);

  let createdCount = 0;
  let templateIndex = 0;
  const usedProducts = new Set<string>(); // Track products to ensure variety
  
  while (createdCount < reviewsNeeded - migratedCount && templateIndex < reviewTemplates.length) {
    const i = templateIndex;
    templateIndex++;
    const template = reviewTemplates[i];
    
    // Find matching product or use random product (prefer unused products)
    let product = products.find((p) => 
      p.title.toLowerCase().includes(template.productTitle?.toLowerCase() || "")
    );
    
    if (!product) {
      // Use random product if no match, but prefer products not yet used
      const unusedProducts = products.filter(p => !usedProducts.has(p.id));
      if (unusedProducts.length > 0) {
        product = unusedProducts[Math.floor(Math.random() * unusedProducts.length)];
      } else {
        // If all products have been used, reset and use any product
        product = products[Math.floor(Math.random() * products.length)];
      }
    }
    
    // Mark product as used
    usedProducts.add(product.id);

    // Check if user already exists using raw query to avoid schema mismatch
    const existingUser = await prisma.$queryRaw<Array<{ id: string; email: string; name: string }>>`
      SELECT id, email, name FROM users WHERE email = ${template.email} LIMIT 1
    `;
    let user = existingUser[0] || null;

    // Create user if doesn't exist
    if (!user) {
      const hashedPassword = await bcrypt.hash("Password123!", 10);
      const result = await prisma.$queryRaw<Array<{ id: string; email: string; name: string }>>`
        INSERT INTO users (id, email, password, name, role, "createdAt", "updatedAt")
        VALUES (gen_random_uuid()::text, ${template.email}, ${hashedPassword}, ${template.name}, 'CUSTOMER', NOW(), NOW())
        RETURNING id, email, name
      `;
      user = result[0];
      console.log(`  ✅ Created user: ${user.name}`);
    }

    // Check if review already exists for this user and product
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: user.id,
        productId: product.id,
      },
    });

    if (!existingReview) {
      await prisma.review.create({
        data: {
          userId: user.id,
          productId: product.id,
          rating: 5, // All 5-star
          title: template.title,
          comment: template.comment,
          isVerified: true,
        },
      });
      createdCount++;
      console.log(`  ✅ Created review by ${template.name} for: ${product.title}`);
    } else {
      console.log(`  ⚠️  Review already exists for ${template.name} and ${product.title}`);
    }
  }

  // Final count
  const finalCount = await prisma.review.count({
    where: { isVerified: true },
  });

  console.log(`\n✅ Complete! Total verified reviews: ${finalCount}`);
  console.log(`   - Migrated: ${migratedCount}`);
  console.log(`   - Created: ${createdCount}`);
  console.log(`   - All reviews are 5-star and verified\n`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
