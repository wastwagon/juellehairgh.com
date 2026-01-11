"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export const dynamic = 'force-dynamic';

export default function CheckoutCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const reference = searchParams.get("reference");

    if (reference) {
      api
        .get(`/payments/verify/${reference}`)
        .then((response) => {
          if (response.data.success) {
            setStatus("success");
            // Check if this is a wallet top-up
            if (response.data.type === "wallet_topup") {
              setMessage("Wallet top-up successful! Redirecting to wallet...");
              setTimeout(() => {
                router.push("/account/wallet");
              }, 2000);
            } else if (response.data.order?.id) {
              setMessage("Payment verified successfully! Redirecting to order confirmation...");
              // Use window.location.href for full page navigation to ensure redirect works
              setTimeout(() => {
                window.location.href = `/checkout/thank-you?orderId=${response.data.order.id}`;
              }, 1500);
            } else {
              setMessage("Payment successful! Redirecting...");
              setTimeout(() => {
                router.push("/account/orders");
              }, 2000);
            }
          } else {
            setStatus("error");
            setMessage("Payment verification failed. Please contact support.");
          }
        })
        .catch((error) => {
          setStatus("error");
          setMessage(error.response?.data?.message || "Payment verification failed.");
        });
    } else {
      setStatus("error");
      setMessage("No payment reference found.");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center border border-gray-100">
            {status === "loading" && (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
                    </div>
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                    Verifying Payment
                  </h1>
                  <p className="text-gray-600">
                    Please wait while we confirm your payment...
                  </p>
                </div>
                <div className="flex justify-center space-x-1">
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}

            {status === "success" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-scale-in">
                      <CheckCircle2 className="h-12 w-12 text-green-600" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full animate-ping"></div>
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                    Payment Successful!
                  </h1>
                  <p className="text-gray-600">
                    {message}
                  </p>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-center">
                  <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="h-12 w-12 text-red-600" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                    Payment Verification Failed
                  </h1>
                  <p className="text-gray-600 mb-6">
                    {message}
                  </p>
                  <p className="text-sm text-gray-500">
                    If you were charged, please contact our support team with your payment reference.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scale-in {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
