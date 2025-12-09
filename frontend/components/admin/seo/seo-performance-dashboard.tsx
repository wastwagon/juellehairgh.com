"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  FileText, 
  Search, 
  Link as LinkIcon,
  AlertCircle,
  CheckCircle2,
  BarChart3
} from "lucide-react";
import Link from "next/link";

export function SeoPerformanceDashboard() {
  const { data: seoStats } = useQuery({
    queryKey: ["seo", "performance"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      
      // Fetch all relevant SEO data
      const [products, redirects, errors404, backlinks, keywords, analyses] = await Promise.all([
        api.get("/products?limit=1000", {
          headers: { Authorization: `Bearer ${token}` },
        }).then(r => r.data.products || []).catch(() => []),
        api.get("/seo/redirects", {
          headers: { Authorization: `Bearer ${token}` },
        }).then(r => r.data || []).catch(() => []),
        api.get("/seo/404s?resolved=false", {
          headers: { Authorization: `Bearer ${token}` },
        }).then(r => r.data || []).catch(() => []),
        api.get("/backlinks/stats", {
          headers: { Authorization: `Bearer ${token}` },
        }).then(r => r.data || {}).catch(() => ({})),
        api.get("/keywords/tracking/list", {
          headers: { Authorization: `Bearer ${token}` },
        }).then(r => r.data || []).catch(() => []),
        api.get("/keywords/analysis", {
          headers: { Authorization: `Bearer ${token}` },
        }).then(r => r.data || []).catch(() => []),
      ]);

      // Calculate stats
      const productsWithSEO = products.filter((p: any) => p.seo).length;
      const avgSeoScore = analyses.length > 0
        ? Math.round(analyses.reduce((sum: number, a: any) => sum + (a.seoScore || 0), 0) / analyses.length)
        : 0;
      const productsNeedingOptimization = analyses.filter((a: any) => a.seoScore < 60).length;
      const productsOptimized = analyses.filter((a: any) => a.seoScore >= 80).length;

      return {
        totalProducts: products.length,
        productsWithSEO,
        seoCoverage: products.length > 0 ? Math.round((productsWithSEO / products.length) * 100) : 0,
        avgSeoScore,
        productsNeedingOptimization,
        productsOptimized,
        totalRedirects: redirects.length,
        activeRedirects: redirects.filter((r: any) => r.active).length,
        errors404: errors404.length,
        totalBacklinks: backlinks.total || 0,
        activeBacklinks: backlinks.active || 0,
        toxicBacklinks: backlinks.toxic || 0,
        trackedKeywords: keywords.length,
        totalAnalyses: analyses.length,
      };
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
  });

  if (!seoStats) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading SEO performance data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">SEO Performance Overview</h2>
        <p className="text-gray-600 mt-1">Comprehensive SEO health and performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">SEO Coverage</p>
                <p className="text-2xl font-bold">{seoStats.seoCoverage}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  {seoStats.productsWithSEO} of {seoStats.totalProducts} products
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average SEO Score</p>
                <p className="text-2xl font-bold">{seoStats.avgSeoScore}/100</p>
                <p className="text-xs text-gray-500 mt-1">
                  {seoStats.totalAnalyses} products analyzed
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Optimized Products</p>
                <p className="text-2xl font-bold text-green-600">{seoStats.productsOptimized}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Score ≥ 80/100
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Needs Optimization</p>
                <p className="text-2xl font-bold text-orange-600">{seoStats.productsNeedingOptimization}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Score &lt; 60/100
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tracked Keywords</p>
                <p className="text-2xl font-bold">{seoStats.trackedKeywords}</p>
              </div>
              <Search className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Backlinks</p>
                <p className="text-2xl font-bold text-green-600">{seoStats.activeBacklinks}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {seoStats.toxicBacklinks} toxic
                </p>
              </div>
              <LinkIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Redirects</p>
                <p className="text-2xl font-bold">{seoStats.activeRedirects}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {seoStats.totalRedirects} total
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">404 Errors</p>
                <p className="text-2xl font-bold text-red-600">{seoStats.errors404}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Unresolved
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/admin/seo/keywords?tab=analysis" className="block">
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-6 w-6 text-blue-500" />
                  <div>
                    <p className="font-medium">Analyze Content</p>
                    <p className="text-xs text-gray-500">Run content analysis</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/admin/seo/backlinks" className="block">
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <LinkIcon className="h-6 w-6 text-green-500" />
                  <div>
                    <p className="font-medium">Review Backlinks</p>
                    <p className="text-xs text-gray-500">Check backlink profile</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/admin/seo/404s" className="block">
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                  <div>
                    <p className="font-medium">Fix 404 Errors</p>
                    <p className="text-xs text-gray-500">Resolve broken links</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

