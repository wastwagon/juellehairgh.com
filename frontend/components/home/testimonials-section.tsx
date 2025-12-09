"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Star, Quote, ChevronLeft, ChevronRight, Play, Pause, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Review {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  productId: string;
  isVerified: boolean;
  user: {
    id: string;
    name: string;
    email: string;
  };
  product: {
    id: string;
    title: string;
    slug: string;
    images: string[];
  };
  createdAt: string;
}

interface ReviewsResponse {
  reviews: Review[];
  totalCount: number;
}

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { data: reviewsData, isLoading, error } = useQuery<ReviewsResponse>({
    queryKey: ["reviews", "public"],
    queryFn: async () => {
      try {
        const response = await api.get("/reviews/public?limit=12");
        return response.data || { reviews: [], totalCount: 0 };
      } catch (err: any) {
        console.error("Error fetching reviews:", err);
        return { reviews: [], totalCount: 0 };
      }
    },
    retry: 2,
    staleTime: 60000, // Cache for 1 minute
  });

  const reviews = reviewsData?.reviews || [];
  const totalCount = reviewsData?.totalCount || 0;

  // Determine items per slide based on screen size
  const getItemsPerSlide = () => {
    if (typeof window === "undefined") return 4;
    if (window.innerWidth >= 1024) return 4; // lg: 4 items
    if (window.innerWidth >= 768) return 2; // md: 2 items
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

  const totalSlides = reviews ? Math.ceil(reviews.length / itemsPerSlide) : 0;

  // Auto-play functionality
  useEffect(() => {
    if (!reviews || reviews.length === 0 || !isAutoPlaying) {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
        autoPlayIntervalRef.current = null;
      }
      return;
    }

    autoPlayIntervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 5000); // Change slide every 5 seconds

    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
      }
    };
  }, [reviews, isAutoPlaying, totalSlides]);

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

  if (isLoading) {
    return (
      <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
        <div className="container mx-auto px-3 sm:px-4 md:px-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reviews...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    console.error("Reviews fetch error:", error);
  }

  if (!reviews || reviews.length === 0) {
    if (isLoading) {
      return (
        <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
          <div className="container mx-auto px-3 sm:px-4 md:px-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading reviews...</p>
            </div>
          </div>
        </section>
      );
    }
    return null;
  }

  const currentReviews = reviews.slice(
    currentIndex * itemsPerSlide,
    currentIndex * itemsPerSlide + itemsPerSlide
  );

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 relative overflow-hidden">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mb-1">
            Real reviews from satisfied customers
          </p>
          {totalCount > 0 && (
            <p className="text-primary font-semibold text-sm sm:text-base">
              {totalCount.toLocaleString()} {totalCount === 1 ? "Review" : "Reviews"}
            </p>
          )}
        </div>

        {/* Carousel Container */}
        <div className="relative" ref={carouselRef}>
          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 transition-all duration-500 ease-in-out">
            {currentReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-xl shadow-lg p-5 sm:p-6 hover:shadow-xl transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1 min-h-[280px]"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-primary via-pink-500 to-purple-600 flex items-center justify-center border-2 border-primary/30 flex-shrink-0 shadow-md relative">
                    <span className="text-white font-bold text-lg sm:text-xl">
                      {review.user.name.charAt(0).toUpperCase()}
                    </span>
                    {/* Verified Badge on Avatar */}
                    {review.isVerified && (
                      <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white shadow-md">
                        <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">
                        {review.user.name}
                      </h3>
                      {/* Verified Badge next to name */}
                      {review.isVerified && (
                        <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                            i < review.rating
                              ? "fill-primary text-primary"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <Quote className="h-5 w-5 sm:h-6 sm:w-6 text-primary/40 flex-shrink-0" />
                </div>

                {review.title && (
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">
                    {review.title}
                  </h4>
                )}

                <p className="text-gray-700 mb-4 text-sm sm:text-base flex-grow leading-relaxed whitespace-pre-wrap">
                  {review.comment || review.title || ""}
                </p>

                {/* View Product Link */}
                {review.product && review.product.slug && (
                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <Link
                      href={`/products/${review.product.slug}`}
                      className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm transition-colors group"
                    >
                      <span>View Product</span>
                      <svg
                        className="w-4 h-4 transition-transform group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          {totalSlides > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-6 md:-translate-x-8 bg-white/90 hover:bg-white shadow-lg border border-gray-200 z-10 h-10 w-10 sm:h-12 sm:w-12 rounded-full hidden md:flex items-center justify-center transition-all hover:scale-110"
                onClick={prevSlide}
                aria-label="Previous reviews"
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-6 md:translate-x-8 bg-white/90 hover:bg-white shadow-lg border border-gray-200 z-10 h-10 w-10 sm:h-12 sm:w-12 rounded-full hidden md:flex items-center justify-center transition-all hover:scale-110"
                onClick={nextSlide}
                aria-label="Next reviews"
              >
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
              </Button>

              {/* Mobile Navigation */}
              <div className="flex md:hidden justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  onClick={prevSlide}
                  aria-label="Previous reviews"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  onClick={nextSlide}
                  aria-label="Next reviews"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </>
          )}

          {/* Pagination Dots */}
          {totalSlides > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6 sm:mt-8">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-primary w-8 sm:w-10 scale-110"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
              {/* Auto-play Toggle */}
              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className="ml-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label={isAutoPlaying ? "Pause auto-play" : "Resume auto-play"}
              >
                {isAutoPlaying ? (
                  <Pause className="h-4 w-4 text-gray-600" />
                ) : (
                  <Play className="h-4 w-4 text-gray-600" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
