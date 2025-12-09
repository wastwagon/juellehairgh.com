"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link2, Plus, Trash2, Sparkles, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export function InternalLinkingTool() {
  const queryClient = useQueryClient();
  const [productId, setProductId] = useState("");

  const { data: suggestions } = useQuery({
    queryKey: ["internal-links", "suggestions", productId],
    queryFn: async () => {
      if (!productId) return null;
      const token = localStorage.getItem("token");
      const response = await api.get(`/backlinks/internal/suggestions/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!productId,
  });

  const { data: existingLinks } = useQuery({
    queryKey: ["internal-links", productId],
    queryFn: async () => {
      if (!productId) return null;
      const token = localStorage.getItem("token");
      const response = await api.get(`/backlinks/internal?sourceId=${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!productId,
  });

  const { data: stats } = useQuery({
    queryKey: ["internal-links", "stats"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await api.get("/backlinks/internal/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
  });

  const addLinkMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem("token");
      const response = await api.post("/backlinks/internal", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["internal-links", productId] });
      queryClient.invalidateQueries({ queryKey: ["internal-links", "suggestions", productId] });
      queryClient.invalidateQueries({ queryKey: ["internal-links", "stats"] });
      toast.success("Internal link added!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add internal link");
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("token");
      await api.delete(`/backlinks/internal/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["internal-links", productId] });
      queryClient.invalidateQueries({ queryKey: ["internal-links", "stats"] });
      toast.success("Internal link removed!");
    },
  });

  const handleAddLink = (targetId: string, targetType: string, anchorText?: string) => {
    if (!productId) {
      toast.error("Please enter a product ID first");
      return;
    }

    addLinkMutation.mutate({
      sourceId: productId,
      sourceType: "product",
      targetId,
      targetType,
      anchorText: anchorText || suggestions?.suggestions?.find((s: any) => s.id === targetId)?.title,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Internal Linking Tool</h2>
          <p className="text-gray-600 mt-1">Get AI-powered suggestions for internal links</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Internal Links</p>
                  <p className="text-2xl font-bold">{stats.total || 0}</p>
                </div>
                <Link2 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">By Source Type</p>
                {stats.bySourceType && stats.bySourceType.length > 0 ? (
                  <div className="space-y-1">
                    {stats.bySourceType.map((item: any) => (
                      <div key={item.type} className="flex justify-between text-sm">
                        <span className="capitalize">{item.type}</span>
                        <span className="font-medium">{item.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No data</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">By Target Type</p>
                {stats.byTargetType && stats.byTargetType.length > 0 ? (
                  <div className="space-y-1">
                    {stats.byTargetType.map((item: any) => (
                      <div key={item.type} className="flex justify-between text-sm">
                        <span className="capitalize">{item.type}</span>
                        <span className="font-medium">{item.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No data</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Product ID Input */}
      <Card>
        <CardHeader>
          <CardTitle>Get Link Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Input
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="Enter Product ID"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter a product ID to get AI-powered internal linking suggestions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions */}
      {suggestions && suggestions.suggestions && suggestions.suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Link Suggestions for: {suggestions.product?.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suggestions.suggestions.map((suggestion: any) => {
                const isLinked = existingLinks?.some((link: any) => link.targetId === suggestion.id);
                return (
                  <div
                    key={suggestion.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={suggestion.url}
                          className="font-medium text-blue-600 hover:underline"
                          target="_blank"
                        >
                          {suggestion.title}
                        </Link>
                        <Badge variant="outline" className="text-xs">
                          {suggestion.reason}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">{suggestion.url}</p>
                    </div>
                    <div className="ml-4">
                      {isLinked ? (
                        <Badge className="bg-green-100 text-green-800">Linked</Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleAddLink(suggestion.id, "product")}
                          disabled={addLinkMutation.isPending}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Link
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Links */}
      {existingLinks && existingLinks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Existing Internal Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {existingLinks.map((link: any) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">
                      {link.anchorText || "Internal Link"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Links to: {link.targetType} ({link.targetId})
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm("Remove this internal link?")) {
                        deleteLinkMutation.mutate(link.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {suggestions && suggestions.suggestions && suggestions.suggestions.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-gray-500">
              No link suggestions available. All related products are already linked.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}





