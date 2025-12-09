"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { toast } from "sonner";

export function KeywordRankTracker() {
  const queryClient = useQueryClient();
  const [newKeyword, setNewKeyword] = useState("");
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);

  const { data: trackedKeywords } = useQuery({
    queryKey: ["keywords", "tracking"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await api.get("/keywords/tracking/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
  });

  const { data: dashboard } = useQuery({
    queryKey: ["keywords", "dashboard"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await api.get("/keywords/tracking/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
  });

  const { data: rankHistory } = useQuery({
    queryKey: ["keywords", "ranks", selectedKeyword],
    queryFn: async () => {
      if (!selectedKeyword) return null;
      const token = localStorage.getItem("token");
      const response = await api.get(`/keywords/tracking/${encodeURIComponent(selectedKeyword)}/ranks?days=30`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!selectedKeyword,
  });

  const trackMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem("token");
      const response = await api.post("/keywords/track", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["keywords", "tracking"] });
      queryClient.invalidateQueries({ queryKey: ["keywords", "dashboard"] });
      toast.success("Keyword tracking started!");
      setNewKeyword("");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to track keyword");
    },
  });

  const handleTrackKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) {
      toast.error("Please enter a keyword");
      return;
    }

    trackMutation.mutate({
      keyword: newKeyword.trim(),
      pageUrl: window.location.origin, // Default to homepage, can be customized
      country: "gh",
      device: "desktop",
    });
  };

  const getPositionChange = (change: number | null) => {
    if (change === null) return null;
    if (change > 0) return { icon: TrendingUp, color: "text-green-600", text: `+${change}` };
    if (change < 0) return { icon: TrendingDown, color: "text-red-600", text: `${change}` };
    return { icon: Minus, color: "text-gray-600", text: "0" };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Keyword Rank Tracking</h2>
          <p className="text-gray-600 mt-1">Track your keyword positions in search results</p>
        </div>
      </div>

      {/* Add Keyword to Track */}
      <Card>
        <CardHeader>
          <CardTitle>Track New Keyword</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTrackKeyword} className="space-y-4">
            <div>
              <Label htmlFor="keyword">Keyword</Label>
              <Input
                id="keyword"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Enter keyword to track"
              />
            </div>
            <Button type="submit" disabled={trackMutation.isPending}>
              <Plus className="h-4 w-4 mr-2" />
              {trackMutation.isPending ? "Tracking..." : "Start Tracking"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Dashboard Stats */}
      {dashboard && dashboard.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ranking Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard.map((stat: any, index: number) => {
                const change = getPositionChange(stat.change);
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedKeyword(stat.keyword)}
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{stat.keyword}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>
                          Current: {stat.currentPosition ? `#${stat.currentPosition}` : "Not ranked"}
                        </span>
                        {stat.previousPosition && (
                          <span>Previous: #{stat.previousPosition}</span>
                        )}
                        {change && (
                          <span className={`flex items-center gap-1 ${change.color}`}>
                            {change.icon && <change.icon className="h-4 w-4" />}
                            {change.text}
                          </span>
                        )}
                      </div>
                    </div>
                    {stat.lastUpdated && (
                      <p className="text-xs text-gray-500">
                        {new Date(stat.lastUpdated).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rank History Chart */}
      {selectedKeyword && rankHistory && rankHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rank History: {selectedKeyword}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {rankHistory.map((rank: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="text-sm font-medium">{new Date(rank.date).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">{rank.device} • {rank.country}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      {rank.position ? `#${rank.position}` : "Not ranked"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Note: Actual rank tracking requires integration with Google Search Console API or
              third-party rank tracking services. Currently showing placeholder data structure.
            </p>
          </CardContent>
        </Card>
      )}

      {(!dashboard || dashboard.length === 0) && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-gray-500">
              No keywords being tracked yet. Start tracking keywords above.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}





