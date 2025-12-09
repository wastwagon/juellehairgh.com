"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

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
}

interface BannerFormProps {
  banner?: Banner;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BannerForm({ banner, onClose, onSuccess }: BannerFormProps) {
  const queryClient = useQueryClient();
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

  const isLoading = createMutation.isPending || updateMutation.isPending;

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
              <label className="block text-sm font-medium mb-2">Image URL *</label>
              <Input
                type="text"
                required
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://example.com/banner.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Link URL</label>
              <Input
                type="text"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="/products/example"
              />
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





