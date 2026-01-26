import type { Metadata } from "next";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";
import { Providers } from "@/components/providers";
import { WhatsAppChatButton } from "@/components/layout/whatsapp-chat-button";

// Dynamically import FakeSalesNotification with SSR disabled to prevent build-time errors
const FakeSalesNotification = dynamic(
  () => import("@/components/layout/fake-sales-notification").then((mod) => ({ default: mod.FakeSalesNotification })),
  { ssr: false }
);

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap', // Optimize font loading
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") || "https://juellehairgh.com"),
  title: {
    default: "Juelle Hair Gh - Crochet Braiding Hair Extensions & Wig Shop",
    template: "%s | Juelle Hair Gh",
  },
  description: "Shop premium quality lace wigs, crochet braids, ponytails, clip-ins, and hair care products in Ghana. Free shipping on orders GHS 950+. Same-day delivery in Accra.",
  keywords: [
    "wigs Ghana",
    "lace wigs",
    "crochet braids",
    "hair extensions Ghana",
    "human hair wigs",
    "synthetic wigs",
    "ponytails",
    "clip-ins",
    "hair care products",
    "Juelle Hair",
    "hair products Accra",
  ],
  authors: [{ name: "Juelle Hair Gh" }],
  creator: "Juelle Hair Gh",
  publisher: "Juelle Hair Gh",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_GH",
    url: process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") || "https://juellehairgh.com",
    siteName: "Juelle Hair Gh",
    title: "Juelle Hair Gh - Crochet Braiding Hair Extensions & Wig Shop",
    description: "Shop premium quality lace wigs, crochet braids, ponytails, and hair care products. Free shipping on orders GHS 950+.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Juelle Hair Gh - Crochet Braiding Hair Extensions & Wig Shop",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Juelle Hair Gh - Crochet Braiding Hair Extensions & Wig Shop",
    description: "Shop premium quality lace wigs, crochet braids, and hair care products in Ghana.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add Google Search Console verification when available
    // google: "your-google-verification-code",
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") || "https://juellehairgh.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Inject runtime configuration for client-side access
  // This allows environment variables set in Render to be available to client-side code
  const runtimeConfig = {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '',
  };

  return (
    <html lang="en">
      <head>
        <script
          id="__RUNTIME_CONFIG__"
          type="application/json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(runtimeConfig),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const script = document.getElementById('__RUNTIME_CONFIG__');
                  if (script) {
                    const config = JSON.parse(script.textContent || '{}');
                    window.__ENV__ = config;
                  }
                } catch (e) {
                  console.error('Failed to load runtime config:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
          <WhatsAppChatButton />
          <FakeSalesNotification />
        </Providers>
      </body>
    </html>
  );
}

