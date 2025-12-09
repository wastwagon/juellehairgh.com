"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export function ContentAnalyzer() {
  const queryClient = useQueryClient();
  const [productId, setProductId] = useState("");

  const analyzeMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("token");
      const response = await api.post(`/keywords/analyze/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-analysis", productId] });
      toast.success("Content analyzed successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to analyze content");
    },
  });

  const { data: analysis } = useQuery({
    queryKey: ["content-analysis", productId],
    queryFn: async () => {
      if (!productId) return null;
      const token = localStorage.getItem("token");
      const response = await api.get(`/keywords/analysis/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!productId,
  });

  const { data: allAnalyses } = useQuery({
    queryKey: ["content-analyses", "all"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await api.get("/keywords/analysis", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
  });

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId.trim()) {
      toast.error("Please enter a product ID");
      return;
    }
    analyzeMutation.mutate(productId.trim());
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Analysis</h2>
          <p className="text-gray-600 mt-1">Analyze product content for SEO optimization</p>
        </div>
      </div>

      {/* Analyze Product */}
      <Card>
        <CardHeader>
          <CardTitle>Analyze Product Content</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <Input
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="Enter Product ID"
              />
              <p className="text-xs text-gray-500 mt-1">
                You can find the Product ID in the admin products list
              </p>
            </div>
            <Button type="submit" disabled={analyzeMutation.isPending}>
              <Sparkles className="h-4 w-4 mr-2" />
              {analyzeMutation.isPending ? "Analyzing..." : "Analyze Content"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                SEO Score
                <Badge className={getScoreBadge(analysis.seoScore)}>
                  {analysis.seoScore}/100
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Overall Score</span>
                    <span className={getScoreColor(analysis.seoScore)}>
                      {analysis.seoScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        analysis.seoScore >= 80
                          ? "bg-green-500"
                          : analysis.seoScore >= 60
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${analysis.seoScore}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600">Word Count</p>
                    <p className="text-2xl font-bold">{analysis.wordCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Readability</p>
                    <p className="text-2xl font-bold">
                      {analysis.readabilityScore ? `${analysis.readabilityScore}/100` : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Content Length</p>
                    <p className="text-2xl font-bold">{analysis.contentLength || 0} chars</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Analyzed</p>
                    <p className="text-sm font-medium">
                      {new Date(analysis.lastAnalyzed).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              {analysis.recommendations && analysis.recommendations.length > 0 ? (
                <div className="space-y-2">
                  {analysis.recommendations.map((rec: string, index: number) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-yellow-50 rounded">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{rec}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <p>No recommendations. Your content is well optimized!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Keyword Density */}
          {analysis.keywordDensity && Object.keys(analysis.keywordDensity).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Keyword Density</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(analysis.keywordDensity).map(([keyword, density]: [string, any]) => (
                    <div key={keyword} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{keyword}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              density >= 1 && density <= 3
                                ? "bg-green-500"
                                : density > 3
                                ? "bg-red-500"
                                : "bg-yellow-500"
                            }`}
                            style={{ width: `${Math.min(density * 10, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">
                          {Number(density).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Optimal keyword density: 1-3%
                </p>
              </CardContent>
            </Card>
          )}

          {/* Image Optimization */}
          {analysis.imageOptimization && (
            <Card>
              <CardHeader>
                <CardTitle>Image Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Images</span>
                    <span className="font-medium">{analysis.imageOptimization.totalImages || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Images with Alt Text</span>
                    <span className="font-medium">
                      {analysis.imageOptimization.imagesWithAlt || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Alt Coverage</span>
                    <span className="font-medium">
                      {analysis.imageOptimization.altCoverage
                        ? `${Number(analysis.imageOptimization.altCoverage).toFixed(1)}%`
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* All Analyses */}
      {allAnalyses && allAnalyses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Content Analyses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {allAnalyses.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="font-medium">
                      {item.product?.title || `Product ${item.productId}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      SEO Score: {item.seoScore}/100 • Word Count: {item.wordCount || 0}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getScoreBadge(item.seoScore)}>
                      {item.seoScore}/100
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setProductId(item.productId);
                        queryClient.invalidateQueries({ queryKey: ["content-analysis", item.productId] });
                      }}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}







