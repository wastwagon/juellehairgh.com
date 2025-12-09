import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();
const API_BASE = "http://localhost:3001/api";

async function verifyContent() {
  console.log("🔍 Verifying homepage content...\n");

  // 1. Verify Blog Posts
  console.log("📝 Checking Blog Posts...");
  try {
    const blogResponse = await axios.get(`${API_BASE}/blog?published=true&limit=4`);
    const blogData = blogResponse.data;
    
    if (blogData.posts && blogData.posts.length > 0) {
      console.log(`  ✅ Found ${blogData.posts.length} published blog posts:`);
      blogData.posts.forEach((post: any, index: number) => {
        console.log(`     ${index + 1}. "${post.title}" (${post.category}) - Published: ${post.publishedAt}`);
      });
    } else {
      console.log("  ⚠️  No published blog posts found!");
    }
  } catch (error: any) {
    console.log(`  ❌ Error fetching blog posts: ${error.message}`);
  }

  // 2. Verify Flash Sale
  console.log("\n🎄 Checking Flash Sale...");
  try {
    const flashSaleResponse = await axios.get(`${API_BASE}/flash-sales/active`);
    const flashSale = flashSaleResponse.data;
    
    if (flashSale) {
      console.log(`  ✅ Flash Sale found: "${flashSale.title}"`);
      console.log(`     - Description: ${flashSale.description}`);
      console.log(`     - Discount: ${flashSale.discountPercent}%`);
      console.log(`     - Products: ${flashSale.products?.length || 0}`);
      console.log(`     - End Date: ${flashSale.endDate}`);
      
      if (flashSale.products && flashSale.products.length > 0) {
        console.log(`     - Product List:`);
        flashSale.products.slice(0, 5).forEach((item: any, index: number) => {
          const product = item.product;
          console.log(`       ${index + 1}. ${product.title} - GHC${product.priceGhs} (was GHC${product.compareAtPriceGhs})`);
        });
        if (flashSale.products.length > 5) {
          console.log(`       ... and ${flashSale.products.length - 5} more products`);
        }
      }
    } else {
      console.log("  ⚠️  No active flash sale found!");
    }
  } catch (error: any) {
    console.log(`  ❌ Error fetching flash sale: ${error.message}`);
  }

  // 3. Verify Database Content
  console.log("\n💾 Checking Database Content...");
  
  const blogCount = await prisma.blogPost.count({
    where: { isPublished: true },
  });
  console.log(`  ✅ Published blog posts in database: ${blogCount}`);

  const flashSaleCount = await prisma.flashSale.count({
    where: { isActive: true },
  });
  console.log(`  ✅ Active flash sales in database: ${flashSaleCount}`);

  const flashSaleProducts = await prisma.flashSaleProduct.count({
    where: {
      flashSale: { isActive: true },
    },
  });
  console.log(`  ✅ Products in active flash sale: ${flashSaleProducts}`);

  // 4. Check for required content
  console.log("\n📋 Content Summary:");
  const requiredBlogPosts = 4;
  const requiredFlashSaleProducts = 10;

  if (blogCount >= requiredBlogPosts) {
    console.log(`  ✅ Blog Posts: ${blogCount}/${requiredBlogPosts} (✓)`);
  } else {
    console.log(`  ⚠️  Blog Posts: ${blogCount}/${requiredBlogPosts} (Need ${requiredBlogPosts - blogCount} more)`);
  }

  if (flashSaleProducts >= requiredFlashSaleProducts) {
    console.log(`  ✅ Flash Sale Products: ${flashSaleProducts}/${requiredFlashSaleProducts} (✓)`);
  } else {
    console.log(`  ⚠️  Flash Sale Products: ${flashSaleProducts}/${requiredFlashSaleProducts} (Need ${requiredFlashSaleProducts - flashSaleProducts} more)`);
  }

  console.log("\n✅ Verification complete!");
  console.log("\n💡 Next Steps:");
  console.log("   1. Open http://localhost:3000 in your browser");
  console.log("   2. Scroll down to see 'Latest News & Updates' section");
  console.log("   3. Scroll further to see '⚡ Christmas Mega Sale' section");
  console.log("   4. Verify all content is displaying correctly");
}

verifyContent()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
