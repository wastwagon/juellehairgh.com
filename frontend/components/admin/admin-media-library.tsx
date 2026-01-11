"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Search, Trash2, Image as ImageIcon, File, X, CheckCircle2, Copy } from "lucide-react";
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

interface MediaLibraryProps {
  onSelect?: (url: string) => void;
  standalone?: boolean;
}

export function AdminMediaLibrary({ onSelect, standalone = true }: MediaLibraryProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [fileType, setFileType] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("library");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !standalone) return;
    
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
  }, [router, mounted, standalone]);

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
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/admin/upload/media", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success("File uploaded successfully!");
        queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
        
        // Find the new file or construct it
        const newFile = {
          id: response.data.id || `library-${response.data.filename}`,
          filename: response.data.filename,
          originalName: response.data.originalName || file.name,
          url: response.data.url,
          category: 'library',
          size: response.data.size || file.size,
          type: (response.data.type || 'image') as "image" | "file",
          mimeType: response.data.mimeType || file.type || 'image/jpeg',
          uploadedAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
        };
        
        setSelectedFile(newFile);
        setActiveTab("library");
      }
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to upload file.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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

  if (!mounted) return null;

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-500">Loading media library...</p>
      </div>
    );
  }

  const files = mediaData?.files || [];
  const pagination = mediaData?.pagination;

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
            <p className="text-sm text-gray-500">Manage and select your assets</p>
          </div>
          <div className="flex items-center gap-3">
            <TabsList className="bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="upload" className="px-4 py-2 rounded-md">Upload Files</TabsTrigger>
              <TabsTrigger value="library" className="px-4 py-2 rounded-md">Media Library</TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="upload" className="mt-0">
          <div 
            className="border-4 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 flex flex-col items-center justify-center py-24 px-6 hover:bg-gray-50 hover:border-primary/30 transition-all cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="bg-white p-6 rounded-full shadow-md mb-6 group-hover:scale-110 transition-transform">
              <Upload className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Select Files to Upload</h3>
            <p className="text-gray-500 mb-8 text-center max-w-xs">Click here to browse your computer for images.</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
            <Button 
              size="lg"
              disabled={uploading} 
              className="px-12 font-bold shadow-lg"
            >
              {uploading ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Uploading...</>
              ) : (
                "Select Files"
              )}
            </Button>
            <p className="mt-8 text-xs text-gray-400">Maximum upload file size: 10 MB.</p>
          </div>
        </TabsContent>

        <TabsContent value="library" className="mt-0 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => {setSearchTerm(e.target.value); setPage(1);}}
                className="pl-10 h-11"
              />
            </div>
            <select
              value={fileType}
              onChange={(e) => {setFileType(e.target.value); setPage(1);}}
              className="px-4 py-2 border rounded-md bg-white h-11 min-w-[160px]"
            >
              <option value="all">All media items</option>
              <option value="image">Images</option>
            </select>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {files.length === 0 ? (
              <div className="col-span-full py-32 text-center border-2 border-dashed rounded-2xl bg-gray-50">
                <ImageIcon className="h-16 w-12 mx-auto mb-4 text-gray-300 opacity-20" />
                <p className="text-gray-400 font-medium">Your library is empty</p>
                <Button variant="link" onClick={() => setActiveTab("upload")} className="text-primary mt-2">
                  Upload your first file
                </Button>
              </div>
            ) : (
              files.map((file) => (
                <div
                  key={file.id}
                  className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer group transition-all duration-300 ${
                    selectedFile?.id === file.id 
                      ? "ring-4 ring-primary ring-offset-2 scale-[0.96]" 
                      : "ring-1 ring-gray-200 hover:ring-primary/50"
                  }`}
                  onClick={() => setSelectedFile(file)}
                >
                  {file.type === "image" ? (
                    <img
                      src={file.url.startsWith("http") ? file.url : `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9001/api'}/admin/upload/media/${file.category}/${file.filename}`}
                      alt={file.originalName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
                      <File className="h-10 w-10 text-gray-400 mb-2" />
                      <span className="text-[10px] text-gray-500 font-medium uppercase">{file.mimeType.split('/')[1]}</span>
                    </div>
                  )}
                  
                  {selectedFile?.id === file.id && (
                    <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1.5 shadow-lg animate-in zoom-in duration-200">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  )}

                  {onSelect && !standalone && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3">
                      <Button 
                        size="sm" 
                        className="w-full font-bold shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(file.url);
                        }}
                      >
                        Select
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-8 border-t">
              <p className="text-sm text-gray-500 font-medium">Page {pagination.page} of {pagination.totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={pagination.page === 1}>Previous</Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={pagination.page === pagination.totalPages}>Next</Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* File Details Modal */}
      {selectedFile && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border-0">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <CardTitle className="text-xl">Media Details</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setSelectedFile(null)} className="rounded-full"><X className="h-5 w-5" /></Button>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center min-h-[300px] border">
                  {selectedFile.type === "image" ? (
                    <img
                      src={selectedFile.url.startsWith("http") ? selectedFile.url : `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9001/api'}/admin/upload/media/${selectedFile.category}/${selectedFile.filename}`}
                      alt={selectedFile.originalName}
                      className="max-w-full max-h-[400px] object-contain"
                    />
                  ) : (
                    <File className="h-24 w-24 text-gray-300" />
                  )}
                </div>
                <div className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Filename</label>
                    <p className="text-sm font-semibold text-gray-900 break-all">{selectedFile.originalName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Size</label>
                      <p className="text-sm font-medium text-gray-700">{formatFileSize(selectedFile.size)}</p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</label>
                      <p className="text-sm font-medium text-gray-700 capitalize">{selectedFile.type}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">File URL</label>
                    <div className="flex gap-2">
                      <Input value={selectedFile.url} readOnly className="h-9 text-xs bg-gray-50" />
                      <Button variant="outline" size="sm" onClick={() => {navigator.clipboard.writeText(selectedFile.url); toast.success("Copied!");}}><Copy className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 pt-4 border-t">
                    {onSelect && (
                      <Button className="w-full font-bold h-11 shadow-lg" onClick={() => {onSelect(selectedFile.url); setSelectedFile(null);}}>Select Image</Button>
                    )}
                    <div className="flex gap-2">
                      <Button variant="destructive" className="flex-1" onClick={() => handleDelete(selectedFile)} disabled={deleteMutation.isPending}>
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={() => setSelectedFile(null)}>Close</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
