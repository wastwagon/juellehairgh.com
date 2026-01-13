"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { useCurrencyStore } from "@/store/currency-store";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Sparkles, Zap } from "lucide-react";
import { useState, useEffect } from "react";

interface Product {
  id: string;
  title: string;
  slug: string;
  priceGhs: number;
  compareAtPriceGhs?: number | null;
  images: string[];
  badges?: string[];
  brand?: {
    name: string;
  } | null;
}

interface ProductBentoSliderProps {
  title?: string;
  subtitle?: string;
  collectionSlug?: string;
  limit?: number;
  autoPlayInterval?: number;
}

export function ProductBentoSlider({
  title = "Featured Products",
  subtitle = "Discover our latest collection",
  collectionSlug,
  limit = 8,
  autoPlayInterval = 5000,
}: ProductBentoSliderProps) {
  const { displayCurrency, convert } = useCurrencyStore();
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["bento-slider-products", collectionSlug, limit],
    queryFn: async () => {
      try {
        let fetchedProducts: Product[] = [];
        
        if (collectionSlug) {
          // Add cache-busting timestamp to force fresh fetch
          const timestamp = Date.now();
          const response = await api.get(`/collections/${collectionSlug}?t=${timestamp}`);
          const collection = response.data;
          if (collection?.products) {
            fetchedProducts = collection.products
              .map((cp: any) => cp.product || cp)
              .filter((p: any) => p && p.images && p.images.length > 0 && p.id && p.isActive !== false)
              .slice(0, limit);
          }
        } else {
          // Add cache-busting timestamp to force fresh fetch
          const timestamp = Date.now();
          const response = await api.get(`/products?limit=${limit * 2}&sort=newest&t=${timestamp}`);
          fetchedProducts = (response.data.products || [])
            .filter((p: any) => p.images && p.images.length > 0 && p.id && p.isActive !== false)
            .slice(0, limit);
        }
        
        return fetchedProducts;
      } catch (error) {
        console.error("Error fetching products:", error);
        return [];
      }
    },
    staleTime: 0, // Always fetch fresh data
    cacheTime: 0, // Don't cache
    refetchOnMount: true, // Refetch on mount
  });

  // Auto-play slider
  useEffect(() => {
    if (!products || products.length <= 4) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const maxSlides = Math.ceil(products.length / 4) - 1;
        return prev >= maxSlides ? 0 : prev + 1;
      });
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [products, autoPlayInterval]);

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-2xl aspect-square" />
          ))}
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  // Calculate discount percentage
  const getDiscount = (regularPrice: number, salePrice?: number | null) => {
    // WooCommerce-style: sale price should be lower than regular price
    if (!salePrice || salePrice >= regularPrice) return null;
    return Math.round(((regularPrice - salePrice) / regularPrice) * 100);
  };

  // Group products into slides (4 per slide)
  const slides: Product[][] = [];
  for (let i = 0; i < products.length; i += 4) {
    slides.push(products.slice(i, i + 4));
  }

  const currentProducts = slides[currentSlide] || [];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Get image URL helper
  const getImageUrl = (imagePath: string) => {
    // Handle absolute URLs
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Handle media library paths (new format: /media/products/filename.jpg or /media/library/filename.jpg)
    if (imagePath.startsWith('/media/products/')) {
      const filename = imagePath.replace('/media/products/', '');
      return `/media/products/${filename}`;
    }
    if (imagePath.startsWith('/media/library/')) {
      const filename = imagePath.replace('/media/library/', '');
      return `/media/library/${filename}`;
    }
    
    // Handle old product paths (legacy: /products/filename.jpg or products/filename.jpg)
    if (imagePath.includes('/products/') || imagePath.startsWith('products/')) {
      const filename = imagePath.split('/').pop() || imagePath;
      return `/media/products/${filename}`;
    }
    
    // Handle paths starting with /
    if (imagePath.startsWith('/')) {
      return imagePath;
    }
    
    // Default: assume it's a filename and use media library
    return `/media/products/${imagePath}`;
  };

  return (
    <section className="container mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
            {title}
          </h2>
          {subtitle && (
            <p className="text-gray-600 text-base md:text-lg">
              {subtitle}
            </p>
          )}
        </div>
        
        {/* Navigation */}
        {slides.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextSlide}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Slider Container */}
      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentSlide * 100}%)`,
          }}
        >
          {slides.map((slideProducts, slideIndex) => (
            <div
              key={slideIndex}
              className="min-w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
            >
              {slideProducts.map((product) => {
                // WooCommerce-style: sale price is compareAtPriceGhs, regular price is priceGhs
                const discount = getDiscount(
                  Number(product.priceGhs),
                  product.compareAtPriceGhs
                );

                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 hover:shadow-2xl transition-all duration-300 border border-gray-100"
                  >
                    <div className="relative h-full flex flex-col p-4 md:p-6">
                      {/* Discount Badge */}
                      {discount && (
                        <div className="absolute top-4 right-4 bg-red-500 text-white rounded-full px-3 py-1.5 font-bold text-xs md:text-sm shadow-lg z-10 flex items-center justify-center">
                          -{discount}%
                        </div>
                      )}

                      {/* Product Badge */}
                      {product.badges && product.badges.length > 0 && (
                        <Badge className="absolute top-4 left-4 bg-purple-600 text-white border-0 text-xs px-3 py-1 z-10">
                          {product.badges[0]}
                        </Badge>
                      )}

                      {/* Product Image */}
                      <div className="relative aspect-square mb-4 rounded-xl overflow-hidden bg-gray-100 group-hover:bg-gray-50 transition-colors">
                        {product.images && product.images[0] ? (
                          <img
                            src={getImageUrl(product.images[0])}
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
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                            <Sparkles className="h-10 w-10 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="space-y-2 flex-1 flex flex-col">
                        {/* Brand */}
                        {product.brand && (
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                            {product.brand.name}
                          </p>
                        )}

                        {/* Title */}
                        <h3 className="font-bold text-sm md:text-base text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors min-h-[2.5rem]">
                          {product.title}
                        </h3>

                        {/* Price */}
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
                                <span className="text-base md:text-lg font-bold text-gray-900">
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

                        {/* Shop Now Indicator */}
                        <div className="flex items-center gap-2 text-xs text-purple-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          <Zap className="h-3 w-3" />
                          <span>Shop Now</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "w-8 bg-purple-600"
                  : "w-2 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

