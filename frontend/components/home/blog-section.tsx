"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { FileText, ArrowRight, Calendar } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: string;
  category?: string;
  publishedAt?: string;
}

export function BlogSection() {
  const { data: postsData, isLoading } = useQuery<{
    posts: BlogPost[];
  }>({
    queryKey: ["blog", "posts", "homepage"],
      queryFn: async () => {
        const response = await api.get("/blog?published=true&limit=4");
        return response.data;
      },
  });

  if (isLoading) {
    return null;
  }

  if (!postsData || !postsData.posts || postsData.posts.length === 0) {
    return null;
  }

  const getImageUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    
    // Handle media library paths
    if (url.includes("library/") || url.includes("/media/")) {
      let filename = url;
      if (url.includes("library/")) {
        filename = url.split("library/").pop() || url;
      } else if (url.includes("/media/")) {
        filename = url.split("/media/").pop() || url;
      }
      
      // Construct backend media URL
      const apiBaseUrl = typeof window !== "undefined" 
        ? ((window as any).__ENV__?.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api")
        : (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api");
      const baseUrl = apiBaseUrl.endsWith("/api") ? apiBaseUrl : `${apiBaseUrl}/api`;
      return `${baseUrl}/admin/upload/media/library/${filename}`;
    }
    
    // Handle regular paths
    if (url.startsWith("/")) return url;
    return `/${url}`;
  };

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-white">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-3 sm:gap-0">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Latest News & Updates</h2>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Stay informed with our latest blog posts</p>
          </div>
          <Link href="/blog">
            <button className="text-primary hover:text-primary/80 font-semibold flex items-center gap-2 text-sm sm:text-base">
              View All
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {postsData.posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden border border-gray-200 hover:border-primary/50">
                <div className="relative w-full h-40 sm:h-48 md:h-56 overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100">
                  {post.featuredImage ? (
                    <Image
                      src={getImageUrl(post.featuredImage) || "/placeholder-product.jpg"}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300" />
                    </div>
                  )}
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Category Badge */}
                  {post.category && (
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10">
                      <span className="inline-block bg-white/90 backdrop-blur-sm text-primary text-[10px] sm:text-xs font-semibold px-2 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-md">
                        {post.category}
                      </span>
                    </div>
                  )}
                </div>
                <CardContent className="p-3 sm:p-4 md:p-5">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1.5 sm:mb-2 line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem] sm:min-h-[3rem] leading-tight sm:leading-normal">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-gray-600 mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 text-xs sm:text-sm leading-relaxed hidden sm:block">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-100">
                    {post.publishedAt && (
                      <p className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1 sm:gap-1.5">
                        <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                        <span className="hidden sm:inline">
                          {new Date(post.publishedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="sm:hidden">
                          {new Date(post.publishedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </p>
                    )}
                    <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
