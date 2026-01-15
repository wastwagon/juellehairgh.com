"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Collection } from "@/types";
import Link from "next/link";
import { Layers } from "lucide-react";

export function CollectionsList() {
  const { data: collections, isLoading } = useQuery<Collection[]>({
    queryKey: ["collections", "all"],
    queryFn: async () => {
      try {
        const timestamp = Date.now();
        const response = await api.get(`/collections?t=${timestamp}`);
        const allCollections = response.data || [];
        return allCollections.filter((c: Collection) => c.isActive !== false);
      } catch (error) {
        console.error("Error fetching collections:", error);
        return [];
      }
    },
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
  });

  // Helper to get collection image URL
  const getCollectionImage = (collection: Collection) => {
    if (collection.image) {
      const imagePath = collection.image;
      
      // Handle different image path formats
      if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        return imagePath;
      }
      
      // For /media/collections/ paths, use Next.js API proxy route
      if (imagePath.startsWith("/media/collections/")) {
        return `/api${imagePath}`;
      }
      
      // Handle /media/ paths (general case)
      if (imagePath.startsWith("/media/")) {
        return `/api${imagePath}`;
      }
      
      // Handle paths that contain "collections" or "media"
      if (imagePath.includes("collections") || imagePath.includes("media")) {
        const filename = imagePath.split("/").pop() || imagePath;
        return `/api/media/collections/${filename}`;
      }
      
      // For other absolute paths starting with /
      if (imagePath.startsWith("/")) {
        if (imagePath.includes("/media/")) {
          return `/api${imagePath}`;
        }
        return imagePath;
      }
      
      // Relative filename - assume it's a collection image
      return `/api/media/collections/${imagePath}`;
    }
    
    return null;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-lg mb-3" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!collections || collections.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No collections available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {collections.map((collection) => {
        const collectionImage = getCollectionImage(collection);
        const productCount = (collection as any).products?.length || (collection as any)._count?.products || 0;

        return (
          <Link
            key={collection.id || collection.slug}
            href={`/collections/${collection.slug}`}
            className="group relative overflow-hidden rounded-xl bg-white border border-gray-200 hover:shadow-2xl hover:border-purple-200 transition-all duration-300"
          >
            <div className="aspect-square relative overflow-hidden bg-gray-100">
              {collectionImage ? (
                <img
                  src={collectionImage}
                  alt={collection.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.display = 'none';
                    const icon = img.nextElementSibling as HTMLElement;
                    if (icon) icon.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 ${collectionImage ? 'hidden' : ''}`}>
                <Layers className="h-12 w-12 text-gray-400" />
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                {collection.name}
              </h3>
              {collection.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {collection.description}
                </p>
              )}
              <p className="text-xs text-gray-500">
                {productCount} {productCount === 1 ? 'product' : 'products'}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
