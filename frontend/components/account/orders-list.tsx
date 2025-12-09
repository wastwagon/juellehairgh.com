"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Order } from "@/types";
import Link from "next/link";
import { formatCurrency, formatOrderStatus } from "@/lib/utils";
import { Package, ShoppingBag, Truck, CheckCircle2, Clock } from "lucide-react";
import Image from "next/image";

export function OrdersList() {
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await api.get("/orders", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    },
    retry: false,
  });

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return <CheckCircle2 className="h-4 w-4" />;
      case "SHIPPED":
        return <Truck className="h-4 w-4" />;
      case "PROCESSING":
        return <Package className="h-4 w-4" />;
      case "PAID":
        return <CheckCircle2 className="h-4 w-4" />;
      case "AWAITING_PAYMENT":
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading orders...</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <ShoppingBag className="h-8 w-8 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
        <p className="text-gray-600 mb-6">
          You haven't placed any orders yet. Start shopping to see your orders here.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-100">
        <div className="flex items-center gap-4">
          <Image
            src="/logo.png"
            alt="Juelle Hair"
            width={50}
            height={50}
            className="object-contain"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600">View and track all your orders</p>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-md divide-y divide-gray-200 border border-gray-200">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/account/orders/${order.id}`}
            className="block p-6 hover:bg-purple-50/50 transition-colors"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <p className="font-bold text-gray-900">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {formatOrderStatus(order.status)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-sm text-gray-600">
                  {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''} • 
                  {order.trackingNumber && (
                    <span className="ml-1 text-purple-600 font-medium">Tracking: {order.trackingNumber}</span>
                  )}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xl font-bold text-purple-600">
                  {formatCurrency(Number(order.totalGhs), "GHS")}
                </p>
                <p className="text-sm text-gray-500 mt-1">View Details →</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Help Section */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-100">
        <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
        <p className="text-sm text-gray-600 mb-3">
          If you have questions about your orders, contact us at{" "}
          <a href="mailto:sales@juellehairgh.com" className="text-purple-600 hover:underline font-semibold">
            sales@juellehairgh.com
          </a>
          {" "}or call{" "}
          <a href="tel:+233539506949" className="text-purple-600 hover:underline font-semibold">
            +233 539506949
          </a>
        </p>
        <Link
          href="/orders/track"
          className="inline-flex items-center text-sm text-purple-600 hover:text-purple-700 font-semibold"
        >
          Track an order by tracking number →
        </Link>
      </div>
    </div>
  );
}
