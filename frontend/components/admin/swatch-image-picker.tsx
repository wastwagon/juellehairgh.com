"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Upload, Image as ImageIcon, Search, RefreshCw } from "lucide-react";
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
}

interface SwatchImagePickerProps {
  value: string | null;
  onChange: (imageUrl: string) => void;
  onClose?: () => void;
}

export function SwatchImagePicker({ value, onChange, onClose }: SwatchImagePickerProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);
  // Always start with "library" tab to check media folder first
  const [selectedTab, setSelectedTab] = useState<"library" | "upload">("library");
  
  // Reset to library tab when modal opens - ensures media folder is checked first
  useEffect(() => {
    if (isOpen) {
      setSelectedTab("library");
      setSearchTerm("");
      // Invalidate and refetch media when opening
      queryClient.invalidateQueries({ queryKey: ["admin", "media", "swatches"] });
    }
  }, [isOpen, queryClient]);

  // Fetch swatch images from media library
  const { data: mediaData, isLoading, error, refetch } = useQuery<{
    files: MediaFile[];
  }>({
    queryKey: ["admin", "media", "swatches", searchTerm],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      
      const params = new URLSearchParams();
      params.append("type", "image");
      params.append("category", "swatches");
      if (searchTerm) params.append("search", searchTerm);
      params.append("limit", "100");
      
      const response = await api.get(`/admin/upload/media?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: isOpen && selectedTab === "library",
    retry: 2,
    staleTime: 0, // Always check for fresh data
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
      toast.error("Only image files are allowed (JPG, PNG, GIF, WebP)");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    try {
      setUploading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");

      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/admin/upload/swatch", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        transformRequest: (data) => data,
      });

      if (response.data.success) {
        const imageUrl = response.data.url;
        onChange(imageUrl);
        toast.success("Image uploaded successfully!");
        setSelectedTab("library");
        // Refresh media library by invalidating query
        queryClient.invalidateQueries({ queryKey: ["admin", "media", "swatches"] });
        // Refresh immediately
        await refetch();
        setTimeout(() => {
          setIsOpen(false);
          if (onClose) onClose();
        }, 500);
      }
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSelectImage = (imageUrl: string) => {
    onChange(imageUrl);
    setIsOpen(false);
    if (onClose) onClose();
  };

  // Get image URL for display
  const getImageUrl = (url: string) => {
    if (url.startsWith("http")) return url;
    if (url.startsWith("/media/swatches/")) {
      const filename = url.replace("/media/swatches/", "");
      return `/api/media/swatches/${filename}`;
    }
    if (url.startsWith("media/swatches/")) {
      const filename = url.replace("media/swatches/", "");
      return `/api/media/swatches/${filename}`;
    }
    const filename = url.split("/").pop() || url;
    return `/api/media/swatches/${filename}`;
  };

  return (
    <div className="space-y-2">
      {/* Current Image Preview */}
      {value && (
        <div className="relative inline-block">
          <img
            src={getImageUrl(value)}
            alt="Current swatch"
            className="w-16 h-16 object-cover rounded border border-gray-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder-image.png";
            }}
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            title="Remove image"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Open Picker Button */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="w-full"
      >
        <ImageIcon className="h-4 w-4 mr-2" />
        {value ? "Change Image" : "Select Image"}
      </Button>

      {/* Image Picker Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">Select Swatch Image</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex border-b">
              <button
                type="button"
                onClick={() => setSelectedTab("library")}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  selectedTab === "library"
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <ImageIcon className="h-4 w-4 inline mr-2" />
                Media Library
              </button>
              <button
                type="button"
                onClick={() => setSelectedTab("upload")}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  selectedTab === "upload"
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Upload className="h-4 w-4 inline mr-2" />
                Upload New
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedTab === "library" ? (
                <div className="space-y-4">
                  {/* Search and Refresh */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search swatch images from media folder..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        queryClient.invalidateQueries({ queryKey: ["admin", "media", "swatches"] });
                        refetch();
                      }}
                      title="Refresh media folder"
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    </Button>
                  </div>

                  {/* Error State */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                      <p className="text-red-600 text-sm">
                        Failed to load images from media folder. Please try again.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          queryClient.invalidateQueries({ queryKey: ["admin", "media", "swatches"] });
                          refetch();
                        }}
                      >
                        <RefreshCw className="h-3 w-3 mr-2" />
                        Retry
                      </Button>
                    </div>
                  )}

                  {/* Image Grid */}
                  {isLoading ? (
                    <div className="text-center py-12 text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p>Loading images from media folder...</p>
                    </div>
                  ) : !error && mediaData?.files && mediaData.files.length > 0 ? (
                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                      {mediaData.files.map((file) => (
                        <button
                          key={file.id}
                          type="button"
                          onClick={() => handleSelectImage(file.url)}
                          className={`relative aspect-square rounded-lg border-2 overflow-hidden transition-all hover:scale-105 ${
                            value === file.url
                              ? "border-primary ring-2 ring-primary"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <img
                            src={getImageUrl(file.url)}
                            alt={file.originalName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder-image.png";
                            }}
                          />
                          {value === file.url && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                              <div className="bg-primary text-white rounded-full p-1">
                                <ImageIcon className="h-4 w-4" />
                              </div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : !error ? (
                    <div className="text-center py-12 text-gray-500">
                      <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="font-medium">No swatch images found in media folder</p>
                      <p className="text-sm mt-2 mb-4">Upload a new image from your computer</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSelectedTab("upload")}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload New Image
                      </Button>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-4">
                      Upload a new swatch image (max 5MB)
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                      id="swatch-upload-input"
                    />
                    <label
                      htmlFor="swatch-upload-input"
                      className={`inline-flex items-center px-4 py-2 rounded-md cursor-pointer ${
                        uploading
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-primary text-white hover:bg-primary/90"
                      }`}
                    >
                      {uploading ? (
                        <>
                          <Upload className="h-4 w-4 mr-2 animate-pulse" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Choose File from Desktop
                        </>
                      )}
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Supported formats: JPG, PNG, GIF, WebP
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              {selectedTab === "library" && value && (
                <Button onClick={() => setIsOpen(false)}>
                  Use Selected Image
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

