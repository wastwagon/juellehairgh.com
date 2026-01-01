"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ProductCard } from "@/components/products/product-card";
import { Product } from "@/types";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductCarouselProps {
  title: string;
  collectionSlug?: string;
}

export function ProductCarousel({ title, collectionSlug }: ProductCarouselProps) {
  // ALL hooks must be called at the top level, before any conditional returns
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  // Calculate items per slide based on screen size
  const getItemsPerSlide = () => {
    if (typeof window === "undefined") return 4;
    if (window.innerWidth >= 1280) return 4; // xl: 4 items
    if (window.innerWidth >= 1024) return 3; // lg: 3 items
    if (window.innerWidth >= 640) return 2;  // sm: 2 items
    return 1; // mobile: 1 item
  };

  const [itemsPerSlide, setItemsPerSlide] = useState(getItemsPerSlide());

  useEffect(() => {
    const handleResize = () => {
      setItemsPerSlide(getItemsPerSlide());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  // Map title to collection slug if not provided
  const slug = collectionSlug || (title === "New Arrivals" ? "new-arrivals" : title === "Best Sellers" ? "best-sellers" : null);

  const { data: collection, isLoading, error } = useQuery({
    queryKey: ["collection", slug],
    queryFn: async () => {
      if (!slug) return null;
      try {
        const response = await api.get(`/collections/${slug}`);
        console.log(`✅ Fetched collection ${slug}:`, response.data);
        return response.data;
      } catch (err: any) {
        console.error(`❌ Error fetching collection ${slug}:`, err);
        return null;
      }
    },
    enabled: !!slug,
    retry: 1,
  });

  // Get products from collection - handle nested structure
  const products = collection?.products
    ? collection.products
        .map((cp: any) => {
          // Handle nested product structure (CollectionProduct -> product)
          if (cp.product) {
            const product = cp.product;
            // Ensure price is a number
            return {
              ...product,
              priceGhs: typeof product.priceGhs === 'string' ? parseFloat(product.priceGhs) : (product.priceGhs || 0),
              compareAtPriceGhs: product.compareAtPriceGhs 
                ? (typeof product.compareAtPriceGhs === 'string' ? parseFloat(product.compareAtPriceGhs) : product.compareAtPriceGhs)
                : null,
            };
          }
          // Handle direct product structure
          return {
            ...cp,
            priceGhs: typeof cp.priceGhs === 'string' ? parseFloat(cp.priceGhs) : (cp.priceGhs || 0),
            compareAtPriceGhs: cp.compareAtPriceGhs 
              ? (typeof cp.compareAtPriceGhs === 'string' ? parseFloat(cp.compareAtPriceGhs) : cp.compareAtPriceGhs)
              : null,
          };
        })
        .filter((p: any) => {
          // Filter out any null/undefined products and ensure product has required fields
          return p && p.id && p.title && (p.priceGhs || p.priceGhs === 0);
        })
    : [];

  console.log(`📦 ${title} - Products extracted:`, products.length);
  if (products.length > 0) {
    console.log(`📦 ${title} - First product:`, products[0]);
  }

  // If no collection or products, fetch recent products instead
  const { data: fallbackProducts, isLoading: isLoadingFallback, error: fallbackError } = useQuery<Product[]>({
    queryKey: ["products", "recent", title],
    queryFn: async () => {
      try {
        let fetchedProducts: any[] = [];
        
        if (title === "New Arrivals") {
          // For New Arrivals, fetch products with "New Arrival" badge or recently created
          const response = await api.get(`/products?limit=20&sort=newest`);
          fetchedProducts = response.data.products || [];
          // Filter for products with "New Arrival" badge or created in last 30 days
          fetchedProducts = fetchedProducts.filter((p: any) => 
            (p.badges && p.badges.includes("New Arrival")) || 
            (p.createdAt && new Date(p.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
          );
          // If no filtered products, just use the first 20
          if (fetchedProducts.length === 0) {
            fetchedProducts = response.data.products || [];
          }
        } else if (title === "Best Sellers") {
          // For Best Sellers, use popular sort or just fetch products
          try {
            const response = await api.get(`/products?limit=20&sort=popular`);
            fetchedProducts = response.data.products || [];
          } catch {
            // Fallback to newest if popular sort doesn't work
            const response = await api.get(`/products?limit=20&sort=newest`);
            fetchedProducts = response.data.products || [];
          }
        } else {
          const response = await api.get(`/products?limit=20&sort=newest`);
          fetchedProducts = response.data.products || [];
        }
        
        console.log(`✅ Fetched fallback products for ${title}:`, fetchedProducts.length);
        // Ensure prices are numbers
        return fetchedProducts.map((p: any) => ({
          ...p,
          priceGhs: typeof p.priceGhs === 'string' ? parseFloat(p.priceGhs) : (p.priceGhs || 0),
          compareAtPriceGhs: p.compareAtPriceGhs 
            ? (typeof p.compareAtPriceGhs === 'string' ? parseFloat(p.compareAtPriceGhs) : p.compareAtPriceGhs)
            : null,
        }));
      } catch (err: any) {
        console.error(`❌ Error fetching fallback products for ${title}:`, err);
        return [];
      }
    },
    enabled: (!slug || products.length === 0) && !isLoading,
    retry: 2,
    staleTime: 60000, // Cache for 1 minute
  });

  // Use products from collection if available, otherwise use fallback
  const displayProducts = products.length > 0 
    ? products 
    : (fallbackProducts || []).filter((p: Product) => p && p.id && p.title && p.priceGhs);

  console.log(`🎯 ${title} - Display products:`, displayProducts.length);
  console.log(`🔍 ${title} - Products data:`, displayProducts);

  // Limit to 8 products for slider - compute early so useEffect can use it
  const maxProducts = 8;
  const productsToShow = displayProducts.slice(0, maxProducts);
  const totalSlides = productsToShow.length > 0 ? Math.ceil(productsToShow.length / itemsPerSlide) : 0;

  // Auto-play functionality - MUST be called before any conditional returns
  useEffect(() => {
    if (!productsToShow || productsToShow.length === 0 || !isAutoPlaying || totalSlides <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [productsToShow.length, isAutoPlaying, totalSlides]);

  if (isLoading || isLoadingFallback) {
    return (
      <section className="py-8 md:py-12 container mx-auto px-4">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 text-center mb-6 md:mb-8 tracking-tight">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Show error state (but still try to show products if available)
  if ((error || fallbackError) && displayProducts.length === 0) {
    console.error(`❌ ${title} - Error and no products:`, error || fallbackError);
  }

  if (displayProducts.length === 0 && !isLoading && !isLoadingFallback) {
    // Don't render if no products and not loading
    return null;
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    goToSlide((currentIndex + 1) % totalSlides);
  };

  const prevSlide = () => {
    goToSlide((currentIndex - 1 + totalSlides) % totalSlides);
  };

  // Group products into slides
  const slides = [];
  for (let i = 0; i < productsToShow.length; i += itemsPerSlide) {
    slides.push(productsToShow.slice(i, i + itemsPerSlide));
  }

  // Debug logging
  if (productsToShow.length === 0 && !isLoading && !isLoadingFallback) {
    console.warn(`⚠️ ${title} - No products to display after filtering`);
    console.warn(`   Collection products:`, collection?.products?.length || 0);
    console.warn(`   Extracted products:`, products.length);
    console.warn(`   Fallback products:`, fallbackProducts?.length || 0);
  }

  return (
    <section className="py-8 md:py-12 container mx-auto px-4">
      <div className="flex flex-col items-center mb-6 md:mb-8 gap-4">
        <div className="flex flex-col items-center gap-3">
          <span className="inline-block px-4 py-1.5 md:px-5 md:py-2 rounded-full bg-pink-600 text-white text-xs md:text-sm font-bold shadow-lg">
            {title}
          </span>
        </div>
        {slug && (
          <Link
            href={`/collections/${slug}`}
            className="text-sm text-primary hover:underline font-medium whitespace-nowrap"
          >
            View all →
          </Link>
        )}
      </div>
      <div className="relative">
        {/* Slider Container */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
            }}
          >
            {slides.map((slideProducts, slideIndex) => (
              <div
                key={slideIndex}
                className="min-w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
              >
                {slideProducts.map((product: Product) => {
                  if (!product || !product.id || !product.title) {
                    console.warn("Invalid product:", product);
                    return null;
                  }
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
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        {totalSlides > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-all z-10 hidden lg:flex items-center justify-center"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6 text-gray-700" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-all z-10 hidden lg:flex items-center justify-center"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6 text-gray-700" />
            </button>
          </>
        )}

        {/* Slide Indicators */}
        {totalSlides > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-pink-600 w-8"
                    : "bg-gray-300 w-2 hover:bg-gray-400"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
