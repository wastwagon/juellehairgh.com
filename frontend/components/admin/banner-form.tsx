"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Upload, Check } from "lucide-react";
import { Category } from "@/types";

interface BannerCategory {
  id: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  isActive: boolean;
  position: number;
  startDate?: string;
  endDate?: string;
  categories?: BannerCategory[];
}

interface BannerFormProps {
  banner?: Banner;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BannerForm({ banner, onClose, onSuccess }: BannerFormProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image: "",
    link: "",
    isActive: true,
    position: 0,
    startDate: "",
    endDate: "",
  });

  // Fetch all categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get("/admin/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data || [];
    },
  });

  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title || "",
        subtitle: banner.subtitle || "",
        image: banner.image || "",
        link: banner.link || "",
        isActive: banner.isActive ?? true,
        position: banner.position || 0,
        startDate: banner.startDate ? new Date(banner.startDate).toISOString().split("T")[0] : "",
        endDate: banner.endDate ? new Date(banner.endDate).toISOString().split("T")[0] : "",
      });
      // Set selected categories
      if (banner.categories && banner.categories.length > 0) {
        setSelectedCategoryIds(banner.categories.map((bc: BannerCategory) => bc.categoryId));
      }
    }
  }, [banner]);

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const payload = {
        ...data,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
        position: parseInt(data.position.toString()),
        categoryIds: selectedCategoryIds,
      };
      return api.post("/admin/banners", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "banners"] });
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
        startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
        position: parseInt(data.position.toString()),
        categoryIds: selectedCategoryIds,
      };
      return api.put(`/admin/banners/${banner?.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "banners"] });
      onSuccess?.();
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (banner) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");

      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/admin/upload/banner", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data?.url) {
        setFormData((prev) => ({ ...prev, image: response.data.url }));
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(error.response?.data?.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending || uploading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{banner ? "Edit Banner" : "Add New Banner"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <Input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subtitle</label>
              <Input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Banner Image *</label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="/media/banners/banner.jpg or URL"
                    className="flex-1"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      "Uploading..."
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </>
                    )}
                  </Button>
                </div>
                {formData.image && (
                  <div className="mt-2 relative w-full h-32 border rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={
                        formData.image.startsWith("/")
                          ? `/api${formData.image}`
                          : formData.image.startsWith("http")
                          ? formData.image
                          : `/api/media/banners/${formData.image}`
                      }
                      alt="Banner preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Link URL</label>
              <Input
                type="text"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="/products/example (optional if categories selected)"
              />
              <p className="text-xs text-gray-500 mt-1">
                If categories are selected, the banner will link to products from those categories. Otherwise, use this link.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Select Categories (Optional)</label>
              <p className="text-xs text-gray-500 mb-3">
                Select one or more categories. Products from these categories will be shown when users click this banner.
              </p>
              <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
                {categories.length === 0 ? (
                  <p className="text-sm text-gray-500">No categories available</p>
                ) : (
                  categories.map((category) => {
                    const isSelected = selectedCategoryIds.includes(category.id);
                    return (
                      <label
                        key={category.id}
                        className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategoryIds([...selectedCategoryIds, category.id]);
                            } else {
                              setSelectedCategoryIds(selectedCategoryIds.filter((id) => id !== category.id));
                            }
                          }}
                          className="rounded text-primary focus:ring-primary"
                        />
                        <span className="text-sm flex-1">{category.name}</span>
                        {isSelected && <Check className="h-4 w-4 text-primary" />}
                      </label>
                    );
                  })
                )}
              </div>
              {selectedCategoryIds.length > 0 && (
                <p className="text-xs text-primary mt-2 font-medium">
                  {selectedCategoryIds.length} categor{selectedCategoryIds.length === 1 ? "y" : "ies"} selected
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Position</label>
                <Input
                  type="number"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center gap-2 pt-8">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Saving..." : banner ? "Update Banner" : "Create Banner"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}









