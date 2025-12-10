"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Plus, Edit, Trash2, X, Save, GripVertical, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface TrustBadge {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  image?: string;
  link?: string;
  isActive: boolean;
  position: number;
  createdAt: string;
}

export function AdminTrustBadges() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingBadge, setEditingBadge] = useState<TrustBadge | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    icon: "",
    image: "",
    link: "",
    isActive: true,
    position: 0,
  });

  const { data: badges, isLoading } = useQuery<TrustBadge[]>({
    queryKey: ["admin", "trust-badges"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get("/admin/trust-badges", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      return api.post("/admin/trust-badges", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "trust-badges"] });
      toast.success("Trust badge created successfully!");
      setShowForm(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create trust badge");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      return api.put(`/admin/trust-badges/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "trust-badges"] });
      toast.success("Trust badge updated successfully!");
      setShowForm(false);
      setEditingBadge(null);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update trust badge");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      return api.delete(`/admin/trust-badges/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "trust-badges"] });
      toast.success("Trust badge deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete trust badge");
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      icon: "",
      image: "",
      link: "",
      isActive: true,
      position: 0,
    });
  };

  const handleEdit = (badge: TrustBadge) => {
    setEditingBadge(badge);
    setFormData({
      title: badge.title,
      description: badge.description || "",
      icon: badge.icon || "",
      image: badge.image || "",
      link: badge.link || "",
      isActive: badge.isActive,
      position: badge.position,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBadge) {
      updateMutation.mutate({ id: editingBadge.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this trust badge?")) {
      deleteMutation.mutate(id);
    }
  };

  const getImageUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith("/")) return url;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `/${url}`;
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading trust badges...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Trust Badges</h1>
          <p className="text-gray-600 mt-1">Manage trust badges displayed on the homepage</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingBadge(null); resetForm(); }}>
          <Plus className="h-4 w-4 mr-2" />
          New Badge
        </Button>
      </div>

      {/* Trust Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges?.map((badge) => (
          <Card key={badge.id} className={badge.isActive ? "" : "opacity-60"}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  {badge.title}
                </CardTitle>
                {badge.isActive && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Badge Preview */}
                <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                  {badge.image ? (
                    <div className="relative w-16 h-16">
                      <Image
                        src={getImageUrl(badge.image) || ""}
                        alt={badge.title}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : badge.icon ? (
                    <div className="text-4xl">{badge.icon}</div>
                  ) : (
                    <Shield className="h-16 w-16 text-gray-300" />
                  )}
                </div>

                {badge.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{badge.description}</p>
                )}

                {badge.link && (
                  <p className="text-xs text-primary truncate">{badge.link}</p>
                )}

                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(badge)} className="flex-1">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(badge.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {badges?.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No trust badges found. Create your first badge!</p>
          </div>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingBadge ? "Edit Trust Badge" : "Create New Trust Badge"}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => { setShowForm(false); setEditingBadge(null); resetForm(); }}>
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
                    placeholder="e.g., Secure Payment, Free Shipping"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the trust badge"
                    className="min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Icon (Emoji or Unicode)</label>
                  <Input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="e.g., 🔒, ✓, ⭐"
                  />
                  <p className="text-xs text-gray-500 mt-1">Use an emoji or icon character</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Image URL</label>
                  <Input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://example.com/badge.png"
                  />
                  <p className="text-xs text-gray-500 mt-1">If provided, image will be used instead of icon</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Link (Optional)</label>
                  <Input
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="https://example.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional link when badge is clicked</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium">
                      Active (visible on homepage)
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Position</label>
                  <Input
                    type="number"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                </div>

                {/* Preview */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium mb-2 text-gray-600">Preview:</p>
                  <div className="flex items-center justify-center p-4 bg-white rounded border">
                    {formData.image ? (
                      <div className="relative w-16 h-16">
                        <Image
                          src={getImageUrl(formData.image) || ""}
                          alt={formData.title}
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : formData.icon ? (
                      <div className="text-4xl">{formData.icon}</div>
                    ) : (
                      <Shield className="h-16 w-16 text-gray-300" />
                    )}
                    <div className="ml-4">
                      <p className="font-semibold">{formData.title || "Badge Title"}</p>
                      {formData.description && (
                        <p className="text-sm text-gray-600">{formData.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingBadge(null); resetForm(); }} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingBadge ? "Update Badge" : "Create Badge"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
