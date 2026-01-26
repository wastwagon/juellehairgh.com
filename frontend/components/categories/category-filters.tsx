"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Category, Brand } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface CategoryFiltersProps {
  category: Category | undefined;
  filters: any;
  onFiltersChange: (filters: any) => void;
}

export function CategoryFilters({
  category,
  filters,
  onFiltersChange,
}: CategoryFiltersProps) {
  const [priceRange, setPriceRange] = useState([0, 10000]);

  const { data: brands } = useQuery<{ id: string; name: string }[]>({
    queryKey: ["brands"],
    queryFn: async () => {
      const response = await api.get("/products?limit=1000");
      const products = (response.data.products || []).filter(
        (p: any) => p && p.id && p.isActive !== false,
      );
      const uniqueBrands = Array.from(
        new Set(products.map((p: any) => p.brand?.name).filter(Boolean))
      );
      return uniqueBrands.map((name: string) => ({ id: name, name }));
    },
  });

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values);
    onFiltersChange({
      ...filters,
      minPrice: values[0].toString(),
      maxPrice: values[1].toString(),
    });
  };

  const clearFilters = () => {
    setPriceRange([0, 10000]);
    onFiltersChange({
      ...filters,
      minPrice: "",
      maxPrice: "",
      brand: "",
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 space-y-6 sticky top-4">
      <div className="flex items-center justify-between pb-4 border-b">
        <h2 className="text-lg font-bold text-gray-900">Filters</h2>
        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-600 hover:text-gray-900">
          <X className="h-4 w-4 mr-1" />
          Clear All
        </Button>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-sm text-gray-900 mb-4 uppercase tracking-wide">Price Range</h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-600 mb-1 block">Min (GHS)</label>
              <Input
                type="number"
                placeholder="0"
                value={priceRange[0]}
                onChange={(e) =>
                  handlePriceChange([Number(e.target.value) || 0, priceRange[1]])
                }
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-600 mb-1 block">Max (GHS)</label>
              <Input
                type="number"
                placeholder="10000"
                value={priceRange[1]}
                onChange={(e) =>
                  handlePriceChange([priceRange[0], Number(e.target.value) || 10000])
                }
                className="w-full"
              />
            </div>
          </div>
          <div className="pt-2">
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={priceRange[1]}
              onChange={(e) => handlePriceChange([priceRange[0], Number(e.target.value)])}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>
      </div>

      {/* Brands */}
      {brands && brands.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm text-gray-900 mb-4 uppercase tracking-wide">Brand</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            {brands.map((brand) => (
              <label key={brand.id} className="flex items-center gap-3 cursor-pointer group hover:bg-gray-50 p-2 rounded-md transition-colors">
                <input
                  type="checkbox"
                  checked={filters.brand === brand.id}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      brand: e.target.checked ? brand.id : "",
                    })
                  }
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">{brand.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Subcategories */}
      {category?.children && category.children.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm text-gray-900 mb-4 uppercase tracking-wide">Subcategories</h3>
          <div className="space-y-2">
            {category.children.map((subcat) => (
              <a
                key={subcat.id}
                href={`/categories/${subcat.slug}`}
                className="block text-sm text-gray-600 hover:text-primary transition-colors py-2 px-2 rounded-md hover:bg-gray-50"
              >
                {subcat.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

