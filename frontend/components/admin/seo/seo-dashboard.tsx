"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Search, 
  FileText, 
  Link as LinkIcon, 
  AlertCircle,
  Network,
  Sparkles,
  Settings,
  Download,
  BarChart3
} from "lucide-react";
import { SeoPerformanceDashboard } from "./seo-performance-dashboard";

export function SeoDashboard() {
  const { data: redirects } = useQuery({
    queryKey: ["seo", "redirects"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await api.get("/seo/redirects", {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      } catch (error: any) {
        // Gracefully handle 404 - endpoint not implemented yet
        if (error?.response?.status === 404) {
          return [];
        }
        throw error;
      }
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
    retry: false, // Don't retry on 404
  });

  const { data: errors404 } = useQuery({
    queryKey: ["seo", "404s"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await api.get("/seo/404s?resolved=false", {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      } catch (error: any) {
        // Gracefully handle 404 - endpoint not implemented yet
        if (error?.response?.status === 404) {
          return [];
        }
        throw error;
      }
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
    retry: false, // Don't retry on 404
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">SEO Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage your site's SEO settings and optimization</p>
      </div>

      {/* Performance Overview */}
      <SeoPerformanceDashboard />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Active Redirects</CardTitle>
            <LinkIcon className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{redirects?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">404 Errors</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{errors404?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">Sitemaps</CardTitle>
            <Network className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">4</div>
            <p className="text-xs text-gray-500 mt-1">Products, Categories, Images, Pages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">SEO Templates</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">-</div>
            <p className="text-xs text-gray-500 mt-1">Coming soon</p>
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
            <Link
              href="/admin/seo/redirects"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <LinkIcon className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Manage Redirects</p>
                <p className="text-xs text-gray-500">Create and edit URL redirects</p>
              </div>
            </Link>
            <Link
              href="/admin/seo/404s"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="font-medium">View 404 Errors</p>
                <p className="text-xs text-gray-500">Monitor and fix broken links</p>
              </div>
            </Link>
            <Link
              href="/admin/products"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <Sparkles className="h-5 w-5 text-purple-500" />
              <div>
                <p className="font-medium">Product SEO</p>
                <p className="text-xs text-gray-500">Optimize individual product pages</p>
              </div>
            </Link>
            <a
              href="/api/seo/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <Network className="h-5 w-5 text-teal-500" />
              <div>
                <p className="font-medium">View Sitemap</p>
                <p className="text-xs text-gray-500">Check your XML sitemaps</p>
              </div>
            </a>
            <Link
              href="/admin/seo/keywords"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <Search className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Keywords & Analysis</p>
                <p className="text-xs text-gray-500">Research, track, and analyze content</p>
              </div>
            </Link>
            <Link
              href="/admin/seo/backlinks"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <LinkIcon className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">Backlinks & Internal Links</p>
                <p className="text-xs text-gray-500">Monitor backlinks and optimize internal linking</p>
              </div>
            </Link>
            <Link
              href="/admin/seo/templates"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <FileText className="h-5 w-5 text-orange-500" />
              <div>
                <p className="font-medium">SEO Templates</p>
                <p className="text-xs text-gray-500">Manage reusable SEO templates</p>
              </div>
            </Link>
            <Link
              href="/admin/seo/bulk"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <Download className="h-5 w-5 text-indigo-500" />
              <div>
                <p className="font-medium">Bulk Operations</p>
                <p className="text-xs text-gray-500">Apply SEO changes in bulk</p>
              </div>
            </Link>
            <Link
              href="/admin/seo/settings"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <Settings className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">SEO Settings</p>
                <p className="text-xs text-gray-500">Configure global SEO settings</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent 404 Errors */}
      {errors404 && errors404.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent 404 Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {errors404.slice(0, 5).map((error: any) => (
                <div key={error.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="text-sm font-medium">{error.url}</p>
                    <p className="text-xs text-gray-500">{error.hitCount} hits</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Create Redirect
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

