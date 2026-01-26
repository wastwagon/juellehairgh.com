import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { HeroBanner } from "@/components/home/hero-banner";
import { FeaturedCollections } from "@/components/home/featured-collections";
import { ProductGrid } from "@/components/home/product-grid";
import { ClearanceProducts } from "@/components/home/clearance-products";
import { RecentlyViewed } from "@/components/home/recently-viewed";
// import { PromotionalBanners } from "@/components/home/promotional-banners";
import { FeaturesShowcase } from "@/components/home/features-showcase";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { FlashSalesSection } from "@/components/home/flash-sales-section";
// import { BlogSection } from "@/components/home/blog-section";
import { HashScrollHandler } from "@/components/home/hash-scroll-handler";
import { HomePageStructuredData } from "@/components/seo/homepage-structured-data";
import { ShopAllSection } from "@/components/home/shop-all-section";

// Force dynamic rendering to prevent caching stale content
export const dynamic = 'force-dynamic';

// SEO Metadata for homepage
export const metadata: Metadata = {
  title: "Juelle Hair Gh - Crochet Braiding Hair Extensions & Wig Shop",
  description: "Shop premium quality lace wigs, crochet braids, ponytails, clip-ins, and hair care products in Ghana. Free shipping on orders GHS 950+. Same-day delivery in Accra.",
  keywords: [
    "wigs Ghana",
    "lace wigs",
    "crochet braids",
    "hair extensions Ghana",
    "human hair wigs",
    "synthetic wigs",
    "ponytails",
    "clip-ins",
    "hair care products",
    "Juelle Hair",
    "hair products Accra",
  ],
  openGraph: {
    title: "Juelle Hair Gh - Crochet Braiding Hair Extensions & Wig Shop",
    description: "Shop premium quality lace wigs, crochet braids, ponytails, and hair care products. Free shipping on orders GHS 950+.",
    type: "website",
    locale: "en_GH",
    siteName: "Juelle Hair Gh",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Juelle Hair Gh - Crochet Braiding Hair Extensions & Wig Shop",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Juelle Hair Gh - Crochet Braiding Hair Extensions & Wig Shop",
    description: "Shop premium quality lace wigs, crochet braids, and hair care products in Ghana.",
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") || "https://juellehairgh.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function HomePage() {
  const siteUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") || "https://juellehairgh.com";
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <HomePageStructuredData siteUrl={siteUrl} />
      <HashScrollHandler />
      <Header />
      <main className="flex-1 w-full overflow-x-hidden">
        <HeroBanner />
        <div className="h-4 md:h-16 bg-white"></div>
        <div className="bg-white w-full">
          <FeaturedCollections />
        </div>
        <div className="bg-white w-full">
          <FlashSalesSection />
        </div>
        <div className="bg-white w-full">
          <ClearanceProducts />
        </div>
        <div className="bg-white w-full">
          <ProductGrid title="New Arrivals" limit={8} />
        </div>
        <div className="bg-white w-full">
          <ShopAllSection />
        </div>
        <div className="bg-gray-50 w-full">
          <ProductGrid title="Best Sellers" limit={8} />
        </div>
        {/* Promotional Banners - Hidden until content is ready */}
        {/* <div className="bg-white w-full">
          <PromotionalBanners />
        </div> */}
        <div className="bg-gray-50 w-full">
          <RecentlyViewed />
        </div>
        <div className="bg-white w-full">
          <FeaturesShowcase />
        </div>
        <div className="bg-white w-full">
          <TestimonialsSection />
        </div>
        {/* Blog Section - Hidden until content is ready */}
        {/* <div className="bg-white w-full">
          <BlogSection />
        </div> */}
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

