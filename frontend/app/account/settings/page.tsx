import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { AccountLayout } from "@/components/account/account-layout";
import { AccountSettings } from "@/components/account/account-settings";

export default function SettingsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <AccountLayout>
          <AccountSettings />
        </AccountLayout>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

