"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Address } from "@/types";
import { Plus, Edit, Trash2 } from "lucide-react";
import { AddressForm } from "./address-form";
import { Button } from "@/components/ui/button";

export function AddressesList() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  
  const { data: user } = useQuery({
    queryKey: ["user", "me"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get("/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    retry: false,
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
  });

  const addresses = user?.addresses || [];

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      return api.delete(`/addresses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
  });

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this address?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAddress(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground mb-4">No addresses saved yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-md"
          >
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address: Address) => (
            <div key={address.id} className="border rounded-lg p-6 relative">
              {address.isDefault && (
                <span className="absolute top-4 right-4 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                  Default
                </span>
              )}
              <div className="space-y-2">
                <p className="font-semibold">
                  {address.firstName} {address.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {address.addressLine1}
                </p>
                {address.addressLine2 && (
                  <p className="text-sm text-muted-foreground">
                    {address.addressLine2}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {address.city}, {address.region}
                </p>
                <p className="text-sm text-muted-foreground">
                  {address.country}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Phone: {address.phone}
                </p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(address)}
                  className="hover:bg-accent"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => address.id && handleDelete(address.id)}
                  className="hover:bg-destructive/10 text-destructive"
                  disabled={deleteMutation.isPending || !address.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <AddressForm
          address={editingAddress}
          onClose={handleCloseForm}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["user", "me"] });
          }}
        />
      )}
    </div>
  );
}

