"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";

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
              setMessage("Payment successful! Redirecting to order confirmation...");
              router.push(`/checkout/thank-you?orderId=${response.data.order.id}`);
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
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Verifying payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        {status === "success" ? (
          <>
            <div className="text-4xl mb-4">✅</div>
            <h1 className="text-2xl md:text-3xl font-bold mb-4">Payment Successful!</h1>
            <p className="text-muted-foreground mb-8">{message}</p>
            <div className="space-y-4">
              <Link
                href="/account/orders"
                className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90"
              >
                View Orders
              </Link>
              <Link
                href="/"
                className="block text-muted-foreground hover:text-foreground"
              >
                Continue Shopping
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="text-4xl mb-4">❌</div>
            <h1 className="text-2xl md:text-3xl font-bold mb-4">Payment Failed</h1>
            <p className="text-muted-foreground mb-8">{message}</p>
            <div className="space-y-4">
              <Link
                href="/cart"
                className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90"
              >
                Try Again
              </Link>
              <Link
                href="/"
                className="block text-muted-foreground hover:text-foreground"
              >
                Continue Shopping
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


