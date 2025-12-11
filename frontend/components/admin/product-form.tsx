"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Product, Category, Brand, ProductVariant } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { ProductSEOForm } from "@/components/admin/seo/product-seo-form";

const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  brandId: z.string().optional(),
  categoryId: z.string().optional(),
  priceGhs: z.number().min(0, "Price must be positive"),
  compareAtPriceGhs: z.number().optional(),
  stock: z.number().min(0, "Stock must be positive").optional(),
  sku: z.string().optional(),
  isActive: z.boolean().optional(),
  images: z.array(z.string()).optional(),
  badges: z.array(z.string()).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ProductAttribute {
  name: string;
  terms: string[];
  usedForVariations: boolean;
}

export function ProductForm({ product, onClose, onSuccess }: ProductFormProps) {
  const queryClient = useQueryClient();
  const [imageUrls, setImageUrls] = useState<string[]>(product?.images || []);
  const [featuredImage, setFeaturedImage] = useState<string | null>(product?.images?.[0] || null);
  const [galleryImages, setGalleryImages] = useState<string[]>(product?.images?.slice(1) || []);
  const [badges, setBadges] = useState<string[]>(product?.badges || []);
  const [variants, setVariants] = useState<ProductVariant[]>(product?.variants || []);
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [newBadge, setNewBadge] = useState("");
  const [useAttributeSystem, setUseAttributeSystem] = useState(false);
  const [showSEO, setShowSEO] = useState(false);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories", "all"],
    queryFn: async () => {
      const response = await api.get("/categories");
      // Flatten categories to include both parent and children
      const allCategories: Category[] = [];
      (response.data || []).forEach((cat: Category) => {
        allCategories.push(cat);
        if (cat.children) {
          allCategories.push(...cat.children);
        }
      });
      return allCategories;
    },
  });

  const { data: brands } = useQuery<Brand[]>({
    queryKey: ["admin", "brands"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      try {
        const response = await api.get("/admin/brands", {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data || [];
      } catch (error) {
        console.error("Error fetching brands:", error);
        return [];
      }
    },
  });

  // Fetch available attributes from database
  const { data: availableAttributes } = useQuery<Array<{ id: string; name: string; terms: Array<{ id: string; name: string; image?: string }> }>>({
    queryKey: ["admin", "attributes"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      try {
        const response = await api.get("/admin/attributes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        return (response.data || []).map((attr: any) => ({
          id: attr.id,
          name: attr.name,
          terms: (attr.terms || []).map((term: any) => ({
            id: term.id,
            name: term.name,
            image: term.image,
          })),
        }));
      } catch (error) {
        console.error("Error fetching attributes:", error);
        return [];
      }
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: product?.title || "",
      description: product?.description || "",
      brandId: typeof product?.brand === "object" ? product.brand?.id : product?.brandId || "",
      categoryId: typeof product?.category === "object" ? product.category?.id : product?.categoryId || "",
      priceGhs: product?.priceGhs ? Number(product.priceGhs) : 0,
      compareAtPriceGhs: product?.compareAtPriceGhs ? Number(product.compareAtPriceGhs) : undefined,
      stock: product?.stock || 0,
      sku: product?.sku || "",
      isActive: product?.isActive ?? true,
      images: product?.images || [],
      badges: product?.badges || [],
    },
  });

  // Update imageUrls when featuredImage or galleryImages change
  // Format: [featuredImage, ...galleryImages] - matches WooCommerce pattern where featured is first
  useEffect(() => {
    const allImages = featuredImage ? [featuredImage, ...galleryImages] : galleryImages;
    setImageUrls(allImages);
  }, [featuredImage, galleryImages]);

  useEffect(() => {
    setValue("images", imageUrls);
  }, [imageUrls, setValue]);

  // Initialize featured image and gallery when product loads
  // WooCommerce pattern: First image = Featured, Rest = Gallery
  useEffect(() => {
    if (product?.images && product.images.length > 0) {
      setFeaturedImage(product.images[0]); // First image is featured (WooCommerce standard)
      setGalleryImages(product.images.slice(1)); // Rest are gallery images
    } else {
      setFeaturedImage(null);
      setGalleryImages([]);
    }
  }, [product?.id]);

  useEffect(() => {
    setValue("badges", badges);
  }, [badges, setValue]);

  // Load variants when editing a product
  useEffect(() => {
    if (product?.id) {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        api
          .get(`/admin/product-variants?productId=${product.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            if (response.data?.variants) {
              setVariants(response.data.variants);
              
              // Try to reconstruct attributes from variants
              const variantMap = new Map<string, Set<string>>();
              response.data.variants.forEach((v: ProductVariant) => {
                if (!variantMap.has(v.name)) {
                  variantMap.set(v.name, new Set());
                }
                variantMap.get(v.name)?.add(v.value);
              });
              
              const reconstructedAttributes: ProductAttribute[] = Array.from(variantMap.entries()).map(([name, values]) => ({
                name,
                terms: Array.from(values),
                usedForVariations: true,
              }));
              
              if (reconstructedAttributes.length > 0) {
                setAttributes(reconstructedAttributes);
                setUseAttributeSystem(true);
              }
            }
          })
          .catch((error) => {
            console.error("Error loading variants:", error);
          });
      }
    } else {
      // Reset variants when creating new product
      setVariants([]);
      setAttributes([]);
      setUseAttributeSystem(false);
    }
  }, [product?.id]);


  const removeImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  const removeFeaturedImage = () => {
    // If there are gallery images, promote the first one to featured
    if (galleryImages.length > 0) {
      setFeaturedImage(galleryImages[0]);
      setGalleryImages(galleryImages.slice(1));
    } else {
      setFeaturedImage(null);
    }
  };

  const setAsFeatured = (imageUrl: string, index: number) => {
    // Move current featured to gallery if it exists
    if (featuredImage) {
      setGalleryImages([featuredImage, ...galleryImages.filter((_, i) => i !== index)]);
    } else {
      setGalleryImages(galleryImages.filter((_, i) => i !== index));
    }
    setFeaturedImage(imageUrl);
  };

  const addBadge = () => {
    if (newBadge.trim() && !badges.includes(newBadge.trim())) {
      setBadges([...badges, newBadge.trim()]);
      setNewBadge("");
    }
  };

  const removeBadge = (badge: string) => {
    setBadges(badges.filter((b) => b !== badge));
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        id: `temp-${Date.now()}`,
        productId: product?.id || "",
        name: "",
        value: "",
        image: undefined,
        priceGhs: undefined,
        stock: 0,
        sku: "",
      },
    ]);
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  // Attribute system functions
  const addAttribute = () => {
    setAttributes([
      ...attributes,
      {
        name: "",
        terms: [],
        usedForVariations: true,
      },
    ]);
  };

  const updateAttribute = (index: number, field: keyof ProductAttribute, value: any) => {
    const updated = [...attributes];
    updated[index] = { ...updated[index], [field]: value };
    setAttributes(updated);
  };

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const addTermToAttribute = (index: number, term: string) => {
    if (!term.trim()) return;
    const updated = [...attributes];
    if (!updated[index].terms.includes(term.trim())) {
      updated[index].terms = [...updated[index].terms, term.trim()];
      setAttributes(updated);
    }
  };

  const removeTermFromAttribute = (attrIndex: number, termIndex: number) => {
    const updated = [...attributes];
    updated[attrIndex].terms = updated[attrIndex].terms.filter((_, i) => i !== termIndex);
    setAttributes(updated);
  };

  const generateVariationsFromAttributes = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token || !product?.id) return;

    const attributesForVariations = attributes.filter((attr) => attr.usedForVariations && attr.name && attr.terms.length > 0);
    
    if (attributesForVariations.length === 0) {
      alert("Please add at least one attribute with terms to generate variations");
      return;
    }

    try {
      const response = await api.post(
        `/admin/products/${product.id}/generate-variations`,
        {
          attributes: attributesForVariations.map((attr) => ({
            name: attr.name,
            terms: attr.terms,
          })),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Reload variants
      const variantsResponse = await api.get(`/admin/product-variants?productId=${product.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (variantsResponse.data?.variants) {
        setVariants(variantsResponse.data.variants);
      }
    } catch (error: any) {
      console.error("Error generating variations:", error);
      alert(error.response?.data?.message || "Failed to generate variations");
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const productData = {
        ...data,
        images: imageUrls,
        badges,
      };
      const response = await api.post("/products", productData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Create variants if product was created
      if (response.data?.id) {
        if (useAttributeSystem && attributes.length > 0) {
          // Generate variations from attributes
          const attributesForVariations = attributes.filter((attr) => attr.usedForVariations && attr.name && attr.terms.length > 0);
          if (attributesForVariations.length > 0) {
            await api.post(
              `/admin/products/${response.data.id}/generate-variations`,
              {
                attributes: attributesForVariations.map((attr) => ({
                  name: attr.name,
                  terms: attr.terms,
                })),
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          }
        } else if (variants.length > 0) {
          // Create manual variants
          const variantPromises = variants
            .filter((v) => v.name && v.value)
            .map((variant) =>
              api.post(
                "/admin/product-variants",
                {
                  productId: response.data.id,
                  name: variant.name,
                  value: variant.value,
                  image: variant.image || null,
                  priceGhs: variant.priceGhs || null,
                  stock: variant.stock || 0,
                  sku: variant.sku || null,
                },
                { headers: { Authorization: `Bearer ${token}` } }
              )
            );
          await Promise.all(variantPromises);
        }
      }
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onSuccess?.();
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const productData = {
        ...data,
        images: imageUrls,
        badges,
      };
      await api.put(`/products/${product?.id}`, productData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Handle variants based on system used
      if (useAttributeSystem && attributes.length > 0) {
        // Generate variations from attributes
        const attributesForVariations = attributes.filter((attr) => attr.usedForVariations && attr.name && attr.terms.length > 0);
        if (attributesForVariations.length > 0) {
          await api.post(
            `/admin/products/${product?.id}/generate-variations`,
            {
              attributes: attributesForVariations.map((attr) => ({
                name: attr.name,
                terms: attr.terms,
              })),
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      } else {
        // Manual variant management
        const existingVariantsResponse = await api.get(`/admin/product-variants?productId=${product?.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const existingVariants = existingVariantsResponse.data?.variants || [];

        // Delete variants that were removed
        const variantsToKeep = variants.filter((v) => v.id && !v.id.startsWith("temp-"));
        const variantsToDelete = existingVariants.filter(
          (ev: ProductVariant) => !variantsToKeep.find((v) => v.id === ev.id)
        );
        for (const variant of variantsToDelete) {
          await api.delete(`/admin/product-variants/${variant.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }

        // Create or update variants
        for (const variant of variants) {
          if (!variant.name || !variant.value) continue;

          if (variant.id && !variant.id.startsWith("temp-")) {
            // Update existing variant
            await api.put(
              `/admin/product-variants/${variant.id}`,
              {
                name: variant.name,
                value: variant.value,
                image: variant.image || null,
                priceGhs: variant.priceGhs || null,
                stock: variant.stock || 0,
                sku: variant.sku || null,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } else {
            // Create new variant
            await api.post(
              "/admin/product-variants",
              {
                productId: product?.id,
                name: variant.name,
                value: variant.value,
                image: variant.image || null,
                priceGhs: variant.priceGhs || null,
                stock: variant.stock || 0,
                sku: variant.sku || null,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", product?.slug] });
      onSuccess?.();
      onClose();
    },
  });

  const onSubmit = (data: ProductFormData) => {
    const formData: any = {
      title: data.title,
      description: data.description || "",
      brandId: data.brandId || undefined,
      categoryId: data.categoryId || undefined,
      priceGhs: Number(data.priceGhs),
      compareAtPriceGhs: data.compareAtPriceGhs ? Number(data.compareAtPriceGhs) : undefined,
      stock: data.stock ? Number(data.stock) : 0,
      sku: data.sku || undefined,
      isActive: data.isActive ?? true,
      images: imageUrls.length > 0 ? imageUrls : [],
      badges: badges.length > 0 ? badges : [],
    };

    // Remove undefined/null/empty values
    Object.keys(formData).forEach((key) => {
      if (formData[key] === undefined || formData[key] === null || formData[key] === "") {
        delete formData[key];
      }
    });

    if (product) {
      updateMutation.mutate(formData, {
        onSuccess: async () => {
          // Auto-generate variations if attributes are selected
          if (useAttributeSystem && attributes.length > 0) {
            const attributesForVariations = attributes.filter((attr) => attr.name && attr.terms.length > 0);
            if (attributesForVariations.length > 0) {
              await generateVariationsFromAttributes();
            }
          }
        },
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{product ? "Edit Product" : "Add New Product"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <Input {...register("title")} />
                {errors.title && (
                  <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">SKU</label>
                <Input {...register("sku")} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                {...register("description")}
                className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  {...register("categoryId")}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select Category</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.parent ? `${cat.parent.name} > ` : ""}{cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Brand</label>
                <select
                  {...register("brandId")}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select Brand</option>
                  {brands?.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Regular Price (GHS) *</label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("priceGhs", { valueAsNumber: true })}
                />
                {errors.priceGhs && (
                  <p className="text-sm text-red-500 mt-1">{errors.priceGhs.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  The regular price. Will be shown crossed out if a sale price is set.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Sale Price (GHS)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Leave empty if not on sale"
                  {...register("compareAtPriceGhs", { valueAsNumber: true })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Set a sale price lower than the regular price. The regular price will be shown crossed out.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Stock</label>
                <Input
                  type="number"
                  {...register("stock", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Product Images</label>
              <p className="text-xs text-gray-500 mb-3">
                Upload product images. The first image will be the main featured image shown in listings.
              </p>

              <div className="space-y-4">
                {/* Upload Section */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  {/* File Upload */}
                  <div>
                    <label className="block text-xs font-medium mb-2 text-gray-700">Upload Image File</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) {
                          setSelectedImagePreview(null);
                          return;
                        }

                        // Show immediate local preview BEFORE upload starts
                        const localPreviewUrl = URL.createObjectURL(file);
                        setSelectedImagePreview(localPreviewUrl);
                        setUploadingImage(true);

                        try {
                          const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
                          if (!token) {
                            alert("Please log in to upload images");
                            setUploadingImage(false);
                            setSelectedImagePreview(null);
                            URL.revokeObjectURL(localPreviewUrl);
                            e.target.value = "";
                            return;
                          }

                          const formData = new FormData();
                          formData.append("file", file);

                          const response = await api.post("/admin/upload/product", formData, {
                            headers: {
                              Authorization: `Bearer ${token}`,
                              "Content-Type": "multipart/form-data",
                            },
                            transformRequest: (data) => data,
                          });

                          if (response.data.success) {
                            const newImageUrl = response.data.url;
                            
                            // Clean up local preview URL
                            URL.revokeObjectURL(localPreviewUrl);
                            
                            // Update preview to show uploaded image URL
                            setSelectedImagePreview(newImageUrl);
                            
                            // If no featured image, set as featured, otherwise add to gallery
                            if (!featuredImage) {
                              setFeaturedImage(newImageUrl);
                            } else {
                              setGalleryImages([...galleryImages, newImageUrl]);
                            }
                            
                            // Keep preview visible for 3 seconds to show success, then clear
                            setTimeout(() => {
                              setSelectedImagePreview(null);
                              setUploadingImage(false);
                              e.target.value = "";
                            }, 3000);
                          }
                        } catch (error: any) {
                          console.error("Error uploading image:", error);
                          alert(error.response?.data?.message || error.message || "Failed to upload image.");
                          URL.revokeObjectURL(localPreviewUrl);
                          setSelectedImagePreview(null);
                          setUploadingImage(false);
                          e.target.value = "";
                        }
                      }}
                      disabled={uploadingImage}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {uploadingImage ? "Uploading..." : "Select image (max 10MB) - Auto-uploads on selection"}
                    </p>
                  </div>

                  {/* Upload Preview - Shows immediately when file is selected, during upload, and after success */}
                  {selectedImagePreview && (
                    <div className="mt-4 p-3 bg-white rounded-lg border-2 border-dashed border-primary">
                      <p className="text-xs font-medium text-gray-700 mb-2">
                        {uploadingImage ? "Uploading image..." : "✓ Image uploaded successfully!"}
                      </p>
                      <div className="relative inline-block">
                        <img 
                          src={selectedImagePreview} 
                          alt={uploadingImage ? "Uploading..." : "Uploaded"} 
                          className="w-48 h-48 object-cover rounded-lg border-2 border-primary shadow-lg"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            // Try backend API fallback if direct path fails
                            if (!selectedImagePreview.includes("http") && !selectedImagePreview.startsWith("/media/")) {
                              const filename = selectedImagePreview.split("/").pop() || selectedImagePreview;
                              img.src = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001/api'}/admin/upload/media/products/${filename}`;
                            }
                          }}
                        />
                        {uploadingImage && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg">
                            <div className="text-white text-sm font-medium flex items-center gap-2">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                              Uploading...
                            </div>
                          </div>
                        )}
                        {!uploadingImage && (
                          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded shadow-lg flex items-center gap-1">
                            <span>✓</span>
                            <span>Uploaded</span>
                          </div>
                        )}
                      </div>
                      {!uploadingImage && (
                        <p className="text-xs text-gray-600 mt-2">
                          This image has been added to your product images below.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* All Product Images - Single Unified View */}
                {(featuredImage || galleryImages.length > 0) && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-white">
                    <label className="block text-sm font-medium mb-3 text-gray-900">
                      Your Product Images ({featuredImage ? 1 + galleryImages.length : galleryImages.length} total)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {/* Featured Image First */}
                      {featuredImage && (
                        <div className="relative group">
                          <img 
                            src={
                              featuredImage.startsWith("http")
                                ? featuredImage
                                : featuredImage.startsWith("/media/")
                                ? featuredImage
                                : featuredImage.startsWith("/")
                                ? featuredImage
                                : `/${featuredImage}`
                            } 
                            alt="Featured product image" 
                            className="w-full h-32 object-cover rounded border-2 border-primary shadow-md"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              const retryCount = parseInt(img.getAttribute('data-retry') || '0');
                              
                              if (retryCount < 2) {
                                // Try backend API fallback
                                const filename = featuredImage.split("/").pop() || featuredImage;
                                const fallbackUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001/api'}/admin/upload/media/products/${filename}`;
                                img.setAttribute('data-retry', String(retryCount + 1));
                                img.src = fallbackUrl;
                              } else {
                                // Show placeholder if all retries fail
                                img.style.display = 'none';
                                const placeholder = document.createElement('div');
                                placeholder.className = 'w-full h-32 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs';
                                placeholder.textContent = 'Image not found';
                                img.parentElement?.appendChild(placeholder);
                              }
                            }}
                          />
                          <div className="absolute top-1 left-1 bg-primary text-white text-xs font-semibold px-2 py-1 rounded shadow-lg">
                            Featured
                          </div>
                          <button
                            type="button"
                            onClick={removeFeaturedImage}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition shadow-lg"
                            title="Remove"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                      
                      {/* Gallery Images */}
                      {galleryImages.map((url, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={
                              url.startsWith("http")
                                ? url
                                : url.startsWith("/media/")
                                ? url
                                : url.startsWith("/")
                                ? url
                                : `/${url}`
                            } 
                            alt={`Product image ${index + 2}`} 
                            className="w-full h-32 object-cover rounded border border-gray-200"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              const retryCount = parseInt(img.getAttribute('data-retry') || '0');
                              
                              if (retryCount < 2) {
                                // Try backend API fallback
                                const filename = url.split("/").pop() || url;
                                const fallbackUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001/api'}/admin/upload/media/products/${filename}`;
                                img.setAttribute('data-retry', String(retryCount + 1));
                                img.src = fallbackUrl;
                              } else {
                                // Show placeholder if all retries fail
                                img.style.display = 'none';
                                const placeholder = document.createElement('div');
                                placeholder.className = 'w-full h-32 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs';
                                placeholder.textContent = 'Image not found';
                                img.parentElement?.appendChild(placeholder);
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition shadow-lg"
                            title="Remove"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setAsFeatured(url, index)}
                            className="absolute bottom-1 left-1 bg-primary text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition shadow-lg font-medium"
                            title="Set as featured"
                          >
                            Set Featured
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      <strong>Featured image</strong> (marked with badge) is the main product image shown in listings. Hover over images to remove or change the featured image.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Badges</label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newBadge}
                    onChange={(e) => setNewBadge(e.target.value)}
                    placeholder="Badge (e.g., NEW, BEST)"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addBadge())}
                  />
                  <Button type="button" onClick={addBadge} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {badges.map((badge) => (
                    <span
                      key={badge}
                      className="px-3 py-1 bg-primary text-white rounded-full text-sm flex items-center gap-2"
                    >
                      {badge}
                      <button
                        type="button"
                        onClick={() => removeBadge(badge)}
                        className="hover:bg-white/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Variations */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium">Product Variations</label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="useAttributeSystem"
                      checked={useAttributeSystem}
                      onChange={(e) => {
                        setUseAttributeSystem(e.target.checked);
                        // Auto-add Color attribute if available when enabling
                        if (e.target.checked && attributes.length === 0) {
                          const colorAttr = availableAttributes?.find(a => a.name.toLowerCase() === 'color');
                          if (colorAttr) {
                            setAttributes([{
                              name: 'Color',
                              terms: [],
                              usedForVariations: true,
                            }]);
                          }
                        }
                      }}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <label htmlFor="useAttributeSystem" className="text-xs text-gray-600 cursor-pointer">
                      Add Color Variations
                    </label>
                  </div>
                  {!useAttributeSystem && (
                    <Button type="button" onClick={addVariant} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Variation
                    </Button>
                  )}
                </div>
              </div>

              {useAttributeSystem ? (
                // Simplified Attribute-based system
                <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-600">
                      Select colors for this product. Variations will be generated automatically when you save.
                    </p>
                    <Button 
                      type="button" 
                      onClick={addAttribute} 
                      variant="outline" 
                      size="sm"
                      className="text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add More Attributes
                    </Button>
                  </div>

                  {attributes.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500 mb-3">
                        Select colors for this product
                      </p>
                      <Button 
                        type="button" 
                        onClick={() => {
                          const colorAttr = availableAttributes?.find(a => a.name.toLowerCase() === 'color');
                          if (colorAttr) {
                            setAttributes([{
                              name: 'Color',
                              terms: [],
                              usedForVariations: true,
                            }]);
                          } else {
                            setAttributes([{
                              name: 'Color',
                              terms: [],
                              usedForVariations: true,
                            }]);
                          }
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Select Colors
                      </Button>
                    </div>
                  ) : (
                    <>
                      {attributes.map((attr, attrIndex) => (
                        <div key={attrIndex} className="bg-white p-4 rounded border space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-gray-900">
                              {attr.name || `Attribute ${attrIndex + 1}`}
                            </h4>
                            <Button
                              type="button"
                              onClick={() => removeAttribute(attrIndex)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {attr.name === 'Color' ? (
                            // Simplified Color selection - show all color terms as selectable buttons with images
                            <div>
                              <label className="block text-xs font-medium mb-2">Select Colors *</label>
                              {(() => {
                                const colorAttr = availableAttributes?.find(a => a.name.toLowerCase() === 'color');
                                if (colorAttr && colorAttr.terms.length > 0) {
                                  return (
                                    <div className="space-y-2">
                                      <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-2 border rounded-md bg-gray-50">
                                        {colorAttr.terms.map((term) => {
                                          const isSelected = attr.terms.includes(term.name);
                                          // Use Next.js API proxy route for production compatibility (same as frontend)
                                          const imageUrl = term.image 
                                            ? (term.image.startsWith("http") 
                                                ? term.image 
                                                : `/api/media/swatches/${term.image.split('/').pop() || term.image}`)
                                            : null;
                                          
                                          return (
                                            <button
                                              key={term.id}
                                              type="button"
                                              onClick={() => {
                                                if (isSelected) {
                                                  const termIndex = attr.terms.indexOf(term.name);
                                                  if (termIndex !== -1) {
                                                    removeTermFromAttribute(attrIndex, termIndex);
                                                  }
                                                } else {
                                                  addTermToAttribute(attrIndex, term.name);
                                                }
                                              }}
                                              className={`px-3 py-2 rounded-md border-2 text-sm font-medium transition-all flex items-center gap-2 min-w-[120px] ${
                                                isSelected
                                                  ? "bg-primary text-white border-primary shadow-md ring-2 ring-primary ring-offset-1"
                                                  : "bg-white text-gray-700 border-gray-300 hover:border-primary hover:text-primary hover:shadow-sm"
                                              }`}
                                            >
                                              {imageUrl ? (
                                                <div className="relative flex-shrink-0">
                                                  <img
                                                    src={imageUrl}
                                                    alt={term.name}
                                                    className="w-8 h-8 object-cover rounded border border-gray-200"
                                                    onError={(e) => {
                                                      const img = e.target as HTMLImageElement;
                                                      const retryCount = parseInt(img.getAttribute('data-retry') || '0');
                                                      
                                                      // Try Next.js API proxy route fallback if direct path fails
                                                      if (retryCount < 2 && term.image) {
                                                        const filename = term.image.split('/').pop() || term.image;
                                                        const fallbackUrl = `/api/media/swatches/${filename}`;
                                                        img.setAttribute('data-retry', String(retryCount + 1));
                                                        img.src = fallbackUrl;
                                                        return;
                                                      }
                                                      
                                                      // Hide image if all retries fail
                                                      img.style.display = 'none';
                                                    }}
                                                  />
                                                </div>
                                              ) : (
                                                <div className="w-8 h-8 rounded border border-gray-300 bg-gray-100 flex-shrink-0"></div>
                                              )}
                                              <span className="truncate">{term.name}</span>
                                            </button>
                                          );
                                        })}
                                      </div>
                                      <p className="text-xs text-gray-500">
                                        {attr.terms.length > 0 
                                          ? `✓ ${attr.terms.length} color${attr.terms.length > 1 ? 's' : ''} selected. Variations will be created automatically.`
                                          : 'Click colors to select. Variations will be generated when you save.'}
                                      </p>
                                    </div>
                                  );
                                }
                                return (
                                  <p className="text-sm text-gray-500">
                                    No colors available. Go to "Attributes & Variations" to add color terms.
                                  </p>
                                );
                              })()}
                            </div>
                          ) : (
                            // Other attributes - keep original complex UI
                            <div>
                              <div>
                                <label className="block text-xs font-medium mb-1">Attribute Name *</label>
                                <select
                                  value={attr.name}
                                  onChange={(e) => {
                                    const selectedValue = e.target.value;
                                    // Find attribute with case-insensitive matching
                                    const selectedAttr = availableAttributes?.find(
                                      (a) => a.name.toLowerCase() === selectedValue.toLowerCase()
                                    );
                                    
                                    if (selectedAttr) {
                                      // Set the exact attribute name from database (preserve casing)
                                      updateAttribute(attrIndex, "name", selectedAttr.name);
                                      // Don't auto-populate terms - let user select which ones they want
                                      // Only clear terms if switching to a different attribute
                                      if (attr.name && attr.name.toLowerCase() !== selectedAttr.name.toLowerCase()) {
                                        updateAttribute(attrIndex, "terms", []);
                                      }
                                    } else if (selectedValue) {
                                      // Allow manual entry if attribute doesn't exist
                                      updateAttribute(attrIndex, "name", selectedValue);
                                    } else {
                                      // Clear if empty selection
                                      updateAttribute(attrIndex, "name", "");
                                      updateAttribute(attrIndex, "terms", []);
                                    }
                                  }}
                                  className="w-full px-3 py-2 border rounded-md text-sm mb-2"
                                >
                                  <option value="">Select attribute</option>
                                  {availableAttributes
                                    ?.filter((a) => a.name.toLowerCase() !== 'color') // Exclude Color as it's handled separately
                                    .map((a) => (
                                      <option key={a.id} value={a.name}>
                                        {a.name}
                                      </option>
                                    ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium mb-1">Attribute Values (Terms) *</label>
                                {(() => {
                                  // Find attribute with case-insensitive matching
                                  const selectedAttr = availableAttributes?.find(
                                    (a) => a.name.toLowerCase() === attr.name.toLowerCase()
                                  );
                                  if (selectedAttr && selectedAttr.terms.length > 0) {
                                    // Show terms from database as selectable buttons with images
                                    return (
                                      <div className="space-y-2">
                                        <div className="flex flex-wrap gap-2">
                                          {selectedAttr.terms.map((term) => {
                                            const isSelected = attr.terms.includes(term.name);
                                            return (
                                              <button
                                                key={term.id}
                                                type="button"
                                                onClick={() => {
                                                  if (isSelected) {
                                                    const termIndex = attr.terms.indexOf(term.name);
                                                    if (termIndex !== -1) {
                                                      removeTermFromAttribute(attrIndex, termIndex);
                                                    }
                                                  } else {
                                                    addTermToAttribute(attrIndex, term.name);
                                                  }
                                                }}
                                                className={`px-3 py-2 rounded-md border text-sm font-medium transition-colors flex items-center gap-2 ${
                                                  isSelected
                                                    ? "bg-primary text-white border-primary shadow-sm"
                                                    : "bg-white text-gray-700 border-gray-300 hover:border-primary hover:text-primary"
                                                }`}
                                              >
                                                {term.image && (
                                                  <img
                                                    src={term.image.startsWith("http") 
                                                      ? term.image 
                                                      : `/api/media/swatches/${term.image.split('/').pop() || term.image}`}
                                                    alt={term.name}
                                                    className="w-6 h-6 object-cover rounded"
                                                    onError={(e) => {
                                                      (e.target as HTMLImageElement).style.display = "none";
                                                    }}
                                                  />
                                                )}
                                                {term.name}
                                              </button>
                                            );
                                          })}
                                        </div>
                                        <p className="text-xs text-gray-500">
                                          Select terms from the attribute. To add new terms, go to "Attributes & Variations" menu.
                                        </p>
                                      </div>
                                    );
                                  }
                                  // Manual input for new attributes or attributes without terms
                                  return (
                                    <div>
                                      <div className="flex gap-2 mb-2">
                                        <Input
                                          id={`term-input-${attrIndex}`}
                                          type="text"
                                          placeholder="Add value (e.g., Black, Red, Large)"
                                          className="text-sm"
                                          onKeyPress={(e) => {
                                            if (e.key === "Enter") {
                                              e.preventDefault();
                                              const input = e.target as HTMLInputElement;
                                              addTermToAttribute(attrIndex, input.value);
                                              input.value = "";
                                            }
                                          }}
                                        />
                                        <Button
                                          type="button"
                                          onClick={() => {
                                            const input = document.getElementById(`term-input-${attrIndex}`) as HTMLInputElement;
                                            if (input && input.value.trim()) {
                                              addTermToAttribute(attrIndex, input.value);
                                              input.value = "";
                                            }
                                          }}
                                          variant="outline"
                                          size="sm"
                                        >
                                          Add
                                        </Button>
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        {attr.terms.map((term, termIndex) => (
                                          <span
                                            key={termIndex}
                                            className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2"
                                          >
                                            {term}
                                            <button
                                              type="button"
                                              onClick={() => removeTermFromAttribute(attrIndex, termIndex)}
                                              className="hover:bg-primary/20 rounded-full p-0.5"
                                            >
                                              <X className="h-3 w-3" />
                                            </button>
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {product?.id && attributes.filter((a) => a.name && a.terms.length > 0).length > 0 && (
                        <div className="pt-4 border-t">
                          <p className="text-xs text-gray-600 text-center mb-2">
                            ✓ Variations will be generated automatically when you save the product
                          </p>
                          <Button
                            type="button"
                            onClick={generateVariationsFromAttributes}
                            variant="outline"
                            className="w-full"
                            disabled={attributes.filter((a) => a.name && a.terms.length > 0).length === 0}
                          >
                            Generate Variations Now (Optional)
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                // Manual variation system
                <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
                {variants.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No variations added. Click "Add Variation" to create variants like Color, Size, Length, etc.
                  </p>
                ) : (
                  variants.map((variant, index) => (
                    <div key={variant.id || index} className="bg-white p-4 rounded border space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">Variation {index + 1}</h4>
                        <Button
                          type="button"
                          onClick={() => removeVariant(index)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium mb-1">Variant Name *</label>
                          <Input
                            value={variant.name}
                            onChange={(e) => updateVariant(index, "name", e.target.value)}
                            placeholder="e.g., Color, Size, Length"
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Variant Value *</label>
                          <Input
                            value={variant.value}
                            onChange={(e) => updateVariant(index, "value", e.target.value)}
                            placeholder="e.g., Black, Large, 22 inches"
                            className="text-sm"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium mb-1">Variant Image URL</label>
                          <div className="flex gap-2">
                            <Input
                              value={variant.image || ""}
                              onChange={(e) => updateVariant(index, "image", e.target.value)}
                              placeholder="Image URL for this variant (e.g., color swatch)"
                              className="text-sm"
                            />
                            {variant.image && (
                              <img
                                src={variant.image.startsWith("http") ? variant.image : `/${variant.image}`}
                                alt={variant.value}
                                className="w-12 h-12 object-cover rounded border"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Add an image URL for this variant (especially useful for color swatches)
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Price (GHS)</label>
                          <Input
                            type="number"
                            step="0.01"
                            value={variant.priceGhs || ""}
                            onChange={(e) =>
                              updateVariant(index, "priceGhs", e.target.value ? parseFloat(e.target.value) : undefined)
                            }
                            placeholder="Optional - overrides product price"
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Stock *</label>
                          <Input
                            type="number"
                            min="0"
                            value={variant.stock}
                            onChange={(e) => updateVariant(index, "stock", parseInt(e.target.value) || 0)}
                            className="text-sm"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium mb-1">SKU</label>
                          <Input
                            value={variant.sku || ""}
                            onChange={(e) => updateVariant(index, "sku", e.target.value)}
                            placeholder="Optional - unique SKU for this variant"
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                {...register("isActive")}
                defaultChecked={product?.isActive ?? true}
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                Active (visible to customers)
              </label>
            </div>

            {/* SEO Section */}
            {product?.id && (
              <div className="border-t pt-6">
                <button
                  type="button"
                  onClick={() => setShowSEO(!showSEO)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h3 className="text-lg font-semibold">SEO Settings</h3>
                  {showSEO ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
                {showSEO && (
                  <div className="mt-4">
                    <ProductSEOForm productId={product.id} embedded={true} />
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : product
                  ? "Update Product"
                  : "Create Product"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>

            {(createMutation.error || updateMutation.error) && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {(createMutation.error as any)?.response?.data?.message ||
                  (updateMutation.error as any)?.response?.data?.message ||
                  "An error occurred"}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

