"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Image as ImageIcon, Plus, Search, GripVertical } from "lucide-react";
import { MediaPicker } from "./media-picker";
import { toast } from "sonner";
import Image from "next/image";

interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
}

interface CollectionProduct {
  id: string;
  productId: string;
  position: number;
  product: {
    id: string;
    title: string;
    slug: string;
    images: string[];
    priceGhs: number;
  };
}

interface CollectionFormProps {
  collection?: Collection;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CollectionForm({ collection, onClose, onSuccess }: CollectionFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    isActive: true,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showProducts, setShowProducts] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [showAddProduct, setShowAddProduct] = useState(false);

  useEffect(() => {
    if (collection) {
      setFormData({
        name: collection.name || "",
        slug: collection.slug || "",
        description: collection.description || "",
        image: collection.image || "",
        isActive: collection.isActive ?? true,
      });
      setImagePreview(collection.image || null);
    }
  }, [collection]);

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      return api.post("/admin/collections", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "collections"] });
      onSuccess?.();
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      return api.put(`/admin/collections/${collection?.id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "collections"] });
      onSuccess?.();
      onClose();
    },
  });

  // Fetch collection products (only when editing)
  const { data: collectionProducts } = useQuery<CollectionProduct[]>({
    queryKey: ["admin", "collection", collection?.id, "products"],
    queryFn: async () => {
      if (!collection?.id) return [];
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get(`/admin/collections/${collection.id}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!collection?.id && showProducts,
  });

  // Fetch all products for adding to collection
  const { data: allProducts } = useQuery<any[]>({
    queryKey: ["admin", "products", "all", productSearchQuery],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get(`/admin/products?search=${encodeURIComponent(productSearchQuery || "")}&limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.products || [];
    },
    enabled: showAddProduct && !!collection?.id,
  });

  // Add product to collection
  const addProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!collection?.id) throw new Error("Collection ID is required");
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      return api.post(`/admin/collections/${collection.id}/products`, { productId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "collection", collection?.id, "products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "collections"] });
      toast.success("Product added to collection!");
      setShowAddProduct(false);
      setProductSearchQuery("");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add product");
    },
  });

  // Remove product from collection
  const removeProductMutation = useMutation({
    mutationFn: async (collectionProductId: string) => {
      if (!collection?.id) throw new Error("Collection ID is required");
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      return api.delete(`/admin/collections/${collection.id}/products/${collectionProductId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "collection", collection?.id, "products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "collections"] });
      toast.success("Product removed from collection!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to remove product");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (collection) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  
  // Helper function to get product image URL
  const getProductImageUrl = (image: string) => {
    if (!image) return null;
    
    // Handle absolute URLs
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    
    // Handle media library paths (new format: /media/library/filename.jpg)
    if (image.startsWith('/media/library/')) {
      const filename = image.replace('/media/library/', '');
      return `/media/library/${filename}`;
    }
    
    // Handle old product paths
    if (image.startsWith('/media/products/')) {
      const filename = image.replace('/media/products/', '');
      return `/media/products/${filename}`;
    }
    
    // If it's just a filename, assume it's a product image
    return `/media/products/${image}`;
  };
  
  const sortedProducts = [...(collectionProducts || [])].sort((a, b) => a.position - b.position);
  const availableProducts = allProducts?.filter(
    (product) => !collectionProducts?.some((cp) => cp.productId === product.id)
  ) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{collection ? "Edit Collection" : "Add New Collection"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <Input
                type="text"
                required
                value={formData.name}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    name: e.target.value,
                    slug: formData.slug || e.target.value.toLowerCase().replace(/\s+/g, "-"),
                  });
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Slug *</label>
              <Input
                type="text"
                required
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Collection Image</label>
              
              <div className="flex flex-col gap-4">
                <MediaPicker 
                  onSelect={(url) => {
                    setFormData({ ...formData, image: url });
                    setImagePreview(url);
                  }}
                  title="Select Collection Image"
                />
              </div>

              {/* Image Preview */}
              {(imagePreview || formData.image) && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Preview
                  </p>
                  <div className="relative inline-block group">
                    <img
                      src={imagePreview || formData.image}
                      alt="Collection preview"
                      className="w-48 h-48 object-cover rounded-lg border border-gray-200 shadow-md transition-transform group-hover:scale-[1.02]"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        if (!img.src.includes("http") && !img.src.startsWith("/media/")) {
                          const filename = (imagePreview || formData.image).split("/").pop();
                          if (filename) {
                            img.src = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9001/api'}/admin/upload/media/collections/${filename}`;
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, image: "" });
                        setImagePreview(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors"
                      title="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded text-primary focus:ring-primary"
              />
              <label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                Active
              </label>
            </div>

            {/* Products Management Section - Only show when editing */}
            {collection && (
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Products in Collection</h3>
                    <p className="text-sm text-gray-500">
                      {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''} in this collection
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowProducts(!showProducts);
                      if (!showProducts) {
                        queryClient.invalidateQueries({ queryKey: ["admin", "collection", collection.id, "products"] });
                      }
                    }}
                  >
                    {showProducts ? "Hide Products" : "Show Products"}
                  </Button>
                </div>

                {showProducts && (
                  <div className="space-y-4">
                    {/* Current Products List */}
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Current Products</h4>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => setShowAddProduct(!showAddProduct)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Product
                        </Button>
                      </div>

                      {sortedProducts.length > 0 ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {sortedProducts.map((collectionProduct, index) => (
                            <div
                              key={collectionProduct.id}
                              className="flex items-center gap-3 p-3 bg-white border rounded-lg"
                            >
                              <div className="flex-shrink-0 w-6 text-center text-sm font-medium text-gray-500">
                                {index + 1}
                              </div>
                              {collectionProduct.product.images && collectionProduct.product.images.length > 0 ? (
                                <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                                  <Image
                                    src={getProductImageUrl(collectionProduct.product.images[0]) || '/placeholder.png'}
                                    alt={collectionProduct.product.title}
                                    fill
                                    className="object-cover"
                                    onError={(e) => {
                                      const img = e.target as HTMLImageElement;
                                      // Try API proxy as fallback
                                      const imageUrl = collectionProduct.product.images[0];
                                      if (imageUrl && !imageUrl.startsWith('http')) {
                                        const filename = imageUrl.split('/').pop();
                                        if (filename) {
                                          img.src = `/api/media/products/${filename}`;
                                        }
                                      }
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs text-gray-400">No Image</span>
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-gray-900 truncate">
                                  {collectionProduct.product.title}
                                </p>
                                <p className="text-xs text-gray-500">GH₵ {Number(collectionProduct.product.priceGhs).toFixed(2)}</p>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeProductMutation.mutate(collectionProduct.id)}
                                disabled={removeProductMutation.isPending}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p className="mb-2">No products in this collection yet.</p>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => setShowAddProduct(true)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Products
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Add Product Section */}
                    {showAddProduct && (
                      <div className="border rounded-lg p-4 bg-white">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">Add Products</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowAddProduct(false);
                              setProductSearchQuery("");
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-3">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              type="text"
                              placeholder="Search products..."
                              value={productSearchQuery}
                              onChange={(e) => setProductSearchQuery(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                          <div className="max-h-64 overflow-y-auto space-y-2">
                            {availableProducts.length > 0 ? (
                              availableProducts.map((product) => (
                                <div
                                  key={product.id}
                                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                                  onClick={() => addProductMutation.mutate(product.id)}
                                >
                                  {product.images && product.images.length > 0 ? (
                                    <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                                      <Image
                                        src={getProductImageUrl(product.images[0]) || '/placeholder.png'}
                                        alt={product.title}
                                        fill
                                        className="object-cover"
                                        onError={(e) => {
                                          const img = e.target as HTMLImageElement;
                                          // Try API proxy as fallback
                                          const imageUrl = product.images[0];
                                          if (imageUrl && !imageUrl.startsWith('http')) {
                                            const filename = imageUrl.split('/').pop();
                                            if (filename) {
                                              img.src = `/api/media/products/${filename}`;
                                            }
                                          }
                                        }}
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                                      <span className="text-xs text-gray-400">No Image</span>
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{product.title}</p>
                                    <p className="text-xs text-gray-500">GH₵ {Number(product.priceGhs).toFixed(2)}</p>
                                  </div>
                                  <Button
                                    type="button"
                                    size="sm"
                                    disabled={addProductMutation.isPending}
                                  >
                                    Add
                                  </Button>
                                </div>
                              ))
                            ) : (
                              <p className="text-center text-gray-500 py-8">
                                {productSearchQuery ? "No products found" : "All products are already in this collection"}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Saving..." : collection ? "Update Collection" : "Create Collection"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}



