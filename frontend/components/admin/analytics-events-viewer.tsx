"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Filter, Search, Eye, Calendar, X } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface AnalyticsEvent {
  id: string;
  eventType: string;
  userId?: string;
  sessionId?: string;
  productId?: string;
  orderId?: string;
  revenue?: number;
  metadata: any;
  createdAt: string;
  product?: {
    id: string;
    title: string;
    slug: string;
  };
}

export function AnalyticsEventsViewer() {
  const [filters, setFilters] = useState({
    eventType: "",
    userId: "",
    sessionId: "",
    productId: "",
    startDate: "",
    endDate: "",
  });
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const limit = 50;

  const { data: eventsData, isLoading } = useQuery<{
    events: AnalyticsEvent[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>({
    queryKey: ["analytics", "events", filters, page],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      
      const params = new URLSearchParams();
      if (filters.eventType) params.append("eventType", filters.eventType);
      if (filters.userId) params.append("userId", filters.userId);
      if (filters.sessionId) params.append("sessionId", filters.sessionId);
      if (filters.productId) params.append("productId", filters.productId);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const response = await api.get(`/analytics/events?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
  });

  const handleExport = () => {
    if (!eventsData?.events || eventsData.events.length === 0) {
      toast.error("No events to export");
      return;
    }

    const csv = [
      ["Event Type", "User ID", "Session ID", "Product ID", "Order ID", "Revenue", "Created At", "Metadata"].join(","),
      ...eventsData.events.map((event) =>
        [
          event.eventType,
          event.userId || "",
          event.sessionId || "",
          event.productId || "",
          event.orderId || "",
          event.revenue || "",
          new Date(event.createdAt).toISOString(),
          JSON.stringify(event.metadata || {}),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-events-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Events exported successfully!");
  };

  const clearFilters = () => {
    setFilters({
      eventType: "",
      userId: "",
      sessionId: "",
      productId: "",
      startDate: "",
      endDate: "",
    });
    setPage(1);
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== "");

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading events...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Analytics Events</h1>
          <p className="text-gray-600 mt-1">View and filter individual analytics events</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Filter Events</CardTitle>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Event Type</label>
                <select
                  value={filters.eventType}
                  onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">All Types</option>
                  <option value="page_view">Page View</option>
                  <option value="view_product">View Product</option>
                  <option value="add_to_cart">Add to Cart</option>
                  <option value="begin_checkout">Begin Checkout</option>
                  <option value="purchase">Purchase</option>
                  <option value="session_start">Session Start</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">User ID</label>
                <Input
                  type="text"
                  value={filters.userId}
                  onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                  placeholder="Filter by user ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Session ID</label>
                <Input
                  type="text"
                  value={filters.sessionId}
                  onChange={(e) => setFilters({ ...filters, sessionId: e.target.value })}
                  placeholder="Filter by session ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Product ID</label>
                <Input
                  type="text"
                  value={filters.productId}
                  onChange={(e) => setFilters({ ...filters, productId: e.target.value })}
                  placeholder="Filter by product ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Events ({eventsData?.pagination.total || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {eventsData?.events && eventsData.events.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-semibold">Type</th>
                    <th className="text-left p-3 text-sm font-semibold">Time</th>
                    <th className="text-left p-3 text-sm font-semibold">User</th>
                    <th className="text-left p-3 text-sm font-semibold">Session</th>
                    <th className="text-left p-3 text-sm font-semibold">Product</th>
                    <th className="text-left p-3 text-sm font-semibold">Revenue</th>
                    <th className="text-left p-3 text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {eventsData.events.map((event) => (
                    <tr key={event.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                          {event.eventType.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        {new Date(event.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        {event.userId ? (
                          <Link href={`/admin/customers?search=${event.userId}`} className="text-primary hover:underline">
                            {event.userId.slice(0, 8)}...
                          </Link>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="p-3 text-sm text-gray-700 font-mono">
                        {event.sessionId ? event.sessionId.slice(0, 12) + "..." : "—"}
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        {event.product ? (
                          <Link href={`/products/${event.product.slug}`} className="text-primary hover:underline">
                            {event.product.title}
                          </Link>
                        ) : event.productId ? (
                          <span className="text-gray-500">{event.productId.slice(0, 8)}...</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        {event.revenue ? `GH₵ ${Number(event.revenue).toFixed(2)}` : "—"}
                      </td>
                      <td className="p-3">
                        <Link href={`/admin/analytics/events/${event.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {eventsData.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, eventsData.pagination.total)} of {eventsData.pagination.total} events
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= eventsData.pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No events found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
