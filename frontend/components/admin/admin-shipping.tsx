"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Truck, Plus, Edit, Trash2, GripVertical, Save, X } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  cost?: number | null;
  freeShippingThreshold?: number | null;
  estimatedDays?: string;
  isActive: boolean;
  position: number;
}

interface ShippingZone {
  id: string;
  name: string;
  description?: string;
  regions: string[];
  isActive: boolean;
  position: number;
  methods: ShippingMethod[];
}

export function AdminShipping() {
  const queryClient = useQueryClient();
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
  const [creatingZone, setCreatingZone] = useState(false);
  const [editingMethod, setEditingMethod] = useState<{ method: ShippingMethod; zoneId: string } | null>(null);
  const [creatingMethod, setCreatingMethod] = useState<string | null>(null);
  const [deletingZone, setDeletingZone] = useState<string | null>(null);
  const [deletingMethod, setDeletingMethod] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: zones, isLoading, error } = useQuery<ShippingZone[]>({
    queryKey: ["admin", "shipping-zones"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      try {
        const response = await api.get("/shipping/admin/zones", {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      } catch (err: any) {
        console.error("Error fetching shipping zones:", err);
        if (err.response?.status === 404) {
          throw new Error("Shipping API endpoint not found. Please ensure the backend server is running and the ShippingModule is properly registered.");
        }
        throw err;
      }
    },
    retry: false,
  });

  const createZoneMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      await api.post("/shipping/admin/zones", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      toast.success("Shipping zone created!");
      queryClient.invalidateQueries({ queryKey: ["admin", "shipping-zones"] });
      setCreatingZone(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create shipping zone");
    },
  });

  const updateZoneMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      await api.put(`/shipping/admin/zones/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      toast.success("Shipping zone updated!");
      queryClient.invalidateQueries({ queryKey: ["admin", "shipping-zones"] });
      setEditingZone(null);
    },
  });

  const deleteZoneMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      await api.delete(`/shipping/admin/zones/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      toast.success("Shipping zone deleted!");
      queryClient.invalidateQueries({ queryKey: ["admin", "shipping-zones"] });
      setDeletingZone(null);
    },
  });

  const createMethodMutation = useMutation({
    mutationFn: async ({ zoneId, data }: { zoneId: string; data: any }) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      await api.post(`/shipping/admin/zones/${zoneId}/methods`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      toast.success("Shipping method created!");
      queryClient.invalidateQueries({ queryKey: ["admin", "shipping-zones"] });
      setCreatingMethod(null);
    },
  });

  const updateMethodMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      await api.put(`/shipping/admin/methods/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      toast.success("Shipping method updated!");
      queryClient.invalidateQueries({ queryKey: ["admin", "shipping-zones"] });
      setEditingMethod(null);
    },
  });

  const deleteMethodMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      await api.delete(`/shipping/admin/methods/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      toast.success("Shipping method deleted!");
      queryClient.invalidateQueries({ queryKey: ["admin", "shipping-zones"] });
      setDeletingMethod(null);
    },
  });

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Shipping Zones & Methods</h1>
          <p className="text-gray-600 mt-1">Manage shipping zones and delivery methods</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Shipping Zones & Methods</h1>
          <p className="text-gray-600 mt-1">Manage shipping zones and delivery methods</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading shipping zones...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Shipping Zones & Methods</h1>
          <p className="text-gray-600 mt-1">Manage shipping zones and delivery methods</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-600 mb-4">Error loading shipping zones</p>
            <p className="text-sm text-gray-500">
              {error instanceof Error ? error.message : "An unknown error occurred"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Shipping Zones & Methods</h1>
          <p className="text-gray-600 mt-1">Manage shipping zones and delivery methods</p>
        </div>
        <Button onClick={() => setCreatingZone(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Zone
        </Button>
      </div>

      {!zones || zones.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Shipping Zones</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first shipping zone.</p>
            <Button onClick={() => setCreatingZone(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Zone
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {zones.map((zone) => (
          <Card key={zone.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GripVertical className="h-5 w-5 text-gray-400" />
                  <CardTitle className="text-xl">{zone.name}</CardTitle>
                  <span className="text-sm text-gray-500">
                    ({zone.regions.join(", ")})
                  </span>
                  {!zone.isActive && (
                    <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">Inactive</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingZone(zone)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Zone
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCreatingMethod(zone.id)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Method
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeletingZone(zone.id)}
                    className="min-w-[40px]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {zone.methods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{method.name}</h3>
                        {!method.isActive && (
                          <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">Inactive</span>
                        )}
                      </div>
                      {method.description && (
                        <p className="text-sm text-gray-600 mb-1">{method.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {method.cost !== null && method.cost !== undefined && (
                          <span>Cost: {formatCurrency(Number(method.cost), "GHS")}</span>
                        )}
                        {method.freeShippingThreshold && (
                          <span>Free over: {formatCurrency(Number(method.freeShippingThreshold), "GHS")}</span>
                        )}
                        {method.estimatedDays && <span>Est: {method.estimatedDays}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingMethod({ method, zoneId: zone.id })}
                        className="min-w-[40px]"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeletingMethod(method.id)}
                        className="min-w-[40px]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {zone.methods.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No shipping methods for this zone</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}

      {/* Create Zone Dialog */}
      {creatingZone && (
        <ZoneCreateDialog
          onSave={(data) => createZoneMutation.mutate(data)}
          onCancel={() => setCreatingZone(false)}
        />
      )}

      {/* Edit Zone Dialog */}
      {editingZone && (
        <ZoneEditDialog
          zone={editingZone}
          onSave={(data) => updateZoneMutation.mutate({ id: editingZone.id, data })}
          onCancel={() => setEditingZone(null)}
        />
      )}

      {/* Edit Method Dialog */}
      {editingMethod && (
        <MethodEditDialog
          method={editingMethod.method}
          onSave={(data) => updateMethodMutation.mutate({ id: editingMethod.method.id, data })}
          onCancel={() => setEditingMethod(null)}
        />
      )}

      {/* Create Method Dialog */}
      {creatingMethod && (
        <MethodCreateDialog
          zoneId={creatingMethod}
          onSave={(data) => createMethodMutation.mutate({ zoneId: creatingMethod, data })}
          onCancel={() => setCreatingMethod(null)}
        />
      )}

      {/* Delete Zone Confirmation */}
      <AlertDialog open={!!deletingZone} onOpenChange={() => setDeletingZone(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shipping Zone?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the zone and all its shipping methods. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingZone && deleteZoneMutation.mutate(deletingZone)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Method Confirmation */}
      <AlertDialog open={!!deletingMethod} onOpenChange={() => setDeletingMethod(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shipping Method?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingMethod && deleteMethodMutation.mutate(deletingMethod)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ZoneCreateDialog({
  onSave,
  onCancel,
}: {
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    regions: "",
    isActive: true,
    position: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      regions: formData.regions.split(",").map((r) => r.trim()).filter(Boolean),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Create Shipping Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zone Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Local Delivery"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Optional description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Regions (comma-separated)
              </label>
              <Input
                value={formData.regions}
                onChange={(e) => setFormData({ ...formData, regions: e.target.value })}
                placeholder="Ghana, Nigeria, or Everywhere"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Use "Everywhere" for worldwide shipping, or specific country codes like "GH", "US", "CA"
              </p>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <Input
                  type="number"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                  className="w-24"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">Create Zone</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function ZoneEditDialog({
  zone,
  onSave,
  onCancel,
}: {
  zone: ShippingZone;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: zone.name,
    description: zone.description || "",
    regions: zone.regions.join(", "),
    isActive: zone.isActive,
    position: zone.position,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      regions: formData.regions.split(",").map((r) => r.trim()).filter(Boolean),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Edit Shipping Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zone Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Regions (comma-separated)
              </label>
              <Input
                value={formData.regions}
                onChange={(e) => setFormData({ ...formData, regions: e.target.value })}
                placeholder="Ghana, Nigeria, etc."
                required
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <Input
                  type="number"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                  className="w-24"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function MethodEditDialog({
  method,
  onSave,
  onCancel,
}: {
  method: ShippingMethod;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: method.name,
    description: method.description || "",
    cost: method.cost ? Number(method.cost) : "",
    freeShippingThreshold: method.freeShippingThreshold ? Number(method.freeShippingThreshold) : "",
    estimatedDays: method.estimatedDays || "",
    isActive: method.isActive,
    position: method.position,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      cost: formData.cost === "" ? null : Number(formData.cost),
      freeShippingThreshold: formData.freeShippingThreshold === "" ? null : Number(formData.freeShippingThreshold),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Edit Shipping Method</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Method Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost (GHS) - Leave empty for free
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value === "" ? "" : parseFloat(e.target.value) })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Free Shipping Threshold (GHS)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.freeShippingThreshold}
                  onChange={(e) => setFormData({ ...formData, freeShippingThreshold: e.target.value === "" ? "" : parseFloat(e.target.value) })}
                  placeholder="950"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Days</label>
              <Input
                value={formData.estimatedDays}
                onChange={(e) => setFormData({ ...formData, estimatedDays: e.target.value })}
                placeholder="3-5 working days"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <Input
                  type="number"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                  className="w-24"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function MethodCreateDialog({
  zoneId,
  onSave,
  onCancel,
}: {
  zoneId: string;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    cost: "",
    freeShippingThreshold: "",
    estimatedDays: "",
    isActive: true,
    position: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      cost: formData.cost === "" ? null : Number(formData.cost),
      freeShippingThreshold: formData.freeShippingThreshold === "" ? null : Number(formData.freeShippingThreshold),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Add Shipping Method</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Method Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost (GHS) - Leave empty for free
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Free Shipping Threshold (GHS)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.freeShippingThreshold}
                  onChange={(e) => setFormData({ ...formData, freeShippingThreshold: e.target.value })}
                  placeholder="950"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Days</label>
              <Input
                value={formData.estimatedDays}
                onChange={(e) => setFormData({ ...formData, estimatedDays: e.target.value })}
                placeholder="3-5 working days"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <Input
                  type="number"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) || 0 })}
                  className="w-24"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

