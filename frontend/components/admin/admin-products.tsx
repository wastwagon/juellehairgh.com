"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Product } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Plus, Search, Edit, Trash2, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "next/link";
import { ProductForm } from "./product-form";

export function AdminProducts() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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

  const { data: productsData, isLoading } = useQuery<{
    products: Product[];
    pagination: any;
  }>({
    queryKey: ["admin", "products", searchQuery],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      // IMPORTANT: includeInactive=true so admins can still see products set to inactive
      const params: Record<string, string> = {
        limit: "200",
        includeInactive: "true",
      };
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      const response = await api.get("/products", {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    enabled: mounted && typeof window !== "undefined" && !!localStorage.getItem("token"),
  });

  const archiveMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!mounted) throw new Error("Not mounted");
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");
      // Backend implements soft-delete on DELETE /products/:id (sets isActive=false)
      return api.delete(`/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "product"] }); // Invalidate all product detail queries
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product archived (set to inactive)");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to archive product");
    },
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!mounted) throw new Error("Not mounted");
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");
      return api.delete(`/products/${productId}/permanent`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "product"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product permanently deleted");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to permanently delete product");
    },
  });

  const handleArchive = async (product: Product) => {
    if (!confirm(`Archive "${product.title}"? Customers won’t see it, but it stays in admin.`)) {
      return;
    }
    archiveMutation.mutate(product.id);
  };

  const handlePermanentDelete = async (product: Product) => {
    const warning = `PERMANENTLY delete "${product.title}"?\n\nThis cannot be undone.\n\nType DELETE to confirm.`;
    const typed = prompt(warning);
    if (typed !== "DELETE") return;
    permanentDeleteMutation.mutate(product.id);
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
          <Button
            variant="outline"
            onClick={() => setShowSearch((v) => !v)}
          >
            {showSearch ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Close
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Search
              </>
            )}
          </Button>
          <Link href="/admin/products/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {showSearch && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search products by title or description..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setSearchQuery(searchText.trim());
                    }
                  }}
                  className="pl-10 pr-10"
                />
                {searchText && (
                  <button
                    onClick={() => setSearchText("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchText("");
                    setSearchQuery("");
                  }}
                  disabled={!searchText && !searchQuery}
                >
                  Clear
                </Button>
                <Button onClick={() => setSearchQuery(searchText.trim())}>Search</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9001/api';
                    
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
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleArchive(product)}
                          disabled={archiveMutation.isPending || permanentDeleteMutation.isPending}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Archive
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handlePermanentDelete(product)}
                          disabled={archiveMutation.isPending || permanentDeleteMutation.isPending}
                          className="whitespace-nowrap"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete Permanently
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
        <Link href="/admin/products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Product
          </Button>
        </Link>
      </div>

    </div>
  );
}

