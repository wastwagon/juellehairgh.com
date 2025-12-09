"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

interface DiscountCode {
  id: string;
  code: string;
  description?: string;
  discountType: string;
  discountValue: number;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

interface DiscountCodeFormProps {
  code?: DiscountCode;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DiscountCodeForm({ code, onClose, onSuccess }: DiscountCodeFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: 0,
    minPurchase: "",
    maxDiscount: "",
    usageLimit: "",
    isActive: true,
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (code) {
      setFormData({
        code: code.code || "",
        description: code.description || "",
        discountType: code.discountType || "PERCENTAGE",
        discountValue: code.discountValue || 0,
        minPurchase: code.minPurchase?.toString() || "",
        maxDiscount: code.maxDiscount?.toString() || "",
        usageLimit: code.usageLimit?.toString() || "",
        isActive: code.isActive ?? true,
        startDate: code.startDate ? new Date(code.startDate).toISOString().split("T")[0] : "",
        endDate: code.endDate ? new Date(code.endDate).toISOString().split("T")[0] : "",
      });
    }
  }, [code]);

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const payload = {
        ...data,
        discountValue: parseFloat(data.discountValue.toString()),
        minPurchase: data.minPurchase ? parseFloat(data.minPurchase) : null,
        maxDiscount: data.maxDiscount ? parseFloat(data.maxDiscount) : null,
        usageLimit: data.usageLimit ? parseInt(data.usageLimit) : null,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
      };
      return api.post("/admin/discount-codes", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "discount-codes"] });
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
        discountValue: parseFloat(data.discountValue.toString()),
        minPurchase: data.minPurchase ? parseFloat(data.minPurchase) : null,
        maxDiscount: data.maxDiscount ? parseFloat(data.maxDiscount) : null,
        usageLimit: data.usageLimit ? parseInt(data.usageLimit) : null,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
      };
      return api.put(`/admin/discount-codes/${code?.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "discount-codes"] });
      onSuccess?.();
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code) {
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
          <CardTitle>{code ? "Edit Discount Code" : "Add New Discount Code"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Code *</label>
              <Input
                type="text"
                required
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toUpperCase() })
                }
                placeholder="SAVE20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Discount Type *</label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Discount Value *</label>
                <Input
                  type="number"
                  required
                  step="0.01"
                  value={formData.discountValue}
                  onChange={(e) =>
                    setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Min Purchase (GHS)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.minPurchase}
                  onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Max Discount (GHS)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.maxDiscount}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Usage Limit</label>
              <Input
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                placeholder="Unlimited if empty"
              />
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
                {isLoading ? "Saving..." : code ? "Update Code" : "Create Code"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}



