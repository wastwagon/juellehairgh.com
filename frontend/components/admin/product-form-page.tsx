"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Product } from "@/types";
import { ProductForm } from "./product-form";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ProductFormPageProps {
  productId?: string;
}

export function ProductFormPage({ productId }: ProductFormPageProps) {
  const router = useRouter();

  // Fetch product if editing
  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["admin", "product", productId],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get(`/admin/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!productId,
  });

  const handleClose = () => {
    router.push("/admin/products");
  };

  const handleSuccess = () => {
    router.push("/admin/products");
  };

  if (productId && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          {productId ? "Edit Product" : "Create New Product"}
        </h1>
      </div>

      <ProductForm
        product={product}
        onClose={handleClose}
        onSuccess={handleSuccess}
        asPage={true}
      />
    </div>
  );
}

