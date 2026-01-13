"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ProductCard } from "@/components/products/product-card";
import { Product } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ShopAllSection() {
  const { data: productsData, isLoading } = useQuery<{
    products: Product[];
    pagination: any;
  }>({
    queryKey: ["products", "all"],
    queryFn: async () => {
      try {
        // Fetch all products - use a high limit to get all products
        const response = await api.get("/products?limit=1000&sort=newest");
        return response.data;
      } catch (err: any) {
        console.error("Error fetching products:", err);
        return { products: [], pagination: null };
      }
    },
    retry: 2,
    staleTime: 0, // Always fetch fresh data
    cacheTime: 0, // Don't cache
    refetchOnMount: true, // Refetch on mount
  });

  const products = productsData?.products || [];

  if (isLoading) {
    return (
      <section className="py-8 md:py-12 container mx-auto px-4">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-6 md:mb-8 text-gray-800 text-center tracking-tight">Shop All</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {[...Array(8)].map((_, i) => (
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

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-8 md:py-12 container mx-auto px-4">
      <div className="flex flex-col items-center mb-6 md:mb-8 gap-4">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 text-center tracking-tight">Shop All</h2>
        {productsData?.pagination && (
          <p className="text-sm text-gray-600">
            Showing {products.length} of {productsData.pagination.total} products
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {products.map((product: Product) => {
          if (!product || !product.id || !product.title) {
            return null;
          }
          const productWithPrice = {
            ...product,
            priceGhs: typeof product.priceGhs === 'string' ? parseFloat(product.priceGhs) : product.priceGhs,
            compareAtPriceGhs: product.compareAtPriceGhs
              ? (typeof product.compareAtPriceGhs === 'string' ? parseFloat(product.compareAtPriceGhs) : product.compareAtPriceGhs)
              : null,
          };
          return <ProductCard key={product.id} product={productWithPrice} />;
        })}
      </div>
    </section>
  );
}

