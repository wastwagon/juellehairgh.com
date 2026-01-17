"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Collection, Product } from "@/types";
import { ProductCard } from "@/components/products/product-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Select } from "@/components/ui/select";
import { useState } from "react";

interface CollectionPageProps {
  slug: string;
}

export function CollectionPage({ slug }: CollectionPageProps) {
  const [sort, setSort] = useState("newest");

  // Helper function to get image URL (similar to promotional banners)
  const getImageUrl = (url?: string) => {
    if (!url) return null;
    
    // Handle absolute URLs
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    
    // Handle media library paths - use Next.js API proxy route
    if (url.startsWith("/media/banners/") || url.startsWith("/media/collections/")) {
      return `/api${url}`;
    }
    
    // Handle /media/ paths (general case) - use Next.js API proxy route
    if (url.startsWith("/media/")) {
      return `/api${url}`;
    }
    
    // Handle paths containing "banners" or "collections" (extract filename)
    if (url.includes("banners") || url.includes("collections")) {
      const filename = url.split("/").pop() || url;
      const category = url.includes("banners") ? "banners" : "collections";
      return `/api/media/${category}/${filename}`;
    }
    
    // For other absolute paths starting with /
    if (url.startsWith("/")) {
      if (url.includes("/media/")) {
        return `/api${url}`;
      }
      return url;
    }
    
    // Bare filename - assume it's a collection image
    return `/api/media/collections/${url}`;
  };

  const { data: collection, isLoading } = useQuery<Collection>({
    queryKey: ["collection", slug],
    queryFn: async () => {
      // Properly encode the slug to handle special characters like %
      const encodedSlug = encodeURIComponent(slug);
      const response = await api.get(`/collections/${encodedSlug}`);
      return response.data;
    },
  });

  const products = collection?.products?.map((cp: any) => cp.product) || [];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[...Array(8)].map((_, i) => (
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

  if (!collection) {
    return (
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Collection not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <Breadcrumbs
        items={[
          { label: "Shop", href: "/shop-all" },
          { label: "Collections", href: "/collections" },
          { label: collection?.name || "Collection" },
        ]}
      />
      <div className="mb-6 md:mb-8">
        {collection.image && (
          <div className="flex justify-center mb-6">
            <div className="max-w-2xl w-full rounded-lg overflow-hidden">
              <img
                src={getImageUrl(collection.image)}
                alt={collection.name}
                className="w-full h-auto object-contain max-h-64 md:max-h-80"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = 'none';
                  img.onerror = null;
                }}
              />
            </div>
          </div>
        )}
        {collection.description && (
          <p className="text-base md:text-lg text-gray-600">{collection.description}</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <p className="text-sm text-gray-600">
          {products.length} products
        </p>
        <Select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full sm:w-auto">
          <option value="newest">Newest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </Select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product: Product) => {
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

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No products in this collection yet.</p>
        </div>
      )}
    </div>
  );
}

