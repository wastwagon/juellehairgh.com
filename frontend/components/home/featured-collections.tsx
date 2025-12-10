"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Product, Category } from "@/types";
import { ArrowRight, Sparkles, Star, TrendingUp, Tag, DollarSign } from "lucide-react";

const collections = [
  { name: "New Arrivals", slug: "new-arrivals", query: "?limit=4&sort=newest", icon: Sparkles },
  { name: "Best Sellers", slug: "best-sellers", query: "?limit=4&sort=popular", icon: TrendingUp },
  { name: "Clearance", slug: "clearance", query: "?limit=4&sort=newest", icon: Tag },
  { name: "Wigs Under GH₵ 500", slug: "wigs-under-ghc-500", query: "?limit=4&maxPrice=500", icon: DollarSign },
];

export function FeaturedCollections() {
  // Fetch products for each collection - all hooks at top level
  const newArrivalsQuery = useQuery<Product[]>({
    queryKey: ["collection-products", "new-arrivals"],
    queryFn: async () => {
      try {
        try {
          const collectionResponse = await api.get(`/collections/new-arrivals`);
          const collectionData = collectionResponse.data;
          if (collectionData?.products && collectionData.products.length > 0) {
            const products = collectionData.products
              .map((cp: any) => cp.product || cp)
              .filter((p: any) => p && p.images && p.images.length > 0)
              .slice(0, 4);
            if (products.length > 0) return products;
          }
        } catch {
          // Fallback
        }
        const response = await api.get(`/products?limit=4&sort=newest`);
        const products = (response.data.products || response.data || []).filter(
          (p: any) => p && p.images && p.images.length > 0
        );
        return products.slice(0, 4);
      } catch (error) {
        console.error("Error fetching new arrivals:", error);
        return [];
      }
    },
    staleTime: 60000,
  });

  const bestSellersQuery = useQuery<Product[]>({
    queryKey: ["collection-products", "best-sellers"],
    queryFn: async () => {
      try {
        try {
          const collectionResponse = await api.get(`/collections/best-sellers`);
          const collectionData = collectionResponse.data;
          if (collectionData?.products && collectionData.products.length > 0) {
            const products = collectionData.products
              .map((cp: any) => cp.product || cp)
              .filter((p: any) => p && p.images && p.images.length > 0)
              .slice(0, 4);
            if (products.length > 0) return products;
          }
        } catch {
          // Fallback
        }
        const response = await api.get(`/products?limit=4&sort=popular`);
        const products = (response.data.products || response.data || []).filter(
          (p: any) => p && p.images && p.images.length > 0
        );
        return products.slice(0, 4);
      } catch (error) {
        console.error("Error fetching best sellers:", error);
        return [];
      }
    },
    staleTime: 60000,
  });

  const clearanceQuery = useQuery<Product[]>({
    queryKey: ["collection-products", "clearance"],
    queryFn: async () => {
      try {
        try {
          const collectionResponse = await api.get(`/collections/clearance`);
          const collectionData = collectionResponse.data;
          if (collectionData?.products && collectionData.products.length > 0) {
            const products = collectionData.products
              .map((cp: any) => cp.product || cp)
              .filter((p: any) => p && p.images && p.images.length > 0)
              .slice(0, 4);
            if (products.length > 0) return products;
          }
        } catch {
          // Fallback
        }
        const response = await api.get(`/products?limit=4&sort=newest`);
        const products = (response.data.products || response.data || []).filter(
          (p: any) => p && p.images && p.images.length > 0
        );
        return products.slice(0, 4);
      } catch (error) {
        console.error("Error fetching clearance:", error);
        return [];
      }
    },
    staleTime: 60000,
  });

  const wigsUnder500Query = useQuery<Product[]>({
    queryKey: ["collection-products", "wigs-under-ghc-500"],
    queryFn: async () => {
      try {
        try {
          const collectionResponse = await api.get(`/collections/wigs-under-ghc-500`);
          const collectionData = collectionResponse.data;
          if (collectionData?.products && collectionData.products.length > 0) {
            const products = collectionData.products
              .map((cp: any) => cp.product || cp)
              .filter((p: any) => p && p.images && p.images.length > 0)
              .slice(0, 4);
            if (products.length > 0) return products;
          }
        } catch {
          // Fallback
        }
        const response = await api.get(`/products?limit=20&sort=newest`);
        const products = (response.data.products || response.data || [])
          .filter((p: any) => p && p.images && p.images.length > 0 && Number(p.priceGhs) <= 500)
          .slice(0, 4);
        return products;
      } catch (error) {
        console.error("Error fetching wigs under 500:", error);
        return [];
      }
    },
    staleTime: 60000,
  });

  const collectionQueries = [
    newArrivalsQuery,
    bestSellersQuery,
    clearanceQuery,
    wigsUnder500Query,
  ];


  const getImageUrl = (product: Product) => {
    if (!product.images || product.images.length === 0) return null;
    const firstImage = product.images[0];
    if (firstImage.startsWith("/")) return firstImage;
    if (firstImage.startsWith("http://") || firstImage.startsWith("https://")) return firstImage;
    if (firstImage.startsWith("products/")) return `/${firstImage}`;
    return `/${firstImage}`;
  };

  // Fetch collections from backend to get images
  const { data: backendCollections } = useQuery({
    queryKey: ["collections", "all"],
    queryFn: async () => {
      try {
        const response = await api.get("/collections");
        return response.data || [];
      } catch (error) {
        console.error("Error fetching collections:", error);
        return [];
      }
    },
    staleTime: 60000,
  });

  // Helper to get collection image from backend
  const getCollectionImage = (slug: string) => {
    const backendCollection = backendCollections?.find((c: any) => c.slug === slug);
    if (backendCollection?.image) {
      const imagePath = backendCollection.image;
      
      // Handle different image path formats
      if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        // Full URL - use as-is (external images)
        return imagePath;
      }
      
      // ALWAYS use Next.js API proxy route for /media/ paths
      // This ensures images load correctly even if backend static serving has issues
      if (imagePath.startsWith("/media/")) {
        // Convert /media/collections/file.jpg -> /api/media/collections/file.jpg
        return `/api${imagePath}`;
      }
      
      // For other absolute paths starting with /
      if (imagePath.startsWith("/")) {
        // If it contains /media/, use proxy route
        if (imagePath.includes("/media/")) {
          return `/api${imagePath}`;
        }
        // For other paths, return as-is (might be relative to frontend)
        return imagePath;
      }
      
      // Relative filename - assume it's a collection image
      // Use proxy route: /api/media/collections/filename
      return `/api/media/collections/${imagePath}`;
    }
    return null;
  };

  return (
    <section className="py-8 md:py-16 container mx-auto px-4">
      <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-6 md:mb-8 text-center text-gray-800 tracking-tight">
        Shop by Collection
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {collections.map((collection, index) => {
          const { data: products = [], isLoading } = collectionQueries[index];
          const IconComponent = collection.icon;
          const collectionImage = getCollectionImage(collection.slug);

          return (
            <div key={collection.slug} className="flex flex-col">
              <Link
                href={`/collections/${collection.slug}`}
                className="group relative overflow-hidden rounded-lg aspect-square bg-gray-200 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105"
              >
                {/* Collection Image Background - Fills entire card, no overlay */}
                {collectionImage ? (
                  <img
                    src={collectionImage}
                    alt={collection.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to gradient background if image fails
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.parentElement?.querySelector('.fallback-gradient') as HTMLElement;
                      if (fallback) fallback.style.display = 'block';
                    }}
                  />
                ) : null}

                {/* Fallback gradient background if no image */}
                <div className="fallback-gradient absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-500 group-hover:from-pink-600 group-hover:to-purple-600 transition-all duration-300" style={{ display: collectionImage ? 'none' : 'block' }} />

                {/* Shimmer Effect on Hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />

                {/* Loading State */}
                {isLoading && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-20">
                    <div className="text-gray-400 text-sm">Loading...</div>
                  </div>
                )}
              </Link>

              {/* Title and Product Count - Outside and below the card */}
              <div className="mt-3 text-center">
                <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1">
                  {collection.name}
                </h3>
                {products.length > 0 && (
                  <p className="text-sm text-gray-600">
                    {products.length} {products.length === 1 ? 'Product' : 'Products'}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

