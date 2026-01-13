import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { HeroBanner } from "@/components/home/hero-banner";
import { FeaturedCollections } from "@/components/home/featured-collections";
import { ProductCarousel } from "@/components/home/product-carousel";
import { ClearanceProducts } from "@/components/home/clearance-products";
import { RecentlyViewed } from "@/components/home/recently-viewed";
import { PromotionalBanners } from "@/components/home/promotional-banners";
import { FeaturesShowcase } from "@/components/home/features-showcase";
import { PopularProductsWidget } from "@/components/products/popular-products-widget";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { FlashSalesSection } from "@/components/home/flash-sales-section";
import { BlogSection } from "@/components/home/blog-section";
import { HashScrollHandler } from "@/components/home/hash-scroll-handler";

// Force dynamic rendering to prevent caching stale content
export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <HashScrollHandler />
      <Header />
      <main className="flex-1 w-full overflow-x-hidden">
        <HeroBanner />
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
          <ProductCarousel title="New Arrivals" />
        </div>
        <div className="bg-gray-50 w-full">
          <ProductCarousel title="Best Sellers" />
        </div>
        <div className="bg-white w-full">
          <PromotionalBanners />
        </div>
        <div className="bg-gray-50 w-full">
          <RecentlyViewed />
        </div>
        <div className="bg-white w-full">
          <PopularProductsWidget limit={4} title="Popular Products" />
        </div>
        <div className="bg-gray-50 w-full">
          <FeaturesShowcase />
        </div>
        <div className="bg-white w-full">
          <TestimonialsSection />
        </div>
        <div className="bg-white w-full">
          <BlogSection />
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

