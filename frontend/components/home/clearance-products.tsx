"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ProductCard } from "@/components/products/product-card";
import { Product } from "@/types";
import Link from "next/link";

export function ClearanceProducts() {
  const { data: collection, isLoading, error } = useQuery({
    queryKey: ["collection", "clearance"],
    queryFn: async () => {
      try {
        // Add cache-busting timestamp to force fresh fetch
        const timestamp = Date.now();
        const response = await api.get(`/collections/clearance?t=${timestamp}`);
        return response.data;
      } catch (err: any) {
        console.error("Error fetching clearance collection:", err);
        return null;
      }
    },
    retry: 1,
    staleTime: 0, // Always fetch fresh data
    cacheTime: 0, // Don't cache
    refetchOnMount: true, // Refetch on mount
  });

  // Get products from collection - handle nested structure
  const products = collection?.products
    ? collection.products
        .map((cp: any) => {
          // Handle nested product structure (CollectionProduct -> product)
          if (cp.product) {
            const product = cp.product;
            return {
              ...product,
              priceGhs: typeof product.priceGhs === 'string' ? parseFloat(product.priceGhs) : (product.priceGhs || 0),
              compareAtPriceGhs: product.compareAtPriceGhs 
                ? (typeof product.compareAtPriceGhs === 'string' ? parseFloat(product.compareAtPriceGhs) : product.compareAtPriceGhs)
                : null,
            };
          }
          // Handle direct product structure
          return {
            ...cp,
            priceGhs: typeof cp.priceGhs === 'string' ? parseFloat(cp.priceGhs) : (cp.priceGhs || 0),
            compareAtPriceGhs: cp.compareAtPriceGhs 
              ? (typeof cp.compareAtPriceGhs === 'string' ? parseFloat(cp.compareAtPriceGhs) : cp.compareAtPriceGhs)
              : null,
          };
        })
        .filter((p: any) => {
          // Filter out any null/undefined products, deleted products, and ensure product has required fields
          return p && p.id && p.title && (p.priceGhs || p.priceGhs === 0) && p.isActive !== false;
        })
    : [];

  if (isLoading) {
    return (
      <section className="py-8 md:py-12 container mx-auto px-4">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 text-center mb-6 md:mb-8 tracking-tight">
          Clearance Sale
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {[...Array(4)].map((_, i) => (
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

  if (error || products.length === 0) {
    return null; // Don't render if no products
  }

  // Limit to 8 products for clearance section
  const productsToShow = products.slice(0, 8);

  return (
    <section className="py-8 md:py-12 container mx-auto px-4">
      <div className="flex flex-col items-center mb-6 md:mb-8 gap-4">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
            🎯 Clearance Sale
          </h2>
          <p className="text-sm md:text-base text-gray-600">
            Limited time offers - Don't miss out on these amazing deals!
          </p>
        </div>
        <Link
          href="/collections/clearance"
          className="text-sm text-primary hover:underline font-medium whitespace-nowrap px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          View All Clearance Items →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {productsToShow.map((product: Product) => {
          if (!product || !product.id || !product.title) {
            return null;
          }
          // Ensure priceGhs is a number
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
