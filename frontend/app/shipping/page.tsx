import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { ShippingPage } from "@/components/pages/shipping-page";

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 w-full">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <ShippingPage />
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
