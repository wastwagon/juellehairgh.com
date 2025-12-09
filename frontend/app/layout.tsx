import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { WhatsAppChatButton } from "@/components/layout/whatsapp-chat-button";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap', // Optimize font loading
  preload: true,
});

export const metadata: Metadata = {
  title: "Juelle Hair Ghana - Premium Hair Products",
  description: "Shop premium wigs, braids, and hair care products in Ghana",
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
        <Providers>{children}</Providers>
        <WhatsAppChatButton />
      </body>
    </html>
  );
}

