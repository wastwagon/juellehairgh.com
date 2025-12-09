"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Mail } from "lucide-react";
import { api } from "@/lib/api";
import Link from "next/link";

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token) {
      handleUnsubscribe(token);
    } else {
      setStatus("error");
      setMessage("Invalid unsubscribe link. Please contact support if you need help.");
    }
  }, [token]);

  const handleUnsubscribe = async (unsubscribeToken: string) => {
    setStatus("loading");
    try {
      await api.get(`/newsletter/unsubscribe?token=${unsubscribeToken}`);
      setStatus("success");
      setMessage("You have been successfully unsubscribed from our newsletter.");
    } catch (error: any) {
      setStatus("error");
      setMessage(error.response?.data?.message || "Failed to unsubscribe. Please contact support.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 w-full flex items-center justify-center py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            {status === "loading" && (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Unsubscribing...</p>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Unsubscribed</h1>
                <p className="text-gray-600 mb-6">{message}</p>
                <Link href="/">
                  <Button>Return to Home</Button>
                </Link>
              </>
            )}

            {status === "error" && (
              <>
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex gap-3 justify-center">
                  <Link href="/">
                    <Button variant="outline">Go Home</Button>
                  </Link>
                  <Link href="/contact">
                    <Button>
                      <Mail className="h-4 w-4 mr-2" />
                      Contact Support
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
