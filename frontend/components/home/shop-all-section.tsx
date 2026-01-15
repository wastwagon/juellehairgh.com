"use client";

import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ProductCard } from "@/components/products/product-card";
import { Product } from "@/types";
import { ShoppingBag } from "lucide-react";

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
        const params = new URLSearchParams({
          sort: "newest",
          page: String(pageParam),
        });
        const response = await api.get(`/products?${params}`);
        return response.data;
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
        <div className="flex items-center justify-center mb-6 md:mb-8 gap-2">
          <ShoppingBag className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
          <span className="inline-block px-4 py-1.5 md:px-5 md:py-2 rounded-full bg-pink-600 text-white text-xs md:text-sm font-bold shadow-lg">
            Shop All
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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

  if (allProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-8 md:py-12 container mx-auto px-4">
      <div className="flex flex-col items-center mb-6 md:mb-8 gap-4">
        <div className="flex items-center justify-center gap-2">
          <ShoppingBag className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
          <span className="inline-block px-4 py-1.5 md:px-5 md:py-2 rounded-full bg-pink-600 text-white text-xs md:text-sm font-bold shadow-lg">
            Shop All
          </span>
        </div>
        {infiniteProductsData?.pages[0]?.pagination?.total && (
          <p className="text-sm text-gray-600">
            {allProducts.length} of {infiniteProductsData.pages[0].pagination.total} products
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {allProducts.map((product: Product) => {
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

