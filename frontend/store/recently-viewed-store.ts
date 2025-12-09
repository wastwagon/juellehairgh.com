import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types";

interface RecentlyViewedStore {
  products: Product[];
  addProduct: (product: Product) => void;
  clear: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set) => ({
      products: [],
      addProduct: (product) =>
        set((state) => {
          // Remove if already exists
          const filtered = state.products.filter((p) => p.id !== product.id);
          // Add to beginning, limit to 10
          return { products: [product, ...filtered].slice(0, 10) };
        }),
      clear: () => set({ products: [] }),
    }),
    {
      name: "recently-viewed-storage",
    }
  )
);





