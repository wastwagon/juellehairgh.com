"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ProductCard } from "@/components/products/product-card";
import { Product } from "@/types";
import Link from "next/link";

interface ProductGridProps {
  title: string;
  collectionSlug?: string;
  limit?: number;
}

export function ProductGrid({ title, collectionSlug, limit = 8 }: ProductGridProps) {
  // Map title to collection slug if not provided
  const slug = collectionSlug || (title === "New Arrivals" ? "new-arrivals" : title === "Best Sellers" ? "best-sellers" : null);

  const { data: collection, isLoading, error } = useQuery({
    queryKey: ["collection", slug],
    queryFn: async () => {
      if (!slug) return null;
      try {
        const timestamp = Date.now();
        const response = await api.get(`/collections/${slug}?t=${timestamp}`);
        return response.data;
      } catch (err: any) {
        return null;
      }
    },
    enabled: !!slug,
    retry: 1,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
  });

  // Get products from collection
  let products: Product[] = [];
  if (collection?.products) {
    products = collection.products
      .map((cp: any) => cp.product || cp)
      .filter((p: any) => p && p.images && p.images.length > 0 && p.id && p.isActive !== false)
      .slice(0, limit);
  }

  // If no collection or products, fetch recent products instead
  const { data: fallbackProducts, isLoading: isLoadingFallback } = useQuery<Product[]>({
    queryKey: ["products", "recent", title],
    queryFn: async () => {
      try {
        let fetchedProducts: any[] = [];
        const timestamp = Date.now();
        
        if (title === "New Arrivals") {
          const response = await api.get(`/products?limit=${limit}&sort=newest&t=${timestamp}`);
          fetchedProducts = response.data.products || [];
          fetchedProducts = fetchedProducts.filter((p: any) => 
            (p.badges && p.badges.includes("New Arrival")) || 
            (p.createdAt && new Date(p.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
          );
          if (fetchedProducts.length === 0) {
            fetchedProducts = response.data.products || [];
          }
        } else if (title === "Best Sellers") {
          try {
            const response = await api.get(`/products?limit=${limit}&sort=popular&t=${timestamp}`);
            fetchedProducts = response.data.products || [];
          } catch {
            const response = await api.get(`/products?limit=${limit}&sort=newest&t=${timestamp}`);
            fetchedProducts = response.data.products || [];
          }
        } else {
          const response = await api.get(`/products?limit=${limit}&sort=newest&t=${timestamp}`);
          fetchedProducts = response.data.products || [];
        }
        
        return fetchedProducts
          .filter((p: any) => p && p.images && p.images.length > 0 && p.id && p.isActive !== false)
          .slice(0, limit);
      } catch (error) {
        console.error("Error fetching products:", error);
        return [];
      }
    },
    enabled: products.length === 0,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
  });

  const displayProducts = products.length > 0 ? products : (fallbackProducts || []);

  if (isLoading || isLoadingFallback) {
    return (
      <section className="py-8 md:py-12 container mx-auto px-4">
        <div className="flex flex-col items-center mb-6 md:mb-8 gap-4">
          <span className="inline-block px-4 py-1.5 md:px-5 md:py-2 rounded-full bg-pink-600 text-white text-xs md:text-sm font-bold shadow-lg">
            {title}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
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

  if (displayProducts.length === 0 && !isLoading && !isLoadingFallback) {
    return null;
  }

  return (
    <section className="py-8 md:py-12 container mx-auto px-4">
      <div className="flex flex-col items-center mb-6 md:mb-8 gap-4">
        <div className="flex flex-col items-center gap-3">
          <span className="inline-block px-4 py-1.5 md:px-5 md:py-2 rounded-full bg-pink-600 text-white text-xs md:text-sm font-bold shadow-lg">
            {title}
          </span>
        </div>
        {slug && (
          <Link
            href={`/collections/${slug}`}
            className="text-sm text-primary hover:underline font-medium whitespace-nowrap"
          >
            View all →
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {displayProducts.map((product: Product) => {
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
