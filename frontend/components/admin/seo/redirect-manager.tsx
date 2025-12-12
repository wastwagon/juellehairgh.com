"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export function RedirectManager() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingRedirect, setEditingRedirect] = useState<any>(null);
  const [formData, setFormData] = useState({
    sourceUrl: "",
    targetUrl: "",
    type: "301",
    regex: false,
    active: true,
  });

  const { data: redirects, isLoading } = useQuery({
    queryKey: ["seo", "redirects"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await api.get("/seo/redirects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = localStorage.getItem("token");
      const response = await api.post("/seo/redirects", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo", "redirects"] });
      toast.success("Redirect created successfully!");
      setShowForm(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create redirect");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const token = localStorage.getItem("token");
      const response = await api.put(`/seo/redirects/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo", "redirects"] });
      toast.success("Redirect updated successfully!");
      setShowForm(false);
      setEditingRedirect(null);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update redirect");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("token");
      await api.delete(`/seo/redirects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo", "redirects"] });
      toast.success("Redirect deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete redirect");
    },
  });

  const resetForm = () => {
    setFormData({
      sourceUrl: "",
      targetUrl: "",
      type: "301",
      regex: false,
      active: true,
    });
    setEditingRedirect(null);
  };

  const handleEdit = (redirect: any) => {
    setEditingRedirect(redirect);
    setFormData({
      sourceUrl: redirect.sourceUrl,
      targetUrl: redirect.targetUrl,
      type: redirect.type,
      regex: redirect.regex,
      active: redirect.active,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRedirect) {
      updateMutation.mutate({ id: editingRedirect.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Redirect Manager</h1>
          <p className="text-gray-600 mt-1">Manage URL redirects and handle broken links</p>
        </div>
        <Button onClick={() => { setShowForm(true); resetForm(); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Redirect
        </Button>
      </div>

      {/* Redirect Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingRedirect ? "Edit Redirect" : "Add New Redirect"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="sourceUrl">Source URL *</Label>
                <Input
                  id="sourceUrl"
                  value={formData.sourceUrl}
                  onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                  placeholder="/old-url or regex pattern"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the URL to redirect from (e.g., /old-page or regex pattern)
                </p>
              </div>

              <div>
                <Label htmlFor="targetUrl">Target URL *</Label>
                <Input
                  id="targetUrl"
                  value={formData.targetUrl}
                  onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                  placeholder="/new-url or https://example.com"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the URL to redirect to (can be relative or absolute)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Redirect Type</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="301">301 - Permanent</option>
                    <option value="302">302 - Temporary</option>
                    <option value="307">307 - Temporary (Preserve Method)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.regex}
                      onChange={(e) => setFormData({ ...formData, regex: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Use Regex Pattern</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingRedirect ? "Update Redirect" : "Create Redirect"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowForm(false); resetForm(); }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Redirects List */}
      <Card>
        <CardHeader>
          <CardTitle>All Redirects ({redirects?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : redirects && redirects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-semibold">Source URL</th>
                    <th className="text-left p-3 text-sm font-semibold">Target URL</th>
                    <th className="text-left p-3 text-sm font-semibold">Type</th>
                    <th className="text-left p-3 text-sm font-semibold">Hits</th>
                    <th className="text-left p-3 text-sm font-semibold">Status</th>
                    <th className="text-left p-3 text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {redirects.map((redirect: any) => (
                    <tr key={redirect.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {redirect.sourceUrl}
                        </code>
                        {redirect.regex && (
                          <span className="ml-2 text-xs text-blue-600">(regex)</span>
                        )}
                      </td>
                      <td className="p-3">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {redirect.targetUrl}
                        </code>
                      </td>
                      <td className="p-3">
                        <span className="text-xs font-medium">{redirect.type}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm">{redirect.hitCount || 0}</span>
                      </td>
                      <td className="p-3">
                        {redirect.active ? (
                          <span className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <XCircle className="h-3 w-3" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(redirect)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this redirect?")) {
                                deleteMutation.mutate(redirect.id);
                              }
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No redirects found. Create your first redirect above.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}











