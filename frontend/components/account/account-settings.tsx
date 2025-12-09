"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { User } from "@/types";
import { useCurrencyStore } from "@/store/currency-store";

export function AccountSettings() {
  const { displayCurrency, setDisplayCurrency } = useCurrencyStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["user", "me"],
    queryFn: async () => {
      const response = await api.get("/users/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    },
    retry: false,
  });

  // Handle user data when loaded (replaces deprecated onSuccess)
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (data: { name?: string; phone?: string; displayCurrency?: string }) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.put("/users/me", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
      alert("Settings updated successfully!");
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to update settings");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      name: formData.name,
      phone: formData.phone,
      displayCurrency: displayCurrency,
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading settings...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
        <p className="text-muted-foreground">
          You need to be signed in to view settings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2 border rounded-md bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Email cannot be changed
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Preferences</h2>
          <div>
            <label className="block text-sm font-medium mb-2">
              Display Currency
            </label>
            <select
              value={displayCurrency}
              onChange={(e) => {
                setDisplayCurrency(e.target.value);
                // Update in formData for saving
                setFormData({ ...formData });
              }}
              className="w-full px-4 py-2 border rounded-md"
            >
              <option value="GHS">GHS - Ghana Cedis</option>
              <option value="USD">USD - US Dollars</option>
              <option value="EUR">EUR - Euros</option>
              <option value="GBP">GBP - British Pounds</option>
              <option value="NGN">NGN - Nigerian Naira</option>
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              Note: Final payment is always in GHS
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="px-6 py-2 border rounded-md"
            onClick={() => window.location.reload()}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

