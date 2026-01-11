"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Layers } from "lucide-react";
import { CollectionForm } from "./collection-form";

interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  _count?: { products: number };
}

export function AdminCollections() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

  const { data: collections, isLoading } = useQuery<Collection[]>({
    queryKey: ["admin", "collections"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get("/admin/collections", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      return api.delete(`/admin/collections/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "collections"] });
    },
  });

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this collection?")) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error: any) {
        alert(error.response?.data?.message || "Failed to delete collection");
      }
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading collections...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Manage Collections</h1>
          <p className="text-gray-600 mt-1">Organize product collections</p>
        </div>
        <Button
          onClick={() => {
            setEditingCollection(null);
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Collection
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Collections ({collections?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections?.map((collection) => (
              <div
                key={collection.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  {collection.image ? (
                    <img
                      src={
                        collection.image.startsWith("http://") || collection.image.startsWith("https://")
                          ? collection.image
                          : collection.image.startsWith("/media/")
                          ? `/api${collection.image}`
                          : collection.image.startsWith("/")
                          ? collection.image
                          : `/api/media/collections/${collection.image.split("/").pop()}`
                      }
                      alt={collection.name}
                      className="w-10 h-10 object-cover rounded"
                      onError={(e) => {
                        // Fallback to icon if image fails
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                        const icon = img.nextElementSibling as HTMLElement;
                        if (icon) icon.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <Layers className={`h-5 w-5 ${collection.image ? 'hidden' : 'text-gray-400'}`} />
                  <div>
                    <h3 className="font-semibold text-gray-900">{collection.name}</h3>
                    <p className="text-sm text-gray-500">
                      {collection._count?.products || 0} products
                      {!collection.isActive && <span className="text-red-500 ml-2">(Inactive)</span>}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingCollection(collection);
                      setShowForm(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(collection.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <CollectionForm
          collection={editingCollection || undefined}
          onClose={() => {
            setShowForm(false);
            setEditingCollection(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["admin", "collections"] });
          }}
        />
      )}
    </div>
  );
}



