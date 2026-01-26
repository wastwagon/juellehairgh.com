"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Brand, Product } from "@/types";
import { ProductCard } from "@/components/products/product-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Select } from "@/components/ui/select";

interface BrandPageProps {
  slug: string;
}

export function BrandPage({ slug }: BrandPageProps) {
  const [sort, setSort] = useState("newest");

  const { data: brand, isLoading: brandLoading } = useQuery<Brand>({
    queryKey: ["brand", slug],
    queryFn: async () => {
      const response = await api.get(`/brands/${slug}`);
      return response.data;
    },
  });

  const { data: productsData, isLoading: productsLoading } = useQuery<{
    products: Product[];
    pagination: any;
  }>({
    queryKey: ["products", "brand", slug, sort],
    queryFn: async () => {
      const params = new URLSearchParams({
        brand: brand?.id || "",
        sort: sort || "",
      });
      const response = await api.get(`/products?${params}`);
      return response.data;
    },
    enabled: !!brand,
  });

  if (brandLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading brand...</p>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Brand Not Found</h2>
        <p className="text-gray-600">The brand you're looking for doesn't exist.</p>
      </div>
    );
  }

  const products =
    productsData?.products?.filter(
      (p: Product) => p && p.id && p.isActive !== false && !!p.images && p.images.length > 0,
    ) || [];

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Brands", href: "/brands" },
          { label: brand.name },
        ]}
      />

      <div className="mb-6 md:mb-8">
        {brand.logo && (
          <div className="mb-6">
            <img
              src={brand.logo}
              alt={brand.name}
              className="h-20 md:h-24 object-contain"
            />
          </div>
        )}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{brand.name}</h1>
        <p className="text-gray-600">{products.length} product{products.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <p className="text-sm text-gray-600">
          {productsData?.pagination?.total || products.length} products
        </p>
        <Select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full sm:w-auto">
          <option value="newest">Newest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="oldest">Oldest</option>
        </Select>
      </div>

      {productsLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => {
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
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">No products found for this brand.</p>
        </div>
      )}
    </div>
  );
}
