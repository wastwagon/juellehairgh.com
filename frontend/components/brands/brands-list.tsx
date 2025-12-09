"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Brand } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Tag } from "lucide-react";

export function BrandsList() {
  const { data: brands, isLoading } = useQuery<Brand[]>({
    queryKey: ["brands", "public"],
    queryFn: async () => {
      const response = await api.get("/brands");
      return response.data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-lg mb-2" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (!brands || brands.length === 0) {
    return (
      <div className="text-center py-12">
        <Tag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">No brands found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      {brands.map((brand) => (
        <Link key={brand.id} href={`/brands/${brand.slug}`}>
          <Card className="hover:shadow-lg transition-all hover:border-primary/50 group">
            <CardContent className="p-6">
              <div className="aspect-square bg-gray-50 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                {brand.logo ? (
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <Tag className="h-12 w-12 text-gray-400" />
                )}
              </div>
              <h3 className="font-semibold text-gray-900 text-center group-hover:text-primary transition-colors">
                {brand.name}
              </h3>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
