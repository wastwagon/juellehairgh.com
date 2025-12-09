"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CurrencyStore {
  displayCurrency: string;
  rates: Record<string, number>;
  setDisplayCurrency: (currency: string) => void;
  setRates: (rates: Record<string, number>) => void;
  convert: (amountGhs: number) => number;
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist(
    (set, get) => ({
      displayCurrency: "GHS",
      rates: {},
      setDisplayCurrency: (currency) => set({ displayCurrency: currency }),
      setRates: (rates) => set({ rates }),
      convert: (amountGhs) => {
        const { displayCurrency, rates } = get();
        if (displayCurrency === "GHS" || !rates[displayCurrency]) {
          return amountGhs;
        }
        return Number((amountGhs * rates[displayCurrency]).toFixed(2));
      },
    }),
    {
      name: "currency-storage",
    }
  )
);





