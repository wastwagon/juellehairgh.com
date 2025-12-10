"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Review } from "@/types";
import { Star, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user is logged in
  const isAuthenticated = typeof window !== "undefined" && !!localStorage.getItem("token");

  // Debug: Log productId on mount
  if (typeof window !== "undefined") {
    console.log("🔍 ProductReviews - productId:", productId, "enabled:", !!productId);
  }

  // Fetch reviews (only verified reviews are returned from backend)
  const { data: reviews = [], isLoading, error } = useQuery<Review[]>({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      console.log("📥 ProductReviews - Fetching reviews for productId:", productId);
      if (!productId) {
        console.warn("⚠️ ProductReviews - No productId provided");
        return [];
      }
      try {
        const response = await api.get(`/reviews/product/${productId}`);
        console.log("✅ ProductReviews - Reviews fetched:", response.data);
        return response.data || [];
      } catch (err: any) {
        console.error("❌ ProductReviews - Error fetching reviews:", err);
        throw err;
      }
    },
    enabled: !!productId, // Only fetch if productId is available
    staleTime: 0, // Always refetch to get latest reviews
    retry: 1, // Retry once on failure
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async (data: { rating: number; title?: string; comment?: string }) => {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please login to leave a review");
      
      return api.post(
        "/reviews",
        {
          productId,
          rating: data.rating,
          title: data.title,
          comment: data.comment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
      setRating(0);
      setTitle("");
      setComment("");
      toast.success("Review submitted successfully! It will be visible after admin approval.");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to submit review");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error("Please login to leave a review");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitReviewMutation.mutateAsync({
        rating,
        title: title.trim() || undefined,
        comment: comment.trim() || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? "month" : "months"} ago`;
    }
    const years = Math.floor(diffDays / 365);
    return `${years} ${years === 1 ? "year" : "years"} ago`;
  };

  // Debug logging
  if (typeof window !== "undefined") {
    console.log("🔍 ProductReviews Debug:", { 
      productId, 
      reviewsCount: reviews.length, 
      isLoading, 
      error: error?.message,
      hasData: !!reviews,
      reviews: reviews
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Customer Reviews</h2>
        <p className="text-gray-600">
          {isLoading ? (
            "Loading reviews..."
          ) : error ? (
            <span className="text-red-600">Error loading reviews. Please refresh the page.</span>
          ) : reviews.length > 0 ? (
            <>
              {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              <span className="text-xs text-gray-500 ml-2">(Only verified reviews are displayed)</span>
            </>
          ) : (
            "No reviews yet"
          )}
        </p>
      </div>

      {/* Review Form */}
      {isAuthenticated ? (
        <Card className="border-gray-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Write a Review</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-6 w-6 transition-colors ${
                          star <= (hoveredRating || rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="text-sm text-gray-600 ml-2">
                      {rating} {rating === 1 ? "star" : "stars"}
                    </span>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Title (Optional)
                </label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your review a title"
                  maxLength={100}
                />
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500 mt-1">{comment.length}/1000 characters</p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting || rating === 0}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-gray-200">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">Please login to leave a review</p>
            <Button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
                }
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              Login to Review
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border-gray-200">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
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
                        {review.user?.name || "Anonymous"}
                      </span>
                      {review.isVerified && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </span>
                      )}
                    </div>
                    {review.title && (
                      <h4 className="font-semibold text-gray-900 mb-1">{review.title}</h4>
                    )}
                    {review.comment && (
                      <p className="text-gray-600 text-sm mb-2">{review.comment}</p>
                    )}
                    <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-gray-200">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

