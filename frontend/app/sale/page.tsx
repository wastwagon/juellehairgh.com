import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { CategoryPage } from "@/components/categories/category-page";

export default function SalePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 w-full">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <p className="text-gray-600 mb-8">Shop our amazing deals and discounts</p>
          {/* For now, redirect to shop-all with sale filter */}
          <CategoryPage slug="shop-all" />
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}


