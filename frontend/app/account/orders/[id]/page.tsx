import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { AccountLayout } from "@/components/account/account-layout";
import { OrderDetail } from "@/components/account/order-detail";

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <AccountLayout>
          <OrderDetail orderId={params.id} />
        </AccountLayout>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

