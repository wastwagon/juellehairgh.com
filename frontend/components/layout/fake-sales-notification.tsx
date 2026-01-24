"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { X, ShoppingBag } from "lucide-react";
import { Product } from "@/types";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useCurrencyStore } from "@/store/currency-store";
import Link from "next/link";

// Generate random time ago (between 5 minutes and 2 hours)
const getRandomTimeAgo = (): string => {
  const minutes = Math.floor(Math.random() * 115) + 5; // 5-120 minutes
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  }
  return `${hours} hour${hours !== 1 ? "s" : ""} ${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""} ago`;
};

// Get product image URL
const getProductImageUrl = (product: Product): string | null => {
  if (!product.images || product.images.length === 0) {
    return null;
  }

  const firstImage = product.images[0];
  if (!firstImage) return null;

  // Handle absolute URLs
  if (firstImage.startsWith("http://") || firstImage.startsWith("https://")) {
    return firstImage;
  }

  // Handle media library paths
  if (firstImage.startsWith("/media/library/")) {
    return firstImage;
  }

  // Handle old product paths
  if (firstImage.startsWith("/media/products/")) {
    return firstImage;
  }

  // Extract filename and try public folder
  const filename = firstImage.split("/").pop() || firstImage;
  return `/media/products/${filename}`;
};

export function FakeSalesNotification() {
  const router = useRouter();
  const { displayCurrency, convert } = useCurrencyStore();
  const [isVisible, setIsVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [timeAgo, setTimeAgo] = useState<string>("");
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check if we should show the notification (hide on admin, checkout, cart pages)
  useEffect(() => {
    if (typeof window === "undefined" || !isMounted) return;

    const path = window.location.pathname;
    const hideOnPaths = ["/admin", "/checkout", "/cart", "/account"];
    const shouldHide = hideOnPaths.some((p) => path.startsWith(p));

    // Check localStorage for dismissal
    const dismissed = localStorage.getItem("fakeSalesNotificationDismissed");
    if (dismissed === "true" || shouldHide) {
      setIsDismissed(true);
      return;
    }

    // Show notification after a delay (3 seconds)
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isMounted]);

  // Fetch products for the notification (only on client side)
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ["fake-sales-products"],
    queryFn: async () => {
      try {
        // Fetch a larger set of products to ensure we get enough wigs
        const response = await api.get("/products?limit=200&isActive=true");
        
        // Debug: Log response structure
        console.log("🔍 Fake Sales Notification - API Response:", {
          hasData: !!response.data,
          hasProducts: !!response.data?.products,
          productsCount: response.data?.products?.length || 0,
          responseKeys: Object.keys(response.data || {}),
        });

        const allProducts = response.data?.products || [];
        console.log(`📦 Total products fetched: ${allProducts.length}`);

        const fetchedProducts = allProducts.filter((p: Product) => {
            // Basic validation
            if (!p || !p.id) {
              return false;
            }

            if (!p.images || p.images.length === 0) {
              return false;
            }

            if (p.isActive === false) {
              return false;
            }

            // Check stock - products with variants might have stock at variant level
            const hasVariants = p.variants && Array.isArray(p.variants) && p.variants.length > 0;
            let hasStock = false;

            if (hasVariants) {
              // For products with variants, check if any variant has stock > 0
              hasStock = p.variants.some((v: any) => {
                const variantStock = v?.stock;
                return variantStock !== undefined && variantStock !== null && variantStock > 0;
              });
            } else {
              // For simple products, check product stock
              const productStock = p.stock;
              hasStock = productStock !== undefined && productStock !== null && productStock > 0;
            }

            if (!hasStock) {
              return false;
            }

            // Only show wigs - check category slug or title
            const categorySlug =
              p.category && typeof p.category === "object" && p.category.slug
                ? p.category.slug
                : null;
            const titleLower = (p.title || "").toLowerCase();

            const isWig =
              categorySlug === "lace-wigs" ||
              categorySlug === "wigs" ||
              categorySlug === "human-hair-wigs" ||
              titleLower.includes("wig") ||
              titleLower.includes("lace front") ||
              titleLower.includes("glueless") ||
              titleLower.includes("hd lace");

            return isWig;
          }
        );

        console.log(`✅ Filtered wig products: ${fetchedProducts.length}`, {
          sampleProducts: fetchedProducts.slice(0, 3).map((p: Product) => ({
            title: p.title,
            category: p.category && typeof p.category === "object" ? p.category.slug : "unknown",
            stock: p.stock,
            hasVariants: !!(p.variants && p.variants.length > 0),
          })),
        });

        // If no wigs found, log detailed warning
        if (fetchedProducts.length === 0) {
          console.warn("⚠️ No wig products found for fake sales notification", {
            totalProducts: allProducts.length,
            sampleCategories: allProducts.slice(0, 10).map((p: Product) => ({
              title: p.title,
              category: p.category && typeof p.category === "object" ? p.category.slug : "unknown",
              stock: p.stock,
            })),
          });
        }

        return fetchedProducts;
      } catch (error) {
        console.error("❌ Error fetching products for sales notification:", error);
        return [];
      }
    },
    enabled: isMounted && typeof window !== "undefined" && !isDismissed,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  // Debug: Log query state
  useEffect(() => {
    if (isMounted) {
      console.log("🔍 Fake Sales Notification Query State:", {
        isLoading,
        error: error?.message,
        productsCount: products?.length || 0,
        isEnabled: isMounted && typeof window !== "undefined" && !isDismissed && isVisible,
      });
    }
  }, [isLoading, error, products, isMounted, isDismissed, isVisible]);

  // Select random product and set time ago
  useEffect(() => {
    if (!products || products.length === 0 || isDismissed) return;

    // Select random product
    const randomIndex = Math.floor(Math.random() * products.length);
    const selectedProduct = products[randomIndex];
    setCurrentProduct(selectedProduct);
    setTimeAgo(getRandomTimeAgo());

    // Rotate to a new product every 8-15 seconds
    const rotationInterval = setInterval(() => {
      if (products.length > 0) {
        const newRandomIndex = Math.floor(Math.random() * products.length);
        setCurrentProduct(products[newRandomIndex]);
        setTimeAgo(getRandomTimeAgo());
      }
    }, Math.floor(Math.random() * 7000) + 8000); // 8-15 seconds

    return () => clearInterval(rotationInterval);
  }, [products, isDismissed]);

  const handleClose = () => {
    setIsVisible(false);
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("fakeSalesNotificationDismissed", "true");
    }
  };

  const handleViewProduct = () => {
    if (currentProduct?.slug) {
      router.push(`/products/${currentProduct.slug}`);
    }
  };

  // Don't render during SSR or if dismissed or no product
  if (!isMounted || isDismissed || !isVisible || !currentProduct) {
    return null;
  }

  const productImageUrl = getProductImageUrl(currentProduct);
  const displayPrice = convert(currentProduct.priceGhs || 0);

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-in slide-in-from-left duration-300 md:bottom-6 md:left-6">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-[280px] md:w-[320px] p-3 md:p-4 relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex gap-3">
          {/* Product Image */}
          <div className="flex-shrink-0">
            {productImageUrl ? (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded overflow-hidden bg-gray-100">
                <img
                  src={productImageUrl}
                  alt={currentProduct.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect fill='%23e5e7eb' width='80' height='80'/%3E%3Ctext fill='%239ca3af' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='10' font-family='sans-serif'%3ENo Image%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded bg-gray-100 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-1 mb-1">
              <ShoppingBag className="h-3 w-3 text-amber-700 flex-shrink-0 mt-0.5" />
              <p className="text-xs md:text-sm text-gray-700 font-medium leading-tight">
                Someone recently bought a{" "}
                <span className="font-semibold">
                  {currentProduct.title.length > 20
                    ? `${currentProduct.title.substring(0, 20)}...`
                    : currentProduct.title}
                </span>
              </p>
            </div>

            <p className="text-xs text-gray-500 mb-1">{timeAgo}</p>

            <p className="text-sm md:text-base font-bold text-gray-900 mb-2">
              {formatCurrency(displayPrice, displayCurrency)}
            </p>

            <Link
              href={`/products/${currentProduct.slug}`}
              onClick={handleViewProduct}
              className="text-xs md:text-sm text-green-600 hover:text-green-700 font-medium hover:underline transition-colors"
            >
              View Product →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
