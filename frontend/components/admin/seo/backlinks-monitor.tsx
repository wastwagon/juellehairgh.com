"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, AlertTriangle, CheckCircle2, XCircle, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function BacklinksMonitor() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "active" | "toxic" | "lost">("all");
  const [scanUrl, setScanUrl] = useState("");

  const { data: backlinks, isLoading } = useQuery({
    queryKey: ["backlinks", filter],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const status = filter !== "all" ? filter : undefined;
      const response = await api.get(`/backlinks?status=${status || ""}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
  });

  const { data: stats } = useQuery({
    queryKey: ["backlinks", "stats"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await api.get("/backlinks/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
  });

  const { data: toxicBacklinks } = useQuery({
    queryKey: ["backlinks", "toxic"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await api.get("/backlinks/toxic", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
  });

  const scanMutation = useMutation({
    mutationFn: async (url: string) => {
      const token = localStorage.getItem("token");
      const response = await api.post("/backlinks/scan", { targetUrl: url }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backlinks"] });
      toast.success("Backlink scan initiated!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to scan backlinks");
    },
  });

  const markToxicMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("token");
      const response = await api.post(`/backlinks/${id}/toxic`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backlinks"] });
      toast.success("Backlink marked as toxic");
    },
  });

  const markLostMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("token");
      const response = await api.post(`/backlinks/${id}/lost`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backlinks"] });
      toast.success("Backlink marked as lost");
    },
  });

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanUrl.trim()) {
      toast.error("Please enter a URL to scan");
      return;
    }
    scanMutation.mutate(scanUrl.trim());
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "toxic":
        return <Badge className="bg-red-100 text-red-800">Toxic</Badge>;
      case "lost":
        return <Badge className="bg-gray-100 text-gray-800">Lost</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Backlinks Monitor</h2>
          <p className="text-gray-600 mt-1">Monitor and manage your backlink profile</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "active" ? "default" : "outline"}
            onClick={() => setFilter("active")}
          >
            Active
          </Button>
          <Button
            variant={filter === "toxic" ? "default" : "outline"}
            onClick={() => setFilter("toxic")}
          >
            Toxic
          </Button>
          <Button
            variant={filter === "lost" ? "default" : "outline"}
            onClick={() => setFilter("lost")}
          >
            Lost
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Backlinks</p>
                  <p className="text-2xl font-bold">{stats.total || 0}</p>
                </div>
                <ExternalLink className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active || 0}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toxic</p>
                  <p className="text-2xl font-bold text-red-600">{stats.toxic || 0}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Lost</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.lost || 0}</p>
                </div>
                <XCircle className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Scan for Backlinks */}
      <Card>
        <CardHeader>
          <CardTitle>Scan for Backlinks</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleScan} className="space-y-4">
            <div>
              <Input
                value={scanUrl}
                onChange={(e) => setScanUrl(e.target.value)}
                placeholder="Enter URL to scan for backlinks (e.g., https://juellehairgh.com)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Note: Backlink scanning requires integration with external APIs (Ahrefs, Majestic, Moz)
              </p>
            </div>
            <Button type="submit" disabled={scanMutation.isPending}>
              <RefreshCw className={`h-4 w-4 mr-2 ${scanMutation.isPending ? "animate-spin" : ""}`} />
              {scanMutation.isPending ? "Scanning..." : "Scan Backlinks"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Toxic Backlinks Alert */}
      {toxicBacklinks && toxicBacklinks.length > 0 && filter !== "toxic" && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Toxic Backlinks Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-700 mb-4">
              {toxicBacklinks.length} toxic backlink(s) detected. Review and take action.
            </p>
            <Button
              variant="outline"
              onClick={() => setFilter("toxic")}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              View Toxic Backlinks
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Backlinks List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filter === "all" ? "All Backlinks" :
             filter === "active" ? "Active Backlinks" :
             filter === "toxic" ? "Toxic Backlinks" :
             "Lost Backlinks"} ({backlinks?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : backlinks && backlinks.length > 0 ? (
            <div className="space-y-4">
              {backlinks.map((backlink: any) => (
                <div
                  key={backlink.id}
                  className="p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(backlink.status)}
                        <a
                          href={backlink.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {backlink.sourceUrl}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        Links to: <span className="font-medium">{backlink.targetUrl}</span>
                      </p>
                      {backlink.anchorText && (
                        <p className="text-xs text-gray-500">
                          Anchor: "{backlink.anchorText}"
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Domain: {backlink.domain}</span>
                        {backlink.domainAuthority !== null && (
                          <span>DA: {backlink.domainAuthority}</span>
                        )}
                        {backlink.spamScore !== null && (
                          <span className={backlink.spamScore >= 70 ? "text-red-600 font-medium" : ""}>
                            Spam Score: {backlink.spamScore}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {backlink.status === "active" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (confirm("Mark this backlink as toxic?")) {
                                markToxicMutation.mutate(backlink.id);
                              }
                            }}
                          >
                            Mark Toxic
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (confirm("Mark this backlink as lost?")) {
                                markLostMutation.mutate(backlink.id);
                              }
                            }}
                          >
                            Mark Lost
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No backlinks found. Use the scan feature above to discover backlinks.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Domains */}
      {stats && stats.topDomains && stats.topDomains.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Linking Domains</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.topDomains.map((domain: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <span className="font-medium">{domain.domain}</span>
                  <Badge>{domain.count} links</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}














