import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { AccountLayout } from "@/components/account/account-layout";
import { OrdersList } from "@/components/account/orders-list";

export default function OrdersPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <AccountLayout>
          <OrdersList />
        </AccountLayout>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

