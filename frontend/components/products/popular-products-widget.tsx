"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ProductCard } from "./product-card";
import { Product } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";

interface PopularProductsWidgetProps {
  limit?: number;
  title?: string;
  showViewAll?: boolean;
}

export function PopularProductsWidget({
  limit = 4,
  title = "Popular Products",
  showViewAll = true,
}: PopularProductsWidgetProps) {
  const { data: topProducts, isLoading } = useQuery({
    queryKey: ["analytics", "top-products", "widget", limit],
    queryFn: async () => {
      try {
        // Use public endpoint (no auth required)
        const response = await api.get(`/analytics/top-products/public?limit=${limit}`);
        return response.data;
      } catch (error) {
        console.error("Error fetching popular products:", error);
        return [];
      }
    },
  });

  if (isLoading) {
    return (
      <section className="py-8 md:py-12 container mx-auto px-4">
        <div className="flex items-center justify-center mb-6 md:mb-8 gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 text-center tracking-tight">
            {title}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!topProducts || topProducts.length === 0) {
    return null;
  }

  // Filter out products without product data
  const validProducts = topProducts
    .filter((item: any) => item.product && item.product.id)
    .map((item: any) => ({
      ...item.product,
      priceGhs: typeof item.product.priceGhs === "string" 
        ? parseFloat(item.product.priceGhs) 
        : item.product.priceGhs,
      compareAtPriceGhs: item.product.compareAtPriceGhs
        ? typeof item.product.compareAtPriceGhs === "string"
          ? parseFloat(item.product.compareAtPriceGhs)
          : item.product.compareAtPriceGhs
        : null,
    })) as Product[];

  if (validProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-8 md:py-12 container mx-auto px-4">
      <div className="flex flex-col items-center mb-6 md:mb-8 gap-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 text-center tracking-tight">
            {title}
          </h2>
        </div>
        {showViewAll && (
          <Link href="/categories/shop-all">
            <Button variant="outline" size="sm">
              View All Products →
            </Button>
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {validProducts.slice(0, limit).map((product: Product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

