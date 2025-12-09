"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, GripVertical, Plus, X, Search } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

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

interface Collection {
  id: string;
  name: string;
  slug: string;
}

export function CollectionProductsManager({ collectionId }: { collectionId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);

  const { data: collection } = useQuery<Collection>({
    queryKey: ["admin", "collection", collectionId],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get(`/admin/collections/${collectionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
  });

  const { data: collectionProducts, isLoading } = useQuery<CollectionProduct[]>({
    queryKey: ["admin", "collection", collectionId, "products"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get(`/admin/collections/${collectionId}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
  });

  const { data: allProducts } = useQuery<any[]>({
    queryKey: ["admin", "products", "all", searchQuery],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get(`/admin/products?search=${encodeURIComponent(searchQuery || "")}&limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.products || [];
    },
    enabled: showAddProduct,
  });

  const updatePositionsMutation = useMutation({
    mutationFn: async (updates: { id: string; position: number }[]) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      return api.put(`/admin/collections/${collectionId}/products/positions`, { updates }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "collection", collectionId, "products"] });
      toast.success("Product order updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update product order");
    },
  });

  const addProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      return api.post(`/admin/collections/${collectionId}/products`, { productId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "collection", collectionId, "products"] });
      toast.success("Product added to collection!");
      setShowAddProduct(false);
      setSearchQuery("");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add product");
    },
  });

  const removeProductMutation = useMutation({
    mutationFn: async (collectionProductId: string) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      return api.delete(`/admin/collections/${collectionId}/products/${collectionProductId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "collection", collectionId, "products"] });
      toast.success("Product removed from collection!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to remove product");
    },
  });

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    const sortedProducts = [...(collectionProducts || [])].sort((a, b) => a.position - b.position);
    const draggedIndex = sortedProducts.findIndex((p) => p.id === draggedItem);
    const targetIndex = sortedProducts.findIndex((p) => p.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newProducts = [...sortedProducts];
    const [removed] = newProducts.splice(draggedIndex, 1);
    newProducts.splice(targetIndex, 0, removed);

    // Update positions
    const updates = newProducts.map((product, index) => ({
      id: product.id,
      position: index,
    }));

    updatePositionsMutation.mutate(updates);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const availableProducts = allProducts?.filter(
    (product) => !collectionProducts?.some((cp) => cp.productId === product.id)
  ) || [];

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading products...</p>
      </div>
    );
  }

  const sortedProducts = [...(collectionProducts || [])].sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push("/admin/collections")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Collections
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {collection?.name || "Collection"} Products
            </h1>
            <p className="text-gray-600 mt-1">Manage product order in this collection</p>
          </div>
        </div>
        <Button onClick={() => setShowAddProduct(!showAddProduct)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Add Product to Collection</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => { setShowAddProduct(false); setSearchQuery(""); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {availableProducts.length > 0 ? (
                  availableProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => addProductMutation.mutate(product.id)}
                    >
                      {product.images && product.images.length > 0 ? (
                        <div className="relative w-12 h-12 rounded overflow-hidden">
                          <Image
                            src={product.images[0]}
                            alt={product.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-400">No Image</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{product.title}</p>
                        <p className="text-xs text-gray-500">GH₵ {Number(product.priceGhs).toFixed(2)}</p>
                      </div>
                      <Button size="sm" disabled={addProductMutation.isPending}>
                        Add
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    {searchQuery ? "No products found" : "All products are already in this collection"}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products List with Drag & Drop */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({sortedProducts.length})</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Drag and drop to reorder products. The order will be saved automatically.
          </p>
        </CardHeader>
        <CardContent>
          {sortedProducts.length > 0 ? (
            <div className="space-y-2">
              {sortedProducts.map((collectionProduct, index) => (
                <div
                  key={collectionProduct.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, collectionProduct.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, collectionProduct.id)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-3 p-4 border rounded-lg bg-white hover:bg-gray-50 cursor-move transition-all ${
                    draggedItem === collectionProduct.id ? "opacity-50" : ""
                  }`}
                >
                  <GripVertical className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div className="flex-shrink-0 w-8 text-center text-sm font-medium text-gray-500">
                    {index + 1}
                  </div>
                  {collectionProduct.product.images && collectionProduct.product.images.length > 0 ? (
                    <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={collectionProduct.product.images[0]}
                        alt={collectionProduct.product.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-gray-400">No Image</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/admin/products/${collectionProduct.product.id}`}
                      className="font-medium text-gray-900 hover:text-primary block truncate"
                    >
                      {collectionProduct.product.title}
                    </Link>
                    <p className="text-sm text-gray-500">GH₵ {Number(collectionProduct.product.priceGhs).toFixed(2)}</p>
                  </div>
                  <Button
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
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No products in this collection yet.</p>
              <Button onClick={() => setShowAddProduct(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Products
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
