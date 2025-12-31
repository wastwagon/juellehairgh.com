"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useCurrencyStore } from "@/store/currency-store";
import { useCartStore } from "@/store/cart-store";
import { ShoppingCart, Heart, Star, Share2 } from "lucide-react";
import { ProductGallery } from "./product-gallery";
import { ProductCard } from "./product-card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { useRecentlyViewedStore } from "@/store/recently-viewed-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductVariantSelector } from "./product-variant-selector";
import { ProductVariant } from "@/types";
import { SchemaMarkup } from "@/components/seo/schema-markup";
import { MetaTags } from "@/components/seo/meta-tags-app";
import { ProductReviews } from "./product-reviews";
import { toast } from "sonner";
import { getShippingBannerText, getShippingStatus, isBeforeCutoff } from "@/lib/shipping-time";

interface ProductDetailProps {
  slug: string;
}

export function ProductDetail({ slug }: ProductDetailProps) {
  const { displayCurrency, convert } = useCurrencyStore();
  const { addItem } = useCartStore();
  const { addProduct: addToRecentlyViewed } = useRecentlyViewedStore();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, ProductVariant>>({});
  const [quantity, setQuantity] = useState(1);

  // Fetch product - must be first hook
  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["product", slug],
    queryFn: async () => {
      const response = await api.get(`/products/${slug}`);
      return response.data;
    },
  });

  // Track product view when data is loaded
  useEffect(() => {
    if (product && typeof window !== "undefined") {
      import("@/lib/analytics").then(({ analytics }) => {
        analytics.viewProduct(product.id, product.title);
      });
    }
  }, [product]);

  // Fetch related products - must be called before any returns
  const { data: relatedProducts } = useQuery<Product[]>({
    queryKey: ["related-products", product?.categoryId, product?.id],
    queryFn: async () => {
      if (!product?.categoryId) return [];
      try {
        const response = await api.get(`/products?category=${product.categoryId}&limit=4`);
        return (response.data.products || []).filter((p: Product) => p.id !== product.id).slice(0, 4);
      } catch (error) {
        return [];
      }
    },
    enabled: !!product?.categoryId,
  });

  // Fetch SEO data - must be called before any returns
  const { data: seoData } = useQuery({
    queryKey: ["seo", "product", product?.id],
    queryFn: async () => {
      if (!product?.id) return null;
      try {
        const response = await api.get(`/seo/products/${product.id}/schema`);
        return response.data;
      } catch {
        return null;
      }
    },
    enabled: !!product?.id,
  });

  // Add to recently viewed - MUST be called before any returns
  useEffect(() => {
    if (product?.id) {
      addToRecentlyViewed(product);
    }
  }, [product?.id, addToRecentlyViewed, product]);

  // Now we can have early returns after all hooks
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

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

  const handleAddToCart = () => {
    // Check if product has variants and if all required variants are selected
    if (product.variants && product.variants.length > 0) {
      // Group variants by name to determine required attributes
      // Use same normalization logic as ProductVariantSelector
      const variantGroups = new Set<string>();
      product.variants.forEach(v => {
        let normalizedName = v.name;
        const nameLower = v.name.toLowerCase();
        
        // Handle combined names (e.g., "Color / Length")
        if (nameLower.includes(" / ") || nameLower.includes("/")) {
          const parts = v.name.split(/[\/\s]+/).filter(p => p.trim().length > 0);
          parts.forEach(part => {
            let partName = part.trim();
            // Normalize old "Option" or "PA Color" variants to "Color"
            if (partName.toLowerCase() === "option" || 
                partName.toLowerCase().includes("pa color") || 
                partName.toLowerCase().includes("pa_color") || 
                partName.toLowerCase().includes("pa-color")) {
              partName = "Color";
            }
            variantGroups.add(partName.toLowerCase());
          });
        } else {
          // Normalize old "Option" or "PA Color" variants to "Color"
          if (nameLower === "option" || 
              nameLower.includes("pa color") || 
              nameLower.includes("pa_color") || 
              nameLower.includes("pa-color")) {
            normalizedName = "Color";
          }
          variantGroups.add(normalizedName.toLowerCase());
        }
      });
      
      // Check if all variant groups have a selection
      const selectedGroups = new Set(Object.keys(selectedVariants).map(k => k.toLowerCase()));
      const missingGroups = Array.from(variantGroups).filter(g => !selectedGroups.has(g));
      
      if (missingGroups.length > 0) {
        const missingNames = missingGroups.map(g => g.charAt(0).toUpperCase() + g.slice(1)).join(", ");
        toast.error(`Please select ${missingNames}`, {
          description: "All options must be selected before adding to cart",
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
    
    // Track add to cart (already tracked in cart store, but also track here for product detail page)
    const effectivePrice = isOnSale ? salePrice! : basePrice;
    if (typeof window !== "undefined") {
      import("@/lib/analytics").then(({ analytics }) => {
        analytics.addToCart(product.id, quantity, effectivePrice);
      });
    }
    
    addItem({
      productId: product.id,
      variantId: selectedVariantId, // Keep for backward compatibility
      variantIds: selectedVariantIds.length > 0 ? selectedVariantIds : undefined,
      variants: selectedVariantObjects.length > 0 ? selectedVariantObjects : undefined,
      quantity,
      product,
    });
    
    // Show success notification with all selected variants
    const variantText = selectedVariantObjects.length > 0
      ? ` (${selectedVariantObjects.map(v => `${v.name}: ${v.value}`).join(', ')})`
      : '';
    
    toast.success("Added to cart!", {
      description: `${product.title}${variantText}`,
      duration: 3000,
    });
  };

  if (isLoading || !product) {
    return (
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <div className="aspect-square bg-gray-200 rounded-lg" />
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

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
    <>
      {/* SEO Meta Tags */}
      <MetaTags
        title={seoData?.metaTitle || product.title}
        description={seoData?.metaDescription || product.description?.replace(/<[^>]*>/g, "").substring(0, 160)}
        keywords={seoData?.keywords?.length ? seoData.keywords : [product.title, product.category?.name, typeof product.brand === "object" ? product.brand?.name : product.brand].filter(Boolean) as string[]}
        ogTitle={seoData?.ogTitle}
        ogDescription={seoData?.ogDescription}
        ogImage={seoData?.ogImage || (product.images && product.images[0])}
        canonicalUrl={seoData?.canonicalUrl}
        noindex={seoData?.noindex || false}
        nofollow={seoData?.nofollow || false}
      />

      {/* Schema Markup */}
      {seoData?.schemaData && <SchemaMarkup schema={seoData.schemaData} />}

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Shop", href: "/shop-all" },
            { label: product.category?.name || "Products", href: product.categoryId ? `/categories/${product.category?.slug}` : undefined },
            { label: product.title },
          ]}
        />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-12">
        <div>
          <ProductGallery 
            images={product.images || []} 
            title={product.title}
            selectedIndex={selectedImageIndex}
            onImageSelect={setSelectedImageIndex}
          />
        </div>

        <div>
          <div className="flex flex-wrap gap-2 mb-4">
            {product.badges?.map((badge) => (
              <span
                key={badge}
                className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-full shadow-md"
              >
                {badge}
              </span>
            ))}
          </div>

          <h1 className="text-base md:text-lg font-bold mb-4 text-gray-900">{product.title}</h1>

          {/* Shipping Time Banner */}
          <div className="mb-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg">
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

          {product.brand && (
            <p className="text-gray-600 mb-4">
              Brand: {typeof product.brand === "string" ? product.brand : product.brand?.name || ""}
            </p>
          )}

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

          <div className="mb-6">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-base md:text-lg font-bold text-gray-900">
                {formatCurrency(displayPrice, displayCurrency)}
              </span>
              {displayComparePrice && (
                <span className="text-xs md:text-sm text-gray-400 line-through">
                  {formatCurrency(displayComparePrice, displayCurrency)}
                </span>
              )}
            </div>
            {displayCurrency !== "GHS" && (
              <p className="text-sm text-gray-600">
                Approximate price. Final payment in GHS: {formatCurrency(Number(product.priceGhs), "GHS")}
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
                onImageChange={setSelectedImageIndex}
              />
            </div>
          )}

          {product.description && (
            <div className="mb-6">
              <h2 className="font-semibold mb-2 text-gray-900">Description</h2>
              <div className="text-gray-600 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex items-center border border-gray-300 rounded-md">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 hover:bg-gray-100 transition-colors"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 text-center border-0 focus:ring-0"
              />
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 hover:bg-gray-100 transition-colors"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg text-xs font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-1.5 transition-all duration-200"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Add to Cart
            </button>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold mb-3 text-gray-900">Shipping Information</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong className="text-gray-900">Free Shipping:</strong> On all orders GHS 950+ within Ghana
              </p>
              <p>
                <strong className="text-gray-900">Delivery:</strong> Same day (Accra), Next day (Accra/Tema), or standard delivery
              </p>
              <p className="pt-2 border-t border-gray-200 text-xs">
                <strong>Contact:</strong> +(233) 539506949 | <strong>Email:</strong> sales@juellehairgh.com
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {product.id && (
        <div className="border-t border-gray-200 pt-8 md:pt-12">
          <ProductReviews productId={product.id} />
        </div>
      )}

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="border-t border-gray-200 pt-8 md:pt-12">
          <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 text-gray-900">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((relatedProduct) => {
              const productWithPrice = {
                ...relatedProduct,
                priceGhs: typeof relatedProduct.priceGhs === 'string' ? parseFloat(relatedProduct.priceGhs) : relatedProduct.priceGhs,
                compareAtPriceGhs: relatedProduct.compareAtPriceGhs 
                  ? (typeof relatedProduct.compareAtPriceGhs === 'string' ? parseFloat(relatedProduct.compareAtPriceGhs) : relatedProduct.compareAtPriceGhs)
                  : null,
              };
              return <ProductCard key={relatedProduct.id} product={productWithPrice} />;
            })}
          </div>
        </div>
      )}
      </div>
    </>
  );
}

