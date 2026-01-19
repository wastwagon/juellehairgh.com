"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Product, Collection } from "@/types";
import { Sparkles, TrendingUp, Tag, DollarSign, Package } from "lucide-react";

// Icon mapping for collections based on name/slug
const getCollectionIcon = (name: string, slug: string) => {
  const nameLower = name.toLowerCase();
  const slugLower = slug.toLowerCase();
  
  if (nameLower.includes("new") || nameLower.includes("arrival") || slugLower.includes("new")) {
    return Sparkles;
  }
  if (nameLower.includes("best") || nameLower.includes("seller") || slugLower.includes("best")) {
    return TrendingUp;
  }
  if (nameLower.includes("clearance") || nameLower.includes("sale") || slugLower.includes("clearance")) {
    return Tag;
  }
  if (nameLower.includes("wig") || nameLower.includes("500") || slugLower.includes("wig")) {
    return DollarSign;
  }
  return Package; // Default icon
};

export function FeaturedCollections() {
  // Fetch all active collections from backend
  const { data: backendCollections = [], isLoading: collectionsLoading } = useQuery<Collection[]>({
    queryKey: ["collections", "featured"],
    queryFn: async () => {
      try {
        // Add cache-busting timestamp to force fresh fetch
        const timestamp = Date.now();
        const response = await api.get(`/collections?t=${timestamp}`);
        const collections = response.data || [];
        // Return all active collections
        return collections.filter((c: Collection) => c.isActive !== false);
      } catch (error) {
        console.error("Error fetching collections:", error);
        return [];
      }
    },
    staleTime: 0, // Always fetch fresh data
    cacheTime: 0, // Don't cache
    refetchOnMount: true, // Refetch on mount
  });


  // Helper to get collection image URL
  const getCollectionImage = (collection: Collection) => {
    if (collection.image) {
      const imagePath = collection.image;
      
      // Handle different image path formats
      if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        // Full URL - use as-is (external images)
        return imagePath;
      }
      
      // For /media/collections/ paths, use Next.js API proxy route
      if (imagePath.startsWith("/media/collections/")) {
        // Use Next.js API proxy route which forwards to backend
        return `/api${imagePath}`;
      }
      
      // Handle /media/ paths (general case) - use Next.js API proxy route
      if (imagePath.startsWith("/media/")) {
        return `/api${imagePath}`;
      }
      
      // Handle paths that contain "collections" or "media" (extract filename)
      if (imagePath.includes("collections") || imagePath.includes("media")) {
        const filename = imagePath.split("/").pop() || imagePath;
        // Use Next.js API proxy route
        return `/api/media/collections/${filename}`;
      }
      
      // For other absolute paths starting with /
      if (imagePath.startsWith("/")) {
        if (imagePath.includes("/media/")) {
          // Use Next.js API proxy route
          return `/api${imagePath}`;
        }
        return imagePath;
      }
      
      // Relative filename - assume it's a collection image
      // Use Next.js API proxy route which forwards to backend
      return `/api/media/collections/${imagePath}`;
    }
    
    // If no image, try to use first product image as fallback
    if (collection.products && collection.products.length > 0) {
      const firstProductItem = collection.products[0] as any;
      // Handle both CollectionProduct (with nested product) and direct Product
      const firstProduct = firstProductItem?.product || firstProductItem;
      if (firstProduct?.images && firstProduct.images.length > 0) {
        const productImage = firstProduct.images[0];
        if (productImage.startsWith("/media/")) {
          return `/api${productImage}`;
        }
        if (productImage.includes("products") || productImage.includes("media")) {
          const filename = productImage.split("/").pop() || productImage;
          return `/api/media/products/${filename}`;
        }
      }
    }
    
    return null;
  };


  if (collectionsLoading) {
    return (
      <section className="mt-0 pt-16 pb-8 md:mt-0 md:pt-12 md:pb-16 container mx-auto px-4">
        <div className="flex justify-center mb-6 md:mb-8">
          <span className="inline-block px-4 py-1.5 md:px-5 md:py-2 rounded-full bg-pink-600 text-white text-xs md:text-sm font-bold shadow-lg relative z-0">
            Shop by Collection
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-3" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!backendCollections || backendCollections.length === 0) {
    return null; // Don't show section if no collections
  }

  return (
    <section className="pt-0 pb-8 md:pt-12 md:pb-16 md:mt-16 container mx-auto px-4" style={{ marginTop: '8px', paddingTop: '0' }}>
      <div className="flex justify-center mb-6 md:mb-8" style={{ marginTop: '0' }}>
        <span className="inline-block px-4 py-1.5 md:px-5 md:py-2 rounded-full bg-pink-600 text-white text-xs md:text-sm font-bold shadow-lg relative z-0" style={{ position: 'relative', top: '0', marginTop: '0' }}>
          Shop by Collection
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {backendCollections.map((collection) => {
          const IconComponent = getCollectionIcon(collection.name, collection.slug);
          const collectionImage = getCollectionImage(collection);

          return (
            <div key={collection.id || collection.slug} className="flex flex-col">
              <Link
                href={`/collections/${encodeURIComponent(collection.slug)}`}
                className="group relative overflow-hidden rounded-lg aspect-square bg-gray-200 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105"
              >
                {/* Collection Image Background */}
                {collectionImage ? (
                  <img
                    src={collectionImage}
                    alt={collection.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Try fallback URLs if image fails
                      const target = e.target as HTMLImageElement;
                      const retryCount = parseInt(target.getAttribute('data-retry') || '0');
                      const originalSrc = target.getAttribute('data-original-src') || collectionImage;
                      
                      if (retryCount < 3) {
                        let fallbackUrl = '';
                        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';
                        const backendBaseUrl = apiBaseUrl.replace('/api', '');
                        const filename = originalSrc.split('/').pop() || '';
                        
                        if (retryCount === 0) {
                          // Try API proxy route
                          fallbackUrl = `/api/media/collections/${filename}`;
                        } else if (retryCount === 1) {
                          // Try backend admin upload endpoint
                          fallbackUrl = `${apiBaseUrl}/admin/upload/media/collections/${filename}`;
                        } else if (retryCount === 2) {
                          // Try backend static file serving (last resort)
                          fallbackUrl = `${backendBaseUrl}/media/collections/${filename}`;
                        }
                        
                        if (fallbackUrl) {
                          target.setAttribute('data-retry', String(retryCount + 1));
                          target.setAttribute('data-original-src', originalSrc);
                          target.src = fallbackUrl;
                          return;
                        }
                      }
                      
                      // If all retries failed, hide image and show fallback gradient
                      target.style.display = 'none';
                      const fallback = target.parentElement?.querySelector('.fallback-gradient') as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                    data-original-src={collectionImage}
                  />
                ) : null}

                {/* Fallback gradient background if no image */}
                <div 
                  className="fallback-gradient absolute inset-0 bg-pink-600 group-hover:bg-pink-700 transition-all duration-300 flex items-center justify-center" 
                  style={{ display: collectionImage ? 'none' : 'flex' }}
                >
                  <IconComponent className="w-16 h-16 text-white/50" />
                </div>

                {/* Shimmer Effect on Hover */}
                <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
              </Link>

              {/* Title - Outside and below the card */}
              <div className="mt-3 text-center">
                <h3 className="text-base md:text-lg font-bold text-gray-900">
                  {collection.name}
                </h3>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

