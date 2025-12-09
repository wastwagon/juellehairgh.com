"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { User } from "@/types";
import { Loader2 } from "lucide-react";

interface CustomerDetailsDialogProps {
  customerId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerDetailsDialog({
  customerId,
  open,
  onOpenChange,
}: CustomerDetailsDialogProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "CUSTOMER",
    displayCurrency: "GHS",
    emailVerified: false,
  });

  // Fetch customer details
  const { data: customer, isLoading } = useQuery<{
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    role: string;
    displayCurrency: string | null;
    emailVerified: boolean;
    createdAt: string;
    orders?: any[];
    addresses?: any[];
  }>({
    queryKey: ["admin", "customer", customerId],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token || !customerId) throw new Error("Not authenticated");
      const response = await api.get(`/admin/customers/${customerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    enabled: !!customerId && open,
    retry: false,
  });

  // Update form data when customer data loads
  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        role: customer.role || "CUSTOMER",
        displayCurrency: customer.displayCurrency || "GHS",
        emailVerified: customer.emailVerified || false,
      });
    }
  }, [customer]);

  // Update customer mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<typeof formData>) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token || !customerId) throw new Error("Not authenticated");
      const response = await api.put(`/admin/customers/${customerId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "customers"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "customer", customerId] });
      setIsEditing(false);
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async (role: string) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token || !customerId) throw new Error("Not authenticated");
      const response = await api.put(`/admin/customers/${customerId}/role`, { role }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "customers"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "customer", customerId] });
    },
  });

  // Delete customer mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token || !customerId) throw new Error("Not authenticated");
      const response = await api.delete(`/admin/customers/${customerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "customers"] });
      setShowDeleteDialog(false);
      onOpenChange(false);
    },
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleRoleChange = (newRole: string) => {
    updateRoleMutation.mutate(newRole);
    setFormData({ ...formData, role: newRole });
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              {isEditing ? "Edit customer information" : "View customer details"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Basic Information */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                id="role"
                value={formData.role}
                onChange={(e) => handleRoleChange(e.target.value)}
                disabled={!isEditing}
              >
                <option value="CUSTOMER">Customer</option>
                <option value="STAFF">Staff</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayCurrency">Display Currency</Label>
              <Select
                id="displayCurrency"
                value={formData.displayCurrency}
                onChange={(e) => setFormData({ ...formData, displayCurrency: e.target.value })}
                disabled={!isEditing}
              >
                <option value="GHS">GHS (Ghana Cedis)</option>
                <option value="USD">USD (US Dollars)</option>
                <option value="EUR">EUR (Euros)</option>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="emailVerified"
                checked={formData.emailVerified}
                onChange={(e) => setFormData({ ...formData, emailVerified: e.target.checked })}
                disabled={!isEditing}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="emailVerified" className="cursor-pointer">
                Email Verified
              </Label>
            </div>

            {/* Statistics */}
            {!isEditing && customer && (
              <div className="pt-4 border-t space-y-2">
                <div className="text-sm text-gray-600">
                  <strong>Joined:</strong> {new Date(customer.createdAt).toLocaleDateString()}
                </div>
                {customer.orders && (
                  <div className="text-sm text-gray-600">
                    <strong>Total Orders:</strong> {customer.orders.length}
                  </div>
                )}
                {customer.addresses && (
                  <div className="text-sm text-gray-600">
                    <strong>Saved Addresses:</strong> {customer.addresses.length}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    Delete
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      // Reset form data
                      if (customer) {
                        setFormData({
                          name: customer.name || "",
                          email: customer.email || "",
                          phone: customer.phone || "",
                          role: customer.role || "CUSTOMER",
                          displayCurrency: customer.displayCurrency || "GHS",
                          emailVerified: customer.emailVerified || false,
                        });
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </>
              )}
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate the customer account. They will no longer be able to log in.
              This action can be reversed later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
