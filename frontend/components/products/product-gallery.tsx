"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
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
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);

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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  return (
    <>
      <div className="space-y-4">
        <div
          className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group cursor-zoom-in"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onClick={() => setLightboxOpen(true)}
        >
          <img
            src={getImageUrl(images[selectedIndex])}
            alt={`${title} - Image ${selectedIndex + 1}`}
            className="w-full h-full object-cover"
            style={{
              transform: isZoomed ? `scale(2)` : 'scale(1)',
              transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
              transition: isZoomed ? 'none' : 'transform 0.3s ease',
            }}
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
          <div className="absolute bottom-2 right-2 bg-white/90 hover:bg-white px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 transition flex items-center gap-2 text-sm">
            <ZoomIn className="h-4 w-4" />
            Click to enlarge
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

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={getImageUrl(images[selectedIndex])}
              alt={`${title} - Image ${selectedIndex + 1}`}
              className="w-full h-auto rounded-lg"
            />
            {images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedIndex(index)}
                      className={`w-2 h-2 rounded-full transition ${
                        selectedIndex === index ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

