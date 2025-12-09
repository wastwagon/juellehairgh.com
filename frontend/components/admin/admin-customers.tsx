"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, X } from "lucide-react";
import Link from "next/link";
import { CustomerDetailsDialog } from "./customer-details-dialog";

export function AdminCustomers() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    
    if (!token) {
      router.push("/login?redirect=/admin/customers");
      return;
    }

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role !== "ADMIN") {
          router.push("/account");
          return;
        }
      } catch (e) {
        router.push("/login?redirect=/admin/customers");
        return;
      }
    }
  }, [router]);

  const { data: customersData, isLoading } = useQuery<{
    users: User[];
    pagination: any;
  }>({
    queryKey: ["admin", "customers", searchQuery],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const params: any = {};
      if (searchQuery) {
        params.search = searchQuery;
      }
      const response = await api.get("/admin/customers", {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
    retry: false,
  });

  const handleViewDetails = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setIsDialogOpen(true);
  };

  const customers = customersData?.users || [];

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Manage Customers</h1>
          <p className="text-gray-600 mt-1">View and manage all customers</p>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            All Customers ({customersData?.pagination?.total || customers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold text-gray-900">Name</th>
                    <th className="text-left p-3 font-semibold text-gray-900">Email</th>
                    <th className="text-left p-3 font-semibold text-gray-900">Phone</th>
                    <th className="text-left p-3 font-semibold text-gray-900">Role</th>
                    <th className="text-left p-3 font-semibold text-gray-900">Joined</th>
                    <th className="text-left p-3 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-900">
                        {customer.name || "N/A"}
                      </td>
                      <td className="p-3 text-gray-700">{customer.email}</td>
                      <td className="p-3 text-gray-700">{customer.phone || "N/A"}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {customer.role || "CUSTOMER"}
                        </span>
                      </td>
                      <td className="p-3 text-gray-700">
                        {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="p-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(customer.id)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No customers found</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <Link href="/admin">
          <Button variant="outline">
            ← Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Customer Details Dialog */}
      <CustomerDetailsDialog
        customerId={selectedCustomerId}
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setSelectedCustomerId(null);
          }
        }}
      />
    </div>
  );
}

