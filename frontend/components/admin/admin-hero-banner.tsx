"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Upload, Smartphone, Monitor } from "lucide-react";
import { MediaPicker } from "./media-picker";

const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect fill='%23e5e7eb' width='100' height='100'/%3E%3Ctext x='50' y='50' fill='%239ca3af' font-size='12' text-anchor='middle' dy='.3em'%3ENo image%3C/text%3E%3C/svg%3E";

const getImageSrc = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/media/")) return url; // /media/... - Next.js rewrites to /api/media/...
  if (url.startsWith("/")) return `/api${url}`;
  // Fallback: filename only - try banners first, library if path hints
  const filename = url.split("/").pop() || url;
  return `/api/media/banners/${filename}`;
};

export function AdminHeroBanner() {
  const queryClient = useQueryClient();
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<"mobile" | "desktop" | null>(null);
  const [formData, setFormData] = useState({
    mobileImage: "",
    desktopImage: "",
    link: "/categories/shop-all",
  });

  const { data: hero, isLoading, isError } = useQuery({
    queryKey: ["admin", "hero-banner"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const res = await api.get("/settings/hero-banner", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    retry: false,
  });

  useEffect(() => {
    if (hero) {
      setFormData({
        mobileImage: hero.mobileImage || "",
        desktopImage: hero.desktopImage || "",
        link: hero.link || "/categories/shop-all",
      });
    }
  }, [hero]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      return api.put(
        "/settings/hero-banner",
        { mobileImage: data.mobileImage, desktopImage: data.desktopImage, link: data.link },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "hero-banner"] });
      queryClient.invalidateQueries({ queryKey: ["hero-banner"] });
    },
  });

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "mobile" | "desktop"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(field);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.post("/admin/upload/media", fd, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      if (res.data?.url) {
        setFormData((prev) => ({ ...prev, [field === "mobile" ? "mobileImage" : "desktopImage"]: res.data.url }));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(null);
    }
    e.target.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const isSaving = updateMutation.isPending || uploading;

  if (isLoading && !isError) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Loading hero banner settings...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Hero Banner CMS</h1>
      <p className="text-gray-600 mb-6">
        Manage the main hero banner on the homepage. Leave images empty to use default static images.
      </p>
      {isError && (
        <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          Could not load existing settings. You can still add images and save—ensure the backend is running on port 9001.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Mobile Hero Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <input
                ref={mobileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e, "mobile")}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => mobileInputRef.current?.click()}
                disabled={!!uploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading === "mobile" ? "Uploading..." : "Upload Image"}
              </Button>
              <MediaPicker
                onSelect={(url) => setFormData((prev) => ({ ...prev, mobileImage: url }))}
                title="Select Mobile Hero Image"
              />
            </div>
            {formData.mobileImage && (
              <div className="relative w-48 h-48 border rounded-lg overflow-hidden bg-gray-50">
                <img
                  src={getImageSrc(formData.mobileImage)}
                  alt="Mobile hero"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = PLACEHOLDER_IMG;
                    (e.target as HTMLImageElement).onerror = null;
                  }}
                />
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, mobileImage: "" }))}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Desktop Hero Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <input
                ref={desktopInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e, "desktop")}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => desktopInputRef.current?.click()}
                disabled={!!uploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading === "desktop" ? "Uploading..." : "Upload Image"}
              </Button>
              <MediaPicker
                onSelect={(url) => setFormData((prev) => ({ ...prev, desktopImage: url }))}
                title="Select Desktop Hero Image"
              />
            </div>
            {formData.desktopImage && (
              <div className="relative w-full max-w-xl aspect-[3/1] border rounded-lg overflow-hidden bg-gray-50">
                <img
                  src={getImageSrc(formData.desktopImage)}
                  alt="Desktop hero"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = PLACEHOLDER_IMG;
                    (e.target as HTMLImageElement).onerror = null;
                  }}
                />
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, desktopImage: "" }))}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Link</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={formData.link}
              onChange={(e) => setFormData((prev) => ({ ...prev, link: e.target.value }))}
              placeholder="/categories/shop-all"
            />
            <p className="text-sm text-gray-500 mt-2">Where the hero banner links when clicked.</p>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-4 py-4 border-t sticky bottom-0 bg-white -mx-6 px-6 rounded-b-lg">
          <Button type="submit" disabled={isSaving} size="lg">
            {isSaving ? "Saving..." : "Save Hero Banner"}
          </Button>
          {updateMutation.isSuccess && (
            <span className="text-green-600 text-sm font-medium">Saved successfully</span>
          )}
          {updateMutation.isError && (
            <span className="text-red-600 text-sm">
              Save failed. Check backend is running and routes are registered.
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
