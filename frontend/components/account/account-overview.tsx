"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { User, Order } from "@/types";
import { formatOrderStatus } from "@/lib/utils";
import Link from "next/link";
import { Package, MapPin, Heart } from "lucide-react";

export function AccountOverview() {
  const { data: user, isLoading: userLoading } = useQuery<User>({
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

  const { data: orders, isLoading: ordersLoading } = useQuery<Order[]>({
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
    enabled: !!user,
  });

  const { data: wishlistCount = 0 } = useQuery<number>({
    queryKey: ["wishlist", "count"],
    queryFn: async () => {
      const response = await api.get("/wishlist", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data?.length || 0;
    },
    retry: false,
    enabled: !!user,
  });

  if (userLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading account...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
        <p className="text-muted-foreground mb-6">
          You need to be signed in to view your account.
        </p>
        <Link
          href="/login"
          className="px-6 py-3 bg-primary text-primary-foreground rounded-md inline-block"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const recentOrders = orders?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 md:p-8 border border-primary/20">
        <p className="text-gray-600">
          Manage your account settings and view your order history.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <Link
          href="/account/orders"
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all hover:border-primary/50 group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-xl md:text-2xl font-bold text-gray-900">{orders?.length || 0}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Orders</h3>
          <p className="text-sm text-gray-500">View all orders</p>
        </Link>

        <Link
          href="/account/addresses"
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all hover:border-primary/50 group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <MapPin className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-xl md:text-2xl font-bold text-gray-900">{user.addresses?.length || 0}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Addresses</h3>
          <p className="text-sm text-gray-500">Manage addresses</p>
        </Link>

        <Link
          href="/account/wishlist"
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all hover:border-primary/50 group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
            <span className="text-xl md:text-2xl font-bold text-gray-900">{wishlistCount}</span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Wishlist</h3>
          <p className="text-sm text-gray-500">Saved items</p>
        </Link>
      </div>

      {recentOrders.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-end mb-6">
            <Link
              href="/account/orders"
              className="text-sm text-primary hover:underline font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-gray-900">GH₵ {Number(order.totalGhs).toFixed(2)}</p>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      order.status === "PAID" || order.status === "DELIVERED"
                        ? "bg-green-100 text-green-800"
                        : order.status === "CANCELLED"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {formatOrderStatus(order.status)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

