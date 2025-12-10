"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Download, Users, CheckCircle2, XCircle, Search } from "lucide-react";
import { toast } from "sonner";

interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  isActive: boolean;
  subscribedAt: string;
  unsubscribedAt?: string;
  source?: string;
}

export function AdminNewsletter() {
  const [activeOnly, setActiveOnly] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: subscribers, isLoading } = useQuery<NewsletterSubscriber[]>({
    queryKey: ["newsletter", "subscribers", activeOnly],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get(`/newsletter/admin/subscribers?activeOnly=${activeOnly}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["newsletter", "stats"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get("/newsletter/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
  });

  const filteredSubscribers = subscribers?.filter((sub) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      sub.email.toLowerCase().includes(query) ||
      (sub.name && sub.name.toLowerCase().includes(query))
    );
  });

  const handleExport = () => {
    if (!filteredSubscribers || filteredSubscribers.length === 0) {
      toast.error("No subscribers to export");
      return;
    }

    const csv = [
      ["Email", "Name", "Status", "Subscribed At", "Source"].join(","),
      ...filteredSubscribers.map((sub) =>
        [
          sub.email,
          sub.name || "",
          sub.isActive ? "Active" : "Inactive",
          new Date(sub.subscribedAt).toLocaleDateString(),
          sub.source || "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Subscribers exported successfully!");
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading subscribers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Newsletter Subscribers</h1>
          <p className="text-gray-600 mt-1">Manage newsletter subscriptions</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">Total Subscribers</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">Active</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold">Inactive</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.inactive || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by email or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={activeOnly ? "default" : "outline"}
                onClick={() => setActiveOnly(true)}
                size="sm"
              >
                Active Only
              </Button>
              <Button
                variant={!activeOnly ? "default" : "outline"}
                onClick={() => setActiveOnly(false)}
                size="sm"
              >
                All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscribers List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Subscribers ({filteredSubscribers?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSubscribers && filteredSubscribers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-semibold">Email</th>
                    <th className="text-left p-3 text-sm font-semibold">Name</th>
                    <th className="text-left p-3 text-sm font-semibold">Status</th>
                    <th className="text-left p-3 text-sm font-semibold">Source</th>
                    <th className="text-left p-3 text-sm font-semibold">Subscribed</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{subscriber.email}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        {subscriber.name || "—"}
                      </td>
                      <td className="p-3">
                        {subscriber.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle className="h-3 w-3" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-sm text-gray-700 capitalize">
                        {subscriber.source || "—"}
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        {new Date(subscriber.subscribedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No subscribers found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
