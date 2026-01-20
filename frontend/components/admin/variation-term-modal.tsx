"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { ProductVariant } from "@/types";
import { toast } from "sonner";

interface VariationTermModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: VariationTermData) => void;
  attributeName: string;
  termName: string;
  termId?: string;
  existingVariant?: ProductVariant | null;
}

export interface VariationTermData {
  regularPrice: number;
  salePrice: number;
  stock: number;
  sku: string;
}

export function VariationTermModal({
  isOpen,
  onClose,
  onSave,
  attributeName,
  termName,
  termId,
  existingVariant,
}: VariationTermModalProps) {
  const [formData, setFormData] = useState<VariationTermData>({
    regularPrice: 0,
    salePrice: 0,
    stock: 0,
    sku: "",
  });

  // Load existing variant data when modal opens or variant changes
  useEffect(() => {
    if (isOpen && existingVariant) {
      setFormData({
        regularPrice: existingVariant.priceGhs ? Number(existingVariant.priceGhs) : 0,
        salePrice: existingVariant.compareAtPriceGhs ? Number(existingVariant.compareAtPriceGhs) : 0,
        stock: existingVariant.stock || 0,
        sku: existingVariant.sku || "",
      });
    } else if (isOpen) {
      // Reset form for new variation
      setFormData({
        regularPrice: 0,
        salePrice: 0,
        stock: 0,
        sku: "",
      });
    }
  }, [isOpen, existingVariant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.stock < 0) {
      toast.error("Stock quantity cannot be negative");
      return;
    }
    if (formData.regularPrice < 0) {
      toast.error("Regular price cannot be negative");
      return;
    }
    if (formData.salePrice < 0) {
      toast.error("Sale price cannot be negative");
      return;
    }
    if (formData.salePrice > 0 && formData.salePrice >= formData.regularPrice) {
      toast.error("Sale price must be lower than regular price");
      return;
    }
    
    try {
      await onSave(formData);
      toast.success("Variation saved successfully!", {
        description: `${attributeName}: ${termName} - Price: GH₵${formData.regularPrice}${formData.salePrice > 0 ? ` (Sale: GH₵${formData.salePrice})` : ''}`,
      });
      onClose();
    } catch (error) {
      toast.error("Failed to save variation");
    }
  };

  // Use React Portal to render modal outside the ProductForm's DOM hierarchy
  // This ensures the modal appears above all other content regardless of z-index stacking context
  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="variation-modal-title"
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 id="variation-modal-title" className="text-xl font-bold text-gray-900">
            Variation Details: {attributeName} - {termName}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close modal">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Regular Price (GH₵) *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.regularPrice || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    regularPrice: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Sale Price (GH₵)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.salePrice || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    salePrice: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">
                Set a sale price lower than the regular price. Leave as 0.00 if not on sale.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Stock Quantity *
              </label>
              <Input
                type="number"
                min="0"
                required
                value={formData.stock ?? ""}
                onChange={(e) => {
                  const value = e.target.value === "" ? 0 : parseInt(e.target.value);
                  setFormData({
                    ...formData,
                    stock: isNaN(value) ? 0 : value,
                  });
                }}
              />
              <p className="text-xs text-gray-500 mt-1">
                Stock = 0 means out of stock. Stock &gt; 0 means in stock.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">SKU</label>
              <Input
                type="text"
                value={formData.sku || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sku: e.target.value,
                  })
                }
                placeholder="Optional - unique SKU for this variation"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  // Use React Portal to render modal outside the ProductForm's DOM hierarchy
  // This ensures proper z-index stacking and prevents event propagation issues
  if (typeof window !== "undefined" && document.body) {
    return createPortal(modalContent, document.body);
  }

  return null;
}
