import { NextResponse } from "next/server";

// Helper function to escape XML entities
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Helper function to get absolute image URL
function getAbsoluteImageUrl(imageUrl: string | undefined, siteUrl: string): string {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return escapeXml(imageUrl);
  }
  // Handle relative URLs
  const cleanUrl = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
  return escapeXml(`${siteUrl}${cleanUrl}`);
}

export async function GET() {
  // Get the frontend URL - if API_BASE_URL contains 'api.', replace it with the frontend domain
  let siteUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  
  // If API URL contains 'api.', replace it with frontend domain
  if (siteUrl.includes("api.juellehairgh.com")) {
    siteUrl = siteUrl.replace("api.juellehairgh.com", "juellehairgh.com");
  }
  
  // Remove /api suffix if present
  siteUrl = siteUrl.replace("/api", "");
  
  // Fallback to default frontend URL
  if (!siteUrl || siteUrl === "" || siteUrl.includes("api.")) {
    siteUrl = "https://juellehairgh.com";
  }
  
  // Ensure siteUrl doesn't have trailing slash and is properly formatted
  const cleanSiteUrl = siteUrl.replace(/\/$/, "");
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.juellehairgh.com/api";

  try {
    // Fetch products, categories, collections, and blog posts
    const [productsRes, categoriesRes, collectionsRes, blogRes] = await Promise.all([
      fetch(`${apiUrl}/products?limit=1000&isActive=true`, {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }).catch(() => null),
      fetch(`${apiUrl}/categories`, {
        next: { revalidate: 3600 },
      }).catch(() => null),
      fetch(`${apiUrl}/collections?isActive=true`, {
        next: { revalidate: 3600 },
      }).catch(() => null),
      fetch(`${apiUrl}/blog?published=true&limit=100`, {
        next: { revalidate: 3600 },
      }).catch(() => null),
    ]);

    const products = productsRes?.ok ? await productsRes.json().then((d) => d.products || []) : [];
    const categories = categoriesRes?.ok ? await categoriesRes.json().then((d) => Array.isArray(d) ? d : []) : [];
    const collections = collectionsRes?.ok ? await collectionsRes.json().then((d) => Array.isArray(d) ? d : []) : [];
    const blogPosts = blogRes?.ok ? await blogRes.json().then((d) => Array.isArray(d) ? d : []) : [];

    const now = new Date().toISOString();

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- Homepage -->
  <url>
    <loc>${escapeXml(cleanSiteUrl)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Products -->
  ${products
    .map(
      (product: any) => {
        const productUrl = `${cleanSiteUrl}/products/${product.slug}`;
        const imageUrl = product.images?.[0];
        const imageSection = imageUrl
          ? `    <image:image>
      <image:loc>${getAbsoluteImageUrl(imageUrl, cleanSiteUrl)}</image:loc>
      <image:title>${escapeXml(product.title)}</image:title>
    </image:image>`
          : "";
        return `  <url>
    <loc>${escapeXml(productUrl)}</loc>
    <lastmod>${product.updatedAt || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
${imageSection}
  </url>`;
      }
    )
    .join("\n")}
  
  <!-- Categories -->
  ${categories
    .map(
      (category: any) => `  <url>
    <loc>${escapeXml(`${cleanSiteUrl}/categories/${category.slug}`)}</loc>
    <lastmod>${category.updatedAt || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join("\n")}
  
  <!-- Collections -->
  ${collections
    .map(
      (collection: any) => `  <url>
    <loc>${escapeXml(`${cleanSiteUrl}/collections/${collection.slug}`)}</loc>
    <lastmod>${collection.updatedAt || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join("\n")}
  
  <!-- Blog Posts -->
  ${blogPosts
    .map(
      (post: any) => `  <url>
    <loc>${escapeXml(`${cleanSiteUrl}/blog/${post.slug}`)}</loc>
    <lastmod>${post.publishedAt || post.updatedAt || now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
    )
    .join("\n")}
  
  <!-- Static Pages -->
  <url>
    <loc>${escapeXml(`${cleanSiteUrl}/about`)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${escapeXml(`${cleanSiteUrl}/contact`)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${escapeXml(`${cleanSiteUrl}/faq`)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${escapeXml(`${cleanSiteUrl}/shipping`)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${escapeXml(`${cleanSiteUrl}/returns`)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${escapeXml(`${cleanSiteUrl}/privacy`)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${escapeXml(`${cleanSiteUrl}/terms`)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>`;

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // Return minimal sitemap on error
    const minimalSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${escapeXml(cleanSiteUrl)}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new NextResponse(minimalSitemap, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
      },
    });
  }
}
