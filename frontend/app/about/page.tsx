import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { AboutPage } from "@/components/pages/about-page";

export const metadata: Metadata = {
  title: "About Us - Juelle Hair Gh",
  description: "Learn about Juelle Hair Gh - your trusted source for premium wigs, braids, and hair care products in Ghana. Quality products, excellent service.",
  openGraph: {
    title: "About Us - Juelle Hair Gh",
    description: "Learn about Juelle Hair Gh - your trusted source for premium hair products in Ghana.",
    type: "website",
  },
};

export default function AboutUsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 w-full">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <AboutPage />
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
