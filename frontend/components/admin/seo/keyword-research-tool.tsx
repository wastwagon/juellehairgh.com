"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, TrendingUp, DollarSign, BarChart3, Lightbulb } from "lucide-react";
import { toast } from "sonner";

export function KeywordResearchTool() {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("gh");
  const [searchedKeyword, setSearchedKeyword] = useState("");

  const researchMutation = useMutation({
    mutationFn: async (keyword: string) => {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/keywords/research",
        { keyword, location },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      setSearchedKeyword(data.keyword);
      toast.success("Keyword research completed!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to research keyword");
    },
  });

  const { data: keywordData } = useQuery({
    queryKey: ["keyword", searchedKeyword],
    queryFn: async () => {
      if (!searchedKeyword) return null;
      const token = localStorage.getItem("token");
      const response = await api.get(`/keywords/${encodeURIComponent(searchedKeyword)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!searchedKeyword,
  });

  const handleResearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) {
      toast.error("Please enter a keyword");
      return;
    }
    researchMutation.mutate(keyword.trim());
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Keyword Research</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResearch} className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Enter keyword to research (e.g., 'lace wigs')"
                className="flex-1"
              />
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="gh">Ghana</option>
                <option value="us">United States</option>
                <option value="uk">United Kingdom</option>
                <option value="ng">Nigeria</option>
              </select>
              <Button
                type="submit"
                disabled={researchMutation.isPending}
              >
                <Search className="h-4 w-4 mr-2" />
                {researchMutation.isPending ? "Researching..." : "Research"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {keywordData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Search Volume</p>
                  <p className="text-2xl font-bold">
                    {keywordData.searchVolume ? keywordData.searchVolume.toLocaleString() : "N/A"}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Difficulty</p>
                  <p className="text-2xl font-bold">
                    {keywordData.difficulty !== null ? `${keywordData.difficulty}/100` : "N/A"}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Competition</p>
                  <p className="text-2xl font-bold">
                    {keywordData.competition !== null 
                      ? `${(Number(keywordData.competition) * 100).toFixed(0)}%` 
                      : "N/A"}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">CPC</p>
                  <p className="text-2xl font-bold">
                    {keywordData.cpc ? `$${Number(keywordData.cpc).toFixed(2)}` : "N/A"}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Suggestions</p>
                  <p className="text-2xl font-bold">
                    {keywordData.suggestions?.length || 0}
                  </p>
                </div>
                <Lightbulb className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {keywordData && keywordData.suggestions && keywordData.suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Related Keyword Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {keywordData.suggestions.map((suggestion: string, index: number) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setKeyword(suggestion);
                    researchMutation.mutate(suggestion);
                  }}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {keywordData && (
        <Card>
          <CardHeader>
            <CardTitle>Keyword Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Keyword:</strong> {keywordData.keyword}
              </p>
              <p>
                <strong>Last Updated:</strong>{" "}
                {new Date(keywordData.updatedAt).toLocaleString()}
              </p>
              {keywordData.searchVolume === null && keywordData.difficulty === null && (
                <p className="text-gray-600 text-xs mt-4">
                  Note: To get real search volume, difficulty, and CPC data, configure external APIs
                  (SerpAPI, DataForSEO, Ahrefs, etc.) in your backend environment variables.
                  See <code className="bg-gray-100 px-1 rounded">backend/SEO_API_SETUP.md</code> for setup instructions.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

