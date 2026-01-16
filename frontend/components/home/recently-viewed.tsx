"use client";

import { useRecentlyViewedStore } from "@/store/recently-viewed-store";
import { ProductCard } from "@/components/products/product-card";
import { Product } from "@/types";
import Link from "next/link";

export function RecentlyViewed() {
  const { products } = useRecentlyViewedStore();

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-8 md:py-12 container mx-auto px-4">
      <div className="flex items-center justify-center sm:justify-between mb-6 md:mb-8 gap-4">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 text-center sm:text-left tracking-tight">Recently Viewed</h2>
        <Link
          href="/account"
          className="text-sm text-primary hover:underline font-medium"
        >
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {products.slice(0, 4).map((product: Product) => {
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
    </section>
  );
}

