"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/types";

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        // Create a unique key for comparison (productId + sorted variantIds)
        const itemKey = (i: CartItem) => {
          const variantIds = i.variantIds || (i.variantId ? [i.variantId] : []);
          return `${i.productId}-${variantIds.sort().join(',')}`;
        };
        
        const newItemKey = itemKey(item);
        const existingItem = get().items.find((i) => itemKey(i) === newItemKey);

        if (existingItem) {
          set({
            items: get().items.map((i) =>
              itemKey(i) === newItemKey
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({ items: [...get().items, item] });
        }

        // Track add to cart event
        if (typeof window !== "undefined" && item.product) {
          import("@/lib/analytics").then(({ analytics }) => {
            analytics.addToCart(
              item.productId,
              item.quantity,
              Number(item.product.priceGhs || 0)
            );
          });
        }
      },
      removeItem: (productId, variantId) => {
        // Support both old (variantId) and new (variantIds) format
        set({
          items: get().items.filter((i) => {
            if (i.productId !== productId) return true;
            // If variantId is provided, match by it (backward compatibility)
            if (variantId) {
              return !(i.variantId === variantId || (i.variantIds && i.variantIds.includes(variantId)));
            }
            // If no variantId, remove all items for this product (shouldn't happen, but handle it)
            return false;
          }),
        });
      },
      updateQuantity: (productId, variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }

        set({
          items: get().items.map((i) => {
            // Match by variantId (backward compatibility) or by variantIds
            const matches = i.productId === productId && (
              i.variantId === variantId || 
              (i.variantIds && i.variantIds.includes(variantId || ''))
            );
            return matches ? { ...i, quantity } : i;
          }),
        });
      },
      clearCart: () => set({ items: [] }),
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: "cart-storage",
    }
  )
);

