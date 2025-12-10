"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  value: string;
  priceGhs?: number;
  stock: number;
  sku?: string;
}

interface ProductVariantFormProps {
  variant?: ProductVariant;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ProductVariantForm({ variant, onClose, onSuccess }: ProductVariantFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    productId: "",
    name: "",
    value: "",
    priceGhs: "",
    stock: 0,
    sku: "",
  });

  const { data: products } = useQuery({
    queryKey: ["admin", "products", "all"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get("/products?limit=1000", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.products || [];
    },
  });

  useEffect(() => {
    if (variant) {
      setFormData({
        productId: variant.productId || "",
        name: variant.name || "",
        value: variant.value || "",
        priceGhs: variant.priceGhs?.toString() || "",
        stock: variant.stock || 0,
        sku: variant.sku || "",
      });
    }
  }, [variant]);

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const payload = {
        ...data,
        priceGhs: data.priceGhs ? parseFloat(data.priceGhs) : null,
        stock: parseInt(data.stock.toString()),
      };
      return api.post("/admin/product-variants", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "product-variants"] });
      onSuccess?.();
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const payload = {
        ...data,
        priceGhs: data.priceGhs ? parseFloat(data.priceGhs) : null,
        stock: parseInt(data.stock.toString()),
      };
      return api.put(`/admin/product-variants/${variant?.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "product-variants"] });
      onSuccess?.();
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (variant) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{variant ? "Edit Product Variant" : "Add New Product Variant"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Product *</label>
              <select
                required
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                disabled={!!variant}
              >
                <option value="">Select Product</option>
                {products?.map((product: any) => (
                  <option key={product.id} value={product.id}>
                    {product.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Variant Name *</label>
                <Input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Color, Size, Length"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Variant Value *</label>
                <Input
                  type="text"
                  required
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="e.g., Black, Large, 22 inches"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Price (GHS)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.priceGhs}
                  onChange={(e) => setFormData({ ...formData, priceGhs: e.target.value })}
                  placeholder="Optional - overrides product price"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to use product base price
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Stock *</label>
                <Input
                  type="number"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">SKU</label>
              <Input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="Optional - unique SKU for this variant"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Saving..." : variant ? "Update Variant" : "Create Variant"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}



