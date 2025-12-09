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

  const { data: collection, isLoading } = useQuery<Collection>({
    queryKey: ["collection", slug],
    queryFn: async () => {
      const response = await api.get(`/collections/${slug}`);
      return response.data;
    },
  });

  const products = collection?.products?.map((cp: any) => cp.product) || [];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 md:py-8">
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
          <div className="aspect-video w-full rounded-lg overflow-hidden mb-6">
            <img
              src={collection.image}
              alt={collection.name}
              className="w-full h-full object-cover"
            />
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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

