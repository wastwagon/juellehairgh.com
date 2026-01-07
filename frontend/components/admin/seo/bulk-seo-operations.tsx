"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Upload, Sparkles, FileText, Tag, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export function BulkSeoOperations() {
  const [productIds, setProductIds] = useState("");
  const [titleTemplate, setTitleTemplate] = useState("{title} - {brand} | Juelle Hair Ghana");
  const [descriptionTemplate, setDescriptionTemplate] = useState("{description}");
  const [keywords, setKeywords] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [importData, setImportData] = useState("");

  const { data: templates } = useQuery({
    queryKey: ["seo", "templates"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await api.get("/seo/templates", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
  });

  const parseProductIds = () => {
    return productIds
      .split(/[,\n]/)
      .map((id) => id.trim())
      .filter((id) => id.length > 0);
  };

  const bulkUpdateTitlesMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      const ids = parseProductIds();
      const response = await api.post(
        "/seo/bulk/update-titles",
        { productIds: ids, titleTemplate },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Updated ${data.successful} of ${data.total} products`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update titles");
    },
  });

  const bulkUpdateDescriptionsMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      const ids = parseProductIds();
      const response = await api.post(
        "/seo/bulk/update-descriptions",
        { productIds: ids, descriptionTemplate },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Updated ${data.successful} of ${data.total} products`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update descriptions");
    },
  });

  const bulkApplyTemplateMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      const ids = parseProductIds();
      const response = await api.post(
        "/seo/bulk/apply-template",
        { productIds: ids, templateId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Template applied successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to apply template");
    },
  });

  const bulkGenerateSchemaMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      const ids = parseProductIds();
      const response = await api.post(
        "/seo/bulk/generate-schema",
        { productIds: ids },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Generated schema for ${data.successful} of ${data.total} products`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to generate schema");
    },
  });

  const bulkAddKeywordsMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      const ids = parseProductIds();
      const keywordArray = keywords.split(/[,\n]/).map((k) => k.trim()).filter((k) => k.length > 0);
      const response = await api.post(
        "/seo/bulk/add-keywords",
        { productIds: ids, keywords: keywordArray },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Added keywords to ${data.successful} of ${data.total} products`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add keywords");
    },
  });

  const exportMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("token");
      const ids = parseProductIds();
      const response = await api.post(
        "/seo/bulk/export",
        { productIds: ids.length > 0 ? ids : undefined },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Download as JSON
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `seo-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${data.length} products`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to export data");
    },
  });

  const importMutation = useMutation({
    mutationFn: async (data: any[]) => {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/seo/bulk/import",
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Imported ${data.successful} of ${data.total} products`);
      setImportData("");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to import data");
    },
  });

  const handleImport = () => {
    try {
      const data = JSON.parse(importData);
      if (Array.isArray(data)) {
        importMutation.mutate(data);
      } else {
        toast.error("Invalid JSON format. Expected an array.");
      }
    } catch (error) {
      toast.error("Invalid JSON format");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Bulk SEO Operations</h2>
        <p className="text-gray-600 mt-1">Perform SEO operations on multiple products at once</p>
      </div>

      {/* Product IDs Input */}
      <Card>
        <CardHeader>
          <CardTitle>Product IDs</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="productIds">
              Enter Product IDs (one per line or comma-separated)
            </Label>
            <Textarea
              id="productIds"
              value={productIds}
              onChange={(e) => setProductIds(e.target.value)}
              placeholder="product-id-1&#10;product-id-2&#10;product-id-3"
              rows={6}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              {parseProductIds().length} product(s) selected
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="titles" className="w-full">
        <TabsList>
          <TabsTrigger value="titles">Update Titles</TabsTrigger>
          <TabsTrigger value="descriptions">Update Descriptions</TabsTrigger>
          <TabsTrigger value="template">Apply Template</TabsTrigger>
          <TabsTrigger value="schema">Generate Schema</TabsTrigger>
          <TabsTrigger value="keywords">Add Keywords</TabsTrigger>
          <TabsTrigger value="export">Export/Import</TabsTrigger>
        </TabsList>

        <TabsContent value="titles">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Update Meta Titles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="titleTemplate">Title Template</Label>
                <Input
                  id="titleTemplate"
                  value={titleTemplate}
                  onChange={(e) => setTitleTemplate(e.target.value)}
                  placeholder="{title} - {brand} | Juelle Hair Ghana"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available variables: {"{title}"}, {"{brand}"}, {"{category}"}, {"{price}"}, {"{site_name}"}
                </p>
              </div>
              <Button
                onClick={() => bulkUpdateTitlesMutation.mutate()}
                disabled={bulkUpdateTitlesMutation.isPending || parseProductIds().length === 0}
              >
                <FileText className="h-4 w-4 mr-2" />
                {bulkUpdateTitlesMutation.isPending ? "Updating..." : "Update Titles"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="descriptions">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Update Meta Descriptions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="descriptionTemplate">Description Template</Label>
                <Textarea
                  id="descriptionTemplate"
                  value={descriptionTemplate}
                  onChange={(e) => setDescriptionTemplate(e.target.value)}
                  placeholder="{description}"
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available variables: {"{title}"}, {"{brand}"}, {"{category}"}, {"{description}"}, {"{site_name}"}
                </p>
              </div>
              <Button
                onClick={() => bulkUpdateDescriptionsMutation.mutate()}
                disabled={bulkUpdateDescriptionsMutation.isPending || parseProductIds().length === 0}
              >
                <FileText className="h-4 w-4 mr-2" />
                {bulkUpdateDescriptionsMutation.isPending ? "Updating..." : "Update Descriptions"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="template">
          <Card>
            <CardHeader>
              <CardTitle>Apply SEO Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="templateId">Select Template</Label>
                <select
                  id="templateId"
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select a template</option>
                  {templates?.map((template: any) => (
                    <option key={template.id} value={template.id}>
                      {template.name} ({template.type})
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={() => bulkApplyTemplateMutation.mutate()}
                disabled={bulkApplyTemplateMutation.isPending || !templateId || parseProductIds().length === 0}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {bulkApplyTemplateMutation.isPending ? "Applying..." : "Apply Template"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schema">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Generate Schema Markup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Generate schema markup for all selected products. This will create or update the JSON-LD schema
                for each product.
              </p>
              <Button
                onClick={() => bulkGenerateSchemaMutation.mutate()}
                disabled={bulkGenerateSchemaMutation.isPending || parseProductIds().length === 0}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {bulkGenerateSchemaMutation.isPending ? "Generating..." : "Generate Schema"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keywords">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Add Keywords</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="keywords">Keywords (one per line or comma-separated)</Label>
                <Textarea
                  id="keywords"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="keyword1&#10;keyword2&#10;keyword3"
                  rows={4}
                />
              </div>
              <Button
                onClick={() => bulkAddKeywordsMutation.mutate()}
                disabled={bulkAddKeywordsMutation.isPending || !keywords.trim() || parseProductIds().length === 0}
              >
                <Tag className="h-4 w-4 mr-2" />
                {bulkAddKeywordsMutation.isPending ? "Adding..." : "Add Keywords"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Export SEO Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Export SEO data for selected products (or all products if none selected) as JSON.
                </p>
                <Button
                  onClick={() => exportMutation.mutate()}
                  disabled={exportMutation.isPending}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {exportMutation.isPending ? "Exporting..." : "Export SEO Data"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Import SEO Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="importData">Paste JSON Data</Label>
                  <Textarea
                    id="importData"
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder='[{"productId": "...", "metaTitle": "...", ...}]'
                    rows={8}
                    className="font-mono text-xs"
                  />
                </div>
                <Button
                  onClick={handleImport}
                  disabled={importMutation.isPending || !importData.trim()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {importMutation.isPending ? "Importing..." : "Import SEO Data"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}














