import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { SearchResults } from "@/components/search/search-results";

export const dynamic = 'force-dynamic';

export default function SearchPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 w-full">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <SearchResults />
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

