"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ProductCard } from "@/components/products/product-card";
import { Product } from "@/types";
import Link from "next/link";

interface ProductCarouselProps {
  title: string;
  collectionSlug?: string;
}

export function ProductCarousel({ title, collectionSlug }: ProductCarouselProps) {
  // Map title to collection slug if not provided
  const slug = collectionSlug || (title === "New Arrivals" ? "new-arrivals" : title === "Best Sellers" ? "best-sellers" : null);

  const { data: collection, isLoading, error } = useQuery({
    queryKey: ["collection", slug],
    queryFn: async () => {
      if (!slug) return null;
      try {
        const response = await api.get(`/collections/${slug}`);
        console.log(`✅ Fetched collection ${slug}:`, response.data);
        return response.data;
      } catch (err: any) {
        console.error(`❌ Error fetching collection ${slug}:`, err);
        return null;
      }
    },
    enabled: !!slug,
    retry: 1,
  });

  // Get products from collection - handle nested structure
  const products = collection?.products
    ? collection.products
        .map((cp: any) => {
          // Handle nested product structure (CollectionProduct -> product)
          if (cp.product) {
            const product = cp.product;
            // Ensure price is a number
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
          // Filter out any null/undefined products and ensure product has required fields
          return p && p.id && p.title && (p.priceGhs || p.priceGhs === 0);
        })
    : [];

  console.log(`📦 ${title} - Products extracted:`, products.length);
  if (products.length > 0) {
    console.log(`📦 ${title} - First product:`, products[0]);
  }

  // If no collection or products, fetch recent products instead
  const { data: fallbackProducts, isLoading: isLoadingFallback, error: fallbackError } = useQuery<Product[]>({
    queryKey: ["products", "recent", title],
    queryFn: async () => {
      try {
        let fetchedProducts: any[] = [];
        
        if (title === "New Arrivals") {
          // For New Arrivals, fetch products with "New Arrival" badge or recently created
          const response = await api.get(`/products?limit=20&sort=newest`);
          fetchedProducts = response.data.products || [];
          // Filter for products with "New Arrival" badge or created in last 30 days
          fetchedProducts = fetchedProducts.filter((p: any) => 
            (p.badges && p.badges.includes("New Arrival")) || 
            (p.createdAt && new Date(p.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
          );
          // If no filtered products, just use the first 20
          if (fetchedProducts.length === 0) {
            fetchedProducts = response.data.products || [];
          }
        } else if (title === "Best Sellers") {
          // For Best Sellers, use popular sort or just fetch products
          try {
            const response = await api.get(`/products?limit=20&sort=popular`);
            fetchedProducts = response.data.products || [];
          } catch {
            // Fallback to newest if popular sort doesn't work
            const response = await api.get(`/products?limit=20&sort=newest`);
            fetchedProducts = response.data.products || [];
          }
        } else {
          const response = await api.get(`/products?limit=20&sort=newest`);
          fetchedProducts = response.data.products || [];
        }
        
        console.log(`✅ Fetched fallback products for ${title}:`, fetchedProducts.length);
        // Ensure prices are numbers
        return fetchedProducts.map((p: any) => ({
          ...p,
          priceGhs: typeof p.priceGhs === 'string' ? parseFloat(p.priceGhs) : (p.priceGhs || 0),
          compareAtPriceGhs: p.compareAtPriceGhs 
            ? (typeof p.compareAtPriceGhs === 'string' ? parseFloat(p.compareAtPriceGhs) : p.compareAtPriceGhs)
            : null,
        }));
      } catch (err: any) {
        console.error(`❌ Error fetching fallback products for ${title}:`, err);
        return [];
      }
    },
    enabled: (!slug || products.length === 0) && !isLoading,
    retry: 2,
    staleTime: 60000, // Cache for 1 minute
  });

  // Use products from collection if available, otherwise use fallback
  const displayProducts = products.length > 0 
    ? products 
    : (fallbackProducts || []).filter((p: Product) => p && p.id && p.title && p.priceGhs);

  console.log(`🎯 ${title} - Display products:`, displayProducts.length);
  console.log(`🔍 ${title} - Products data:`, displayProducts);

  if (isLoading || isLoadingFallback) {
    return (
      <section className="py-8 md:py-12 container mx-auto px-4">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 text-center mb-6 md:mb-8 tracking-tight">{title}</h2>
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

  // Show error state (but still try to show products if available)
  if ((error || fallbackError) && displayProducts.length === 0) {
    console.error(`❌ ${title} - Error and no products:`, error || fallbackError);
  }

  if (displayProducts.length === 0 && !isLoading && !isLoadingFallback) {
    // Don't render if no products and not loading
    return null;
  }

  // Limit to 4 products for both New Arrivals and Best Sellers
  const maxProducts = 4;
  const productsToShow = displayProducts.slice(0, maxProducts);

  // Debug logging
  if (productsToShow.length === 0 && !isLoading && !isLoadingFallback) {
    console.warn(`⚠️ ${title} - No products to display after filtering`);
    console.warn(`   Collection products:`, collection?.products?.length || 0);
    console.warn(`   Extracted products:`, products.length);
    console.warn(`   Fallback products:`, fallbackProducts?.length || 0);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {productsToShow.map((product: Product) => {
          if (!product || !product.id || !product.title) {
            console.warn("Invalid product:", product);
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
