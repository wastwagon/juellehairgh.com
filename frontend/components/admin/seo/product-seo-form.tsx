"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Sparkles, Eye, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface ProductSEOFormProps {
  productId: string;
  onClose?: () => void;
  embedded?: boolean; // If true, don't show close button and adjust layout
}

export function ProductSEOForm({ productId, onClose, embedded = false }: ProductSEOFormProps) {
  const queryClient = useQueryClient();
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");

  const { data: seo, isLoading } = useQuery({
    queryKey: ["seo", "product", productId],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await api.get(`/seo/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!productId,
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      const response = await api.post(`/seo/products/${productId}/generate`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo", "product", productId] });
      toast.success("SEO data generated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to generate SEO data");
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem("token");
      const response = await api.post(`/seo/products/${productId}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo", "product", productId] });
      toast.success("SEO data saved successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to save SEO data");
    },
  });

  useEffect(() => {
    if (seo) {
      setKeywords(seo.keywords || []);
    }
  }, [seo]);

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      metaTitle: formData.get("metaTitle") as string,
      metaDescription: formData.get("metaDescription") as string,
      focusKeyword: formData.get("focusKeyword") as string,
      keywords,
      ogTitle: formData.get("ogTitle") as string,
      ogDescription: formData.get("ogDescription") as string,
      ogImage: formData.get("ogImage") as string,
      twitterCard: formData.get("twitterCard") as string,
      canonicalUrl: formData.get("canonicalUrl") as string,
      noindex: formData.get("noindex") === "on",
      nofollow: formData.get("nofollow") === "on",
    };
    saveMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Product SEO Settings</h3>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Auto-Generate
          </Button>
          {onClose && !embedded && (
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Meta Title & Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Meta Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="metaTitle">Meta Title</Label>
            <Input
              id="metaTitle"
              name="metaTitle"
              defaultValue={seo?.metaTitle || ""}
              placeholder="Product Title - Brand | Juelle Hair Ghana"
              maxLength={60}
            />
            <p className="text-xs text-gray-500 mt-1">Recommended: 50-60 characters</p>
          </div>

          <div>
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Textarea
              id="metaDescription"
              name="metaDescription"
              defaultValue={seo?.metaDescription || ""}
              placeholder="Compelling product description for search results..."
              rows={3}
              maxLength={160}
            />
            <p className="text-xs text-gray-500 mt-1">Recommended: 150-160 characters</p>
          </div>

          <div>
            <Label htmlFor="focusKeyword">Focus Keyword</Label>
            <Input
              id="focusKeyword"
              name="focusKeyword"
              defaultValue={seo?.focusKeyword || ""}
              placeholder="Primary keyword for this product"
            />
          </div>

          <div>
            <Label>Additional Keywords</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddKeyword();
                  }
                }}
                placeholder="Add keyword and press Enter"
              />
              <Button type="button" onClick={handleAddKeyword} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword) => (
                <Badge key={keyword} variant="secondary" className="flex items-center gap-1">
                  {keyword}
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(keyword)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Open Graph & Social */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Social Media (Open Graph)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="ogTitle">OG Title</Label>
            <Input
              id="ogTitle"
              name="ogTitle"
              defaultValue={seo?.ogTitle || ""}
              placeholder="Leave empty to use meta title"
            />
          </div>

          <div>
            <Label htmlFor="ogDescription">OG Description</Label>
            <Textarea
              id="ogDescription"
              name="ogDescription"
              defaultValue={seo?.ogDescription || ""}
              rows={2}
              placeholder="Leave empty to use meta description"
            />
          </div>

          <div>
            <Label htmlFor="ogImage">OG Image URL</Label>
            <Input
              id="ogImage"
              name="ogImage"
              defaultValue={seo?.ogImage || ""}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">Recommended: 1200x630px</p>
          </div>

          <div>
            <Label htmlFor="twitterCard">Twitter Card Type</Label>
            <select
              id="twitterCard"
              name="twitterCard"
              defaultValue={seo?.twitterCard || "summary_large_image"}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="summary">Summary</option>
              <option value="summary_large_image">Summary Large Image</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Advanced */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Advanced Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="canonicalUrl">Canonical URL</Label>
            <Input
              id="canonicalUrl"
              name="canonicalUrl"
              defaultValue={seo?.canonicalUrl || ""}
              placeholder="Leave empty for default"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="noindex"
                defaultChecked={seo?.noindex || false}
                className="rounded"
              />
              <span className="text-sm">Noindex (hide from search engines)</span>
            </label>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="nofollow"
                defaultChecked={seo?.nofollow || false}
                className="rounded"
              />
              <span className="text-sm">Nofollow (don't follow links)</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Schema Preview */}
      {seo?.schemaData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Schema Markup (Auto-generated)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-50 p-4 rounded-md text-xs overflow-auto max-h-64">
              {JSON.stringify(seo.schemaData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {!embedded && (
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Saving..." : "Save SEO Settings"}
          </Button>
        </div>
      )}
    </form>
  );
}

