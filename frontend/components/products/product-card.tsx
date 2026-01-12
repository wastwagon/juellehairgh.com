"use client";

import { useState } from "react";
import Link from "next/link";
import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useCurrencyStore } from "@/store/currency-store";
import { useCartStore } from "@/store/cart-store";
import { Star, Eye, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuickViewModal } from "./quick-view-modal";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { displayCurrency, convert } = useCurrencyStore();
  const { addItem } = useCartStore();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  
  // Check if product has variants
  const hasVariants = product.variants && product.variants.length > 0;
  
  // Check if product is out of stock
  // For variation products: check if any variant has stock
  // For simple products: check product stock
  const isOutOfStock = hasVariants
    ? !product.variants?.some(v => v.stock > 0) // Out of stock if no variants have stock
    : (product.stock !== undefined && product.stock <= 0); // Simple product: check product stock
  
  // WooCommerce-style: If sale price is set and lower than regular price, show sale price prominently
  const regularPrice = Number(product.priceGhs);
  const salePrice = product.compareAtPriceGhs ? Number(product.compareAtPriceGhs) : null;
  const isOnSale = salePrice && salePrice < regularPrice;
  const displayPrice = isOnSale ? convert(salePrice) : convert(regularPrice);
  const displayComparePrice = isOnSale ? convert(regularPrice) : null;

  const discountPercent = isOnSale
    ? Math.round(((regularPrice - salePrice!) / regularPrice) * 100)
    : 0;

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
          // Try public folder first, API proxy as fallback
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
    
    // Handle media library paths (new format: /media/products/filename.jpg)
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
    
    // Extract filename and try public folder first
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
        <div className="aspect-square relative overflow-hidden bg-gray-100">
          <div className="absolute inset-0 flex items-center justify-center p-2">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={product.title}
                className="max-w-full max-h-full w-auto h-auto object-contain group-hover:scale-105 transition-transform duration-300"
                style={{ objectPosition: 'center center' }}
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23e5e7eb" width="400" height="400"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="16" font-family="sans-serif"%3ENo Image%3C/text%3E%3C/svg%3E';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <span className="text-gray-400 text-sm">No Image</span>
              </div>
            )}
          </div>
          
          {/* Quick View Eye Icon - Top Right (always visible) */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleQuickView(e);
            }}
            className="absolute top-2 right-2 z-20 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200"
            title="Quick View"
          >
            <Eye className="h-4 w-4 text-gray-700 hover:text-purple-600" />
          </button>
          
          {/* Sale Badge - Hide if out of stock */}
          {!isOutOfStock && displayComparePrice && discountPercent > 0 && (
            <div className="absolute top-2 left-2 bg-pink-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg z-10 shadow-lg">
              Save {discountPercent}%
            </div>
          )}
          
          {/* NEW Badge */}
          {product.badges?.includes("NEW") && (
            <div className="absolute top-2 left-2 bg-pink-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg z-10 shadow-lg">
              NEW
            </div>
          )}

          {/* Out of Stock Badge */}
          {isOutOfStock && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg z-10 shadow-lg">
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

        {/* Price - Only show for simple products (no variants) */}
        {!hasVariants && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base md:text-lg font-bold text-gray-900">
              {formatCurrency(displayPrice, displayCurrency)}
            </span>
            {displayComparePrice && (
              <span className="text-sm text-gray-400 line-through">
                {formatCurrency(displayComparePrice, displayCurrency)}
              </span>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="mt-auto">
          {hasVariants ? (
            // Variation products: Show "Select Options" button
            <Link href={`/products/${product.slug}`}>
              <Button
                variant="default"
                size="sm"
                className="w-full h-7 text-xs bg-pink-600 hover:bg-pink-700 text-white font-medium px-2 py-1"
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
              className="w-full h-7 text-xs bg-pink-600 hover:bg-pink-700 text-white font-medium flex items-center justify-center gap-1 px-2 py-1"
              disabled={isOutOfStock}
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

