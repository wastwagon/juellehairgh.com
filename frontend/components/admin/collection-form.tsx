"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (collection) {
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
              
              {/* File Upload */}
              <div className="mb-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    setUploadingImage(true);
                    const localPreviewUrl = URL.createObjectURL(file);
                    setImagePreview(localPreviewUrl);

                    try {
                      const uploadFormData = new FormData();
                      uploadFormData.append("file", file);

                      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
                      if (!token) throw new Error("Not authenticated");

                      const response = await api.post("/admin/upload/collection", uploadFormData, {
                        headers: {
                          Authorization: `Bearer ${token}`,
                          "Content-Type": "multipart/form-data",
                        },
                      });

                      if (response.data?.url) {
                        const uploadedUrl = response.data.url;
                        setFormData({ ...formData, image: uploadedUrl });
                        URL.revokeObjectURL(localPreviewUrl);
                        setImagePreview(uploadedUrl);
                        setTimeout(() => {
                          setUploadingImage(false);
                          e.target.value = "";
                        }, 1000);
                      }
                    } catch (error: any) {
                      console.error("Error uploading image:", error);
                      alert(error.response?.data?.message || error.message || "Failed to upload image.");
                      URL.revokeObjectURL(localPreviewUrl);
                      setImagePreview(null);
                      setUploadingImage(false);
                      e.target.value = "";
                    }
                  }}
                  disabled={uploadingImage}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {uploadingImage ? "Uploading..." : "Upload image file (max 10MB) - Auto-uploads on selection"}
                </p>
              </div>

              {/* Image Preview */}
              {(imagePreview || formData.image) && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    {uploadingImage ? "Uploading image..." : "Collection Image"}
                  </p>
                  <div className="relative inline-block">
                    <img
                      src={imagePreview || formData.image}
                      alt="Collection preview"
                      className="w-48 h-48 object-cover rounded-lg border-2 border-gray-300 shadow-lg"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        // Try backend API fallback if direct path fails
                        if (!img.src.includes("http") && !img.src.startsWith("/media/")) {
                          const filename = (imagePreview || formData.image).split("/").pop();
                          if (filename) {
                            img.src = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001/api'}/admin/upload/media/collections/${filename}`;
                          }
                        }
                      }}
                    />
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg">
                        <div className="text-white text-sm font-medium flex items-center gap-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                          Uploading...
                        </div>
                      </div>
                    )}
                    {!uploadingImage && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, image: "" });
                          setImagePreview(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded shadow-lg hover:bg-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* URL Input (Fallback) */}
              <div className="mt-3">
                <label className="block text-xs font-medium mb-1 text-gray-600">Or enter image URL:</label>
                <Input
                  type="text"
                  value={formData.image}
                  onChange={(e) => {
                    setFormData({ ...formData, image: e.target.value });
                    setImagePreview(e.target.value || null);
                  }}
                  placeholder="/media/collections/image.jpg or https://example.com/image.jpg"
                  className="text-sm"
                />
              </div>
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



