"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Boxes, Filter } from "lucide-react";
import { ProductVariantForm } from "./product-variant-form";
import { Input } from "@/components/ui/input";

interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  value: string;
  priceGhs?: number;
  stock: number;
  sku?: string;
  product: {
    id: string;
    title: string;
    slug: string;
  };
}

export function AdminProductVariations() {
  const queryClient = useQueryClient();
  const [isMounted, setIsMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [productFilter, setProductFilter] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: variantsData, isLoading } = useQuery<{
    variants: ProductVariant[];
    pagination: any;
  }>({
    queryKey: ["admin", "product-variants", productFilter],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const params = productFilter ? `?productId=${productFilter}` : "";
      const response = await api.get(`/admin/product-variants${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: isMounted && typeof window !== "undefined" && !!localStorage.getItem("token"),
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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      return api.delete(`/admin/product-variants/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "product-variants"] });
    },
  });

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product variant?")) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error: any) {
        alert(error.response?.data?.message || "Failed to delete variant");
      }
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading product variations...</div>;
  }

  const variants = variantsData?.variants || [];
  const pagination = variantsData?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Manage Product Variations</h1>
          <p className="text-gray-600 mt-1">Manage product variants (colors, sizes, etc.)</p>
        </div>
        <Button
          onClick={() => {
            setEditingVariant(null);
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Variation
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              All Product Variations ({pagination?.total || variants.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="">All Products</option>
                {products?.map((product: any) => (
                  <option key={product.id} value={product.id}>
                    {product.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {variants.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold text-gray-900">Product</th>
                    <th className="text-left p-3 font-semibold text-gray-900">Variant Name</th>
                    <th className="text-left p-3 font-semibold text-gray-900">Value</th>
                    <th className="text-left p-3 font-semibold text-gray-900">Price (GHS)</th>
                    <th className="text-left p-3 font-semibold text-gray-900">Stock</th>
                    <th className="text-left p-3 font-semibold text-gray-900">SKU</th>
                    <th className="text-left p-3 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((variant) => (
                    <tr key={variant.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-gray-700">{variant.product.title}</td>
                      <td className="p-3 font-medium text-gray-900">{variant.name}</td>
                      <td className="p-3 text-gray-700">{variant.value}</td>
                      <td className="p-3 text-gray-900 font-semibold">
                        {variant.priceGhs ? `GH₵ ${Number(variant.priceGhs).toFixed(2)}` : "N/A"}
                      </td>
                      <td className="p-3 text-gray-700">{variant.stock}</td>
                      <td className="p-3 text-gray-700 font-mono text-sm">
                        {variant.sku || "N/A"}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingVariant(variant);
                              setShowForm(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(variant.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Boxes className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No product variations found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <ProductVariantForm
          variant={editingVariant || undefined}
          onClose={() => {
            setShowForm(false);
            setEditingVariant(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["admin", "product-variants"] });
          }}
        />
      )}
    </div>
  );
}



