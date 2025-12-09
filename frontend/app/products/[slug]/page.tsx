import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { ProductDetail } from "@/components/products/product-detail";

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

