"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Tag } from "lucide-react";
import { BrandForm } from "./brand-form";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  _count?: { products: number };
}

export function AdminBrands() {
  const queryClient = useQueryClient();
  const [isMounted, setIsMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  // Fix hydration error - only render after client-side mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: brands, isLoading } = useQuery<Brand[]>({
    queryKey: ["admin", "brands"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get("/admin/brands", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: isMounted && typeof window !== "undefined" && !!localStorage.getItem("token"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      return api.delete(`/admin/brands/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "brands"] });
    },
  });

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this brand?")) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error: any) {
        alert(error.response?.data?.message || "Failed to delete brand");
      }
    }
  };

  // Fix hydration error - don't render until mounted on client
  if (!isMounted) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading brands...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Manage Brands</h1>
          <p className="text-gray-600 mt-1">Organize your product brands</p>
        </div>
        <Button
          onClick={() => {
            setEditingBrand(null);
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Brand
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Brands ({brands?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {brands?.map((brand) => (
              <div
                key={brand.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  {brand.logo ? (
                    <img src={brand.logo} alt={brand.name} className="w-10 h-10 object-contain" />
                  ) : (
                    <Tag className="h-5 w-5 text-gray-400" />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{brand.name}</h3>
                    <p className="text-sm text-gray-500">
                      {brand._count?.products || 0} products
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingBrand(brand);
                      setShowForm(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(brand.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <BrandForm
          brand={editingBrand || undefined}
          onClose={() => {
            setShowForm(false);
            setEditingBrand(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["admin", "brands"] });
          }}
        />
      )}
    </div>
  );
}




