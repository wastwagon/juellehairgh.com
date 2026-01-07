import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types";

interface CompareStore {
  products: Product[];
  addProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;
  clear: () => void;
  canAdd: () => boolean;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      products: [],
      addProduct: (product) =>
        set((state) => {
          if (state.products.find((p) => p.id === product.id)) {
            return state; // Already in compare
          }
          if (state.products.length >= 4) {
            return state; // Max 4 products
          }
          return { products: [...state.products, product] };
        }),
      removeProduct: (productId) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== productId),
        })),
      clear: () => set({ products: [] }),
      canAdd: () => get().products.length < 4,
    }),
    {
      name: "compare-storage",
    }
  )
);














