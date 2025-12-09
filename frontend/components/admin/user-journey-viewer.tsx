"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, User, Clock, ShoppingCart, Eye, MousePointerClick } from "lucide-react";

export function UserJourneyViewer() {
  const [userId, setUserId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [searchType, setSearchType] = useState<"user" | "session">("session");

  const { data: journey, isLoading, refetch } = useQuery({
    queryKey: ["analytics", "user-journey", searchType, userId || sessionId],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const params = new URLSearchParams();
      if (searchType === "user" && userId) {
        params.append("userId", userId);
      } else if (searchType === "session" && sessionId) {
        params.append("sessionId", sessionId);
      }
      params.append("days", "30");
      const response = await api.get(`/analytics/user-journey?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: (() => {
      if (typeof window === "undefined") return false;
      const hasToken = !!localStorage.getItem("token");
      const hasSearchValue = searchType === "user" ? !!userId : !!sessionId;
      return hasToken && hasSearchValue;
    })(),
  });

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "page_view":
        return <Eye className="h-4 w-4 text-blue-500" />;
      case "view_product":
        return <Eye className="h-4 w-4 text-purple-500" />;
      case "add_to_cart":
        return <ShoppingCart className="h-4 w-4 text-green-500" />;
      case "begin_checkout":
        return <ShoppingCart className="h-4 w-4 text-orange-500" />;
      case "purchase":
        return <ShoppingCart className="h-4 w-4 text-red-500" />;
      case "link_click":
      case "button_click":
        return <MousePointerClick className="h-4 w-4 text-indigo-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEventLabel = (event: any) => {
    const metadata = event.metadata || {};
    switch (event.eventType) {
      case "page_view":
        return `Viewed page: ${metadata.path || "Unknown"}`;
      case "view_product":
        return `Viewed product: ${metadata.productTitle || event.productId || "Unknown"}`;
      case "add_to_cart":
        return `Added to cart: ${metadata.quantity || 1} item(s)`;
      case "begin_checkout":
        return `Started checkout: GH₵ ${Number(metadata.cartValue || 0).toFixed(2)}`;
      case "purchase":
        return `Purchased: Order #${event.orderId || "Unknown"} - GH₵ ${Number(event.revenue || 0).toFixed(2)}`;
      case "link_click":
        return `Clicked link: ${metadata.linkText || metadata.linkUrl || "Unknown"}`;
      case "button_click":
        return `Clicked button: ${metadata.buttonText || metadata.buttonId || "Unknown"}`;
      case "search":
        return `Searched: "${metadata.query || "Unknown"}"`;
      default:
        return event.eventType.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());
    }
  };

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-gray-900">User Journey</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex gap-2">
            <Button
              variant={searchType === "session" ? "default" : "outline"}
              size="sm"
              onClick={() => setSearchType("session")}
            >
              By Session
            </Button>
            <Button
              variant={searchType === "user" ? "default" : "outline"}
              size="sm"
              onClick={() => setSearchType("user")}
            >
              By User
            </Button>
          </div>
          {searchType === "session" ? (
            <Input
              placeholder="Enter Session ID"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className="flex-1"
            />
          ) : (
            <Input
              placeholder="Enter User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="flex-1"
            />
          )}
          <Button onClick={() => refetch()} disabled={isLoading}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading journey...</p>
          </div>
        ) : journey && journey.length > 0 ? (
          <div className="space-y-3">
            {journey.map((event: any, index: number) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">{getEventIcon(event.eventType)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">{getEventLabel(event)}</p>
                    <span className="text-xs text-gray-500 ml-4">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(event.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {searchType === "session" && !sessionId
              ? "Enter a session ID to view the journey"
              : searchType === "user" && !userId
              ? "Enter a user ID to view the journey"
              : "No journey data found"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

