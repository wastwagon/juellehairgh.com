"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, X, Search } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { SwatchImagePicker } from "@/components/admin/swatch-image-picker";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProductAttribute {
  id: string;
  name: string;
  slug: string;
  description?: string;
  terms: ProductAttributeTerm[];
}

interface ProductAttributeTerm {
  id: string;
  attributeId: string;
  name: string;
  slug: string;
  image?: string;
}

interface EditingTermState {
  attributeId: string;
  term: ProductAttributeTerm | null;
}

export function AdminAttributes() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<ProductAttribute | null>(null);
  const [editingTerm, setEditingTerm] = useState<EditingTermState | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newAttributeName, setNewAttributeName] = useState("");
  const [newAttributeDescription, setNewAttributeDescription] = useState("");
  const [newTermName, setNewTermName] = useState("");
  const [newTermImage, setNewTermImage] = useState("");
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token) {
      router.push("/login?redirect=/admin/attributes");
      return;
    }

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role !== "ADMIN") {
          router.push("/account");
          return;
        }
      } catch (e) {
        router.push("/login?redirect=/admin/attributes");
        return;
      }
    }
  }, [router, mounted]);

  const { data: attributes, isLoading, refetch } = useQuery<ProductAttribute[]>({
    queryKey: ["admin", "attributes"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get("/admin/attributes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data || [];
    },
    enabled: typeof window !== "undefined" && !!localStorage.getItem("token"),
  });

  const createAttributeMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.post("/admin/attributes", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "attributes"] });
      setNewAttributeName("");
      setNewAttributeDescription("");
    },
    onError: (error: any) => {
      console.error("Error creating attribute:", error);
      alert(error.response?.data?.message || error.message || "Failed to create attribute. Please try again.");
    },
  });

  const updateAttributeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name?: string; description?: string } }) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      return api.put(`/admin/attributes/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "attributes"] });
      setEditingAttribute(null);
    },
  });

  const deleteAttributeMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      return api.delete(`/admin/attributes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "attributes"] });
    },
  });

  const createTermMutation = useMutation({
    mutationFn: async ({ attributeId, data }: { attributeId: string; data: { name: string; image?: string } }) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      return api.post(`/admin/attributes/${attributeId}/terms`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "attributes"] });
      setNewTermName("");
      setNewTermImage("");
      toast.success("Term created successfully!");
    },
    onError: (error: any) => {
      console.error("Error creating term:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to create term. Please try again.";
      toast.error(errorMessage);
    },
  });

  const updateTermMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name?: string; image?: string } }) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      return api.put(`/admin/attribute-terms/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "attributes"] });
      setEditingTerm(null);
    },
  });

  const deleteTermMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      return api.delete(`/admin/attribute-terms/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "attributes"] });
    },
  });

  const handleCreateAttribute = () => {
    if (!newAttributeName.trim()) return;
    createAttributeMutation.mutate({
      name: newAttributeName.trim(),
      description: newAttributeDescription.trim() || undefined,
    });
  };

  const handleCreateTerm = (attributeId: string) => {
    if (!newTermName.trim()) return;
    createTermMutation.mutate({
      attributeId,
      data: {
        name: newTermName.trim(),
        image: newTermImage.trim() || undefined,
      },
    });
  };

  if (!mounted) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading attributes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Attributes & Variations</h1>
          <p className="text-gray-600 mt-1">Manage product attributes (Color, Size, Length, etc.) and their values</p>
        </div>
        <Link href="/admin">
          <Button variant="outline">← Back to Dashboard</Button>
        </Link>
      </div>

      {/* Create New Attribute */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Attribute</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Attribute Name *</label>
              <Input
                value={newAttributeName}
                onChange={(e) => setNewAttributeName(e.target.value)}
                placeholder="e.g., Color, Size, Length"
                onKeyPress={(e) => e.key === "Enter" && handleCreateAttribute()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description (Optional)</label>
              <Textarea
                value={newAttributeDescription}
                onChange={(e) => setNewAttributeDescription(e.target.value)}
                placeholder="Brief description of this attribute"
                rows={3}
              />
            </div>
            <Button
              onClick={handleCreateAttribute}
              disabled={!newAttributeName.trim() || createAttributeMutation.isPending}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Attribute
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Attributes List */}
      <div className="space-y-4">
        {attributes && attributes.length > 0 ? (
          attributes.map((attribute) => (
            <Card key={attribute.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{attribute.name}</CardTitle>
                    {attribute.description && (
                      <p className="text-sm text-gray-600 mt-1">{attribute.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingAttribute(attribute)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will delete the attribute and all its terms. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteAttributeMutation.mutate(attribute.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Edit Attribute Form */}
                {editingAttribute?.id === attribute.id ? (
                  <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium mb-2">Attribute Name *</label>
                      <Input
                        value={editingAttribute.name}
                        onChange={(e) =>
                          setEditingAttribute({ ...editingAttribute, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <Input
                        value={editingAttribute.description || ""}
                        onChange={(e) =>
                          setEditingAttribute({ ...editingAttribute, description: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          updateAttributeMutation.mutate({
                            id: attribute.id,
                            data: {
                              name: editingAttribute.name,
                              description: editingAttribute.description,
                            },
                          });
                        }}
                        disabled={updateAttributeMutation.isPending}
                      >
                        Save
                      </Button>
                      <Button variant="outline" onClick={() => setEditingAttribute(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : null}

                {/* Terms Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Terms ({attribute.terms.length})</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingTerm({ attributeId: attribute.id, term: null })}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Term
                    </Button>
                  </div>

                  {/* Add New Term Form */}
                  {editingTerm?.attributeId === attribute.id && !editingTerm.term ? (
                    <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Term Name *</label>
                        <Input
                          value={newTermName}
                          onChange={(e) => setNewTermName(e.target.value)}
                          placeholder="e.g., Black, Red, Small, Large"
                          onKeyPress={(e) => e.key === "Enter" && handleCreateTerm(attribute.id)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Term Image (Optional)</label>
                        <div className="space-y-2">
                          {/* Image Preview - Show prominently when image exists */}
                          {newTermImage ? (
                            <div className="space-y-2">
                              <div className="relative inline-block bg-gray-100 rounded-lg border-2 border-gray-200 w-32 h-32 flex items-center justify-center overflow-hidden">
                                <img
                                  src={
                                    newTermImage.startsWith("http")
                                      ? newTermImage
                                      : newTermImage.startsWith("/media/")
                                      ? newTermImage
                                      : `/${newTermImage}`
                                  }
                                  onError={(e) => {
                                    const img = e.target as HTMLImageElement;
                                    const currentSrc = img.src;
                                    const retryCount = parseInt(img.getAttribute("data-retry") || "0");
                                    
                                    // If image failed to load from public folder, try backend API (only once)
                                    if (retryCount === 0 && !currentSrc.includes("/api/admin/upload/media/")) {
                                      const filename = newTermImage.split("/").pop();
                                      if (filename) {
                                        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:9001/api";
                                        const fallbackUrl = `${apiBaseUrl}/admin/upload/media/swatches/${filename}`;
                                        console.log("Trying fallback URL:", fallbackUrl);
                                        img.setAttribute("data-retry", "1");
                                        img.src = fallbackUrl;
                                        return;
                                      }
                                    }
                                    
                                    // If fallback also failed, try retrying the original URL with cache busting
                                    if (retryCount < 2) {
                                      setTimeout(() => {
                                        img.setAttribute("data-retry", (retryCount + 1).toString());
                                        const baseUrl = currentSrc.split("?")[0].split("/api/admin/upload/media/")[0] || currentSrc.split("?")[0];
                                        img.src = `${baseUrl}?t=${Date.now()}&retry=${retryCount + 1}`;
                                      }, 1000);
                                    } else {
                                      // After retries, show error message
                                      console.error("Image failed to load after retries:", {
                                        url: newTermImage,
                                        resolvedSrc: currentSrc,
                                      });
                                      img.style.display = "none";
                                      const parent = img.parentElement;
                                      if (parent && !parent.querySelector(".error-message")) {
                                        const errorDiv = document.createElement("div");
                                        errorDiv.className = "error-message text-xs text-red-500 p-2 text-center absolute inset-0 flex items-center justify-center bg-white/90 rounded-lg";
                                        errorDiv.textContent = "Image not found";
                                        parent.appendChild(errorDiv);
                                      }
                                    }
                                  }}
                                  onLoad={(e) => {
                                    console.log("Image loaded successfully:", newTermImage);
                                    const parent = (e.target as HTMLImageElement).parentElement;
                                    const errorMsg = parent?.querySelector(".error-message");
                                    if (errorMsg) errorMsg.remove();
                                  }}
                                  alt="Preview"
                                  className="w-full h-full object-cover rounded-lg"
                                />
                                <button
                                  type="button"
                                  onClick={() => setNewTermImage("")}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors z-10 shadow-md"
                                  title="Remove image"
                                >
                                  ×
                                </button>
                              </div>
                              <div className="text-xs text-gray-500">
                                <p className="font-medium mb-1">Image URL:</p>
                                <Input
                                  value={newTermImage}
                                  onChange={(e) => setNewTermImage(e.target.value)}
                                  placeholder="Image URL"
                                  className="text-xs"
                                />
                              </div>
                            </div>
                          ) : (
                            <>
                              {/* Image Picker - Shows Media Library First */}
                              <SwatchImagePicker
                                value={newTermImage}
                                onChange={(imageUrl) => setNewTermImage(imageUrl)}
                              />
                              {/* Or Enter URL Manually */}
                              <div className="mt-2">
                                <Input
                                  value={newTermImage}
                                  onChange={(e) => setNewTermImage(e.target.value)}
                                  placeholder="Or enter image URL manually"
                                />
                                <p className="text-xs text-gray-500 mt-1">Or paste an image URL</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleCreateTerm(attribute.id)}
                          disabled={!newTermName.trim() || createTermMutation.isPending}
                          size="sm"
                        >
                          Add Term
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingTerm(null);
                            setNewTermName("");
                            setNewTermImage("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  {/* Search Terms */}
                  {attribute.terms.length > 0 && (
                    <div className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Search terms..."
                          value={searchQueries[attribute.id] || ""}
                          onChange={(e) =>
                            setSearchQueries({
                              ...searchQueries,
                              [attribute.id]: e.target.value,
                            })
                          }
                          className="pl-10"
                        />
                      </div>
                      {(searchQueries[attribute.id] || "").trim() && (
                        <p className="text-xs text-gray-500 mt-1">
                          {attribute.terms.filter((term) =>
                            term.name.toLowerCase().includes((searchQueries[attribute.id] || "").toLowerCase())
                          ).length}{" "}
                          result(s) found
                        </p>
                      )}
                    </div>
                  )}

                  {/* Terms List */}
                  {attribute.terms.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {attribute.terms
                        .filter((term) => {
                          const query = (searchQueries[attribute.id] || "").toLowerCase().trim();
                          if (!query) return true;
                          return term.name.toLowerCase().includes(query);
                        })
                        .map((term) => (
                        <div
                          key={term.id}
                          className="p-3 border rounded-lg bg-white flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            {term.image && (
                              <img
                                src={
                                  term.image.startsWith("http")
                                    ? term.image
                                    : term.image.startsWith("/media/")
                                    ? term.image
                                    : `/${term.image}`
                                }
                                alt={term.name}
                                className="w-10 h-10 object-cover rounded border"
                                onError={(e) => {
                                  const img = e.target as HTMLImageElement;
                                  const currentSrc = img.src;
                                  const retryCount = parseInt(img.getAttribute("data-retry") || "0");
                                  
                                  // If image failed to load from public folder, try backend API (only once)
                                  if (retryCount === 0 && !currentSrc.includes("/api/admin/upload/media/")) {
                                    const filename = term.image.split("/").pop();
                                    if (filename) {
                                      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:9001/api";
                                      const fallbackUrl = `${apiBaseUrl}/admin/upload/media/swatches/${filename}`;
                                      console.log("Trying fallback URL for existing term:", fallbackUrl);
                                      img.setAttribute("data-retry", "1");
                                      img.src = fallbackUrl;
                                      return;
                                    }
                                  }
                                  
                                  // If fallback also failed, try retrying the original URL with cache busting
                                  if (retryCount < 2) {
                                    setTimeout(() => {
                                      img.setAttribute("data-retry", (retryCount + 1).toString());
                                      const baseUrl = currentSrc.split("?")[0].split("/api/admin/upload/media/")[0] || currentSrc.split("?")[0];
                                      img.src = `${baseUrl}?t=${Date.now()}&retry=${retryCount + 1}`;
                                    }, 1000);
                                  } else {
                                    // After retries, hide the image
                                    img.style.display = "none";
                                  }
                                }}
                                onLoad={() => {
                                  console.log("Existing term image loaded successfully:", term.image);
                                }}
                              />
                            )}
                            <span className="font-medium">{term.name}</span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingTerm({ attributeId: attribute.id, term });
                                setIsEditModalOpen(true);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-3 w-3 text-red-600" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Term?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will delete the term "{term.name}". This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteTermMutation.mutate(term.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No terms added yet. Click "Add Term" to add values for this attribute.
                    </p>
                  )}

                  {/* No Search Results */}
                  {attribute.terms.length > 0 &&
                    (searchQueries[attribute.id] || "").trim() &&
                    attribute.terms.filter((term) =>
                      term.name.toLowerCase().includes((searchQueries[attribute.id] || "").toLowerCase())
                    ).length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-sm text-gray-500">
                          No terms found matching "{searchQueries[attribute.id]}"
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setSearchQueries({
                              ...searchQueries,
                              [attribute.id]: "",
                            })
                          }
                          className="mt-2"
                        >
                          Clear search
                        </Button>
                      </div>
                    )}

                  {/* Edit Term Form - Now in modal popup */}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600">No attributes created yet. Create your first attribute above.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Term Modal */}
      {isEditModalOpen && editingTerm?.term && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsEditModalOpen(false);
              setEditingTerm(null);
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Edit Term</h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingTerm(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Term Name *</label>
                <Input
                  value={editingTerm.term?.name || ""}
                  onChange={(e) => {
                    if (editingTerm?.term) {
                      setEditingTerm({
                        ...editingTerm,
                        term: { ...editingTerm.term, name: e.target.value },
                      });
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Term Image</label>
                <div className="space-y-2">
                  {/* Image Preview - Show prominently when image exists */}
                  {editingTerm.term?.image ? (
                    <div className="space-y-2">
                      <div className="relative inline-block bg-gray-100 rounded-lg border-2 border-gray-200 w-32 h-32 flex items-center justify-center">
                        <img
                          src={
                            editingTerm.term.image?.startsWith("http")
                              ? editingTerm.term.image
                              : editingTerm.term.image?.startsWith("/media/")
                              ? editingTerm.term.image
                              : `/${editingTerm.term.image}`
                          }
                          alt={editingTerm.term?.name || "Term image"}
                          className="w-full h-full object-cover rounded-lg"
                          key={`${editingTerm.term?.id}-${editingTerm.term?.image}-${Date.now()}`}
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            const currentSrc = img.src;
                            
                            // If image failed to load from public folder, try backend API
                            if (!currentSrc.includes("/api/admin/upload/media/")) {
                              const filename = editingTerm.term?.image?.split("/").pop();
                              if (filename) {
                                const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:9001/api";
                                const fallbackUrl = `${apiBaseUrl}/admin/upload/media/swatches/${filename}`;
                                console.log("Trying fallback URL:", fallbackUrl);
                                img.src = fallbackUrl;
                                return;
                              }
                            }
                            
                            // Original error handling
                            console.error("Image failed to load:", {
                              url: editingTerm.term?.image,
                              resolvedSrc: currentSrc,
                            });
                            
                            const retryCount = parseInt(img.getAttribute("data-retry") || "0");
                            if (retryCount < 3) {
                              setTimeout(() => {
                                img.setAttribute("data-retry", (retryCount + 1).toString());
                                const baseUrl = currentSrc.split("?")[0];
                                img.src = `${baseUrl}?t=${Date.now()}&retry=${retryCount + 1}`;
                              }, 1000 * (retryCount + 1));
                            } else {
                              img.style.display = "none";
                              const parent = img.parentElement;
                              if (parent && !parent.querySelector(".error-message")) {
                                const errorDiv = document.createElement("div");
                                errorDiv.className = "error-message text-xs text-red-500 p-2 text-center absolute inset-0 flex items-center justify-center bg-white/90 rounded-lg";
                                errorDiv.textContent = "Image not found";
                                parent.appendChild(errorDiv);
                              }
                            }
                          }}
                          onLoad={(e) => {
                            console.log("Image loaded successfully:", editingTerm.term?.image);
                            const parent = (e.target as HTMLImageElement).parentElement;
                            const errorMsg = parent?.querySelector(".error-message");
                            if (errorMsg) errorMsg.remove();
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (editingTerm?.term) {
                              setEditingTerm({
                                ...editingTerm,
                                term: { ...editingTerm.term, image: "" },
                              });
                            }
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors z-10 shadow-md"
                          title="Remove image"
                        >
                          ×
                        </button>
                      </div>
                      <div className="text-xs text-gray-500">
                        <p className="font-medium mb-1">Image URL:</p>
                        <Input
                          value={editingTerm.term?.image || ""}
                          onChange={(e) => {
                            if (editingTerm?.term) {
                              setEditingTerm({
                                ...editingTerm,
                                term: { ...editingTerm.term, image: e.target.value },
                              });
                            }
                          }}
                          placeholder="Image URL"
                          className="text-xs"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Image Picker - Shows Media Library First */}
                      <SwatchImagePicker
                        value={editingTerm.term?.image || null}
                        onChange={(imageUrl) => {
                          if (editingTerm?.term) {
                            setEditingTerm({
                              ...editingTerm,
                              term: { ...editingTerm.term, image: imageUrl },
                            });
                          }
                        }}
                      />
                      {/* Or Enter URL Manually */}
                      <div className="mt-2">
                        <Input
                          value={editingTerm.term?.image || ""}
                          onChange={(e) => {
                            if (editingTerm?.term) {
                              setEditingTerm({
                                ...editingTerm,
                                term: { ...editingTerm.term, image: e.target.value },
                              });
                            }
                          }}
                          placeholder="Or enter image URL manually"
                        />
                        <p className="text-xs text-gray-500 mt-1">Or paste an image URL</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => {
                    if (editingTerm?.term) {
                      updateTermMutation.mutate(
                        {
                          id: editingTerm.term.id,
                          data: {
                            name: editingTerm.term.name,
                            image: editingTerm.term.image,
                          },
                        },
                        {
                          onSuccess: () => {
                            setIsEditModalOpen(false);
                            setEditingTerm(null);
                          },
                        }
                      );
                    }
                  }}
                  disabled={updateTermMutation.isPending || !editingTerm?.term?.name?.trim()}
                  className="flex-1"
                >
                  {updateTermMutation.isPending ? "Saving..." : "Save"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingTerm(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

