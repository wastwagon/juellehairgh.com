"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Zap, Plus, Edit, Trash2, X, Save, Clock } from "lucide-react";
import { toast } from "sonner";

interface FlashSale {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  discountPercent: number;
  isActive: boolean;
  createdAt: string;
  products?: Array<{
    product: {
      id: string;
      title: string;
      slug: string;
      images: string[];
      priceGhs: number;
    };
  }>;
}

export function AdminFlashSales() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingSale, setEditingSale] = useState<FlashSale | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    discountPercent: 0,
    productIds: [] as string[],
    isActive: true,
  });

  const { data: flashSales, isLoading } = useQuery<FlashSale[]>({
    queryKey: ["admin", "flash-sales"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get("/admin/flash-sales", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
  });

  const { data: products } = useQuery<any[]>({
    queryKey: ["admin", "products", "all"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get("/admin/products?limit=1000", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data?.products || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      return api.post("/admin/flash-sales", {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "flash-sales"] });
      toast.success("Flash sale created successfully!");
      setShowForm(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create flash sale");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> & { startDate?: string; endDate?: string } }) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const payload: any = { ...data };
      if (data.startDate) payload.startDate = new Date(data.startDate).toISOString();
      if (data.endDate) payload.endDate = new Date(data.endDate).toISOString();
      return api.put(`/admin/flash-sales/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "flash-sales"] });
      toast.success("Flash sale updated successfully!");
      setShowForm(false);
      setEditingSale(null);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update flash sale");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      return api.delete(`/admin/flash-sales/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "flash-sales"] });
      toast.success("Flash sale deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete flash sale");
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      discountPercent: 0,
      productIds: [],
      isActive: true,
    });
  };

  const handleEdit = (sale: FlashSale) => {
    setEditingSale(sale);
    const startDate = new Date(sale.startDate).toISOString().slice(0, 16);
    const endDate = new Date(sale.endDate).toISOString().slice(0, 16);
    setFormData({
      title: sale.title,
      description: sale.description || "",
      startDate,
      endDate,
      discountPercent: Number(sale.discountPercent),
      productIds: sale.products?.map((p) => p.product.id) || [],
      isActive: sale.isActive,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSale) {
      updateMutation.mutate({ id: editingSale.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this flash sale?")) {
      deleteMutation.mutate(id);
    }
  };

  const toggleProduct = (productId: string) => {
    setFormData({
      ...formData,
      productIds: formData.productIds.includes(productId)
        ? formData.productIds.filter((id) => id !== productId)
        : [...formData.productIds, productId],
    });
  };

  const isActive = (sale: FlashSale) => {
    const now = new Date();
    const start = new Date(sale.startDate);
    const end = new Date(sale.endDate);
    return sale.isActive && now >= start && now <= end;
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading flash sales...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Flash Sales</h1>
          <p className="text-gray-600 mt-1">Manage limited-time flash sales with countdown timers</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingSale(null); resetForm(); }}>
          <Plus className="h-4 w-4 mr-2" />
          New Flash Sale
        </Button>
      </div>

      {/* Flash Sales List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {flashSales?.map((sale) => {
          const active = isActive(sale);
          return (
            <Card key={sale.id} className={active ? "border-2 border-red-200 bg-red-50/30" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    {sale.title}
                  </CardTitle>
                  {active && (
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded animate-pulse">LIVE</span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-bold text-red-600">{Number(sale.discountPercent).toFixed(0)}% OFF</span>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-600">Start: {new Date(sale.startDate).toLocaleString()}</p>
                    <p className="text-gray-600">End: {new Date(sale.endDate).toLocaleString()}</p>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Products: </span>
                    <span className="font-medium">{sale.products?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(sale)} className="flex-1">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(sale.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {flashSales?.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No flash sales found. Create your first flash sale!</p>
          </div>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingSale ? "Edit Flash Sale" : "Create New Flash Sale"}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => { setShowForm(false); setEditingSale(null); resetForm(); }}>
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
                    placeholder="e.g., Black Friday Sale"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Flash sale description"
                    className="min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Start Date & Time *</label>
                    <Input
                      type="datetime-local"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">End Date & Time *</label>
                    <Input
                      type="datetime-local"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Discount Percentage *</label>
                  <Input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={formData.discountPercent}
                    onChange={(e) => setFormData({ ...formData, discountPercent: parseFloat(e.target.value) || 0 })}
                    placeholder="25"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter percentage (e.g., 25 for 25% off)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Products *</label>
                  <div className="border rounded-md p-3 max-h-60 overflow-y-auto">
                    {products && products.length > 0 ? (
                      <div className="space-y-2">
                        {products.map((product) => (
                          <label key={product.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input
                              type="checkbox"
                              checked={formData.productIds.includes(product.id)}
                              onChange={() => toggleProduct(product.id)}
                              className="h-4 w-4"
                            />
                            <span className="text-sm">{product.title}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No products available</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Selected: {formData.productIds.length} product(s)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">
                    Active
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingSale(null); resetForm(); }} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingSale ? "Update Flash Sale" : "Create Flash Sale"}
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
