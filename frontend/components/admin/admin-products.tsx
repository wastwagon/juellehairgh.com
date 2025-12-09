"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Product } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Plus, Search, Edit, Trash2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "next/link";
import { ProductForm } from "./product-form";

export function AdminProducts() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [mounted, setMounted] = useState(false);

  // Ensure component only renders client-side content after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token) {
      router.push("/login?redirect=/admin/products");
      return;
    }

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role !== "ADMIN") {
          router.push("/account");
          return;
        }
      } catch (e) {
        router.push("/login?redirect=/admin/products");
        return;
      }
    }
  }, [router, mounted]);

  const { data: productsData, isLoading, refetch } = useQuery<{
    products: Product[];
    pagination: any;
  }>({
    queryKey: ["admin", "products"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get("/products?limit=100", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    enabled: mounted && typeof window !== "undefined" && !!localStorage.getItem("token"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!mounted) throw new Error("Not mounted");
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");
      return api.delete(`/admin/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete product");
    },
  });

  const handleDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.title}"? This action cannot be undone.`)) {
      return;
    }
    deleteMutation.mutate(product.id);
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
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
        <p className="text-gray-600">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Manage Products</h1>
          <p className="text-gray-600 mt-1">View and manage all products</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Products ({productsData?.products?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold text-gray-900">Product</th>
                  <th className="text-left p-3 font-semibold text-gray-900">Price</th>
                  <th className="text-left p-3 font-semibold text-gray-900">Stock</th>
                  <th className="text-left p-3 font-semibold text-gray-900">Status</th>
                  <th className="text-left p-3 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {productsData?.products?.map((product) => {
                  // Helper function to get image URLs (primary and fallback)
                  const getImageUrls = (imagePath: string) => {
                    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001/api';
                    
                    // Handle absolute URLs
                    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
                      return { primary: imagePath, fallback: null };
                    }
                    
                    // Extract filename from any path format
                    // Examples: "/media/products/image.jpg" -> "image.jpg"
                    //          "products/image.jpg" -> "image.jpg"
                    //          "image.jpg" -> "image.jpg"
                    let filename = imagePath;
                    if (imagePath.includes('/')) {
                      filename = imagePath.split('/').pop() || imagePath;
                    }
                    
                    // Primary: API URL (most reliable)
                    const primaryUrl = `${apiBaseUrl}/admin/upload/media/products/${filename}`;
                    
                    // Fallback: Next.js public path (if API fails)
                    const fallbackUrl = imagePath.startsWith('/') ? imagePath : `/media/products/${filename}`;
                    
                    return { primary: primaryUrl, fallback: fallbackUrl };
                  };

                  const firstImage = product.images?.[0];
                  const imageUrls = firstImage ? getImageUrls(firstImage) : null;
                  const placeholderSvg = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect fill="%23e5e7eb" width="48" height="48"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-size="10" font-family="sans-serif"%3ENo Image%3C/text%3E%3C/svg%3E';

                  return (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {imageUrls ? (
                            <img
                              src={imageUrls.primary}
                              alt={product.title}
                              className="w-12 h-12 object-cover rounded"
                              onError={(e) => {
                                const img = e.target as HTMLImageElement;
                                // Try fallback URL if available
                                if (imageUrls.fallback && img.src !== imageUrls.fallback) {
                                  img.src = imageUrls.fallback;
                                } else {
                                  // Final fallback to placeholder SVG
                                  img.src = placeholderSvg;
                                  img.onerror = null; // Prevent infinite loop
                                }
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        <div>
                          <p className="font-medium text-gray-900">{product.title}</p>
                          <p className="text-sm text-gray-500">{product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-gray-900 font-semibold">
                      GH₵ {Number(product.priceGhs).toFixed(2)}
                    </td>
                    <td className="p-3 text-gray-700">
                      {product.variants && product.variants.length > 0 ? (
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500">Variants: {product.variants.length}</span>
                          <span className="text-sm font-medium">
                            Total: {product.variants.reduce((sum, v) => sum + (v.stock || 0), 0)}
                          </span>
                        </div>
                      ) : (
                        product.stock || 0
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          product.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingProduct(product);
                            setShowForm(true);
                          }}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product)}
                          disabled={deleteMutation.isPending}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <Link href="/admin">
          <Button variant="outline">
            ← Back to Dashboard
          </Button>
        </Link>
      </div>

      {showForm && (
        <ProductForm
          product={editingProduct || undefined}
          onClose={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
          onSuccess={() => {
            // Query will automatically refetch
          }}
        />
      )}
    </div>
  );
}

