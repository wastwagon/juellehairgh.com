import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export default function CheckoutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 w-full">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <Breadcrumbs
            items={[
              { label: "Cart", href: "/cart" },
              { label: "Checkout" },
            ]}
          />
          <CheckoutForm />
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

