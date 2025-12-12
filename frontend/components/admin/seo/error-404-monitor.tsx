"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export function Error404Monitor() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "resolved" | "unresolved">("unresolved");

  const { data: errors, isLoading } = useQuery({
    queryKey: ["seo", "404s", filter],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const resolved = filter === "resolved" ? true : filter === "unresolved" ? false : undefined;
      const response = await api.get(`/seo/404s?resolved=${resolved !== undefined ? resolved : ""}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ id, redirectId }: { id: string; redirectId?: string }) => {
      const token = localStorage.getItem("token");
      const response = await api.post(`/seo/404s/${id}/resolve`, { redirectId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo", "404s"] });
      toast.success("404 error resolved!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to resolve error");
    },
  });

  const handleResolve = (id: string) => {
    if (confirm("Mark this 404 error as resolved?")) {
      resolveMutation.mutate({ id });
    }
  };

  const unresolvedCount = errors?.filter((e: any) => !e.resolved).length || 0;
  const resolvedCount = errors?.filter((e: any) => e.resolved).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">404 Error Monitor</h1>
          <p className="text-gray-600 mt-1">Track and resolve broken links on your site</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === "unresolved" ? "default" : "outline"}
            onClick={() => setFilter("unresolved")}
          >
            Unresolved ({unresolvedCount})
          </Button>
          <Button
            variant={filter === "resolved" ? "default" : "outline"}
            onClick={() => setFilter("resolved")}
          >
            Resolved ({resolvedCount})
          </Button>
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            All
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total 404 Errors</p>
                <p className="text-2xl font-bold">{errors?.length || 0}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unresolved</p>
                <p className="text-2xl font-bold text-red-600">{unresolvedCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{resolvedCount}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Errors List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filter === "unresolved" ? "Unresolved 404 Errors" :
             filter === "resolved" ? "Resolved 404 Errors" :
             "All 404 Errors"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : errors && errors.length > 0 ? (
            <div className="space-y-4">
              {errors.map((error: any) => (
                <div
                  key={error.id}
                  className={`p-4 border rounded-lg ${
                    error.resolved ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {error.url}
                        </code>
                        {error.resolved ? (
                          <span className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle2 className="h-3 w-3" />
                            Resolved
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-red-600">
                            <AlertCircle className="h-3 w-3" />
                            Unresolved
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-600">
                        <div>
                          <strong>Hits:</strong> {error.hitCount}
                        </div>
                        <div>
                          <strong>First Seen:</strong>{" "}
                          {new Date(error.firstSeen).toLocaleDateString()}
                        </div>
                        <div>
                          <strong>Last Seen:</strong>{" "}
                          {new Date(error.lastSeen).toLocaleDateString()}
                        </div>
                      </div>
                      {error.referer && (
                        <div className="mt-2 text-xs text-gray-500">
                          <strong>Referer:</strong> {error.referer}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      {!error.resolved && (
                        <>
                          <Link href={`/admin/seo/redirects?create=${encodeURIComponent(error.url)}`}>
                            <Button variant="outline" size="sm">
                              Create Redirect
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResolve(error.id)}
                          >
                            Mark Resolved
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
              {filter === "unresolved"
                ? "No unresolved 404 errors. Great job!"
                : filter === "resolved"
                ? "No resolved errors yet."
                : "No 404 errors tracked yet."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}











