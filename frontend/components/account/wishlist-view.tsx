"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCurrencyStore } from "@/store/currency-store";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";

interface WishlistItem {
  id: string;
  productId: string;
  product: {
    id: string;
    title: string;
    slug: string;
    priceGhs: number;
    compareAtPriceGhs?: number;
    images: string[];
    brand?: { name: string };
  };
  createdAt: string;
}

export function WishlistView() {
  const { displayCurrency, convert } = useCurrencyStore();
  const { addItem } = useCartStore();
  const queryClient = useQueryClient();
  
  const { data: wishlistItems = [], isLoading } = useQuery<WishlistItem[]>({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get("/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data || [];
    },
    retry: false,
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
  });

  const removeMutation = useMutation({
    mutationFn: async (productId: string) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      return api.delete(`/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  const handleAddToCart = (item: WishlistItem) => {
    addItem({
      productId: item.product.id,
      quantity: 1,
      // Only pass product if it has all required fields
      product: item.product as any, // Type assertion to avoid strict type checking
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading wishlist...</p>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Your Wishlist is Empty</h2>
        <p className="text-gray-600 mb-6">
          Start adding items you love to your wishlist.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-primary text-white rounded-md inline-block hover:bg-primary/90 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {wishlistItems.map((item) => {
          const getImageUrl = () => {
            if (!item.product?.images || item.product.images.length === 0) return "/placeholder.jpg";
            const firstImage = item.product.images[0];
            if (firstImage.startsWith('/')) return firstImage;
            if (firstImage.startsWith('http://') || firstImage.startsWith('https://')) return firstImage;
            if (firstImage.startsWith('products/')) return `/${firstImage}`;
            return `/${firstImage}`;
          };

          return (
            <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-lg transition-shadow group">
              <Link href={`/products/${item.product.slug}`} className="block">
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  <img
                    src={getImageUrl()}
                    alt={item.product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23e5e7eb" width="400" height="400"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="16"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              </Link>
              <div className="p-3 md:p-4">
                {item.product.brand && (
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                    {item.product.brand.name}
                  </p>
                )}
                <Link href={`/products/${item.product.slug}`}>
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2 text-gray-900 hover:text-primary transition-colors">
                    {item.product.title}
                  </h3>
                </Link>
                <div className="flex items-center gap-2 mb-4">
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(
                      convert(Number(item.product.priceGhs || 0)),
                      displayCurrency
                    )}
                  </p>
                  {item.product.compareAtPriceGhs && (
                    <p className="text-sm text-gray-400 line-through">
                      {formatCurrency(
                        convert(Number(item.product.compareAtPriceGhs)),
                        displayCurrency
                      )}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAddToCart(item)}
                    className="flex-1 text-sm"
                    size="sm"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeMutation.mutate(item.product.id)}
                    disabled={removeMutation.isPending}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

