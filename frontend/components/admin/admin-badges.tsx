"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag, Plus, Edit, Trash2, X, Save, Star } from "lucide-react";
import { toast } from "sonner";

interface BadgeTemplate {
  id: string;
  name: string;
  label: string;
  color: string;
  textColor: string;
  style: string;
  isPredefined: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function AdminBadges() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<BadgeTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    label: "",
    color: "#3B82F6",
    textColor: "#FFFFFF",
    style: "rounded",
    isPredefined: false,
  });

  const { data: templates, isLoading } = useQuery<BadgeTemplate[]>({
    queryKey: ["admin", "badges", "templates"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get("/badges/admin/templates", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      return api.post("/badges/admin/templates", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "badges", "templates"] });
      toast.success("Badge template created successfully!");
      setShowForm(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create badge template");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> & { isActive?: boolean } }) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      return api.put(`/badges/admin/templates/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "badges", "templates"] });
      toast.success("Badge template updated successfully!");
      setShowForm(false);
      setEditingTemplate(null);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update badge template");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      return api.delete(`/badges/admin/templates/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "badges", "templates"] });
      toast.success("Badge template deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete badge template");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      label: "",
      color: "#3B82F6",
      textColor: "#FFFFFF",
      style: "rounded",
      isPredefined: false,
    });
  };

  const handleEdit = (template: BadgeTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      label: template.label,
      color: template.color,
      textColor: template.textColor,
      style: template.style,
      isPredefined: template.isPredefined,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTemplate) {
      // Don't update name for existing templates
      const { name, ...updateData } = formData;
      updateMutation.mutate({ id: editingTemplate.id, data: updateData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this badge template?")) {
      deleteMutation.mutate(id);
    }
  };

  const getBadgeStyle = (template: BadgeTemplate) => {
    const baseStyle = {
      backgroundColor: template.color,
      color: template.textColor,
    };

    const borderRadius = {
      rounded: "rounded-md",
      pill: "rounded-full",
      square: "rounded-none",
    }[template.style] || "rounded-md";

    return { ...baseStyle, borderRadius };
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading badge templates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Badge Templates</h1>
          <p className="text-gray-600 mt-1">Create and manage product badge templates</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingTemplate(null); resetForm(); }}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Badge Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates?.map((template) => (
          <Card key={template.id} className={template.isPredefined ? "border-2 border-yellow-200" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {template.isPredefined && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                  {template.name}
                </CardTitle>
                {!template.isActive && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Inactive</span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Badge Preview */}
                <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                  <span
                    className="px-4 py-2 text-sm font-medium"
                    style={getBadgeStyle(template)}
                  >
                    {template.label}
                  </span>
                </div>

                {/* Template Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Label:</span>
                    <span className="font-medium">{template.label}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Style:</span>
                    <span className="font-medium capitalize">{template.style}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Colors:</span>
                    <div className="flex gap-1">
                      <div
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: template.color }}
                        title={`Background: ${template.color}`}
                      />
                      <div
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: template.textColor }}
                        title={`Text: ${template.textColor}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(template)}
                    className="flex-1"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  {!template.isPredefined && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {templates?.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No badge templates found. Create your first template!</p>
          </div>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingTemplate ? "Edit Badge Template" : "Create New Badge Template"}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => { setShowForm(false); setEditingTemplate(null); resetForm(); }}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name (Code) *</label>
                  <Input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase().replace(/\s+/g, "_") })}
                    placeholder="e.g., NEW, BEST, SALE"
                    disabled={!!editingTemplate}
                    className="uppercase"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This is the code used in products (e.g., "NEW", "BEST"). Cannot be changed after creation.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Display Label *</label>
                  <Input
                    type="text"
                    required
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="e.g., New Arrival, Best Seller, On Sale"
                  />
                  <p className="text-xs text-gray-500 mt-1">This is what users will see on the badge.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Background Color</label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        placeholder="#3B82F6"
                        pattern="^#[0-9A-Fa-f]{6}$"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Text Color</label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData.textColor}
                        onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                        className="w-16 h-10"
                      />
                      <Input
                        type="text"
                        value={formData.textColor}
                        onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                        placeholder="#FFFFFF"
                        pattern="^#[0-9A-Fa-f]{6}$"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Style *</label>
                  <select
                    value={formData.style}
                    onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  >
                    <option value="rounded">Rounded</option>
                    <option value="pill">Pill (Fully Rounded)</option>
                    <option value="square">Square</option>
                  </select>
                </div>

                {editingTemplate && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={editingTemplate.isActive}
                      onChange={(e) => {
                        updateMutation.mutate({
                          id: editingTemplate.id,
                          data: { isActive: e.target.checked },
                        });
                      }}
                      className="h-4 w-4"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium">
                      Active (visible in product form)
                    </label>
                  </div>
                )}

                {/* Preview */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium mb-2 text-gray-600">Preview:</p>
                  <div className="flex items-center justify-center">
                    <span
                      className="px-4 py-2 text-sm font-medium"
                      style={{
                        backgroundColor: formData.color,
                        color: formData.textColor,
                        borderRadius:
                          formData.style === "pill"
                            ? "9999px"
                            : formData.style === "square"
                            ? "0"
                            : "0.375rem",
                      }}
                    >
                      {formData.label || "Badge Preview"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingTemplate(null); resetForm(); }} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingTemplate ? "Update Template" : "Create Template"}
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
