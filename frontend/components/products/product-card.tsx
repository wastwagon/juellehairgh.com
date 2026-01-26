"use client";

import { useState } from "react";
import Link from "next/link";
import { Product } from "@/types";
import { formatCurrency, calculateProductSalePrice } from "@/lib/utils";
import { useCurrencyStore } from "@/store/currency-store";
import { useCartStore } from "@/store/cart-store";
import { Star, Eye, ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuickViewModal } from "./quick-view-modal";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface ProductCardProps {
  product: Product;
  compactBadges?: boolean;
}

export function ProductCard({ product, compactBadges = true }: ProductCardProps) {
  const { displayCurrency, convert } = useCurrencyStore();
  const { addItem } = useCartStore();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // Check if user is authenticated
  const isAuthenticated = typeof window !== "undefined" && !!localStorage.getItem("token");
  
  // Fetch wishlist to check if product is in wishlist
  const { data: wishlistItems = [] } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return [];
      try {
        const response = await api.get("/wishlist", {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data || [];
      } catch {
        return [];
      }
    },
    enabled: isAuthenticated,
    retry: false,
  });
  
  const isInWishlist = wishlistItems.some((item: any) => item.productId === product.id);
  
  // Add/Remove from wishlist mutation
  const wishlistMutation = useMutation({
    mutationFn: async ({ productId, shouldRemove }: { productId: string; shouldRemove: boolean }) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Please login to add items to wishlist");
      
      if (shouldRemove) {
        return api.delete(`/wishlist/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        return api.post(`/wishlist/${productId}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success(variables.shouldRemove ? "Removed from wishlist" : "Added to wishlist");
    },
    onError: (error: any) => {
      if (error.response?.status === 401) {
        toast.error("Please login to add items to wishlist");
      } else {
        toast.error(error.response?.data?.message || "Failed to update wishlist");
      }
    },
  });
  
  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    wishlistMutation.mutate({ productId: product.id, shouldRemove: isInWishlist });
  };
  
  // Check if product has variants
  const hasVariants = product.variants && product.variants.length > 0;
  
  // Check if product is out of stock
  // For variation products: check if any variant has stock
  // For simple products: check product stock
  const isOutOfStock = hasVariants
    ? !product.variants?.some(v => v.stock > 0) // Out of stock if no variants have stock
    : (product.stock !== undefined && product.stock <= 0); // Simple product: check product stock
  
  // Calculate sale price (handles both simple and variation products)
  const { regularPrice, salePrice, isOnSale, discountPercent } = calculateProductSalePrice(product);
  const displayPrice = isOnSale && salePrice ? convert(salePrice) : convert(regularPrice);
  const displayComparePrice = isOnSale && salePrice ? convert(regularPrice) : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isOutOfStock) {
      toast.error("This product is out of stock");
      return;
    }
    
    addItem({
      productId: product.id,
      quantity: 1,
      product: product,
    });
    
    toast.success("Added to cart!");
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  // Get the first valid image URL
  const getImageUrl = () => {
    // Check if product has images
    if (!product.images || product.images.length === 0) {
      // For variation products, try to get image from first variant with image
      if (hasVariants && product.variants) {
        const variantWithImage = product.variants.find(v => v.image);
        if (variantWithImage?.image) {
          if (variantWithImage.image.startsWith('http')) {
            return variantWithImage.image;
          }
          // Handle media library paths (new products)
          if (variantWithImage.image.startsWith('/media/library/')) {
            const filename = variantWithImage.image.replace('/media/library/', '');
            return `/media/library/${filename}`;
          }
          // Handle old product paths
          const filename = variantWithImage.image.split('/').pop() || variantWithImage.image;
          return `/media/products/${filename}`;
        }
      }
      return null;
    }
    
    const firstImage = product.images[0];
    if (!firstImage) return null;
    
    // Handle absolute URLs
    if (firstImage.startsWith('http://') || firstImage.startsWith('https://')) {
      return firstImage;
    }
    
    // Handle media library paths (new format: /media/library/filename.jpg)
    if (firstImage.startsWith('/media/library/')) {
      const filename = firstImage.replace('/media/library/', '');
      // Try public folder first (for images that work)
      return `/media/library/${filename}`;
    }
    
    // Handle old product paths (legacy: /media/products/filename.jpg)
    if (firstImage.startsWith('/media/products/')) {
      const filename = firstImage.replace('/media/products/', '');
      // Try public folder first (for products that work)
      return `/media/products/${filename}`;
    }
    
    // Handle old product paths (legacy: /products/filename.jpg or products/filename.jpg)
    if (firstImage.includes('/products/') || firstImage.startsWith('products/')) {
      const filename = firstImage.split('/').pop() || firstImage;
      // Try public folder first (for products that work)
      return `/media/products/${filename}`;
    }
    
    // Extract filename and try public folder first (assume old products format)
    const filename = firstImage.split('/').pop() || firstImage;
    return `/media/products/${filename}`;
  };

  const imageUrl = getImageUrl();

  // Calculate review stats
  const reviews = product.reviews || [];
  const hasReviews = reviews.length > 0;
  const averageRating = hasReviews
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;
  const reviewCount = reviews.length;
  
  // Get first review for tooltip
  const firstReview = reviews.length > 0 ? reviews[0] : null;
  const tooltipText = firstReview
    ? `${firstReview.user?.name || "Customer"}: ${firstReview.comment || firstReview.title || ""}`
    : "";

  return (
    <div className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-2xl hover:border-purple-200 transition-all duration-300 flex flex-col h-full">
      <Link href={`/products/${product.slug}`} className="flex-shrink-0">
        <div className="aspect-square relative bg-gray-100 overflow-hidden">
          <div className="absolute inset-0 flex items-start justify-center pt-2 px-2 pb-2">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={product.title}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                style={{ objectPosition: 'center top' }}
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  const retryCount = parseInt(img.getAttribute('data-retry') || '0');
                  
                  // Try API proxy route as fallback if public folder fails
                  if (retryCount === 0 && imageUrl) {
                    const filename = imageUrl.split('/').pop() || '';
                    if (filename) {
                      img.setAttribute('data-retry', '1');
                      // Check if it's a media library image or old product image
                      if (imageUrl.startsWith('/media/library/')) {
                        img.src = `/api/media/library/${filename}`;
                      } else {
                        img.src = `/api/media/products/${filename}`;
                      }
                      return;
                    }
                  }
                  
                  // Final fallback to placeholder
                  img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23e5e7eb" width="400" height="400"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="16" font-family="sans-serif"%3ENo Image%3C/text%3E%3C/svg%3E';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <span className="text-gray-400 text-sm">No Image</span>
              </div>
            )}
          </div>
          
          {/* Quick View Eye Icon and Wishlist Heart Icon - Top Right */}
          <div className="absolute top-2 right-2 z-20 flex items-center gap-2">
            {/* Wishlist Heart Icon */}
            <button
              onClick={handleWishlistToggle}
              className="bg-white/90 hover:bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200"
              title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart 
                className={`h-4 w-4 transition-all duration-200 ${
                  isInWishlist 
                    ? "fill-pink-600 text-pink-600" 
                    : "text-gray-700 hover:text-pink-600"
                }`} 
              />
            </button>
            
            {/* Quick View Eye Icon */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleQuickView(e);
              }}
              className="bg-white/90 hover:bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200"
              title="Quick View"
            >
              <Eye className="h-4 w-4 text-gray-700 hover:text-purple-600" />
            </button>
          </div>
          
          {/* Sale Badge - Hide if out of stock */}
          {!isOutOfStock && displayComparePrice && discountPercent > 0 && (
            <div
              className={
                compactBadges
                  ? "absolute top-1 left-1 bg-pink-600 text-white text-[9px] font-bold px-2 py-1 rounded z-10 shadow-lg"
                  : "absolute top-1 left-1 md:top-2 md:left-2 bg-pink-600 text-white text-[10px] md:text-xs font-bold px-1.5 py-0.5 md:px-3 md:py-1.5 rounded md:rounded-lg z-10 shadow-lg"
              }
            >
              Save {discountPercent}%
            </div>
          )}
          
          {/* NEW Badge */}
          {product.badges?.includes("NEW") && (
            <div
              className={
                compactBadges
                  ? "absolute top-1 left-1 bg-pink-600 text-white text-[9px] font-bold px-2 py-1 rounded z-10 shadow-lg"
                  : "absolute top-1 left-1 md:top-2 md:left-2 bg-pink-600 text-white text-[10px] md:text-xs font-bold px-1.5 py-0.5 md:px-3 md:py-1.5 rounded md:rounded-lg z-10 shadow-lg"
              }
            >
              NEW
            </div>
          )}

          {/* Out of Stock Badge */}
          {isOutOfStock && (
            <div
              className={
                compactBadges
                  ? "absolute top-1 left-1 bg-red-600 text-white text-[9px] font-bold px-2 py-1 rounded z-10 shadow-lg"
                  : "absolute top-1 left-1 md:top-2 md:left-2 bg-red-600 text-white text-[10px] md:text-xs font-bold px-1.5 py-0.5 md:px-3 md:py-1.5 rounded md:rounded-lg z-10 shadow-lg"
              }
            >
              Out of Stock
            </div>
          )}

        </div>
      </Link>

      <div className="p-3 md:p-4 flex flex-col flex-grow">
        {/* Title */}
        <Link href={`/products/${product.slug}`} className="block min-h-[3rem] sm:min-h-[3.5rem]">
          <h3 className="font-semibold text-xs sm:text-sm mb-2 hover:text-pink-600 transition-all text-gray-900 leading-snug">
            {product.title}
          </h3>
        </Link>

        {/* Rating - Only show if product has reviews */}
        {hasReviews && (
          <div 
            className="flex items-center gap-1 mb-2 cursor-pointer group/rating"
            title={tooltipText}
          >
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.round(averageRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              {averageRating.toFixed(1)} / 5.0
            </span>
            <span className="text-xs text-gray-500">
              ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
            </span>
          </div>
        )}

        {/* Price - Show for both simple and variation products */}
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-3">
          <span className="text-sm md:text-base font-bold text-gray-900 leading-tight">
            {formatCurrency(displayPrice, displayCurrency)}
          </span>
          {displayComparePrice && (
            <span className="text-xs md:text-sm text-gray-400 line-through leading-tight">
              {formatCurrency(displayComparePrice, displayCurrency)}
            </span>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-auto">
          {hasVariants ? (
            // Variation products: Show "Select Options" button
            <Link href={`/products/${product.slug}`}>
              <Button
                variant="default"
                size="sm"
                className="w-full h-7 text-xs bg-pink-600 hover:bg-pink-700 text-white font-medium px-1 py-1"
                disabled={isOutOfStock}
              >
                Select Options
              </Button>
            </Link>
          ) : (
            // Simple products: Show "Add to Cart" button
            <Button
              onClick={handleAddToCart}
              variant="default"
              size="sm"
              className="w-full h-7 text-xs bg-pink-600 hover:bg-pink-700 text-white font-medium flex items-center justify-center gap-1 px-1 py-1"
              disabled={isOutOfStock}
              data-button-id={`add-to-cart-${product.id}`}
            >
              <ShoppingCart className="h-3 w-3" />
              Add to Cart
            </Button>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </div>
  );
}

