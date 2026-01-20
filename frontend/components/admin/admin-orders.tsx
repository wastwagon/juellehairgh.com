"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Order } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Filter, Trash2 } from "lucide-react";
import { formatOrderStatus } from "@/lib/utils";
import Link from "next/link";

export function AdminOrders() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isMounted, setIsMounted] = useState(false);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

  // Fix hydration error - only render after client-side mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    
    if (!token) {
      router.push("/login?redirect=/admin/orders");
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
        router.push("/login?redirect=/admin/orders");
        return;
      }
    }
  }, [router, isMounted]);

  const { data: ordersData, isLoading } = useQuery<{
    orders: Order[];
    pagination: any;
  }>({
    queryKey: ["admin", "orders"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get("/admin/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    enabled: isMounted && typeof window !== "undefined" && !!localStorage.getItem("token"),
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      await api.delete(`/admin/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      setDeletingOrderId(null);
      alert("Order deleted successfully. Analytics and dashboard stats have been updated.");
    },
    onError: (error: any) => {
      console.error("Error deleting order:", error);
      alert(error.response?.data?.message || "Failed to delete order. Please try again.");
      setDeletingOrderId(null);
    },
  });

  const handleDeleteClick = (orderId: string) => {
    if (window.confirm(
      "Are you sure you want to delete this order?\n\n" +
      "This will:\n" +
      "• Permanently delete the order\n" +
      "• Remove it from analytics and revenue calculations\n" +
      "• Update dashboard statistics\n\n" +
      "This action cannot be undone."
    )) {
      setDeletingOrderId(orderId);
      deleteOrderMutation.mutate(orderId);
    }
  };

  // Fix hydration error - don't render until mounted on client
  if (!isMounted) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // Fix hydration error - extract data first, then check loading
  const orders = ordersData?.orders || [];

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading orders...</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "PROCESSING":
      case "SHIPPED":
        return "bg-blue-100 text-blue-800";
      case "AWAITING_PAYMENT":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Manage Orders</h1>
          <p className="text-gray-600 mt-1">View and manage all customer orders</p>
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            All Orders ({ordersData?.pagination?.total || orders?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders && orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold text-gray-900">Order ID</th>
                    <th className="text-left p-3 font-semibold text-gray-900">Customer</th>
                    <th className="text-left p-3 font-semibold text-gray-900">Date</th>
                    <th className="text-left p-3 font-semibold text-gray-900">Total</th>
                    <th className="text-left p-3 font-semibold text-gray-900">Status</th>
                    <th className="text-left p-3 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-mono text-sm text-gray-700">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="p-3 text-gray-700">
                        {order.user?.name || order.user?.email || "N/A"}
                      </td>
                      <td className="p-3 text-gray-700">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-gray-900 font-semibold">
                        GH₵ {Number(order.totalGhs).toFixed(2)}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {formatOrderStatus(order.status)}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/orders/${order.id}`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(order.id)}
                            disabled={deletingOrderId === order.id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          >
                            {deletingOrderId === order.id ? (
                              <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                                <span>Deleting...</span>
                              </div>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </>
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No orders yet</p>
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
    </div>
  );
}

