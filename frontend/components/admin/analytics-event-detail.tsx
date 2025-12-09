"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, Package, ShoppingCart, DollarSign, FileText } from "lucide-react";
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
    images: string[];
    priceGhs: number;
  };
}

export function AnalyticsEventDetail({ eventId }: { eventId: string }) {
  const router = useRouter();

  const { data: event, isLoading } = useQuery<AnalyticsEvent>({
    queryKey: ["analytics", "event", eventId],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get(`/analytics/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Event not found.</p>
        <Button onClick={() => router.push("/admin/analytics/events")} className="mt-4">
          Back to Events
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.push("/admin/analytics/events")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Event Details</h1>
          <p className="text-gray-600 mt-1">View detailed information about this analytics event</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Information */}
        <Card>
          <CardHeader>
            <CardTitle>Event Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Event Type</label>
              <p className="text-lg font-semibold capitalize mt-1">
                {event.eventType.replace(/_/g, " ")}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Timestamp
              </label>
              <p className="text-sm text-gray-900 mt-1">
                {new Date(event.createdAt).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(event.createdAt).toISOString()}
              </p>
            </div>

            {event.revenue && (
              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Revenue
                </label>
                <p className="text-lg font-semibold text-green-600 mt-1">
                  GH₵ {Number(event.revenue).toFixed(2)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Related Entities */}
        <Card>
          <CardHeader>
            <CardTitle>Related Entities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {event.userId && (
              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  User
                </label>
                <Link
                  href={`/admin/customers?search=${event.userId}`}
                  className="text-primary hover:underline text-sm mt-1 block"
                >
                  {event.userId}
                </Link>
              </div>
            )}

            {event.sessionId && (
              <div>
                <label className="text-sm font-medium text-gray-600">Session ID</label>
                <p className="text-sm font-mono text-gray-900 mt-1 break-all">{event.sessionId}</p>
              </div>
            )}

            {event.product && (
              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Product
                </label>
                <Link
                  href={`/products/${event.product.slug}`}
                  className="text-primary hover:underline text-sm mt-1 block"
                >
                  {event.product.title}
                </Link>
                <p className="text-xs text-gray-500 mt-1">GH₵ {Number(event.product.priceGhs).toFixed(2)}</p>
              </div>
            )}

            {event.orderId && (
              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Order
                </label>
                <Link
                  href={`/admin/orders/${event.orderId}`}
                  className="text-primary hover:underline text-sm mt-1 block"
                >
                  {event.orderId}
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Event Metadata
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-xs">
              {JSON.stringify(event.metadata || {}, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
