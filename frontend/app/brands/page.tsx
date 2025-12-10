import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { BrandsList } from "@/components/brands/brands-list";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export default function BrandsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 w-full">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Brands" },
            ]}
          />
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">All Brands</h1>
            <p className="text-gray-600">Browse products by brand</p>
          </div>
          <BrandsList />
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
