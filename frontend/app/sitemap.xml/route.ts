import { NextResponse } from "next/server";

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") || "https://juellehairgh.com";
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
    <loc>${siteUrl}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Products -->
  ${products
    .map(
      (product: any) => `  <url>
    <loc>${siteUrl}/products/${product.slug}</loc>
    <lastmod>${product.updatedAt || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    ${product.images?.[0] ? `<image:image>
      <image:loc>${product.images[0].startsWith("http") ? product.images[0] : `${siteUrl}${product.images[0]}`}</image:loc>
      <image:title>${product.title}</image:title>
    </image:image>` : ""}
  </url>`
    )
    .join("\n")}
  
  <!-- Categories -->
  ${categories
    .map(
      (category: any) => `  <url>
    <loc>${siteUrl}/categories/${category.slug}</loc>
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
    <loc>${siteUrl}/collections/${collection.slug}</loc>
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
    <loc>${siteUrl}/blog/${post.slug}</loc>
    <lastmod>${post.publishedAt || post.updatedAt || now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`
    )
    .join("\n")}
  
  <!-- Static Pages -->
  <url>
    <loc>${siteUrl}/about</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${siteUrl}/contact</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${siteUrl}/faq</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${siteUrl}/shipping</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${siteUrl}/returns</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${siteUrl}/privacy</loc>
    <lastmod>${now}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${siteUrl}/terms</loc>
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
    <loc>${siteUrl}</loc>
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
