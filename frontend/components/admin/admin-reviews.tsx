"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Trash2, CheckCircle, XCircle } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  isVerified: boolean;
  createdAt: string;
  user: { id: string; name?: string; email: string };
  product: { id: string; title: string; slug: string };
}

export function AdminReviews() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ page: 1, limit: 20, status: "all" }); // all, pending, approved

  const { data: reviewsData, isLoading, error } = useQuery<{
    reviews: Review[];
    pagination: any;
  }>({
    queryKey: ["admin", "reviews", filters],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const params: any = { page: filters.page, limit: filters.limit };
      // Note: Backend doesn't filter by isVerified in admin endpoint, we filter on frontend
      const response = await api.get(`/admin/reviews`, { params, headers: { Authorization: `Bearer ${token}` } });
      return response.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      return api.put(`/admin/reviews/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
      // Also invalidate product reviews cache so approved reviews appear immediately
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      if (variables.data.isVerified) {
        alert("Review approved! It will now be visible on the product page.");
      } else {
        alert("Review unapproved. It will no longer be visible on the product page.");
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      return api.delete(`/admin/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
    },
  });

  const handleToggleVerify = (review: Review) => {
    updateMutation.mutate({
      id: review.id,
      data: { isVerified: !review.isVerified },
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this review?")) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error: any) {
        alert(error.response?.data?.message || "Failed to delete review");
      }
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading reviews...</div>;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Manage Reviews</h1>
          <p className="text-gray-600 mt-1">View and manage product reviews</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-600 mb-4">Error loading reviews: {error instanceof Error ? error.message : "Unknown error"}</p>
            <p className="text-sm text-gray-600">Please check your backend connection and try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allReviews = reviewsData?.reviews || [];
  const pagination = reviewsData?.pagination;

  // Filter reviews based on status
  const filteredReviews = allReviews.filter((review) => {
    if (filters.status === "pending") return !review.isVerified;
    if (filters.status === "approved") return review.isVerified;
    return true; // "all"
  });

  const pendingCount = allReviews.filter((r) => !r.isVerified).length;
  const approvedCount = allReviews.filter((r) => r.isVerified).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Manage Reviews</h1>
        <p className="text-gray-600 mt-1">Approve or reject product reviews before they appear on the site</p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setFilters({ ...filters, status: "all" })}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            filters.status === "all"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          All ({pagination?.total || 0})
        </button>
        <button
          onClick={() => setFilters({ ...filters, status: "pending" })}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors relative ${
            filters.status === "pending"
              ? "border-orange-600 text-orange-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Pending Approval ({pendingCount})
          {pendingCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-orange-600 rounded-full">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setFilters({ ...filters, status: "approved" })}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            filters.status === "approved"
              ? "border-green-600 text-green-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Approved ({approvedCount})
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {filters.status === "pending" && "Pending Reviews"}
            {filters.status === "approved" && "Approved Reviews"}
            {filters.status === "all" && "All Reviews"} ({filteredReviews.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              {filters.status === "pending" ? (
                <>
                  <p className="text-gray-600 mb-2">No pending reviews.</p>
                  <p className="text-sm text-gray-500">All reviews have been approved!</p>
                </>
              ) : filters.status === "approved" ? (
                <>
                  <p className="text-gray-600 mb-2">No approved reviews.</p>
                  <p className="text-sm text-gray-500">Approve reviews to make them visible on product pages.</p>
                </>
              ) : (
                <>
                  <p className="text-gray-600 mb-4">No reviews found.</p>
                  <p className="text-sm text-gray-500">
                    Reviews will appear here once customers submit them. New reviews require admin approval before appearing on product pages.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
              <div 
                key={review.id} 
                className={`p-4 border rounded-lg hover:bg-gray-50 ${
                  !review.isVerified ? "border-orange-200 bg-orange-50" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {review.user.name || review.user.email}
                      </span>
                      {review.isVerified ? (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
                          ✓ Approved
                        </span>
                      ) : (
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded font-medium">
                          ⏳ Pending Approval
                        </span>
                      )}
                    </div>
                    {review.title && (
                      <h3 className="font-semibold text-gray-900 mb-1">{review.title}</h3>
                    )}
                    {review.comment && (
                      <p className="text-sm text-gray-600 mb-2">{review.comment}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Product: {review.product.title} • {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!review.isVerified ? (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleToggleVerify(review)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        title="Approve Review"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleVerify(review)}
                        title="Unapprove Review"
                        className="border-orange-300 text-orange-700 hover:bg-orange-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Unapprove
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(review.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Delete Review"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


