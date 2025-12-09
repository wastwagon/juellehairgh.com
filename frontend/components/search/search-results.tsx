"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { api } from "@/lib/api";
import { Product } from "@/types";
import { ProductCard } from "@/components/products/product-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const { data: productsData, isLoading } = useQuery<{
    products: Product[];
    pagination: any;
  }>({
    queryKey: ["products", "search", query],
    queryFn: async () => {
      const response = await api.get(`/products?search=${encodeURIComponent(query)}`);
      return response.data;
    },
    enabled: !!query,
  });

  // Track search when results are loaded
  useEffect(() => {
    if (productsData && typeof window !== "undefined") {
      import("@/lib/analytics").then(({ analytics }) => {
        analytics.search(query, productsData.pagination?.total || productsData.products?.length || 0);
      });
    }
  }, [productsData, query]);

  if (!query) {
    return (
      <div className="w-full">
        <Breadcrumbs items={[{ label: "Search" }]} />
        <div className="text-center py-12">
          <p className="text-gray-600">
            Enter a search term to find products.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Breadcrumbs
        items={[
          { label: "Search", href: "/search" },
          { label: `"${query}"` },
        ]}
      />
      {productsData?.products && productsData.products.length > 0 ? (
        <>
          <p className="text-sm md:text-base text-gray-600 mb-6">
            Found {productsData.pagination?.total || 0} products
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {productsData.products.map((product) => {
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
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">
            No products found for &quot;{query}&quot;
          </p>
        </div>
      )}
    </div>
  );
}

