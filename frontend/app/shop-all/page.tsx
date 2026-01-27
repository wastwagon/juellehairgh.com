import { Suspense } from "react";
import { CategoryPage } from "@/components/categories/category-page";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

export const dynamic = 'force-dynamic';

export default function ShopAllPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 w-full">
        <Suspense fallback={<div className="container mx-auto px-4 py-8 animate-pulse text-center">Loading shop...</div>}>
          <CategoryPage slug="shop-all" />
        </Suspense>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
