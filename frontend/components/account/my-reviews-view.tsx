"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Review } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Edit, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export function MyReviewsView() {
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery<Review[]>({
    queryKey: ["reviews", "my"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get("/reviews/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      return api.delete(`/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", "my"] });
      toast.success("Review deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete review");
    },
  });

  const handleDelete = (reviewId: string) => {
    if (confirm("Are you sure you want to delete this review?")) {
      deleteMutation.mutate(reviewId);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading reviews...</p>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
        <p className="text-gray-600 mb-6">You haven't written any reviews yet.</p>
        <Link href="/shop-all">
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Reviews</h2>
          <p className="text-gray-600 mt-1">Manage your product reviews</p>
        </div>
        <p className="text-sm text-gray-600">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "fill-primary text-primary"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    {review.isVerified ? (
                      <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                        <XCircle className="h-3 w-3" />
                        Pending
                      </span>
                    )}
                  </div>
                  {review.title && (
                    <h3 className="font-semibold text-gray-900 mb-2">{review.title}</h3>
                  )}
                  {review.comment && (
                    <p className="text-gray-700 mb-3">{review.comment}</p>
                  )}
                  {review.product && (
                    <Link
                      href={`/products/${(review.product as any).slug}`}
                      className="text-sm text-purple-600 hover:text-purple-700 hover:underline"
                    >
                      View Product: {(review.product as any).title}
                    </Link>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(review.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
