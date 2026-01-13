"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Zap, Clock, Sparkles } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "@/components/products/product-card";
import { Product } from "@/types";

interface FlashSale {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  discountPercent: number;
  products: Array<{
    product: Product;
  }>;
}

export function FlashSalesSection() {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  const { data: flashSale, isLoading } = useQuery<FlashSale>({
    queryKey: ["flash-sales", "active"],
    queryFn: async () => {
      const response = await api.get("/flash-sales/active");
      return response.data;
    },
    staleTime: 0, // Always fetch fresh data
    cacheTime: 0, // Don't cache
    refetchOnMount: true, // Refetch on mount
  });

  useEffect(() => {
    if (!flashSale) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const end = new Date(flashSale.endDate).getTime();
      const difference = end - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [flashSale]);

  if (isLoading) {
    return (
      <section className="py-12 md:py-16 bg-gradient-to-r from-green-50 via-pink-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Christmas sale...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!flashSale || !timeLeft) {
    return null;
  }

  const products = flashSale.products.map((p) => {
    const product = p.product;
    // Calculate sale price
    const originalPrice = Number(product.priceGhs);
    const discount = (originalPrice * Number(flashSale.discountPercent)) / 100;
    const salePrice = originalPrice - discount;

    return {
      ...product,
      priceGhs: salePrice,
      compareAtPriceGhs: originalPrice,
      badges: [...(product.badges || []), "CHRISTMAS SALE"],
    };
  });

  // Use Christmas content if available, otherwise use flash sale data
  const displayTitle = flashSale.title || "Christmas Mega Sale";
  const displayDescription = flashSale.description || "Celebrate the holidays with amazing deals! Up to 30% off on selected hair products. Perfect gifts for yourself or loved ones!";
  const displayDiscount = flashSale.discountPercent || 30;

  return (
    <section className="py-12 md:py-16 bg-gradient-to-r from-green-50 via-pink-50 to-pink-50 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-pink-600 animate-pulse" />
            <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-yellow-500 animate-pulse" />
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">{displayTitle}</h2>
          </div>
          <p className="text-gray-700 mb-6 text-base md:text-lg max-w-3xl mx-auto">{displayDescription}</p>
          
          {/* Countdown Timer */}
          <div className="flex items-center justify-center gap-4 md:gap-6 mb-8">
            <div className="flex items-center gap-2 text-red-600">
              <Clock className="h-5 w-5" />
              <span className="text-sm font-medium">Ends in:</span>
            </div>
            <div className="flex gap-2 md:gap-4">
              <div className="bg-white rounded-lg shadow-md p-3 md:p-4 min-w-[60px] md:min-w-[80px] text-center">
                <div className="text-2xl md:text-3xl font-bold text-red-600">{String(timeLeft.days).padStart(2, "0")}</div>
                <div className="text-xs md:text-sm text-gray-600 mt-1">Days</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-3 md:p-4 min-w-[60px] md:min-w-[80px] text-center">
                <div className="text-2xl md:text-3xl font-bold text-red-600">{String(timeLeft.hours).padStart(2, "0")}</div>
                <div className="text-xs md:text-sm text-gray-600 mt-1">Hours</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-3 md:p-4 min-w-[60px] md:min-w-[80px] text-center">
                <div className="text-2xl md:text-3xl font-bold text-red-600">{String(timeLeft.minutes).padStart(2, "0")}</div>
                <div className="text-xs md:text-sm text-gray-600 mt-1">Minutes</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-3 md:p-4 min-w-[60px] md:min-w-[80px] text-center">
                <div className="text-2xl md:text-3xl font-bold text-red-600">{String(timeLeft.seconds).padStart(2, "0")}</div>
                <div className="text-xs md:text-sm text-gray-600 mt-1">Seconds</div>
              </div>
            </div>
          </div>

          <div className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg text-base md:text-lg font-semibold mb-6 shadow-lg">
            {Number(displayDiscount).toFixed(0)}% OFF
          </div>
        </div>

        {/* Products Grid */}
        {products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {products.slice(0, 10).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
