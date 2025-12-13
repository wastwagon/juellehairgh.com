"use client";

import { useState, useEffect, useMemo } from "react";
import { ProductVariant } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useCurrencyStore } from "@/store/currency-store";
import { getShippingStatus } from "@/lib/shipping-time";

interface ProductVariantSelectorProps {
  variants?: ProductVariant[];
  productImages: string[];
  basePrice: number;
  onVariantChange?: (selectedVariants: Record<string, ProductVariant>) => void;
  onImageChange?: (imageIndex: number) => void;
}

export function ProductVariantSelector({
  variants = [],
  productImages = [],
  basePrice,
  onVariantChange,
  onImageChange,
}: ProductVariantSelectorProps) {
  const { displayCurrency, convert } = useCurrencyStore();
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  // Group variants by name (Color, Size, Length, etc.)
  // Handle combined variant names (e.g., "Color / Length") by splitting them
  // Normalize old "Option" and "PA Color" variants to "Color"
  // Deduplicate variants with the same value to prevent duplicates
  const groupedVariants = useMemo(() => {
    const groups: Record<string, ProductVariant[]> = {};
    const seenValues = new Map<string, Set<string>>(); // Track seen values per group
    
    variants.forEach((variant) => {
      let normalizedName = variant.name;
      const nameLower = variant.name.toLowerCase();
      
      // Handle combined variant names (e.g., "Color / Length" or "Color/Length")
      // Split them and create separate entries for each attribute
      if (nameLower.includes(" / ") || nameLower.includes("/")) {
        const parts = variant.name.split(/[\/\s]+/).filter(p => p.trim().length > 0);
        // For combined variants, we need to extract the value for each part
        // But since we're creating separate variants now, this should be rare
        // For now, assign to the first part
        if (parts.length > 0) {
          normalizedName = parts[0].trim();
        }
      }
      
      // Convert old "Option" or "PA Color" variants to "Color"
      if (normalizedName.toLowerCase() === "option" || 
          normalizedName.toLowerCase().includes("pa color") || 
          normalizedName.toLowerCase().includes("pa_color") || 
          normalizedName.toLowerCase().includes("pa-color")) {
        normalizedName = "Color";
      }
      
      const key = normalizedName.toLowerCase();
      if (!groups[key]) {
        groups[key] = [];
        seenValues.set(key, new Set());
      }
      
      // Check if we've already seen this value in this group
      const valueKey = variant.value.toLowerCase().trim();
      const seenSet = seenValues.get(key)!;
      
      if (!seenSet.has(valueKey)) {
        seenSet.add(valueKey);
        // Push variant with normalized name
        groups[key].push({ ...variant, name: normalizedName });
      }
    });
    
    // Sort groups by priority: Color first, then Length, then others alphabetically
    const sortedGroups: Record<string, ProductVariant[]> = {};
    const priority = ['color', 'length', 'size'];
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      const aIndex = priority.indexOf(a);
      const bIndex = priority.indexOf(b);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.localeCompare(b);
    });
    
    sortedKeys.forEach(key => {
      sortedGroups[key] = groups[key];
    });
    
    return sortedGroups;
  }, [variants]);

  // Check if we have color variants
  const colorVariants = useMemo(() => {
    const colorKey = Object.keys(groupedVariants).find(
      (key) => key.includes("color") || key.includes("colour")
    );
    return colorKey ? groupedVariants[colorKey] : [];
  }, [groupedVariants]);

  // Get selected variant price
  const selectedPrice = useMemo(() => {
    const selected = Object.values(selectedVariants)
      .map((variantId) => variants.find((v) => v.id === variantId))
      .find((v) => v?.priceGhs);
    return selected?.priceGhs ? Number(selected.priceGhs) : basePrice;
  }, [selectedVariants, variants, basePrice]);

  // Update parent when variants change
  useEffect(() => {
    if (onVariantChange) {
      const selected = Object.entries(selectedVariants).reduce(
        (acc, [name, variantId]) => {
          const variant = variants.find((v) => v.id === variantId);
          if (variant) {
            acc[name] = variant;
          }
          return acc;
        },
        {} as Record<string, ProductVariant>
      );
      onVariantChange(selected);
    }
  }, [selectedVariants, variants, onVariantChange]);

  // Handle color variant selection - update image
  const handleColorSelect = (variant: ProductVariant, index: number) => {
    const colorKey = Object.keys(groupedVariants).find(
      (key) => key.includes("color") || key.includes("colour")
    );
    if (colorKey) {
      setSelectedVariants((prev) => ({
        ...prev,
        [colorKey]: variant.id,
      }));
      // Try to find corresponding image for this color
      // Assuming images are in same order as color variants
      if (onImageChange && productImages[index]) {
        onImageChange(index);
      }
    }
  };

  const handleVariantSelect = (variantName: string, variantId: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variantName.toLowerCase()]: variantId,
    }));
  };

  if (variants.length === 0) {
    return null;
  }

  // Debug: Log grouped variants to help identify missing attributes
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    console.log("Grouped variants:", groupedVariants);
    console.log("All variants:", variants);
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedVariants).map(([variantName, variantList]) => {
        const isColor = variantName.includes("color") || variantName.includes("colour");
        const selectedId = selectedVariants[variantName.toLowerCase()];
        
        // Get the display name (capitalize first letter, handle special cases)
        const displayName = variantName === "color" ? "Color" : 
                           variantName === "length" ? "Length" :
                           variantName === "size" ? "Size" :
                           variantName.charAt(0).toUpperCase() + variantName.slice(1);

        return (
          <div key={variantName} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
            <label className="block text-sm font-semibold mb-3 text-gray-900">
              {displayName}
              {selectedId && (
                <span className="ml-2 text-primary font-normal text-sm">
                  ({variantList.find((v) => v.id === selectedId)?.value})
                </span>
              )}
            </label>

            {isColor && colorVariants.length > 0 ? (
              // Color swatches with images
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {variantList.map((variant, index) => {
                  const isSelected = selectedId === variant.id;
                  // Use color swatch images from variant.image (enriched from ProductAttributeTerm by backend)
                  let imageUrl: string | null = null;
                  
                  if (variant.image) {
                    // If it's already a full URL, use it as-is
                    if (variant.image.startsWith("http")) {
                      imageUrl = variant.image;
                    } 
                    // If it starts with /media/swatches/, use Next.js API proxy
                    else if (variant.image.startsWith("/media/swatches/")) {
                      const filename = variant.image.split('/').pop() || variant.image;
                      imageUrl = `/api/media/swatches/${filename}`;
                    }
                    // If it's just a filename or path, extract filename and use API proxy
                    else {
                      const filename = variant.image.split('/').pop() || variant.image;
                      // Use Next.js API proxy route for production compatibility
                      imageUrl = `/api/media/swatches/${filename}`;
                    }
                  }

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => {
                        handleColorSelect(variant, index);
                        // Update main product image when color is selected
                        if (onImageChange && variant.image) {
                          // Find the index of this variant's image in product images
                          const imgIndex = productImages.findIndex(img => img === variant.image);
                          if (imgIndex !== -1) {
                            onImageChange(imgIndex);
                          }
                        }
                      }}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        isSelected
                          ? "border-primary ring-2 ring-primary ring-offset-2"
                          : "border-gray-300 hover:border-gray-400"
                      } ${variant.stock === 0 ? "opacity-50" : ""}`}
                      style={{ width: '80px', height: '80px' }}
                      title={variant.value}
                      disabled={variant.stock === 0}
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={variant.value}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            const retryCount = parseInt(img.getAttribute('data-retry') || '0');
                            
                            // Try Next.js API proxy route fallback if direct path fails
                            if (retryCount < 3 && variant.image) {
                              // Extract filename from image path
                              const filename = variant.image.split('/').pop() || variant.image;
                              // Use Next.js API proxy route (same as collection images)
                              const fallbackUrl = `/api/media/swatches/${filename}`;
                              
                              img.setAttribute('data-retry', String(retryCount + 1));
                              img.src = fallbackUrl;
                              return;
                            }
                            
                            // Final fallback: show text
                            img.style.display = 'none';
                            const parent = img.parentElement;
                            if (parent && !parent.querySelector('.fallback-text')) {
                              const fallback = document.createElement('div');
                              fallback.className = 'fallback-text w-full h-full bg-gray-200 flex items-center justify-center';
                              fallback.innerHTML = `<span class="text-xs text-gray-500">${variant.value}</span>`;
                              parent.appendChild(fallback);
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-500 text-center px-1">{variant.value}</span>
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center pointer-events-none">
                          <div className="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-md"></div>
                        </div>
                      )}
                      {variant.stock === 0 && (
                        <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center pointer-events-none">
                          <span className="text-xs text-white font-medium">OOS</span>
                        </div>
                      )}
                      {/* Ship Today badge */}
                      {variant.stock > 0 && (
                        <div className="absolute top-1 left-1 bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm z-10">
                          {getShippingStatus()}
                        </div>
                      )}
                      {/* Variant label overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[11px] text-center py-1 px-1 truncate leading-tight">
                        {variant.value}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              // Size/Length dropdown or buttons
              <div className="flex flex-wrap gap-2">
                {variantList.map((variant) => {
                  const isSelected = selectedId === variant.id;
                  const isOutOfStock = variant.stock === 0;

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => handleVariantSelect(variantName, variant.id)}
                      disabled={isOutOfStock}
                      className={`px-4 py-2 rounded-md border-2 text-sm font-medium transition-all ${
                        isSelected
                          ? "border-primary bg-primary text-white"
                          : isOutOfStock
                          ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "border-gray-300 bg-white text-gray-700 hover:border-primary hover:text-primary"
                      }`}
                    >
                      {variant.value}
                      {variant.priceGhs && variant.priceGhs !== basePrice && (
                        <span className="ml-1 text-xs opacity-75">
                          ({formatCurrency(convert(Number(variant.priceGhs)), displayCurrency)})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Show stock info */}
            {selectedId && (
              <p className="text-xs text-gray-500 mt-2">
                {(() => {
                  const selected = variantList.find((v) => v.id === selectedId);
                  if (selected) {
                    return selected.stock > 0
                      ? `${selected.stock} in stock`
                      : "Out of stock";
                  }
                  return "";
                })()}
              </p>
            )}
          </div>
        );
      })}

      {/* Show price difference if variant has different price */}
      {selectedPrice !== basePrice && (
        <div className="pt-2 border-t">
          <p className="text-sm text-gray-600">
            Variant price:{" "}
            <span className="font-semibold text-gray-900">
              {formatCurrency(convert(selectedPrice), displayCurrency)}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

