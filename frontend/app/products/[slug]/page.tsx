import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { ProductDetail } from "@/components/products/product-detail";

// Generate metadata for product pages (Next.js App Router)
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") || "https://juellehairgh.com";
  
  try {
    // Fetch product data for metadata
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.juellehairgh.com/api";
    const response = await fetch(`${apiUrl}/products/${params.slug}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      return {
        title: "Product - Juelle Hair Gh",
        description: "Shop premium wigs, braids, and hair care products in Ghana",
      };
    }

    const product = await response.json();
    const seoData = product?.seo;

    const title = seoData?.metaTitle || `${product.title} - Juelle Hair Gh`;
    const description = seoData?.metaDescription || 
      (product.description 
        ? product.description.replace(/<[^>]*>/g, "").substring(0, 160)
        : `Shop ${product.title} at Juelle Hair Gh. Premium quality hair products in Ghana.`);
    
    const image = seoData?.ogImage || product.images?.[0] || `${siteUrl}/logo.png`;
    const canonicalUrl = seoData?.canonicalUrl || `${siteUrl}/products/${params.slug}`;

    return {
      title,
      description,
      keywords: seoData?.keywords || [
        product.title,
        product.category?.name,
        typeof product.brand === "object" ? product.brand?.name : product.brand,
        "wigs Ghana",
        "hair extensions",
      ].filter(Boolean),
      openGraph: {
        title: seoData?.ogTitle || title,
        description: seoData?.ogDescription || description,
        type: "product",
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: product.title,
          },
        ],
        url: canonicalUrl,
      },
      twitter: {
        card: "summary_large_image",
        title: seoData?.ogTitle || title,
        description: seoData?.ogDescription || description,
        images: [image],
      },
      alternates: {
        canonical: canonicalUrl,
      },
      robots: {
        index: !seoData?.noindex,
        follow: !seoData?.nofollow,
      },
    };
  } catch (error) {
    // Fallback metadata if fetch fails
    return {
      title: "Product - Juelle Hair Gh",
      description: "Shop premium wigs, braids, and hair care products in Ghana",
    };
  }
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 w-full">
        <ProductDetail slug={params.slug} />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

