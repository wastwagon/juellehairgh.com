"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ArrowRight, Sparkles, Layers, Droplet, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  isActive: boolean;
  position: number;
}

// Fallback icons for each banner position
const fallbackIcons = [
  <Sparkles key="sparkles" className="h-8 w-8" />,
  <Layers key="layers" className="h-8 w-8" />,
  <Droplet key="droplet" className="h-8 w-8" />,
  <Zap key="zap" className="h-8 w-8" />,
];

// Fallback gradients
const fallbackGradients = [
  "from-purple-500 via-pink-500 to-purple-600",
  "from-pink-500 via-rose-500 to-pink-600",
  "from-rose-500 via-purple-500 to-pink-600",
  "from-purple-600 via-pink-600 to-rose-600",
];

export function PromotionalBanners() {
  const { data: banners, isLoading } = useQuery<Banner[]>({
    queryKey: ["banners", "active"],
    queryFn: async () => {
      try {
        // Fetch banners from public endpoint
        const response = await api.get("/banners");
        const allBanners = response.data || [];
        // Filter active banners and sort by position
        return allBanners
          .filter((banner: Banner) => banner.isActive)
          .sort((a: Banner, b: Banner) => a.position - b.position)
          .slice(0, 4); // Limit to 4 banners
      } catch (error) {
        console.error("Error fetching banners:", error);
        return [];
      }
    },
    staleTime: 60000, // Cache for 1 minute
  });

  // Banners are already filtered and sorted in the query
  const activeBanners = banners || [];

  const getImageUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    
    // Handle media library paths - use Next.js API proxy route
    if (url.startsWith("/media/")) {
      return `/api${url}`;
    }
    
    // Handle paths containing "media" or "banners"
    if (url.includes("media") || url.includes("banners")) {
      const filename = url.split("/").pop() || url;
      return `/api/media/banners/${filename}`;
    }
    
    // For other paths
    if (url.startsWith("/")) return url;
    return `/${url}`;
  };

  // Show loading state
  if (isLoading) {
    return (
      <section className="py-8 md:py-12 container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="aspect-[4/3] bg-gray-200 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  // If no banners, don't render anything (or show fallback)
  if (!activeBanners || activeBanners.length === 0) {
    return null;
  }

  return (
    <section className="py-8 md:py-12 container mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {activeBanners.map((banner, index) => {
          const imageUrl = getImageUrl(banner.image);
          const icon = fallbackIcons[index % fallbackIcons.length];
          const gradient = fallbackGradients[index % fallbackGradients.length];
          const link = banner.link || "/categories/shop-all";
          const buttonText = banner.link?.includes("lace") ? "Explore Collection" :
                           banner.link?.includes("braid") ? "View Styles" :
                           banner.link?.includes("care") ? "Shop Now" :
                           banner.link?.includes("ponytail") ? "Discover" : "Shop Now";

          return (
            <Link
              key={banner.id}
              href={link}
              className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 aspect-[4/3]`}
            >
              {/* Background Image */}
              {imageUrl ? (
                <div className="absolute inset-0">
                  <Image
                    src={imageUrl}
                    alt={banner.title}
                    fill
                    className="object-cover opacity-80 group-hover:opacity-90 transition-opacity"
                    onError={(e) => {
                      // Hide image if it fails to load, gradient will show
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  {/* Dark overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
                </div>
              ) : (
                // Gradient overlay when no image
                <div className="absolute inset-0 bg-black/20" />
              )}

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-between p-6 md:p-8 text-white">
                <div>
                  {/* Icon */}
                  <div className="mb-4 opacity-90 group-hover:opacity-100 transition-opacity">
                    {icon}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg md:text-xl font-bold mb-2 group-hover:text-white transition-colors">
                    {banner.title}
                  </h3>
                  
                  {/* Subtitle/Description */}
                  {(banner.subtitle || banner.description) && (
                    <p className="text-sm md:text-base opacity-90 mb-4 line-clamp-2">
                      {banner.subtitle || banner.description}
                    </p>
                  )}
                </div>

                {/* CTA Button */}
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 w-fit"
                  onClick={(e) => e.preventDefault()}
                >
                  {buttonText}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {/* Shimmer effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
