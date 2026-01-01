"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCurrencyStore } from "@/store/currency-store";
import { api } from "@/lib/api";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  country: string;
}

export function CurrencySelector() {
  const { displayCurrency, setDisplayCurrency, setRates } = useCurrencyStore();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all currencies
  const { data: currencies = [] } = useQuery<CurrencyInfo[]>({
    queryKey: ["currencies"],
    queryFn: async () => {
      const response = await api.get("/currency/currencies");
      return response.data;
    },
    staleTime: 1000 * 60 * 60 * 24,
  });

  // Fetch exchange rates (silently in background)
  const { data: ratesData } = useQuery<Record<string, number>>({
    queryKey: ["currency-rates"],
    queryFn: async () => {
      const response = await api.get("/currency/rates");
      return response.data;
    },
    staleTime: 1000 * 60 * 60,
  });

  useEffect(() => {
    if (ratesData) {
      setRates(ratesData);
    }
  }, [ratesData]);

  // Filter currencies based on search
  const filteredCurrencies = useMemo(() => {
    if (!searchQuery.trim()) return currencies;
    const query = searchQuery.toLowerCase();
    return currencies.filter(
      (currency) =>
        currency.code.toLowerCase().includes(query) ||
        currency.name.toLowerCase().includes(query) ||
        currency.country.toLowerCase().includes(query)
    );
  }, [currencies, searchQuery]);

  // Get current currency info
  const currentCurrency = currencies.find((c) => c.code === displayCurrency) || {
    code: displayCurrency,
    name: displayCurrency,
    symbol: displayCurrency,
    flag: "🌍",
    country: "",
  };

  const handleCurrencySelect = (currencyCode: string) => {
    setDisplayCurrency(currencyCode);
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors border border-gray-200">
          <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-[10px] leading-none shadow-sm">
            {currentCurrency.flag}
          </span>
          <div className="flex items-center gap-1">
            <span className="font-medium text-xs text-gray-700">
              {currentCurrency.code}
            </span>
            <span className="text-[10px] text-gray-500">
              {currentCurrency.symbol}
            </span>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-2 shadow-xl border-gray-200" align="end">
        {/* Search Header */}
        <div className="mb-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-7 pr-7 text-xs border-gray-200 rounded-full focus:ring-1 focus:ring-primary"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <X className="h-3 w-3 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Currency List */}
        <div className="max-h-[400px] overflow-y-auto space-y-1.5">
          {filteredCurrencies.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-xs text-gray-500">No currencies found</p>
            </div>
          ) : (
            filteredCurrencies.map((currency) => {
              const isSelected = currency.code === displayCurrency;

              return (
                <button
                  key={currency.code}
                  onClick={() => handleCurrencySelect(currency.code)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-full transition-all duration-200",
                    isSelected
                      ? "bg-pink-100 text-gray-900 shadow-sm border border-pink-200"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                  )}
                >
                  {/* Circular Flag */}
                  <div className={cn(
                    "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs leading-none shadow-sm",
                    isSelected ? "bg-white" : "bg-white"
                  )}>
                    {currency.flag}
                  </div>

                  {/* Currency Code and Symbol */}
                  <div className="flex items-center gap-1.5 flex-1">
                    <span className={cn(
                      "font-medium text-sm",
                      isSelected ? "text-gray-900" : "text-gray-900"
                    )}>
                      {currency.code}
                    </span>
                    <span className={cn(
                      "text-xs font-medium",
                      isSelected ? "text-gray-600" : "text-gray-500"
                    )}>
                      {currency.symbol}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-2 pt-2 border-t">
          <p className="text-[10px] text-center text-gray-400 leading-tight">
            Payment processed in GHS
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
