import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { AccountLayout } from "@/components/account/account-layout";
import { AddressesList } from "@/components/account/addresses-list";

export default function AddressesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <AccountLayout>
          <AddressesList />
        </AccountLayout>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

