"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Category, Product } from "@/types";
import { ProductCard } from "@/components/products/product-card";
import { CategoryFilters } from "@/components/categories/category-filters";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface CategoryPageProps {
  slug: string;
}

export function CategoryPage({ slug }: CategoryPageProps) {
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    brand: "",
    sort: "newest",
    page: 1,
  });

  // Helper function to get image URL
  const getImageUrl = (url?: string) => {
    if (!url) return null;
    
    // Handle absolute URLs
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    
    // Handle media library paths - use Next.js API proxy route
    if (url.startsWith("/media/categories/") || url.startsWith("/media/collections/") || url.startsWith("/media/banners/")) {
      return `/api${url}`;
    }
    
    // Handle /media/ paths (general case) - use Next.js API proxy route
    if (url.startsWith("/media/")) {
      return `/api${url}`;
    }
    
    // Handle paths containing category/collection/banner keywords
    if (url.includes("categories") || url.includes("collections") || url.includes("banners")) {
      const filename = url.split("/").pop() || url;
      let category = "categories";
      if (url.includes("collections")) category = "collections";
      if (url.includes("banners")) category = "banners";
      return `/api/media/${category}/${filename}`;
    }
    
    // For other absolute paths starting with /
    if (url.startsWith("/")) {
      if (url.includes("/media/")) {
        return `/api${url}`;
      }
      return url;
    }
    
    // Bare filename - assume it's a category image
    return `/api/media/categories/${url}`;
  };

  // For "shop-all", we don't need to fetch category - show all products
  const isShopAll = slug === "shop-all";

  const { data: category } = useQuery<Category>({
    queryKey: ["category", slug],
    queryFn: async () => {
      if (isShopAll) {
        // Return a mock category for shop-all
        return {
          id: "shop-all",
          name: "Shop All",
          slug: "shop-all",
          description: "All products",
        };
      }
      const response = await api.get(`/categories/${slug}`);
      return response.data;
    },
    enabled: !isShopAll || true, // Always enabled
  });

  const { data: productsData, isLoading } = useQuery<{
    products: Product[];
    pagination: any;
  }>({
    queryKey: ["products", slug, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        // Don't filter by category for shop-all
        ...(isShopAll ? {} : { category: category?.id || "" }),
        minPrice: filters.minPrice || "",
        maxPrice: filters.maxPrice || "",
        brand: filters.brand || "",
        sort: filters.sort || "",
        page: String(filters.page || 1),
      });
      const response = await api.get(`/products?${params}`);
      if (process.env.NODE_ENV === 'development') {
        console.log("📦 Products API Response:", JSON.stringify(response.data.pagination));
        console.log("📦 Products count:", response.data.products?.length);
      }
      return response.data;
    },
    enabled: isShopAll || !!category?.id, // Enable for shop-all or when category ID exists
  });

  if (process.env.NODE_ENV === 'development') {
    console.log("🎨 Rendering CategoryPage:", JSON.stringify({
      slug,
      categoryId: category?.id,
      productsCount: productsData?.products?.length || 0,
      total: productsData?.pagination?.total || 0,
      isLoading
    }));
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Shop", href: "/shop-all" },
          { label: category?.name || "Category" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
        <aside className="lg:col-span-1">
          <CategoryFilters
            category={category}
            filters={filters}
            onFiltersChange={setFilters}
          />
        </aside>

        <div className="lg:col-span-3">
          {category?.image && (
            <div className="w-full rounded-lg overflow-hidden mb-6">
              <img
                src={getImageUrl(category.image)}
                alt={category.name}
                className="w-full h-auto object-contain"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = 'none';
                  img.onerror = null;
                }}
              />
            </div>
          )}
          {category?.description && (
            <div className="mb-4 md:mb-6">
              <p className="text-sm md:text-base text-gray-600">{category.description}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <p className="text-sm text-gray-600">
              {productsData?.pagination?.total || 0} products
            </p>
            <Select
              value={filters.sort}
              onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
              className="w-full sm:w-auto"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="oldest">Oldest</option>
            </Select>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {productsData?.products?.map((product) => {
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

              {productsData?.pagination?.totalPages > 1 && (
                <div className="flex flex-wrap justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    disabled={filters.page === 1}
                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                    className="w-full sm:w-auto"
                  >
                    Previous
                  </Button>
                  <span className="px-4 py-2 text-sm text-gray-600 flex items-center">
                    Page {filters.page} of {productsData.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={filters.page >= productsData.pagination.totalPages}
                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                    className="w-full sm:w-auto"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

