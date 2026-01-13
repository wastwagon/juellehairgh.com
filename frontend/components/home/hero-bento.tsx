"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { useCurrencyStore } from "@/store/currency-store";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Zap } from "lucide-react";

interface Product {
  id: string;
  title: string;
  slug: string;
  priceGhs: number;
  compareAtPriceGhs?: number | null;
  images: string[];
  badges?: string[];
}

export function HeroBento() {
  const { displayCurrency, convert } = useCurrencyStore();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["hero-products"],
    queryFn: async () => {
      try {
        // Add cache-busting timestamp to force fresh fetch
        const timestamp = Date.now();
        const response = await api.get(`/products?limit=8&sort=newest&t=${timestamp}`);
        const fetchedProducts = response.data.products || [];
        // Filter out inactive/deleted products
        return fetchedProducts.filter((p: Product) => p && p.id && p.isActive !== false);
      } catch (error) {
        console.error("Error fetching hero products:", error);
        return [];
      }
    },
    staleTime: 0, // Always fetch fresh data
    cacheTime: 0, // Don't cache
    refetchOnMount: true, // Refetch on mount
  });

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-2xl aspect-square" />
          ))}
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  // Calculate discount percentage (WooCommerce-style: sale price should be lower than regular price)
  const getDiscount = (regularPrice: number, salePrice?: number | null) => {
    if (!salePrice || salePrice >= regularPrice) return null;
    return Math.round(((regularPrice - salePrice) / regularPrice) * 100);
  };

  // Featured product (largest card)
  const featuredProduct = products[0];
  const featuredDiscount = getDiscount(
    Number(featuredProduct.priceGhs),
    featuredProduct.compareAtPriceGhs
  );

  // Other products for grid
  const gridProducts = products.slice(1, 8);

  return (
    <section className="container mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Discover Your Style
          </h1>
          <p className="text-gray-600 text-base md:text-lg">
            Premium hair products for every look
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
          <TrendingUp className="h-4 w-4" />
          <span>Trending Now</span>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 auto-rows-fr">
        {/* Featured Product - Large Card (2x2) */}
        <Link
          href={`/products/${featuredProduct.slug}`}
          className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-3xl bg-pink-50 hover:shadow-2xl transition-all duration-300"
        >
          <div className="absolute inset-0 bg-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative h-full flex flex-col p-6 md:p-8">
            {/* Badge */}
            {featuredProduct.badges && featuredProduct.badges.length > 0 && (
              <div className="flex gap-2 mb-4">
                {featuredProduct.badges.slice(0, 2).map((badge, idx) => (
                  <Badge
                    key={idx}
                    className="bg-purple-600 text-white border-0 text-xs md:text-sm px-3 py-1"
                  >
                    {badge}
                  </Badge>
                ))}
              </div>
            )}

            {/* Discount Badge */}
            {featuredDiscount && (
              <div className="absolute top-6 right-6 bg-red-500 text-white rounded-full px-4 py-2 font-bold text-sm md:text-base shadow-lg z-10">
                -{featuredDiscount}%
              </div>
            )}

            {/* Product Image */}
            <div className="flex-1 relative mb-4 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm">
              {featuredProduct.images && featuredProduct.images[0] ? (
                <img
                  src={featuredProduct.images[0].startsWith('/') 
                    ? featuredProduct.images[0] 
                    : featuredProduct.images[0].startsWith('http')
                    ? featuredProduct.images[0]
                    : `/products/${featuredProduct.images[0]}`}
                  alt={featuredProduct.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23e5e7eb" width="400" height="400"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="16" font-family="sans-serif"%3ENo Image%3C/text%3E%3C/svg%3E';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <Sparkles className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-2">
              <h3 className="font-bold text-lg md:text-xl text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
                {featuredProduct.title}
              </h3>
              
              <div className="flex items-center gap-3">
                {(() => {
                  // WooCommerce-style: If sale price is set and lower than regular price, show sale price prominently
                  const regularPrice = Number(featuredProduct.priceGhs);
                  const salePrice = featuredProduct.compareAtPriceGhs ? Number(featuredProduct.compareAtPriceGhs) : null;
                  const isOnSale = salePrice && salePrice < regularPrice;
                  const displayPrice = isOnSale ? salePrice : regularPrice;
                  const displayComparePrice = isOnSale ? regularPrice : null;
                  
                  return (
                    <>
                      <span className="text-xl md:text-2xl font-bold text-gray-900">
                        {formatCurrency(convert(displayPrice), displayCurrency)}
                      </span>
                      {displayComparePrice && (
                        <span className="text-lg text-gray-500 line-through">
                          {formatCurrency(convert(displayComparePrice), displayCurrency)}
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>

              <div className="flex items-center gap-2 text-sm text-purple-600 font-medium">
                <Zap className="h-4 w-4" />
                <span>Shop Now</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Grid Products - Smaller Cards */}
        {gridProducts.map((product, index) => {
          const discount = getDiscount(Number(product.priceGhs), product.compareAtPriceGhs);
          const isLarge = index === 0; // First grid item is larger

          return (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className={`group relative overflow-hidden rounded-2xl bg-white hover:shadow-xl transition-all duration-300 ${
                isLarge ? "md:col-span-2" : ""
              }`}
            >
              <div className="relative h-full flex flex-col p-4 md:p-6">
                {/* Discount Badge */}
                {discount && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white rounded-full px-3 py-1 font-bold text-xs shadow-lg z-10">
                    -{discount}%
                  </div>
                )}

                {/* Badge */}
                {product.badges && product.badges.length > 0 && (
                  <Badge className="absolute top-4 left-4 bg-purple-600 text-white border-0 text-xs px-2 py-1 z-10">
                    {product.badges[0]}
                  </Badge>
                )}

                {/* Product Image */}
                <div className="relative aspect-square mb-4 rounded-xl overflow-hidden bg-gray-100">
                  {product.images && product.images[0] ? (() => {
                    const getImageUrl = (image: string) => {
                      // Handle absolute URLs
                      if (image.startsWith('http://') || image.startsWith('https://')) {
                        return image;
                      }
                      
                      // Handle media library paths (new format: /media/products/filename.jpg or /media/library/filename.jpg)
                      if (image.startsWith('/media/products/')) {
                        const filename = image.replace('/media/products/', '');
                        return `/media/products/${filename}`;
                      }
                      if (image.startsWith('/media/library/')) {
                        const filename = image.replace('/media/library/', '');
                        return `/media/library/${filename}`;
                      }
                      
                      // Handle old product paths (legacy: /products/filename.jpg or products/filename.jpg)
                      if (image.includes('/products/') || image.startsWith('products/')) {
                        const filename = image.split('/').pop() || image;
                        return `/media/products/${filename}`;
                      }
                      
                      // Handle paths starting with /
                      if (image.startsWith('/')) {
                        return image;
                      }
                      
                      // Bare filename - assume it's a product image
                      return `/media/products/${image}`;
                    };
                    
                    const imageUrl = getImageUrl(product.images[0]);
                    
                    return (
                      <img
                        src={imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          const currentSrc = img.src;
                          // If currentSrc is already an API proxy, or an absolute URL, don't retry
                          if (currentSrc.startsWith('/api/media/') || currentSrc.startsWith('http')) {
                            img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23e5e7eb" width="400" height="400"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="16" font-family="sans-serif"%3ENo Image%3C/text%3E%3C/svg%3E';
                            return;
                          }
                          // Fallback to API proxy route
                          const filename = product.images[0].split('/').pop() || product.images[0];
                          const category = product.images[0].includes('/media/library/') ? 'library' : 'products';
                          img.src = `/api/media/${category}/${filename}`;
                        }}
                      />
                    );
                  })() : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Sparkles className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-2 flex-1 flex flex-col">
                  <h3 className="font-semibold text-sm md:text-base text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {product.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 mt-auto">
                    {(() => {
                      // WooCommerce-style: If sale price is set and lower than regular price, show sale price prominently
                      const regularPrice = Number(product.priceGhs);
                      const salePrice = product.compareAtPriceGhs ? Number(product.compareAtPriceGhs) : null;
                      const isOnSale = salePrice && salePrice < regularPrice;
                      const displayPrice = isOnSale ? salePrice : regularPrice;
                      const displayComparePrice = isOnSale ? regularPrice : null;
                      
                      return (
                        <>
                          <span className="text-lg md:text-xl font-bold text-gray-900">
                            {formatCurrency(convert(displayPrice), displayCurrency)}
                          </span>
                          {displayComparePrice && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatCurrency(convert(displayComparePrice), displayCurrency)}
                            </span>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* View All Link */}
      <div className="mt-8 md:mt-12 text-center">
        <Link
          href="/shop-all"
          className="inline-flex items-center gap-2 px-8 py-4 bg-pink-600 text-white rounded-full font-semibold hover:bg-pink-700 hover:shadow-lg hover:scale-105 transition-all duration-300"
        >
          <span>View All Products</span>
          <TrendingUp className="h-5 w-5" />
        </Link>
      </div>
    </section>
  );
}

