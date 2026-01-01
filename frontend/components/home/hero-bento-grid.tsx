"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { useCurrencyStore } from "@/store/currency-store";
import { Product } from "@/types";

export function HeroBentoGrid() {
  const { displayCurrency, convert } = useCurrencyStore();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["hero-bento-products"],
    queryFn: async () => {
      try {
        // Fetch more products to ensure we get 4 unique random ones
        const response = await api.get("/products?limit=20&sort=newest");
        const fetchedProducts = (response.data.products || [])
          .filter((p: Product) => p && p.images && p.images.length > 0 && p.isActive !== false)
          .map((p: Product) => ({
            ...p,
            variants: p.variants || [],
          }));
        
        // Shuffle and get 4 random products (1 large + 1 top right + 2 bottom right)
        const shuffled = [...fetchedProducts].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 4);
      } catch (error) {
        console.error("Error fetching hero bento products:", error);
        return [];
      }
    },
    staleTime: 30000, // Refresh every 30 seconds for randomness
  });

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
          <div className="md:col-span-2 md:row-span-2 animate-pulse bg-gray-200 rounded-2xl aspect-square md:aspect-auto min-h-[400px]" />
          <div className="md:col-span-2 animate-pulse bg-gray-200 rounded-2xl aspect-square" />
          <div className="animate-pulse bg-gray-200 rounded-2xl aspect-square" />
          <div className="animate-pulse bg-gray-200 rounded-2xl aspect-square" />
        </div>
      </section>
    );
  }

  if (!products || products.length < 4) {
    return null;
  }

  const getImageUrl = (image: string) => {
    if (!image) return null;
    if (image.startsWith('/')) return image;
    if (image.startsWith('http://') || image.startsWith('https://')) return image;
    if (image.startsWith('products/')) return `/${image}`;
    return `/media/products/${image}`;
  };

  // Bento grid layout: 1 large left (2x2), 1 top right, 2 bottom right (side-by-side)
  const [largeProduct, topRightProduct, bottomLeftProduct, bottomRightProduct] = products;

  return (
    <section className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 lg:py-16">

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 auto-rows-fr">
        {/* Large Left Card - Takes 2 columns, 2 rows */}
        <Link
          href={`/products/${largeProduct.slug}`}
          className="sm:col-span-2 md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-xl sm:rounded-2xl bg-white border-2 border-gray-200 hover:border-purple-300 transition-all duration-300 shadow-lg hover:shadow-2xl min-h-[300px] sm:min-h-[400px] md:min-h-[600px]"
          style={{
            boxShadow: '0 10px 30px rgba(0,0,0,0.1), 0 1px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          {/* Image Background - Shows image in full, no cropping */}
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            {largeProduct.images && largeProduct.images[0] ? (
              <img
                src={getImageUrl(largeProduct.images[0]) || ''}
                alt={largeProduct.title}
                className="w-full h-full object-contain"
                style={{ objectPosition: 'center' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23e5e7eb" width="400" height="400"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="16"%3ENo Image%3C/text%3E%3C/svg%3E';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-200" />
            )}
          </div>

          {/* Text Overlay - Semi-transparent background for text visibility */}
          <div className="absolute inset-x-0 bottom-0 z-20 bg-pink-600/90 p-4 sm:p-6 md:p-8">
            <div className="text-white">
              <h3 className="text-base sm:text-lg md:text-2xl lg:text-3xl font-bold mb-1.5 sm:mb-2 md:mb-4 line-clamp-2">
                {largeProduct.title}
              </h3>
              
              {/* Price - Only show for simple products */}
              {(!largeProduct.variants || largeProduct.variants.length === 0) && (
                <div className="mb-2 sm:mb-3 md:mb-4">
                  <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
                    {formatCurrency(convert(Number(largeProduct.priceGhs)), displayCurrency)}
                  </span>
                </div>
              )}

              <span className="inline-block mt-2 sm:mt-3 md:mt-4 px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg text-xs sm:text-sm md:text-base font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer touch-manipulation">
                {largeProduct.variants && largeProduct.variants.length > 0 ? "View Options" : "Shop Now"}
              </span>
            </div>
          </div>
        </Link>

        {/* Top Right Card - Medium horizontal card */}
        {topRightProduct && (
          <Link
            href={`/products/${topRightProduct.slug}`}
            className="sm:col-span-2 md:col-span-2 group relative overflow-hidden rounded-xl sm:rounded-2xl bg-white border-2 border-gray-200 hover:border-purple-300 transition-all duration-300 shadow-lg hover:shadow-2xl aspect-[2/1] min-h-[200px] sm:min-h-[250px]"
            style={{
              boxShadow: '0 10px 30px rgba(0,0,0,0.1), 0 1px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            {/* Image Background - Shows image in full, no cropping */}
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              {topRightProduct.images && topRightProduct.images[0] ? (
                <img
                  src={getImageUrl(topRightProduct.images[0]) || ''}
                  alt={topRightProduct.title}
                  className="w-full h-full object-contain"
                  style={{ objectPosition: 'center' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23e5e7eb" width="400" height="400"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="16"%3ENo Image%3C/text%3E%3C/svg%3E';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
            </div>

            {/* Text Overlay - Semi-transparent background for text visibility */}
            <div className="absolute inset-x-0 bottom-0 z-20 bg-pink-600/90 p-3 sm:p-4 md:p-6">
              <div className="text-white">
                <h3 className="text-sm sm:text-base md:text-lg font-bold mb-1.5 sm:mb-2 line-clamp-2">
                  {topRightProduct.title}
                </h3>
                
                {/* Price - Only show for simple products */}
                {(!topRightProduct.variants || topRightProduct.variants.length === 0) && (
                  <div className="mb-1.5 sm:mb-2">
                    <span className="text-base sm:text-lg md:text-xl font-bold">
                      {formatCurrency(convert(Number(topRightProduct.priceGhs)), displayCurrency)}
                    </span>
                  </div>
                )}

                <span className="inline-block mt-1.5 sm:mt-2 px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg text-xs sm:text-xs md:text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer touch-manipulation">
                  {topRightProduct.variants && topRightProduct.variants.length > 0 ? "View Options" : "Shop Now"}
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* Bottom Left Card (of right section) */}
        {bottomLeftProduct && (
          <Link
            href={`/products/${bottomLeftProduct.slug}`}
            className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-white border-2 border-gray-200 hover:border-purple-300 transition-all duration-300 shadow-lg hover:shadow-2xl aspect-square min-h-[200px] sm:min-h-[250px]"
            style={{
              boxShadow: '0 10px 30px rgba(0,0,0,0.1), 0 1px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            {/* Image Background - Shows image in full, no cropping */}
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              {bottomLeftProduct.images && bottomLeftProduct.images[0] ? (
                <img
                  src={getImageUrl(bottomLeftProduct.images[0]) || ''}
                  alt={bottomLeftProduct.title}
                  className="w-full h-full object-contain"
                  style={{ objectPosition: 'center' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23e5e7eb" width="400" height="400"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="16"%3ENo Image%3C/text%3E%3C/svg%3E';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
            </div>

            {/* Text Overlay - Semi-transparent background for text visibility */}
            <div className="absolute inset-x-0 bottom-0 z-20 bg-pink-600/90 p-3 sm:p-4 md:p-6">
              <div className="text-white">
                <h3 className="text-sm sm:text-base md:text-lg font-bold mb-1.5 sm:mb-2 line-clamp-2">
                  {bottomLeftProduct.title}
                </h3>
                
                {/* Price - Only show for simple products */}
                {(!bottomLeftProduct.variants || bottomLeftProduct.variants.length === 0) && (
                  <div className="mb-1.5 sm:mb-2">
                    <span className="text-base sm:text-lg md:text-xl font-bold">
                      {formatCurrency(convert(Number(bottomLeftProduct.priceGhs)), displayCurrency)}
                    </span>
                  </div>
                )}

                <span className="inline-block mt-1.5 sm:mt-2 px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg text-xs sm:text-xs md:text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer touch-manipulation">
                  {bottomLeftProduct.variants && bottomLeftProduct.variants.length > 0 ? "View Options" : "Shop Now"}
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* Bottom Right Card (of right section) */}
        {bottomRightProduct && (
          <Link
            href={`/products/${bottomRightProduct.slug}`}
            className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-white border-2 border-gray-200 hover:border-purple-300 transition-all duration-300 shadow-lg hover:shadow-2xl aspect-square min-h-[200px] sm:min-h-[250px]"
            style={{
              boxShadow: '0 10px 30px rgba(0,0,0,0.1), 0 1px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            {/* Image Background - Shows image in full, no cropping */}
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              {bottomRightProduct.images && bottomRightProduct.images[0] ? (
                <img
                  src={getImageUrl(bottomRightProduct.images[0]) || ''}
                  alt={bottomRightProduct.title}
                  className="w-full h-full object-contain"
                  style={{ objectPosition: 'center' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23e5e7eb" width="400" height="400"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="16"%3ENo Image%3C/text%3E%3C/svg%3E';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
            </div>

            {/* Text Overlay - Semi-transparent background for text visibility */}
            <div className="absolute inset-x-0 bottom-0 z-20 bg-pink-600/90 p-3 sm:p-4 md:p-6">
              <div className="text-white">
                <h3 className="text-sm sm:text-base md:text-lg font-bold mb-1.5 sm:mb-2 line-clamp-2">
                  {bottomRightProduct.title}
                </h3>
                
                {/* Price - Only show for simple products */}
                {(!bottomRightProduct.variants || bottomRightProduct.variants.length === 0) && (
                  <div className="mb-1.5 sm:mb-2">
                    <span className="text-base sm:text-lg md:text-xl font-bold">
                      {formatCurrency(convert(Number(bottomRightProduct.priceGhs)), displayCurrency)}
                    </span>
                  </div>
                )}

                <span className="inline-block mt-1.5 sm:mt-2 px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/40 rounded-lg text-xs sm:text-xs md:text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer touch-manipulation">
                  {bottomRightProduct.variants && bottomRightProduct.variants.length > 0 ? "View Options" : "Shop Now"}
                </span>
              </div>
            </div>
          </Link>
        )}
      </div>
    </section>
  );
}
