"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Search, Trash2, Image as ImageIcon, File, X } from "lucide-react";
import { toast } from "sonner";

interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  category: string;
  size: number;
  type: "image" | "file";
  mimeType: string;
  uploadedAt: string;
  modifiedAt: string;
}

export function AdminMediaLibrary() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [fileType, setFileType] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token) {
      router.push("/login?redirect=/admin/media");
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
        router.push("/login?redirect=/admin/media");
        return;
      }
    }
  }, [router, mounted]);

  const { data: mediaData, isLoading } = useQuery<{
    files: MediaFile[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>({
    queryKey: ["admin", "media", searchTerm, fileType, page],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (fileType !== "all") params.append("type", fileType);
      params.append("page", page.toString());
      params.append("limit", "50");
      
      const response = await api.get(`/admin/upload/media?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: mounted && typeof window !== "undefined" && !!localStorage.getItem("token"),
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ category, filename }: { category: string; filename: string }) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      return api.delete(`/admin/upload/media/${category}/${filename}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
      toast.success("Media file deleted successfully");
      setSelectedFile(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete media file");
    },
  });

  const handleDelete = (file: MediaFile) => {
    if (!confirm(`Are you sure you want to delete "${file.filename}"? This action cannot be undone.`)) {
      return;
    }
    deleteMutation.mutate({ category: file.category, filename: file.filename });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        toast.error("Please log in to upload files");
        setUploading(false);
        e.target.value = "";
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/admin/upload/media", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        transformRequest: (data) => data,
      });

      if (response.data.success) {
        toast.success("File uploaded successfully");
        queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
      }
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to upload file.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
        <p className="text-gray-600">Loading media library...</p>
      </div>
    );
  }

  const files = mediaData?.files || [];
  const pagination = mediaData?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-600 mt-1">Manage all your media files</p>
        </div>
        <div className="flex gap-3">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
            <Button disabled={uploading} className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? "Uploading..." : "Upload Media"}
            </Button>
          </label>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search media files..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
            <select
              value={fileType}
              onChange={(e) => {
                setFileType(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Types</option>
              <option value="image">Images Only</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Media Grid */}
      <Card>
        <CardHeader>
          <CardTitle>
            {pagination ? (
              <>
                All Media ({pagination.total} file{pagination.total !== 1 ? "s" : ""})
              </>
            ) : (
              "All Media"
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No media files found</p>
              <p className="text-sm text-gray-500 mt-2">
                {searchTerm ? "Try a different search term" : "Upload your first media file"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="relative group border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedFile(file)}
                  >
                    {file.type === "image" ? (
                      <div className="aspect-square relative bg-gray-100">
                        <img
                          src={(() => {
                            // If it's already a full URL, use it
                            if (file.url.startsWith("http")) {
                              return file.url;
                            }
                            
                            // Extract filename from URL
                            const filename = file.url.split("/").pop() || file.filename;
                            const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001/api';
                            
                            // Use backend API endpoint directly for all categories
                            // This ensures images load reliably regardless of where they're stored
                            return `${apiBaseUrl}/admin/upload/media/${file.category}/${filename}`;
                          })()}
                          alt={file.originalName}
                          className="w-full h-full object-cover"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      const retryCount = parseInt(img.getAttribute('data-retry') || '0');
                      
                      if (retryCount < 1) {
                        // Try direct Next.js path as fallback
                        const filename = file.url.split("/").pop() || file.filename;
                        const directPath = file.url.startsWith("/media/") ? file.url : `/media/${file.category}/${filename}`;
                        img.setAttribute('data-retry', String(retryCount + 1));
                        img.src = directPath;
                        return;
                      }
                      
                      // Final fallback: show placeholder
                      img.style.display = 'none';
                      const parent = img.parentElement;
                      if (parent && !parent.querySelector('.image-placeholder')) {
                        const placeholder = document.createElement('div');
                        placeholder.className = 'image-placeholder w-full h-full bg-gray-200 flex items-center justify-center';
                        placeholder.innerHTML = '<span class="text-xs text-gray-400">Image not found</span>';
                        parent.appendChild(placeholder);
                      }
                    }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      </div>
                    ) : (
                      <div className="aspect-square bg-gray-100 flex items-center justify-center">
                            <File className="h-12 w-12 text-gray-400" />
                          </div>
                    )}
                    <div className="p-2 bg-white">
                      <p className="text-xs font-medium text-gray-900 truncate" title={file.originalName}>
                        {file.originalName}
                      </p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(file);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition shadow-lg"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t">
                  <p className="text-sm text-gray-600">
                    Page {pagination.page} of {pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* File Details Modal */}
      {selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Media Details</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setSelectedFile(null)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedFile.type === "image" && (
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={
                      selectedFile.url.startsWith("http")
                        ? selectedFile.url
                        : selectedFile.url.startsWith("/media/")
                        ? selectedFile.url
                        : `/${selectedFile.url}`
                    }
                    alt={selectedFile.originalName}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      const retryCount = parseInt(img.getAttribute('data-retry') || '0');
                      
                      if (retryCount < 1) {
                        // Try direct Next.js path as fallback
                        const filename = selectedFile.url.split("/").pop() || selectedFile.filename;
                        const directPath = selectedFile.url.startsWith("/media/") ? selectedFile.url : `/media/${selectedFile.category}/${filename}`;
                        img.setAttribute('data-retry', String(retryCount + 1));
                        img.src = directPath;
                        return;
                      }
                      
                      // Show placeholder if all retries fail
                      img.style.display = 'none';
                      const parent = img.parentElement;
                      if (parent && !parent.querySelector('.image-placeholder')) {
                        const placeholder = document.createElement('div');
                        placeholder.className = 'image-placeholder w-full h-full bg-gray-200 flex items-center justify-center';
                        placeholder.innerHTML = '<span class="text-sm text-gray-400">Image not found</span>';
                        parent.appendChild(placeholder);
                      }
                    }}
                  />
                </div>
              )}
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Filename</label>
                  <p className="text-sm text-gray-900">{selectedFile.originalName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">URL</label>
                  <div className="flex gap-2">
                    <Input
                      value={
                        selectedFile.url.startsWith("http")
                          ? selectedFile.url
                          : selectedFile.url.startsWith("/media/")
                          ? selectedFile.url
                          : `/${selectedFile.url}`
                      }
                      readOnly
                      className="text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const url =
                          selectedFile.url.startsWith("http")
                            ? selectedFile.url
                            : selectedFile.url.startsWith("/media/")
                            ? selectedFile.url
                            : `/${selectedFile.url}`;
                        navigator.clipboard.writeText(url);
                        toast.success("URL copied to clipboard");
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Size</label>
                    <p className="text-sm text-gray-900">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Type</label>
                    <p className="text-sm text-gray-900">{selectedFile.type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <p className="text-sm text-gray-900 capitalize">{selectedFile.category}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Uploaded</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedFile.uploadedAt)}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(selectedFile)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button variant="outline" onClick={() => setSelectedFile(null)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

