"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Edit } from "lucide-react";
import { CurrencyRateForm } from "./currency-rate-form";

interface CurrencyRate {
  id: string;
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  updatedAt: string;
}

export function AdminCurrencyRates() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingRate, setEditingRate] = useState<CurrencyRate | null>(null);

  const { data: rates, isLoading } = useQuery<CurrencyRate[]>({
    queryKey: ["admin", "currency-rates"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get("/admin/currency-rates", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
  });

  if (isLoading) {
    return <div className="text-center py-12">Loading currency rates...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Manage Currency Rates</h1>
        <p className="text-gray-600 mt-1">Update exchange rates for multi-currency display</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Currency Rates ({rates?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rates?.map((rate) => (
              <div
                key={rate.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {rate.baseCurrency} → {rate.targetCurrency}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Rate: {Number(rate.rate).toFixed(4)}
                    </p>
                    <p className="text-xs text-gray-400">
                      Updated: {new Date(rate.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingRate(rate);
                    setShowForm(true);
                  }}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Rate
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <CurrencyRateForm
          rate={editingRate || undefined}
          onClose={() => {
            setShowForm(false);
            setEditingRate(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["admin", "currency-rates"] });
          }}
        />
      )}
    </div>
  );
}









