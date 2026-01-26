"use client";

import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ProductCard } from "@/components/products/product-card";
import { Product } from "@/types";
import Link from "next/link";

export function ShopAllSection() {
  const {
    data: infiniteProductsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingInfinite,
  } = useInfiniteQuery<{
    products: Product[];
    pagination: any;
  }>({
    queryKey: ["products-infinite", "homepage", "shop-all"],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        // Fetch from API (paged)
        // Use limit=20 so desktop (5 cols) stays nicely aligned
        const params = new URLSearchParams({
          sort: "newest",
          page: String(pageParam),
          limit: "20",
        });
        const response = await api.get(`/products?${params}`);
        const products = (response.data?.products || [])
          .filter((p: any) => p && p.images && p.images.length > 0 && p.id && p.isActive !== false)
          .map((p: any) => ({
            ...p,
            priceGhs: typeof p.priceGhs === "string" ? parseFloat(p.priceGhs) : p.priceGhs,
            compareAtPriceGhs: p.compareAtPriceGhs
              ? typeof p.compareAtPriceGhs === "string"
                ? parseFloat(p.compareAtPriceGhs)
                : p.compareAtPriceGhs
              : null,
          })) as Product[];

        return {
          products,
          pagination: response.data?.pagination,
        };
      } catch (err: any) {
        console.error("Error fetching products:", err);
        return { products: [], pagination: null };
      }
    },
    getNextPageParam: (lastPage) => {
      const totalPages = lastPage.pagination?.totalPages || 1;
      const currentPage = lastPage.pagination?.page || 1;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
  });

  // Flatten all products from infinite query
  const allProducts = infiniteProductsData?.pages.flatMap((page) => page.products) || [];

  // Intersection Observer for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoadingInfinite && allProducts.length === 0) {
    return (
      <section className="py-8 md:py-12 container mx-auto px-4">
        <div className="flex flex-col items-center mb-6 md:mb-8 gap-3">
          <span className="inline-block px-4 py-1.5 md:px-5 md:py-2 rounded-full bg-pink-600 text-white text-xs md:text-sm font-bold shadow-lg">
            Shop All
          </span>
          <Link href="/shop-all" className="text-sm text-primary hover:underline font-medium">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {[...Array(10)].map((_, i) => (
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

  if (allProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-8 md:py-12 container mx-auto px-4">
      <div className="flex flex-col items-center mb-6 md:mb-8 gap-3">
        <span className="inline-block px-4 py-1.5 md:px-5 md:py-2 rounded-full bg-pink-600 text-white text-xs md:text-sm font-bold shadow-lg">
          Shop All
        </span>
        <Link href="/shop-all" className="text-sm text-primary hover:underline font-medium">
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {allProducts.map((product: Product) => (
          <ProductCard key={product.id} product={product} compactBadges />
        ))}
      </div>

      {/* Infinite scroll trigger */}
      <div ref={loadMoreRef} className="mt-8">
        {isFetchingNextPage && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-3 text-sm text-gray-600">Loading more products...</span>
          </div>
        )}
        {!hasNextPage && allProducts.length > 0 && (
          <div className="text-center py-8 text-sm text-gray-500">
            All products loaded
          </div>
        )}
      </div>
    </section>
  );
}

