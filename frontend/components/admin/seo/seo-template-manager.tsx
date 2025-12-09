"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Plus, Edit, Trash2, Star, X, Save } from "lucide-react";
import { toast } from "sonner";

interface SEOTemplate {
  id: string;
  name: string;
  type: string;
  titleTemplate: string;
  metaTemplate: string;
  variables: any;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export function SeoTemplateManager() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SEOTemplate | null>(null);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [formData, setFormData] = useState({
    name: "",
    type: "product",
    titleTemplate: "",
    metaTemplate: "",
    variables: {},
    isDefault: false,
  });

  const { data: templates, isLoading } = useQuery<SEOTemplate[]>({
    queryKey: ["seo", "templates", selectedType],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const url = selectedType === "all" 
        ? "/seo/templates" 
        : `/seo/templates?type=${selectedType}`;
      const response = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      return api.post("/seo/templates", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo", "templates"] });
      toast.success("Template created successfully!");
      setShowForm(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create template");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      return api.put(`/seo/templates/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo", "templates"] });
      toast.success("Template updated successfully!");
      setShowForm(false);
      setEditingTemplate(null);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update template");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      return api.delete(`/seo/templates/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo", "templates"] });
      toast.success("Template deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete template");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      type: "product",
      titleTemplate: "",
      metaTemplate: "",
      variables: {},
      isDefault: false,
    });
  };

  const handleEdit = (template: SEOTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      titleTemplate: template.titleTemplate,
      metaTemplate: template.metaTemplate,
      variables: template.variables || {},
      isDefault: template.isDefault,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteMutation.mutate(id);
    }
  };

  const availableVariables = {
    product: ["{title}", "{price}", "{brand}", "{category}", "{sku}"],
    category: ["{name}", "{description}", "{productCount}"],
    page: ["{title}", "{content}"],
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading templates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">SEO Templates</h1>
          <p className="text-gray-600 mt-1">Create and manage reusable SEO templates</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingTemplate(null); resetForm(); }}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Filter by Type */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Button
              variant={selectedType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType("all")}
            >
              All Types
            </Button>
            <Button
              variant={selectedType === "product" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType("product")}
            >
              Products
            </Button>
            <Button
              variant={selectedType === "category" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType("category")}
            >
              Categories
            </Button>
            <Button
              variant={selectedType === "page" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType("page")}
            >
              Pages
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Templates List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates?.map((template) => (
          <Card key={template.id} className={template.isDefault ? "border-2 border-primary" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {template.isDefault && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                    {template.name}
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1 capitalize">{template.type}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div>
                  <p className="text-xs font-medium text-gray-600">Title Template:</p>
                  <p className="text-sm text-gray-800 truncate">{template.titleTemplate || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">Meta Template:</p>
                  <p className="text-sm text-gray-800 line-clamp-2">{template.metaTemplate || "N/A"}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(template)}
                  className="flex-1"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(template.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {templates?.length === 0 && (
          <div className="col-span-full text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No templates found. Create your first template!</p>
          </div>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingTemplate ? "Edit Template" : "Create New Template"}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => { setShowForm(false); setEditingTemplate(null); resetForm(); }}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Template Name *</label>
                  <Input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Product Default Template"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                    disabled={!!editingTemplate}
                  >
                    <option value="product">Product</option>
                    <option value="category">Category</option>
                    <option value="page">Page</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Title Template *
                    <span className="text-xs text-gray-500 ml-2">
                      Available: {availableVariables[formData.type as keyof typeof availableVariables]?.join(", ")}
                    </span>
                  </label>
                  <Input
                    type="text"
                    required
                    value={formData.titleTemplate}
                    onChange={(e) => setFormData({ ...formData, titleTemplate: e.target.value })}
                    placeholder="e.g., {title} - {brand} | Juelle Hair"
                    maxLength={60}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.titleTemplate.length}/60 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Meta Description Template *
                    <span className="text-xs text-gray-500 ml-2">
                      Available: {availableVariables[formData.type as keyof typeof availableVariables]?.join(", ")}
                    </span>
                  </label>
                  <textarea
                    required
                    value={formData.metaTemplate}
                    onChange={(e) => setFormData({ ...formData, metaTemplate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={4}
                    placeholder="e.g., Shop {title} from {brand}. {description}. Free shipping on orders over GH₵950."
                    maxLength={160}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.metaTemplate.length}/160 characters</p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <label htmlFor="isDefault" className="text-sm font-medium">
                    Set as default template for this type
                  </label>
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
