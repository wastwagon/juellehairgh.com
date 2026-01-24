import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { CategoryPage } from "@/components/categories/category-page";

// Generate metadata for category pages (Next.js App Router)
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") || "https://juellehairgh.com";
  
  try {
    // Fetch category data for metadata
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.juellehairgh.com/api";
    const response = await fetch(`${apiUrl}/categories/${params.slug}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      return {
        title: "Shop - Le Juelle Hair",
        description: "Shop premium wigs, braids, and hair care products in Ghana",
      };
    }

    const category = await response.json();
    const seoData = category?.seo;

    const categoryName = category.name || params.slug;
    const title = seoData?.metaTitle || `${categoryName} - Le Juelle Hair`;
    const description = seoData?.metaDescription || 
      (category.description 
        ? category.description.replace(/<[^>]*>/g, "").substring(0, 160)
        : `Shop ${categoryName} at Le Juelle Hair. Premium quality hair products in Ghana.`);
    
    const image = seoData?.ogImage || category.image || `${siteUrl}/logo.png`;
    const canonicalUrl = seoData?.canonicalUrl || `${siteUrl}/categories/${params.slug}`;

    return {
      title,
      description,
      keywords: seoData?.keywords || [
        categoryName,
        "wigs Ghana",
        "hair extensions",
        "hair products",
        "Le Juelle Hair",
      ],
      openGraph: {
        title: seoData?.ogTitle || title,
        description: seoData?.ogDescription || description,
        type: "website",
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: categoryName,
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
      title: "Shop - Le Juelle Hair",
      description: "Shop premium wigs, braids, and hair care products in Ghana",
    };
  }
}

export default function CategoryListingPage({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 w-full">
        <CategoryPage slug={params.slug} />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

