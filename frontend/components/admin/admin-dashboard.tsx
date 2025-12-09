"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, DollarSign, ShoppingCart, Users, Star } from "lucide-react";
import Link from "next/link";

export function AdminDashboard() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    const userStr = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
    setHasToken(!!token);
    
    if (!token) {
      router.push("/login?redirect=/admin");
      return;
    }

    // Check if user is admin
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role !== "ADMIN") {
          router.push("/account");
          return;
        }
      } catch (e) {
        router.push("/login?redirect=/admin");
        return;
      }
    }
  }, [router]);

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      if (!token) {
        throw new Error("Not authenticated");
      }
      const response = await api.get("/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    retry: false,
    enabled: isClient && hasToken,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    const isUnauthorized = (error as any)?.response?.status === 401;
    
    if (isUnauthorized) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12 max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Authentication Required</h2>
            <p className="text-gray-600 mb-6">
              You need to be logged in as an administrator to access this page.
            </p>
            <div className="space-y-3">
              <Link href="/login?redirect=/admin">
                <Button className="w-full">Sign In</Button>
              </Link>
              <p className="text-sm text-gray-500">
                Admin credentials: admin@juellehair.com / admin123
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You need admin privileges to access this page.
          </p>
          <Link href="/account">
            <Button variant="outline">Go to Account</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">
          Manage your e-commerce platform and track performance
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Total Revenue</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">
              GH₵ {Number(stats.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              All time sales
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Total Orders</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">{stats.totalOrders || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              All orders
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Today's Orders</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">{stats.todayOrders || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              Orders today
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Today's Revenue</CardTitle>
            <div className="p-2 bg-orange-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">
              GH₵ {Number(stats.todayRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Revenue today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/products">
              <Button variant="outline" className="w-full justify-start hover:bg-gray-50 transition-colors">
                <Package className="h-4 w-4 mr-2" />
                Manage Products
              </Button>
            </Link>
            <Link href="/admin/orders">
              <Button variant="outline" className="w-full justify-start hover:bg-gray-50 transition-colors">
                <ShoppingCart className="h-4 w-4 mr-2" />
                View Orders
              </Button>
            </Link>
            <Link href="/admin/customers">
              <Button variant="outline" className="w-full justify-start hover:bg-gray-50 transition-colors">
                <Users className="h-4 w-4 mr-2" />
                Manage Customers
              </Button>
            </Link>
            <Link href="/admin/reviews">
              <Button variant="outline" className="w-full justify-start hover:bg-gray-50 transition-colors">
                <Star className="h-4 w-4 mr-2" />
                Manage Reviews
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">New order received</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Product updated</p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

