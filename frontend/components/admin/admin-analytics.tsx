"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  Eye,
  MousePointerClick,
  BarChart3,
  Activity,
} from "lucide-react";
import { UserJourneyViewer } from "./user-journey-viewer";

export function AdminAnalytics() {
  const router = useRouter();
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;

    if (!token) {
      router.push("/login?redirect=/admin/analytics");
      return;
    }

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role !== "ADMIN" && user.role !== "MANAGER") {
          router.push("/account");
          return;
        }
      } catch (e) {
        router.push("/login?redirect=/admin/analytics");
        return;
      }
    }
  }, [router]);

  const { data: realtimeStats, isLoading, refetch } = useQuery({
    queryKey: ["analytics", "realtime"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get("/analytics/realtime", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
    refetchInterval: refreshInterval,
  });

  const { data: revenueChart } = useQuery({
    queryKey: ["analytics", "revenue-chart"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get("/analytics/revenue-chart?days=30", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
  });

  const { data: topProducts } = useQuery({
    queryKey: ["analytics", "top-products"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get("/analytics/top-products?limit=10", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
  });

  const { data: salesFunnel } = useQuery({
    queryKey: ["analytics", "sales-funnel"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get("/analytics/sales-funnel", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
  });

  const { data: trafficSources } = useQuery({
    queryKey: ["analytics", "traffic-sources"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get("/analytics/traffic-sources?days=30", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
  });

  const { data: deviceBreakdown } = useQuery({
    queryKey: ["analytics", "device-breakdown"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get("/analytics/device-breakdown?days=30", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
  });

  const { data: formConversions } = useQuery({
    queryKey: ["analytics", "form-conversions"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get("/analytics/form-conversions?days=30", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
  });

  const { data: topLinks } = useQuery({
    queryKey: ["analytics", "top-links"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get("/analytics/top-links?days=30&limit=10", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
  });

  const { data: videoEngagement } = useQuery({
    queryKey: ["analytics", "video-engagement"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get("/analytics/video-engagement?days=30", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
  });

  const { data: customDimensions } = useQuery({
    queryKey: ["analytics", "custom-dimensions"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get("/analytics/custom-dimensions?days=30", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  const stats = realtimeStats || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="flex items-center gap-2"
          >
            <Activity className="h-4 w-4" />
            Refresh
          </Button>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value={10000}>10s</option>
            <option value={30000}>30s</option>
            <option value={60000}>1m</option>
            <option value={300000}>5m</option>
            <option value={0}>Manual</option>
          </select>
        </div>
      </div>

      {/* Real-time Stats */}
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
              GH₵ {Number(stats.totalRevenue || 0).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Today's Revenue</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">
              GH₵ {Number(stats.todayRevenue || 0).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Total Orders</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">
              {stats.totalOrders || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Today's Orders</CardTitle>
            <div className="p-2 bg-orange-100 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">
              {stats.todayOrders || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Active Sessions</CardTitle>
            <div className="p-2 bg-cyan-100 rounded-lg">
              <Activity className="h-5 w-5 text-cyan-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">
              {stats.activeSessions || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Last hour</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Page Views</CardTitle>
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Eye className="h-5 w-5 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">
              {stats.pageViews || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Unique Visitors</CardTitle>
            <div className="p-2 bg-pink-100 rounded-lg">
              <Users className="h-5 w-5 text-pink-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">
              {stats.uniqueVisitors || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Conversion Rate</CardTitle>
            <div className="p-2 bg-teal-100 rounded-lg">
              <MousePointerClick className="h-5 w-5 text-teal-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">
              {Number(stats.conversionRate || 0).toFixed(2)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Funnel */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">Sales Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            {salesFunnel ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Product Views</span>
                    <span className="font-semibold text-gray-900">{salesFunnel.views}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: "100%" }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Add to Cart</span>
                    <span className="font-semibold text-gray-900">
                      {salesFunnel.carts} ({salesFunnel.cartRate.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${salesFunnel.cartRate}%` }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Begin Checkout</span>
                    <span className="font-semibold text-gray-900">
                      {salesFunnel.checkouts} ({salesFunnel.checkoutRate.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-600 h-2 rounded-full"
                      style={{ width: `${salesFunnel.checkoutRate}%` }}
                    ></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Purchases</span>
                    <span className="font-semibold text-gray-900">
                      {salesFunnel.purchases} ({salesFunnel.purchaseRate.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${salesFunnel.purchaseRate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">Loading funnel data...</div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">Top Products (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts && topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.slice(0, 5).map((item: any, index: number) => (
                  <div key={item.productId || index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {item.product?.title || "Unknown Product"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.views} views • GH₵ {Number(item.revenue || 0).toFixed(2)} revenue
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No product data available</div>
            )}
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            {trafficSources && trafficSources.length > 0 ? (
              <div className="space-y-3">
                {trafficSources.map((source: any, index: number) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {source.source}
                      </span>
                      <span className="text-sm text-gray-600">
                        {source.count} ({source.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${source.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No traffic data available</div>
            )}
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">Device Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {deviceBreakdown && deviceBreakdown.length > 0 ? (
              <div className="space-y-3">
                {deviceBreakdown.map((device: any, index: number) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {device.device}
                      </span>
                      <span className="text-sm text-gray-600">
                        {device.count} ({device.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${device.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No device data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      {revenueChart && revenueChart.length > 0 && (
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">Revenue Trend (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {revenueChart.map((item: any, index: number) => {
                const maxRevenue = Math.max(...revenueChart.map((r: any) => r.revenue));
                const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-t relative" style={{ height: "200px" }}>
                      <div
                        className="w-full bg-primary rounded-t absolute bottom-0 transition-all"
                        style={{ height: `${height}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(item.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="text-xs font-semibold text-gray-900">
                      GH₵ {Number(item.revenue).toFixed(0)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Conversions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">Form Conversions (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {formConversions && formConversions.length > 0 ? (
              <div className="space-y-3">
                {formConversions.map((form: any, index: number) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-sm font-medium text-gray-700">{form.formName}</span>
                        <span className="text-xs text-gray-500 ml-2 capitalize">({form.formType})</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{form.submissions}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${(form.submissions / Math.max(...formConversions.map((f: any) => f.submissions))) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No form submissions tracked</div>
            )}
          </CardContent>
        </Card>

        {/* Top Links & Buttons */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">Top Links & Buttons (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {topLinks && topLinks.length > 0 ? (
              <div className="space-y-3">
                {topLinks.map((link: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{link.text}</p>
                      <p className="text-xs text-gray-500 truncate">{link.url}</p>
                      <span className="text-xs text-gray-400 capitalize">{link.type}</span>
                    </div>
                    <div className="ml-4 text-right">
                      <span className="text-sm font-semibold text-gray-900">{link.clicks}</span>
                      <p className="text-xs text-gray-500">clicks</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No link/button clicks tracked</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Video Engagement */}
      {videoEngagement && (
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">Video Engagement (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{videoEngagement.totalPlays || 0}</div>
                <div className="text-sm text-gray-600 mt-1">Total Plays</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{videoEngagement.totalCompletions || 0}</div>
                <div className="text-sm text-gray-600 mt-1">Completions</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {Number(videoEngagement.completionRate || 0).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 mt-1">Completion Rate</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {Number(videoEngagement.averageProgress || 0).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 mt-1">Avg Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Dimensions - Category Performance */}
      {customDimensions && customDimensions.categories && customDimensions.categories.length > 0 && (
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-gray-900">Category Performance (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {customDimensions.categories
                .sort((a: any, b: any) => b.views - a.views)
                .map((category: any, index: number) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{category.categoryName}</span>
                      <span className="text-sm text-gray-600">
                        {category.views} views • {category.uniqueProducts} products
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{
                          width: `${
                            (category.views /
                              Math.max(...customDimensions.categories.map((c: any) => c.views))) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Journey Viewer */}
      <UserJourneyViewer />
    </div>
  );
}

