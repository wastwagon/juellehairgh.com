"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Ticket } from "lucide-react";
import { DiscountCodeForm } from "./discount-code-form";

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

export function AdminDiscountCodes() {
  const queryClient = useQueryClient();
  const [isMounted, setIsMounted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: codes, isLoading } = useQuery<DiscountCode[]>({
    queryKey: ["admin", "discount-codes"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get("/admin/discount-codes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: isMounted && typeof window !== "undefined" && !!localStorage.getItem("token"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      return api.delete(`/admin/discount-codes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "discount-codes"] });
    },
  });

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this discount code?")) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error: any) {
        alert(error.response?.data?.message || "Failed to delete discount code");
      }
    }
  };

  if (!isMounted) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading discount codes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Manage Discount Codes</h1>
          <p className="text-gray-600 mt-1">Create and manage promotional codes</p>
        </div>
        <Button
          onClick={() => {
            setEditingCode(null);
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Discount Code
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Discount Codes ({codes?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {codes?.map((code) => (
              <div
                key={code.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <Ticket className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{code.code}</h3>
                      <span className="text-sm font-medium text-primary">
                        {code.discountType === "PERCENTAGE"
                          ? `${code.discountValue}% OFF`
                          : `GH₵${code.discountValue} OFF`}
                      </span>
                      {!code.isActive && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    {code.description && (
                      <p className="text-sm text-gray-500 mt-1">{code.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Used: {code.usedCount}
                      {code.usageLimit && ` / ${code.usageLimit}`}
                      {code.minPurchase && ` • Min: GH₵${code.minPurchase}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingCode(code);
                      setShowForm(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(code.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <DiscountCodeForm
          code={editingCode || undefined}
          onClose={() => {
            setShowForm(false);
            setEditingCode(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["admin", "discount-codes"] });
          }}
        />
      )}
    </div>
  );
}




