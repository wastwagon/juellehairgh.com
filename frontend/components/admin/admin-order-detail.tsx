"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Order } from "@/types";
import { formatCurrency, formatOrderStatus } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Package, Truck, CheckCircle2, Clock, Save, Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

interface AdminOrderDetailProps {
  orderId: string;
}

export function AdminOrderDetail({ orderId }: AdminOrderDetailProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isMounted, setIsMounted] = useState(false);
  const [status, setStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  // Fix hydration error - only render after client-side mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: order, isLoading } = useQuery<Order>({
    queryKey: ["admin", "order", orderId],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get(`/admin/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: isMounted && !!orderId && typeof window !== "undefined" && !!localStorage.getItem("token"),
    onSuccess: (data) => {
      setStatus(data.status);
      setTrackingNumber(data.trackingNumber || "");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (data: { status: string; trackingNumber?: string }) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      return api.put(
        `/admin/orders/${orderId}/status`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      toast.success("Order status updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update order status");
    },
  });

  const handleUpdateStatus = () => {
    if (!status) {
      toast.error("Please select a status");
      return;
    }
    updateStatusMutation.mutate({
      status,
      trackingNumber: trackingNumber || undefined,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-200";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PROCESSING":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "PAID":
        return "bg-green-100 text-green-800 border-green-200";
      case "AWAITING_PAYMENT":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  // Fix hydration error - don't render until mounted on client
  if (!isMounted) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
        <Link href="/admin/orders">
          <Button variant="outline">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/orders"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
          <p className="text-gray-600 mt-1">Order #{order.id.slice(0, 8).toUpperCase()}</p>
        </div>
      </div>

      {/* Order Status Update Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Update Order Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="AWAITING_PAYMENT">Awaiting Payment</option>
                <option value="PAID">Paid</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tracking Number
              </label>
              <Input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
              />
            </div>
          </div>
          <Button
            onClick={handleUpdateStatus}
            disabled={updateStatusMutation.isPending}
            className="w-full md:w-auto"
          >
            {updateStatusMutation.isPending ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Update Status
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Order Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 pb-4 border-b last:border-0">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.product?.images?.[0] ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.title || "Product"}
                          width={80}
                          height={80}
                          className="object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="h-10 w-10 text-gray-400" />
                      )}
                    </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{item.product?.title || "Product"}</p>
                {item.variantIds && item.variantIds.length > 0 ? (
                  <div className="text-sm text-gray-600 space-y-0.5">
                    {item.variantIds.map((variantId: string, idx: number) => {
                      // Try to find variant from product variants
                      const variant = item.product?.variants?.find((v: any) => v.id === variantId);
                      return variant ? (
                        <p key={idx}>
                          {variant.name}: {variant.value}
                        </p>
                      ) : null;
                    })}
                  </div>
                ) : item.variant ? (
                  <p className="text-sm text-gray-600">
                    {item.variant.name}: {item.variant.value}
                  </p>
                ) : null}
                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
              </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(Number(item.priceGhs) * item.quantity, "GHS")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Date:</span>
                <span className="font-semibold">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status:</span>
                <span className={`font-semibold ${
                  order.paymentStatus === "PAID" ? "text-green-600" : "text-yellow-600"
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-semibold text-gray-900">
                  {order.paymentMethod === "cash_on_delivery" ? "Cash on Delivery" :
                   order.paymentMethod === "wallet" ? "Wallet Balance" :
                   order.paymentMethod === "paystack" ? "Paystack" :
                   order.paymentMethod || "Paystack"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Status:</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(order.status)}`}>
                  {formatOrderStatus(order.status)}
                </span>
              </div>
              {order.trackingNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tracking:</span>
                  <span className="font-mono text-sm">{order.trackingNumber}</span>
                </div>
              )}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-purple-600">
                    {formatCurrency(Number(order.totalGhs), "GHS")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold">{order.user?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <a
                  href={`mailto:${order.user?.email}`}
                  className="text-purple-600 hover:underline flex items-center gap-1"
                >
                  <Mail className="h-4 w-4" />
                  {order.user?.email || "N/A"}
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p className="font-semibold">
                  {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                </p>
                <p>{order.shippingAddress?.addressLine1}</p>
                {order.shippingAddress?.addressLine2 && (
                  <p>{order.shippingAddress.addressLine2}</p>
                )}
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.region}
                </p>
                <p>{order.shippingAddress?.country}</p>
                <p className="mt-2 flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {order.shippingAddress?.phone}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card>
            <CardHeader>
              <CardTitle>Billing Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p className="font-semibold">
                  {order.billingAddress?.firstName} {order.billingAddress?.lastName}
                </p>
                <p>{order.billingAddress?.addressLine1}</p>
                {order.billingAddress?.addressLine2 && (
                  <p>{order.billingAddress.addressLine2}</p>
                )}
                <p>
                  {order.billingAddress?.city}, {order.billingAddress?.region}
                </p>
                <p>{order.billingAddress?.country}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

