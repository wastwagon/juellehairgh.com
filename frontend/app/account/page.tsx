import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { AccountLayout } from "@/components/account/account-layout";
import { AccountOverview } from "@/components/account/account-overview";

export default function AccountPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <AccountLayout>
          <AccountOverview />
        </AccountLayout>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

