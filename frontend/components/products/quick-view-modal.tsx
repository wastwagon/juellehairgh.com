"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, ShoppingCart, Heart, Star } from "lucide-react";
import { Product, ProductVariant } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useCurrencyStore } from "@/store/currency-store";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { ProductVariantSelector } from "./product-variant-selector";
import Link from "next/link";
import { toast } from "sonner";
import { getShippingBannerText, getShippingStatus, isBeforeCutoff } from "@/lib/shipping-time";

interface QuickViewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const router = useRouter();
  const { displayCurrency, convert } = useCurrencyStore();
  const { addItem } = useCartStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, ProductVariant>>({});

  if (!isOpen) return null;

  // Calculate price based on selected variant
  const selectedVariant = Object.values(selectedVariants).find((v) => v.priceGhs);
  const variantPrice = selectedVariant?.priceGhs;
  const variantSalePrice = selectedVariant?.compareAtPriceGhs;
  
  // Use variant prices if variant is selected, otherwise use product prices
  const basePrice = variantPrice ? Number(variantPrice) : Number(product.priceGhs);
  const salePrice = variantSalePrice ? Number(variantSalePrice) : (product.compareAtPriceGhs ? Number(product.compareAtPriceGhs) : null);
  
  // WooCommerce-style: If sale price is set and lower than regular price, show sale price prominently
  const isOnSale = salePrice && salePrice < basePrice;
  const displayPrice = isOnSale ? convert(salePrice) : convert(basePrice);
  const displayComparePrice = isOnSale ? convert(basePrice) : null;

  const discountPercent = isOnSale
    ? Math.round(((basePrice - salePrice!) / basePrice) * 100)
    : 0;

  const handleAddToCart = () => {
    // Check if product has variants and if at least one variant is selected
    if (product.variants && product.variants.length > 0) {
      // Check if at least one variant is selected
      const hasSelectedVariant = Object.keys(selectedVariants).length > 0;
      
      if (!hasSelectedVariant) {
        toast.error("Please select an option", {
          description: "Please choose from the available options before adding to cart",
          duration: 3000,
        });
        return;
      }
    }
    // Get all selected variant IDs
    const selectedVariantIds = Object.values(selectedVariants)
      .map(v => v.id)
      .filter(Boolean);
    const selectedVariantId = selectedVariantIds[0]; // Keep first for backward compatibility
    
    // Get all selected variant objects for display
    const selectedVariantObjects = Object.values(selectedVariants).filter(Boolean);
    
    addItem({
      productId: product.id,
      variantId: selectedVariantId, // Keep for backward compatibility
      variantIds: selectedVariantIds.length > 0 ? selectedVariantIds : undefined,
      variants: selectedVariantObjects.length > 0 ? selectedVariantObjects : undefined,
      quantity,
      product,
    });
    // Track is already done in cart store, but we can also track here for quick view
    const effectivePrice = isOnSale ? salePrice! : basePrice;
    if (typeof window !== "undefined") {
      import("@/lib/analytics").then(({ analytics }) => {
        analytics.addToCart(product.id, quantity, effectivePrice);
      });
    }
    
    // Show success notification with all selected variants
    const variantText = selectedVariantObjects.length > 0
      ? ` (${selectedVariantObjects.map(v => `${v.name}: ${v.value}`).join(', ')})`
      : '';
    
    toast.success("Added to cart!", {
      description: `${product.title}${variantText}`,
      duration: 3000,
    });
  };

  const getImageUrl = (image: string) => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001/api';
    
    // Handle absolute URLs
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    
    // Handle media library paths (new format: /media/products/filename.jpg)
    if (image.startsWith('/media/products/')) {
      const filename = image.replace('/media/products/', '');
      // Try Next.js public path first, then fallback to API
      return `/media/products/${filename}`;
    }
    
    // Handle old product paths (legacy: /products/filename.jpg or products/filename.jpg)
    if (image.includes('/products/') || image.startsWith('products/')) {
      const filename = image.split('/').pop() || image;
      // Try Next.js public path first, then fallback to API
      return `/media/products/${filename}`;
    }
    
    // Extract filename and use backend API as fallback
    const filename = image.split('/').pop() || image;
    return `${apiBaseUrl}/admin/upload/media/products/${filename}`;
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* Image Gallery */}
            <div>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 relative">
                <div className="absolute inset-0 flex items-center justify-center p-2">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={getImageUrl(product.images[selectedImage])}
                      alt={product.title}
                      className="max-w-full max-h-full w-auto h-auto object-contain"
                      style={{ objectPosition: 'center center' }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                </div>
              </div>
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.slice(0, 4).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-md overflow-hidden border-2 ${
                        selectedImage === index ? 'border-primary ring-2 ring-primary ring-offset-1' : 'border-transparent hover:border-gray-300'
                      }`}
                      style={{ minWidth: '96px', minHeight: '96px' }}
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`${product.title} ${index + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              {product.brand && (
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
                  {typeof product.brand === "string" ? product.brand : product.brand?.name || ""}
                </p>
              )}

              <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-900">{product.title}</h2>

              {/* Shipping Time Banner */}
              <div className="mb-4 p-2 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-gray-700">
                    {isBeforeCutoff() ? (
                      <>
                        Order <span className="bg-green-600 text-white px-2 py-0.5 rounded">Ship Today</span> Item(s) by <strong>2PM GMT</strong> — <strong className="text-red-600">Ships Today!</strong>
                      </>
                    ) : (
                      <strong className="text-gray-800">Orders Placed After 2PM GMT Ship Next Business Day.</strong>
                    )}
                  </span>
                </div>
              </div>

              {/* Rating - Only show if product has reviews */}
              {hasReviews && (
                <div 
                  className="flex items-center gap-2 mb-4 cursor-pointer"
                  title={tooltipText}
                >
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(averageRating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {averageRating.toFixed(1)} ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl md:text-2xl font-bold text-gray-900">
                    {formatCurrency(displayPrice, displayCurrency)}
                  </span>
                  {displayComparePrice && (
                    <span className="text-lg text-gray-400 line-through">
                      {formatCurrency(displayComparePrice, displayCurrency)}
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      Save {discountPercent}%
                    </span>
                  )}
                </div>
                {displayCurrency !== "GHS" && (
                  <p className="text-sm text-gray-600">
                    Final payment in GHS: {formatCurrency(Number(product.priceGhs), "GHS")}
                  </p>
                )}
              </div>

              {/* Product Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <ProductVariantSelector
                    variants={product.variants}
                    productImages={product.images || []}
                    basePrice={Number(product.priceGhs)}
                    onVariantChange={setSelectedVariants}
                    onImageChange={setSelectedImage}
                  />
                </div>
              )}

              {/* Short Description */}
              {product.shortDescription && (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 line-clamp-3" dangerouslySetInnerHTML={{ __html: product.shortDescription }} />
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">Quantity:</label>
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-2 py-1 hover:bg-gray-100 transition-colors text-sm"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-14 text-center border-0 focus:ring-0 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-2 py-1 hover:bg-gray-100 transition-colors text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleAddToCart}
                    className="flex-1 px-2 py-1.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-medium"
                  >
                    <ShoppingCart className="h-3 w-3 mr-1.5" />
                    Add to Cart
                  </Button>
                  <Button variant="outline" className="px-2.5 py-1.5">
                    <Heart className="h-3 w-3" />
                  </Button>
                </div>

                <Link
                  href={`/products/${product.slug}`}
                  className="block text-center text-sm text-primary hover:underline"
                  onClick={onClose}
                >
                  View Full Details →
                </Link>
              </div>

              {/* Shipping Info */}
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600">
                  <strong>Free Shipping:</strong> On all orders GHS 950+ within Ghana. <strong>Delivery:</strong> Same day (Accra), Next day (Accra/Tema), or standard delivery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

