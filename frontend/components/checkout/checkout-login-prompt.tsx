"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, UserPlus, CheckCircle2, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CheckoutLoginPromptProps {
  onLoginSuccess?: () => void;
}

export function CheckoutLoginPrompt({ onLoginSuccess }: CheckoutLoginPromptProps) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      setIsLoggedIn(!!token);
    };

    checkAuth();

    // Listen for storage changes (when user logs in on another tab/window)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token") {
        checkAuth();
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          // Refresh the page to reload user data
          window.location.reload();
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also check periodically in case user logged in on same tab
    const interval = setInterval(checkAuth, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [onLoginSuccess]);

  // Don't show if user is already logged in
  if (isLoggedIn) {
    return null;
  }

  const loginUrl = `/auth/login?redirect=${encodeURIComponent("/checkout")}`;
  const registerUrl = `/auth/register?redirect=${encodeURIComponent("/checkout")}`;

  return (
    <Card className="mb-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 shadow-lg">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Sign in for faster checkout
              </h3>
            </div>
            <p className="text-sm text-gray-700 mb-4">
              Returning customers enjoy quick checkout with saved addresses and order history.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span>Saved addresses</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span>Order tracking</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <MapPin className="h-4 w-4 text-purple-600 flex-shrink-0" />
                <span>Quick checkout</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link href={loginUrl}>
              <Button
                type="button"
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
            <Link href={registerUrl}>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto border-2 border-purple-500 text-purple-600 hover:bg-purple-50 font-semibold px-6 py-2.5 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Create Account
              </Button>
            </Link>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-purple-200">
          <p className="text-xs text-gray-600 text-center">
            Don't have an account? You can still checkout as a guest, but you'll miss out on these benefits.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

