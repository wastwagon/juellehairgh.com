"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Loader2, TrendingUp } from "lucide-react";
import { api } from "@/lib/api";
import { Product } from "@/types";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { useCurrencyStore } from "@/store/currency-store";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { displayCurrency, convert } = useCurrencyStore();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Fetch search suggestions
  const { data: suggestions, isLoading } = useQuery<Product[]>({
    queryKey: ["search-suggestions", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
        return [];
      }
      try {
        const response = await api.get(
          `/products?search=${encodeURIComponent(debouncedQuery)}&limit=8`
        );
        return (response.data?.products || []).filter(
          (p: Product) => p && p.id && p.isActive !== false,
        );
      } catch (error) {
        console.error("Search error:", error);
        return [];
      }
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 5000,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      onClose();
      setSearchQuery("");
    }
  };

  const handleSuggestionClick = (product: Product) => {
    router.push(`/products/${product.slug}`);
    onClose();
    setSearchQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
        {/* Search Input */}
        <form onSubmit={handleSearch} className="relative">
          <div className="flex items-center border-b border-gray-200">
            <div className="pl-6 pr-4">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search products..."
              className="flex-1 py-4 text-base outline-none placeholder:text-gray-400"
            />
            {isLoading && (
              <div className="pr-4">
                <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-4 hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </form>

        {/* Suggestions */}
        <div className="max-h-[60vh] overflow-y-auto">
          {debouncedQuery.length < 2 ? (
            <div className="p-8 text-center text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-base font-medium">Start typing to search</p>
              <p className="text-sm mt-2">Search for products, brands, or categories</p>
            </div>
          ) : isLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 mx-auto text-gray-400 animate-spin" />
              <p className="text-sm text-gray-500 mt-2">Searching...</p>
            </div>
          ) : suggestions && suggestions.length > 0 ? (
            <div className="p-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {suggestions.length} {suggestions.length === 1 ? "result" : "results"} found
              </div>
              {suggestions.map((product) => {
                const imageUrl = product.images?.[0]
                  ? product.images[0].startsWith("/")
                    ? product.images[0]
                    : `/${product.images[0]}`
                  : null;
                const displayPrice = convert(Number(product.priceGhs));

                return (
                  <button
                    key={product.id}
                    onClick={() => handleSuggestionClick(product)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left group"
                  >
                    {imageUrl ? (
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={product.title}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Search className="h-6 w-6 text-gray-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                        {product.title}
                      </h3>
                      {product.brand && (
                        <p className="text-sm text-gray-500 mt-1">
                          {typeof product.brand === "string"
                            ? product.brand
                            : product.brand.name}
                        </p>
                      )}
                      <p className="text-base md:text-lg font-bold text-primary mt-1">
                        {formatCurrency(displayPrice, displayCurrency)}
                      </p>
                    </div>
                    <TrendingUp className="h-5 w-5 text-gray-300 group-hover:text-primary transition-colors flex-shrink-0" />
                  </button>
                );
              })}
              {debouncedQuery && (
                <div className="p-4 border-t border-gray-100">
                  <button
                    onClick={handleSearch}
                    className="w-full py-3 px-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Search className="h-5 w-5" />
                    View all results for "{debouncedQuery}"
                  </button>
                </div>
              )}
            </div>
          ) : debouncedQuery.length >= 2 ? (
            <div className="p-8 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-base font-medium text-gray-900">No products found</p>
              <p className="text-sm text-gray-500 mt-2">
                Try searching with different keywords
              </p>
              <button
                onClick={handleSearch}
                className="mt-4 py-2 px-6 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Search anyway
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

