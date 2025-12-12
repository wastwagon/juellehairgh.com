"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductGalleryProps {
  images: string[];
  title: string;
  selectedIndex?: number;
  onImageSelect?: (index: number) => void;
}

export function ProductGallery({ images, title, selectedIndex: controlledIndex, onImageSelect }: ProductGalleryProps) {
  const [internalIndex, setInternalIndex] = useState(0);
  const selectedIndex = controlledIndex !== undefined ? controlledIndex : internalIndex;
  const setSelectedIndex = onImageSelect || setInternalIndex;
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Handle keyboard navigation in lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
      } else if (e.key === "ArrowRight") {
        setSelectedIndex((prev) => (prev + 1) % images.length);
      } else if (e.key === "Escape") {
        setLightboxOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, images.length, setSelectedIndex]);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-400">No image available</span>
      </div>
    );
  }

  const getImageUrl = (image: string) => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001/api';
    
    // Handle absolute URLs
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    
    // Handle media library paths (new format: /media/products/filename.jpg)
    if (image.startsWith('/media/products/')) {
      const filename = image.replace('/media/products/', '');
      // Try Next.js public path first, then fallback to API
      return `/media/products/${filename}`;
    }
    
    // Handle old product paths (legacy: /products/filename.jpg or products/filename.jpg)
    if (image.includes('/products/') || image.startsWith('products/')) {
      const filename = image.split('/').pop() || image;
      // Try Next.js public path first, then fallback to API
      return `/media/products/${filename}`;
    }
    
    // Extract filename and use backend API as fallback
    const filename = image.split('/').pop() || image;
    return `${apiBaseUrl}/admin/upload/media/products/${filename}`;
  };

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <div className="space-y-4">
        <div
          className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group cursor-pointer"
          onClick={() => setLightboxOpen(true)}
        >
          <img
            src={getImageUrl(images[selectedIndex])}
            alt={`${title} - Image ${selectedIndex + 1}`}
            className="w-full h-full object-cover"
          />
          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition"
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition"
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
          <div className="absolute bottom-2 right-2 bg-white/90 hover:bg-white px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 transition text-sm">
            Click to view gallery
          </div>
        </div>
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`aspect-square rounded-md overflow-hidden border-2 transition ${
                  selectedIndex === index
                    ? "border-primary"
                    : "border-transparent hover:border-gray-300"
                }`}
              >
                <img
                  src={getImageUrl(image)}
                  alt={`${title} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Lightbox Modal with Thumbnail Navigation */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close Button */}
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black/50 rounded-full p-2 transition"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>

          {/* Main Image Container */}
          <div className="relative max-w-6xl w-full max-h-[calc(100vh-200px)] flex-1 flex items-center justify-center mb-24" onClick={(e) => e.stopPropagation()}>
            <img
              src={getImageUrl(images[selectedIndex])}
              alt={`${title} - Image ${selectedIndex + 1}`}
              className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg"
            />
            
            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                {selectedIndex + 1} / {images.length}
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center px-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex gap-2 max-w-6xl overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedIndex === index
                        ? "border-white scale-110 shadow-lg"
                        : "border-white/30 hover:border-white/60 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`${title} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

