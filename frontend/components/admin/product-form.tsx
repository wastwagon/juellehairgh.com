"use client";

import { useState, useEffect, useMemo } from "react";
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
import { VariationTermModal, VariationTermData } from "@/components/admin/variation-term-modal";

const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  brandId: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  priceGhs: z.number().min(0, "Price must be positive"),
  compareAtPriceGhs: z.union([z.number(), z.literal(""), z.null(), z.undefined()]).optional(),
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
  asPage?: boolean;
}

interface ProductAttribute {
  name: string;
  terms: string[];
  usedForVariations: boolean;
}

export function ProductForm({ product, onClose, onSuccess, asPage = false }: ProductFormProps) {
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
  
  // Product type: simple or variable
  // Initialize from product, but will be updated when variants are loaded
  const [productType, setProductType] = useState<"simple" | "variable">(() => {
    // Check if product has variants (either from initial load or already loaded)
    if (product?.variants && product.variants.length > 0) {
      return "variable";
    }
    return "simple";
  });
  
  // Selected attribute terms for variable products
  const [selectedColorTerms, setSelectedColorTerms] = useState<string[]>([]);
  const [selectedLengthTerms, setSelectedLengthTerms] = useState<string[]>([]);
  
  // Variation modal state
  const [variationModalOpen, setVariationModalOpen] = useState(false);
  const [selectedVariationCombo, setSelectedVariationCombo] = useState<{
    color: string;
    length: string;
    colorId?: string;
    lengthId?: string;
    existingVariant?: ProductVariant | null;
  } | null>(null);

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
    reset,
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

  // Reset form when product changes (for editing)
  useEffect(() => {
    if (product) {
      reset({
        title: product.title || "",
        description: product.description || "",
        brandId: typeof product.brand === "object" ? product.brand?.id : product.brandId || "",
        categoryId: typeof product.category === "object" ? product.category?.id : product.categoryId || "",
        priceGhs: product.priceGhs ? Number(product.priceGhs) : 0,
        compareAtPriceGhs: product.compareAtPriceGhs ? Number(product.compareAtPriceGhs) : undefined,
        stock: product.stock || 0,
        sku: product.sku || "",
        isActive: product.isActive ?? true,
        images: product.images || [],
        badges: product.badges || [],
      });
    }
  }, [product?.id, reset]);

  // Update imageUrls when featuredImage or galleryImages change
  // Format: [featuredImage, ...galleryImages] - matches WooCommerce pattern where featured is first
  useEffect(() => {
    const allImages = featuredImage ? [featuredImage, ...galleryImages] : galleryImages;
    setImageUrls(allImages);
  }, [featuredImage, galleryImages]);

  // Get first variation price for variable products
  const firstVariationPrice = useMemo(() => {
    if (productType === "variable" && variants.length > 0) {
      // Find first variation with a price
      const firstVariantWithPrice = variants.find(v => v.priceGhs && Number(v.priceGhs) > 0);
      if (firstVariantWithPrice) {
        return Number(firstVariantWithPrice.priceGhs);
      }
      // If no price found, check if we have existing product variants
      if (product?.variants && product.variants.length > 0) {
        const existingVariantWithPrice = product.variants.find((v: ProductVariant) => v.priceGhs && Number(v.priceGhs) > 0);
        if (existingVariantWithPrice) {
          return Number(existingVariantWithPrice.priceGhs);
        }
      }
    }
    return 0;
  }, [productType, variants, product?.variants]);

  // Update form values when product type changes
  useEffect(() => {
    if (productType === "variable") {
      // Use first variation price instead of 0
      const priceToUse = firstVariationPrice > 0 ? firstVariationPrice : 0;
      setValue("priceGhs", priceToUse);
      setValue("stock", 0);
      setValue("compareAtPriceGhs", undefined);
    } else if (productType === "simple") {
      // When switching to simple, restore product prices if editing
      if (product) {
        setValue("priceGhs", product.priceGhs ? Number(product.priceGhs) : 0);
        setValue("compareAtPriceGhs", product.compareAtPriceGhs ? Number(product.compareAtPriceGhs) : undefined);
        setValue("stock", product.stock || 0);
      }
    }
  }, [productType, setValue, firstVariationPrice, product]);

  // Update form price when variants change (for variable products)
  useEffect(() => {
    if (productType === "variable" && firstVariationPrice > 0) {
      setValue("priceGhs", firstVariationPrice);
    }
  }, [variants, productType, firstVariationPrice, setValue]);

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

  // Initialize selected color and length terms from existing variants
  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      const colorVariants = product.variants.filter(v => 
        v.name.toLowerCase().includes('color') || v.name.toLowerCase().includes('colour')
      );
      const lengthVariants = product.variants.filter(v => 
        v.name.toLowerCase().includes('length')
      );
      
      const colors = Array.from(new Set(colorVariants.map(v => v.value)));
      const lengths = Array.from(new Set(lengthVariants.map(v => v.value)));
      
      setSelectedColorTerms(colors);
      setSelectedLengthTerms(lengths);
    }
  }, [product?.id]);

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
              const loadedVariants = response.data.variants;
              setVariants(loadedVariants);
              
              // Update productType based on loaded variants
              if (loadedVariants.length > 0) {
                setProductType("variable");
              }
              
              // Try to reconstruct attributes from variants
              const variantMap = new Map<string, Set<string>>();
              loadedVariants.forEach((v: ProductVariant) => {
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
            } else {
              // No variants found, ensure productType is set correctly
              if (product?.variants && product.variants.length > 0) {
                setProductType("variable");
              } else {
                setProductType("simple");
              }
            }
          })
          .catch((error) => {
            console.error("Error loading variants:", error);
            // On error, check if product has variants from initial load
            if (product?.variants && product.variants.length > 0) {
              setProductType("variable");
            }
          });
      }
    } else {
      // Reset variants when creating new product
      setVariants([]);
      setAttributes([]);
      setUseAttributeSystem(false);
      setProductType("simple");
    }
  }, [product?.id, product?.variants]);


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

  // Generate variation combinations (Color × Length)
  const variationCombinations = useMemo(() => {
    if (productType !== "variable" || selectedColorTerms.length === 0) {
      return [];
    }

    const colors = selectedColorTerms;
    const lengths = selectedLengthTerms.length > 0 ? selectedLengthTerms : [null]; // If no length, create single variant per color

    return colors.flatMap(color => 
      lengths.map(length => {
        const comboKey = length ? `${color} / ${length}` : color;
        
        // Find existing variant for this combination
        const existingVariant = variants.find(v => {
          if (length) {
            // Combined variant: "Color / Length" with value "1 / 18 inches"
            return v.name.toLowerCase().includes('color') && 
                   v.name.toLowerCase().includes('length') &&
                   v.value === comboKey;
          } else {
            // Single color variant
            return (v.name.toLowerCase().includes('color') || v.name.toLowerCase().includes('colour')) &&
                   v.value === color;
          }
        });

        return {
          color,
          length: length || null,
          comboKey,
          existingVariant: existingVariant || null,
        };
      })
    );
  }, [selectedColorTerms, selectedLengthTerms, variants, productType]);

  // Open variation modal
  const openVariationModal = (combo: typeof variationCombinations[0]) => {
    setSelectedVariationCombo({
      color: combo.color,
      length: combo.length || '',
      existingVariant: combo.existingVariant || null,
    });
    setVariationModalOpen(true);
  };

  // Delete variation combination
  const handleDeleteVariation = async (combo: typeof variationCombinations[0], e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the modal when clicking delete
    
    if (!confirm(`Are you sure you want to delete the variation "${combo.color}${combo.length ? ` / ${combo.length}` : ''}"?`)) {
      return;
    }

    // If it's an existing variant, delete from database
    if (combo.existingVariant?.id && product?.id) {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) throw new Error("Not authenticated");
        
        await api.delete(`/admin/product-variants/${combo.existingVariant.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Reload variants
        const variantsResponse = await api.get(`/admin/product-variants?productId=${product.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (variantsResponse.data?.variants) {
          setVariants(variantsResponse.data.variants);
        }
      } catch (error: any) {
        console.error("Error deleting variation:", error);
        alert(error.response?.data?.message || "Failed to delete variation");
      }
    } else {
      // Remove from local state (for new products)
      const variantName = combo.length ? "Color / Length" : "Color";
      const variantValue = combo.length
        ? `${combo.color} / ${combo.length}`
        : combo.color;
      
      setVariants(prev => prev.filter(v => 
        !(v.name === variantName && v.value === variantValue)
      ));
    }

    // Remove from selected terms if no other variations use them
    // Check if this color is still used by other combinations
    const otherCombosUsingColor = variationCombinations.filter(c => 
      c.color === combo.color && c !== combo
    );
    if (otherCombosUsingColor.length === 0) {
      setSelectedColorTerms(prev => prev.filter(c => c !== combo.color));
    }

    // Check if this length is still used by other combinations
    if (combo.length) {
      const otherCombosUsingLength = variationCombinations.filter(c => 
        c.length === combo.length && c !== combo
      );
      if (otherCombosUsingLength.length === 0) {
        setSelectedLengthTerms(prev => prev.filter(l => l !== combo.length));
      }
    }
  };

  // Save variation from modal
  const handleSaveVariation = async (data: VariationTermData) => {
    if (!selectedVariationCombo) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) throw new Error("Not authenticated");

    // For new products, store variation data temporarily
    if (!product?.id) {
      // Store in local state for now - will be created after product is saved
      const variantName = selectedVariationCombo.length 
        ? "Color / Length" 
        : "Color";
      const variantValue = selectedVariationCombo.length
        ? `${selectedVariationCombo.color} / ${selectedVariationCombo.length}`
        : selectedVariationCombo.color;

      const newVariant: ProductVariant = {
        id: `temp-${Date.now()}`,
        productId: "",
        name: variantName,
        value: variantValue,
        priceGhs: data.regularPrice,
        compareAtPriceGhs: data.salePrice > 0 ? data.salePrice : null,
        stock: data.stock,
        sku: data.sku || null,
      };

      setVariants(prev => {
        const existing = prev.find(v => 
          v.name === variantName && v.value === variantValue
        );
        if (existing) {
          return prev.map(v => 
            v.name === variantName && v.value === variantValue ? newVariant : v
          );
        }
        return [...prev, newVariant];
      });

      // Update product price to first variation price if this is the first variation
      if (variants.length === 0 && data.regularPrice > 0) {
        setValue("priceGhs", data.regularPrice);
      }

      setVariationModalOpen(false);
      setSelectedVariationCombo(null);
      return;
    }

    // For existing products, save immediately
    try {
      const variantName = selectedVariationCombo.length 
        ? "Color / Length" 
        : "Color";
      const variantValue = selectedVariationCombo.length
        ? `${selectedVariationCombo.color} / ${selectedVariationCombo.length}`
        : selectedVariationCombo.color;

      if (selectedVariationCombo.existingVariant?.id) {
        // Update existing variant
        await api.put(
          `/admin/product-variants/${selectedVariationCombo.existingVariant.id}`,
          {
            name: variantName,
            value: variantValue,
            priceGhs: data.regularPrice,
            compareAtPriceGhs: data.salePrice > 0 ? data.salePrice : null,
            stock: data.stock,
            sku: data.sku || null,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create new variant
        await api.post(
          "/admin/product-variants",
          {
            productId: product.id,
            name: variantName,
            value: variantValue,
            priceGhs: data.regularPrice,
            compareAtPriceGhs: data.salePrice > 0 ? data.salePrice : null,
            stock: data.stock,
            sku: data.sku || null,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // Reload variants
      const variantsResponse = await api.get(`/admin/product-variants?productId=${product.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (variantsResponse.data?.variants) {
        setVariants(variantsResponse.data.variants);
      }

      setVariationModalOpen(false);
      setSelectedVariationCombo(null);
    } catch (error: any) {
      console.error("Error saving variation:", error);
      throw error;
    }
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
      console.log("Creating product with data:", productData);
      const response = await api.post("/admin/products", productData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Create variants if product was created and we have temp variants (from modal)
      if (response.data?.id && variants.length > 0) {
        const variantPromises = variants
          .filter((v) => v.name && v.value && v.id?.startsWith("temp-"))
          .map((variant) =>
            api.post(
              "/admin/product-variants",
              {
                productId: response.data.id,
                name: variant.name,
                value: variant.value,
                image: variant.image || null,
                priceGhs: variant.priceGhs || null,
                compareAtPriceGhs: variant.compareAtPriceGhs || null,
                stock: variant.stock || 0,
                sku: variant.sku || null,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            )
          );
        if (variantPromises.length > 0) {
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
    onError: (error: any) => {
      console.error("Error creating product:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to create product";
      alert(errorMessage);
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
      console.log("Updating product with data:", productData);
      await api.put(`/admin/products/${product?.id}`, productData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // For variable products, variations are created manually via modal
      // No auto-generation - admin must click each combination and set prices
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", product?.slug] });
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      console.error("Error updating product:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to update product";
      alert(errorMessage);
    },
  });

  const onSubmit = (data: ProductFormData) => {
    // Validate required fields
    if (!data.categoryId || data.categoryId.trim() === "") {
      alert("Please select a category");
      return;
    }

    const formData: any = {
      title: data.title,
      description: data.description || "",
      brandId: data.brandId && data.brandId.trim() !== "" ? data.brandId : undefined,
      categoryId: data.categoryId, // Required, don't allow empty
      isActive: data.isActive ?? true,
      images: imageUrls.length > 0 ? imageUrls : [],
      badges: badges.length > 0 ? badges : [],
    };

    // For simple products, include pricing
    if (productType === "simple") {
      formData.priceGhs = Number(data.priceGhs) || 0;
      // Handle sale price: convert empty string, null, undefined, or 0 to undefined
      const salePrice = data.compareAtPriceGhs === "" || data.compareAtPriceGhs === null || data.compareAtPriceGhs === undefined 
        ? undefined 
        : Number(data.compareAtPriceGhs);
      formData.compareAtPriceGhs = salePrice && salePrice > 0 ? salePrice : undefined;
      formData.stock = data.stock ? Number(data.stock) : 0;
      formData.sku = data.sku && data.sku.trim() !== "" ? data.sku : undefined;
    } else {
      // For variable products, use first variation's price instead of 0
      // Find first variation with a price
      let defaultPrice = 0;
      if (variants.length > 0) {
        const firstVariantWithPrice = variants.find(v => v.priceGhs && Number(v.priceGhs) > 0);
        if (firstVariantWithPrice) {
          defaultPrice = Number(firstVariantWithPrice.priceGhs);
        }
      } else if (product?.variants && product.variants.length > 0) {
        // Check existing product variants if no new variants created yet
        const existingVariantWithPrice = product.variants.find((v: ProductVariant) => v.priceGhs && Number(v.priceGhs) > 0);
        if (existingVariantWithPrice) {
          defaultPrice = Number(existingVariantWithPrice.priceGhs);
        }
      }
      formData.priceGhs = defaultPrice;
      formData.stock = 0;
    }

    // Remove undefined/null/empty values (but keep categoryId as it's required)
    Object.keys(formData).forEach((key) => {
      if (key === "categoryId") return; // Don't delete required field
      if (formData[key] === undefined || formData[key] === null || formData[key] === "") {
        delete formData[key];
      }
    });

    if (product) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  // Render as page or modal based on asPage prop
  const formContent = (
    <>
      {!asPage && (
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{product ? "Edit Product" : "Add New Product"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
      )}
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
                <label className="block text-sm font-medium mb-2">Category *</label>
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
                {errors.categoryId && (
                  <p className="text-sm text-red-500 mt-1">{errors.categoryId.message}</p>
                )}
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

            {/* Product Type Toggle */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <label className="block text-sm font-medium mb-3">Product Type *</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="simple"
                    checked={productType === "simple"}
                    onChange={(e) => {
                      setProductType(e.target.value as "simple" | "variable");
                      if (e.target.value === "simple") {
                        setSelectedColorTerms([]);
                        setSelectedLengthTerms([]);
                      }
                    }}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium">Simple Product</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="variable"
                    checked={productType === "variable"}
                    onChange={(e) => setProductType(e.target.value as "simple" | "variable")}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium">Variable Product</span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {productType === "simple" 
                  ? "Simple products use product-level pricing and stock."
                  : "Variable products have variations with individual prices and stock."}
              </p>
            </div>

            {/* Price Fields - Only show for Simple Products */}
            {productType === "simple" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Regular Price (GHS) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={watch("priceGhs") === undefined || watch("priceGhs") === null ? "" : watch("priceGhs")}
                    onChange={(e) => {
                      const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
                      setValue("priceGhs", isNaN(value) ? 0 : value, { shouldValidate: true });
                    }}
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
                    min="0"
                    placeholder="Leave empty if not on sale"
                    value={watch("compareAtPriceGhs") === undefined || watch("compareAtPriceGhs") === null || watch("compareAtPriceGhs") === "" ? "" : watch("compareAtPriceGhs")}
                    onChange={(e) => {
                      const value = e.target.value === "" ? undefined : parseFloat(e.target.value);
                      setValue("compareAtPriceGhs", value === undefined || isNaN(value) ? undefined : value, { shouldValidate: true });
                    }}
                  />
                  {errors.compareAtPriceGhs && (
                    <p className="text-sm text-red-500 mt-1">{errors.compareAtPriceGhs.message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Set a sale price lower than the regular price. The regular price will be shown crossed out.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Stock</label>
                  <Input
                    type="number"
                    min="0"
                    value={watch("stock") === undefined || watch("stock") === null ? "" : watch("stock")}
                    onChange={(e) => {
                      const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
                      setValue("stock", isNaN(value) ? 0 : value, { shouldValidate: true });
                    }}
                  />
                </div>
              </div>
            )}

            {/* Variable Product: Attribute Selection */}
            {productType === "variable" && (
              <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
                {/* Hidden inputs for variable products to satisfy form validation */}
                {/* Use first variation price instead of 0 */}
                <input type="hidden" {...register("priceGhs", { valueAsNumber: true, value: firstVariationPrice })} />
                <input type="hidden" {...register("stock", { valueAsNumber: true, value: 0 })} />
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Product Variations</h3>
                
                {/* Color Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Color *</label>
                  {(() => {
                    const colorAttr = availableAttributes?.find(a => a.name.toLowerCase() === 'color');
                    if (colorAttr && colorAttr.terms.length > 0) {
                      return (
                        <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-2 border rounded-md bg-white">
                          {colorAttr.terms.map((term, index) => {
                            const isSelected = selectedColorTerms.includes(term.name);
                            // Handle different image path formats
                            let imageUrl: string | null = null;
                            if (term.image) {
                              if (term.image.startsWith("http")) {
                                imageUrl = term.image;
                              } else if (term.image.startsWith("/media/swatches/")) {
                                // Full path format: /media/swatches/filename.jpg
                                const filename = term.image.replace("/media/swatches/", "");
                                imageUrl = `/api/media/swatches/${filename}`;
                              } else if (term.image.startsWith("media/swatches/")) {
                                // Path without leading slash
                                const filename = term.image.replace("media/swatches/", "");
                                imageUrl = `/api/media/swatches/${filename}`;
                              } else {
                                // Just filename or relative path
                                const filename = term.image.split('/').pop() || term.image;
                                imageUrl = `/api/media/swatches/${filename}`;
                              }
                            }
                            
                            return (
                              <button
                                key={`color-${colorAttr.id}-${term.id}-${index}`}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedColorTerms(prev => prev.filter(c => c !== term.name));
                                  } else {
                                    setSelectedColorTerms(prev => [...prev, term.name]);
                                  }
                                }}
                                className={`px-3 py-2 rounded-md border-2 text-sm font-medium transition-all flex items-center gap-2 ${
                                  isSelected
                                    ? "bg-primary text-white border-primary shadow-md"
                                    : "bg-white text-gray-700 border-gray-300 hover:border-primary"
                                }`}
                              >
                                {imageUrl && (
                                  <img
                                    src={imageUrl}
                                    alt={term.name}
                                    className="w-6 h-6 object-cover rounded border"
                                  />
                                )}
                                <span>{term.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      );
                    }
                    return <p className="text-sm text-gray-500">No colors available. Go to "Attributes & Variations" to add colors.</p>;
                  })()}
                </div>

                {/* Length Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Length (Optional)</label>
                  {(() => {
                    const lengthAttr = availableAttributes?.find(a => a.name.toLowerCase() === 'length');
                    if (lengthAttr && lengthAttr.terms.length > 0) {
                      return (
                        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border rounded-md bg-white">
                          {lengthAttr.terms.map((term, index) => {
                            const isSelected = selectedLengthTerms.includes(term.name);
                            return (
                              <button
                                key={`length-${lengthAttr.id}-${term.id}-${index}`}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedLengthTerms(prev => prev.filter(l => l !== term.name));
                                  } else {
                                    setSelectedLengthTerms(prev => [...prev, term.name]);
                                  }
                                }}
                                className={`px-4 py-2 rounded-md border-2 text-sm font-medium transition-all ${
                                  isSelected
                                    ? "bg-primary text-white border-primary shadow-md"
                                    : "bg-white text-gray-700 border-gray-300 hover:border-primary"
                                }`}
                              >
                                {term.name}
                              </button>
                            );
                          })}
                        </div>
                      );
                    }
                    return <p className="text-sm text-gray-500">No lengths available. Go to "Attributes & Variations" to add lengths.</p>;
                  })()}
                </div>

                {/* Variation Matrix */}
                {selectedColorTerms.length > 0 && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium mb-3">
                      Variation Combinations ({variationCombinations.length})
                    </label>
                    <p className="text-xs text-gray-500 mb-4">
                      Click on each combination to set price, stock, and other details. Variations are created manually.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {variationCombinations.map((combo, index) => {
                        const colorTerm = availableAttributes?.find(a => a.name.toLowerCase() === 'color')?.terms.find(t => t.name === combo.color);
                        // Handle different image path formats
                        let colorImageUrl: string | null = null;
                        if (colorTerm?.image) {
                          if (colorTerm.image.startsWith("http")) {
                            colorImageUrl = colorTerm.image;
                          } else if (colorTerm.image.startsWith("/media/swatches/")) {
                            const filename = colorTerm.image.replace("/media/swatches/", "");
                            colorImageUrl = `/api/media/swatches/${filename}`;
                          } else if (colorTerm.image.startsWith("media/swatches/")) {
                            const filename = colorTerm.image.replace("media/swatches/", "");
                            colorImageUrl = `/api/media/swatches/${filename}`;
                          } else {
                            const filename = colorTerm.image.split('/').pop() || colorTerm.image;
                            colorImageUrl = `/api/media/swatches/${filename}`;
                          }
                        }
                        
                        return (
                          <div
                            key={index}
                            className={`relative border-2 rounded-lg p-3 transition-all hover:border-primary hover:shadow-md ${
                              combo.existingVariant
                                ? "border-green-500 bg-green-50"
                                : "border-gray-300 bg-white"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => openVariationModal(combo)}
                              className="w-full text-left"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                {colorImageUrl && (
                                  <img
                                    src={colorImageUrl}
                                    alt={combo.color}
                                    className="w-8 h-8 object-cover rounded border"
                                  />
                                )}
                                <span className="text-xs font-medium text-gray-900">{combo.color}</span>
                              </div>
                              {combo.length && (
                                <div className="text-xs text-gray-600 mb-2">{combo.length}</div>
                              )}
                              {combo.existingVariant ? (
                                <div className="text-xs space-y-1">
                                  <div className="text-green-600 font-medium">
                                    GH₵{Number(combo.existingVariant.priceGhs || 0).toFixed(2)}
                                  </div>
                                  <div className={combo.existingVariant.stock === 0 ? "text-red-500 font-medium" : "text-gray-500"}>
                                    {combo.existingVariant.stock === 0 ? "Out of Stock" : `Stock: ${combo.existingVariant.stock}`}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-xs text-gray-400">Click to configure</div>
                              )}
                            </button>
                            {/* Delete button */}
                            <button
                              type="button"
                              onClick={(e) => handleDeleteVariation(combo, e)}
                              className="absolute top-2 right-2 p-1 rounded-full hover:bg-red-100 text-red-500 hover:text-red-700 transition-colors"
                              title="Delete variation"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

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
      </>
  );

  // Render as page
  if (asPage) {
    return (
      <>
        <Card className="w-full">
          {formContent}
        </Card>

        {/* Variation Modal */}
        {variationModalOpen && selectedVariationCombo && (
          <VariationTermModal
            isOpen={variationModalOpen}
            onClose={() => {
              setVariationModalOpen(false);
              setSelectedVariationCombo(null);
            }}
            onSave={handleSaveVariation}
            attributeName={selectedVariationCombo.length ? "Color / Length" : "Color"}
            termName={selectedVariationCombo.length 
              ? `${selectedVariationCombo.color} / ${selectedVariationCombo.length}`
              : selectedVariationCombo.color}
            existingVariant={selectedVariationCombo.existingVariant || null}
          />
        )}
      </>
    );
  }

  // Render as modal (default)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {formContent}
      </Card>

      {/* Variation Modal */}
      {variationModalOpen && selectedVariationCombo && (
        <VariationTermModal
          isOpen={variationModalOpen}
          onClose={() => {
            setVariationModalOpen(false);
            setSelectedVariationCombo(null);
          }}
          onSave={handleSaveVariation}
          attributeName={selectedVariationCombo.length ? "Color / Length" : "Color"}
          termName={selectedVariationCombo.length 
            ? `${selectedVariationCombo.color} / ${selectedVariationCombo.length}`
            : selectedVariationCombo.color}
          existingVariant={selectedVariationCombo.existingVariant || null}
        />
      )}
    </div>
  );
}

