import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Creating sample content for Juelle Hair Ghana...");

  // 1. Create Badge Templates
  console.log("Creating badge templates...");
  const badges = [
    {
      name: "NEW",
      label: "New",
      color: "#10B981",
      textColor: "#FFFFFF",
      style: "rounded",
      isPredefined: true,
      isActive: true,
    },
    {
      name: "BEST",
      label: "Best Seller",
      color: "#F59E0B",
      textColor: "#FFFFFF",
      style: "rounded",
      isPredefined: true,
      isActive: true,
    },
    {
      name: "SALE",
      label: "Sale",
      color: "#EF4444",
      textColor: "#FFFFFF",
      style: "rounded",
      isPredefined: true,
      isActive: true,
    },
    {
      name: "GLUELESS",
      label: "Glueless",
      color: "#8B5CF6",
      textColor: "#FFFFFF",
      style: "rounded",
      isPredefined: false,
      isActive: true,
    },
    {
      name: "PREMIUM",
      label: "Premium",
      color: "#EC4899",
      textColor: "#FFFFFF",
      style: "rounded",
      isPredefined: false,
      isActive: true,
    },
  ];

  for (const badge of badges) {
    await prisma.badgeTemplate.upsert({
      where: { name: badge.name },
      update: badge,
      create: badge,
    });
  }
  console.log("✅ Created badge templates");

  // 2. Create Trust Badges
  console.log("Creating trust badges...");
  const trustBadges = [
    {
      title: "Free Shipping",
      description: "Free shipping on orders over GH₵ 950",
      icon: "🚚",
      image: null,
      link: null,
      isActive: true,
      position: 1,
    },
    {
      title: "Secure Payment",
      description: "100% secure payment with Paystack",
      icon: "🔒",
      image: null,
      link: null,
      isActive: true,
      position: 2,
    },
    {
      title: "Easy Returns",
      description: "30-day return policy",
      icon: "↩️",
      image: null,
      link: null,
      isActive: true,
      position: 3,
    },
    {
      title: "Authentic Products",
      description: "100% authentic hair products",
      icon: "✓",
      image: null,
      link: null,
      isActive: true,
      position: 4,
    },
    {
      title: "Customer Support",
      description: "24/7 WhatsApp support",
      icon: "💬",
      image: null,
      link: null,
      isActive: true,
      position: 5,
    },
  ];

  for (const badge of trustBadges) {
    await prisma.trustBadge.create({
      data: badge,
    });
  }
  console.log("✅ Created trust badges");

  // 3. Get some products for testimonials
  const products = await prisma.product.findMany({
    take: 5,
    where: { isActive: true },
  });

  // 4. Create Testimonials
  console.log("Creating testimonials...");
  const testimonials = [
    {
      customerName: "Ama Mensah",
      customerEmail: "ama.mensah@example.com",
      customerImage: null,
      rating: 5,
      review: "I absolutely love my Bobbi Boss ponytail! The quality is amazing and it looks so natural. Shipping was fast and the customer service was excellent. Will definitely order again!",
      productId: products[0]?.id || null,
      isApproved: true,
      isFeatured: true,
      position: 1,
    },
    {
      customerName: "Efua Asante",
      customerEmail: "efua.asante@example.com",
      customerImage: null,
      rating: 5,
      review: "Best hair extensions I've ever bought! The Sensationnel lace wig is so comfortable and looks exactly like my natural hair. Highly recommend Juelle Hair!",
      productId: products[1]?.id || null,
      isApproved: true,
      isFeatured: true,
      position: 2,
    },
    {
      customerName: "Akosua Osei",
      customerEmail: "akosua.osei@example.com",
      customerImage: null,
      rating: 5,
      review: "The FreeTress braiding hair is perfect for my protective styles. Great quality, soft texture, and holds well. Great value for money!",
      productId: products[2]?.id || null,
      isApproved: true,
      isFeatured: true,
      position: 3,
    },
    {
      customerName: "Yaa Boateng",
      customerEmail: "yaa.boateng@example.com",
      customerImage: null,
      rating: 4,
      review: "Love the variety of colors available. The hair blends perfectly with my natural hair. Only wish there were more length options, but overall very satisfied!",
      productId: products[3]?.id || null,
      isApproved: true,
      isFeatured: false,
      position: 4,
    },
    {
      customerName: "Adjoa Kwarteng",
      customerEmail: "adjoa.kwarteng@example.com",
      customerImage: null,
      rating: 5,
      review: "Excellent customer service! They helped me choose the perfect wig for my face shape. The glueless lace wig is a game changer - so easy to install!",
      productId: products[4]?.id || null,
      isApproved: true,
      isFeatured: false,
      position: 5,
    },
  ];

  for (const testimonial of testimonials) {
    await prisma.testimonial.create({
      data: testimonial,
    });
  }
  console.log("✅ Created testimonials");

  // 5. Create Flash Sale
  console.log("Creating flash sale...");
  const flashSaleProducts = await prisma.product.findMany({
    take: 6,
    where: { isActive: true },
  });

  const flashSale = await prisma.flashSale.create({
    data: {
      title: "Black Friday Mega Sale",
      description: "Get up to 30% off on selected hair products! Limited time offer.",
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      discountPercent: 30.0,
      isActive: true,
    },
  });

  // Add products to flash sale
  if (flashSaleProducts.length > 0) {
    await prisma.flashSaleProduct.createMany({
      data: flashSaleProducts.map((product) => ({
        flashSaleId: flashSale.id,
        productId: product.id,
      })),
      skipDuplicates: true,
    });
  }
  console.log("✅ Created flash sale");

  // 6. Create Blog Posts
  console.log("Creating blog posts...");
  const blogPosts = [
    {
      title: "How to Care for Your Lace Wig: A Complete Guide",
      slug: "how-to-care-for-your-lace-wig-complete-guide",
      excerpt: "Learn the essential tips and tricks to maintain your lace wig and keep it looking fresh and natural for longer.",
      content: `
# How to Care for Your Lace Wig: A Complete Guide

Lace wigs are a fantastic way to change up your look, but they require proper care to maintain their quality and longevity. Here's everything you need to know about caring for your lace wig.

## Daily Maintenance

### Brushing and Detangling
- Always use a wide-tooth comb or a wig brush designed for synthetic or human hair
- Start from the ends and work your way up to prevent breakage
- Be gentle, especially around the lace front area

### Washing Your Wig
- Wash your wig every 2-3 weeks, or more frequently if you use a lot of products
- Use sulfate-free shampoo and conditioner
- Gently massage the shampoo into the hair, avoiding the lace
- Rinse thoroughly with cool water

## Storage Tips

- Store your wig on a wig stand or mannequin head to maintain its shape
- Keep it away from direct sunlight and heat sources
- Use a satin or silk bag to prevent tangling

## Common Mistakes to Avoid

1. **Using regular hair products** - Always use products specifically designed for wigs
2. **Brushing when wet** - This can cause breakage and damage
3. **Sleeping in your wig** - Remove it before bed to extend its lifespan
4. **Using heat without protection** - Always use heat protectant if styling with heat

## Pro Tips

- Invest in a good wig cap to protect your natural hair
- Rotate between multiple wigs to extend their lifespan
- Get your wig professionally styled if you're unsure

With proper care, your lace wig can last for months or even years!
      `,
      featuredImage: null,
      authorName: "Juelle Hair Team",
      category: "Hair Care Tips",
      tags: ["lace wig", "wig care", "hair care", "tutorial"],
      isPublished: true,
      publishedAt: new Date(),
      seoTitle: "Complete Guide to Lace Wig Care | Juelle Hair Ghana",
      seoDescription: "Learn how to properly care for your lace wig with our comprehensive guide. Tips for washing, styling, and maintaining your wig.",
    },
    {
      title: "5 Protective Styles Using Braiding Hair",
      slug: "5-protective-styles-using-braiding-hair",
      excerpt: "Discover five beautiful protective hairstyles you can create with braiding hair to protect your natural hair while looking fabulous.",
      content: `
# 5 Protective Styles Using Braiding Hair

Protective styles are essential for maintaining healthy hair growth. Here are five stunning styles you can achieve with braiding hair from Juelle Hair.

## 1. Box Braids

Box braids are a classic protective style that never goes out of fashion. They're versatile, low-maintenance, and perfect for any occasion.

**What you'll need:**
- FreeTress or Bobbi Boss braiding hair
- Edge control
- Hair oil

**Installation time:** 4-6 hours

## 2. Passion Twists

Passion twists offer a softer, more natural look than traditional braids. They're perfect for those who want a protective style with a modern twist.

**What you'll need:**
- Passion twist braiding hair
- Styling gel
- Hair clips

## 3. Crochet Braids

Crochet braids are quick to install and offer endless styling possibilities. Perfect for beginners!

**Benefits:**
- Quick installation (1-2 hours)
- Versatile styling options
- Easy to maintain

## 4. Faux Locs

Faux locs give you the look of traditional locs without the commitment. They're stylish and protective.

## 5. Knotless Braids

Knotless braids are gentler on your scalp and edges. They're the perfect protective style for those with sensitive scalps.

## Maintenance Tips

- Moisturize your scalp regularly
- Protect your hair at night with a satin bonnet
- Don't keep styles in for more than 8-10 weeks

Choose the style that best fits your lifestyle and hair goals!
      `,
      featuredImage: null,
      authorName: "Juelle Hair Team",
      category: "Styling Tips",
      tags: ["protective styles", "braiding hair", "hairstyles", "hair care"],
      isPublished: true,
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      seoTitle: "5 Protective Styles with Braiding Hair | Juelle Hair",
      seoDescription: "Discover five beautiful protective hairstyles using braiding hair. Step-by-step guides for box braids, passion twists, and more.",
    },
    {
      title: "Choosing the Right Hair Color: A Complete Guide",
      slug: "choosing-right-hair-color-complete-guide",
      excerpt: "Not sure which hair color to choose? Our comprehensive guide will help you find the perfect shade to match your skin tone and style.",
      content: `
# Choosing the Right Hair Color: A Complete Guide

Selecting the perfect hair color can be overwhelming with so many options available. Here's how to choose the right shade for you.

## Understanding Color Numbers

Hair colors are typically numbered:
- **1B** - Off Black (most common)
- **2** - Darkest Brown
- **4** - Medium Brown
- **27** - Strawberry Blonde
- **30** - Light Auburn
- **613** - Lightest Blonde

## Matching Your Skin Tone

### Warm Undertones
If you have warm undertones (yellow, golden, or peachy), consider:
- Colors 27, 30, 33
- Warm browns and auburns
- Golden highlights

### Cool Undertones
If you have cool undertones (pink, blue, or red), consider:
- Colors 1B, 2, 4
- Ash browns
- Cool-toned highlights

## Popular Color Choices

### 1B (Off Black)
- Most versatile color
- Matches most natural hair
- Perfect for beginners

### 4 (Medium Brown)
- Natural-looking
- Easy to blend
- Great for highlights

### 27 (Strawberry Blonde)
- Bold and vibrant
- Perfect for summer
- Great for highlights

## Tips for First-Time Buyers

1. **Start with 1B** if you're unsure - it's the safest choice
2. **Consider your natural hair color** - choose something close for easier blending
3. **Think about maintenance** - lighter colors may require more upkeep
4. **Check return policies** - some colors can't be returned once opened

## Mixing Colors

Don't be afraid to mix colors for a custom look! Many customers mix:
- 1B and 2 for depth
- 4 and 27 for dimension
- Multiple shades for highlights

Need help choosing? Contact our customer service team for personalized recommendations!
      `,
      featuredImage: null,
      authorName: "Juelle Hair Team",
      category: "Buying Guide",
      tags: ["hair color", "buying guide", "styling", "tips"],
      isPublished: true,
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      seoTitle: "How to Choose the Right Hair Color | Juelle Hair Ghana",
      seoDescription: "Complete guide to choosing the perfect hair color. Learn about color numbers, skin tone matching, and popular color choices.",
    },
    {
      title: "Why Choose Glueless Lace Wigs?",
      slug: "why-choose-glueless-lace-wigs",
      excerpt: "Discover the benefits of glueless lace wigs and why they're becoming the preferred choice for wig wearers everywhere.",
      content: `
# Why Choose Glueless Lace Wigs?

Glueless lace wigs are revolutionizing the wig industry. Here's why they're the best choice for both beginners and experienced wig wearers.

## What Are Glueless Lace Wigs?

Glueless lace wigs are designed to be installed without adhesives. They typically feature:
- Adjustable straps
- Combs for secure attachment
- Pre-plucked hairlines
- Baby hairs for natural look

## Benefits of Glueless Wigs

### 1. Easy Installation
- No messy glues or adhesives
- Quick to put on and take off
- Perfect for beginners

### 2. Scalp-Friendly
- No irritation from adhesives
- Allows your scalp to breathe
- Better for sensitive skin

### 3. Versatile Styling
- Can be styled in multiple ways
- Easy to switch up your look
- No commitment to one style

### 4. Cost-Effective
- No need to buy adhesives
- Longer lifespan with proper care
- Better value for money

## Installation Tips

1. **Prepare your hair** - Braid or flatten your natural hair
2. **Wear a wig cap** - Protects your hair and provides grip
3. **Adjust the straps** - Find the perfect fit
4. **Secure with combs** - Use the built-in combs for extra security
5. **Style as desired** - Part, curl, or straighten as you like

## Maintenance

- Remove before sleeping
- Store on a wig stand
- Wash regularly with wig-specific products
- Avoid excessive heat

## Popular Glueless Wig Styles

- **360 Lace Wigs** - Full perimeter lace
- **Lace Front Wigs** - Lace only at the front
- **Full Lace Wigs** - Complete lace coverage

Ready to try a glueless wig? Browse our collection of premium glueless lace wigs!
      `,
      featuredImage: null,
      authorName: "Juelle Hair Team",
      category: "Product Guide",
      tags: ["glueless wigs", "lace wigs", "wig guide", "hair extensions"],
      isPublished: true,
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      seoTitle: "Benefits of Glueless Lace Wigs | Juelle Hair",
      seoDescription: "Discover why glueless lace wigs are the best choice. Learn about easy installation, scalp-friendly design, and versatile styling options.",
    },
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: post,
      create: post,
    });
  }
  console.log("✅ Created blog posts");

  console.log("\n🎉 All sample content created successfully!");
  console.log("\nSummary:");
  console.log(`- ${badges.length} Badge Templates`);
  console.log(`- ${trustBadges.length} Trust Badges`);
  console.log(`- ${testimonials.length} Testimonials`);
  console.log(`- 1 Flash Sale with ${flashSaleProducts.length} products`);
  console.log(`- ${blogPosts.length} Blog Posts`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
