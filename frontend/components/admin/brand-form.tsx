"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Image as ImageIcon } from "lucide-react";
import { MediaPicker } from "./media-picker";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
}

interface BrandFormProps {
  brand?: Brand;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BrandForm({ brand, onClose, onSuccess }: BrandFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    logo: "",
  });

  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name || "",
        slug: brand.slug || "",
        logo: brand.logo || "",
      });
    }
  }, [brand]);

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      return api.post("/admin/brands", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "brands"] });
      onSuccess?.();
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      return api.put(`/admin/brands/${brand?.id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "brands"] });
      onSuccess?.();
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (brand) {
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
          <CardTitle>{brand ? "Edit Brand" : "Add New Brand"}</CardTitle>
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
              <label className="block text-sm font-medium mb-2">Brand Logo</label>
              <div className="flex flex-col gap-4">
                <MediaPicker 
                  onSelect={(url) => setFormData({ ...formData, logo: url })}
                  title="Select Brand Logo"
                />
              </div>

              {formData.logo && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Logo Preview
                  </p>
                  <div className="relative inline-block group">
                    <img
                      src={formData.logo}
                      alt="Brand preview"
                      className="w-32 h-32 object-contain bg-white rounded-lg border border-gray-200 shadow-sm"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        if (!img.src.includes("http") && !img.src.startsWith("/media/")) {
                          const filename = formData.logo.split("/").pop();
                          if (filename) {
                            img.src = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001/api'}/admin/upload/media/brands/${filename}`;
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logo: "" })}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Saving..." : brand ? "Update Brand" : "Create Brand"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}














