"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { FileText, Calendar, User, ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: string;
  authorName?: string;
  category?: string;
  tags: string[];
  publishedAt?: string;
  views: number;
}

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const { data: postsData, isLoading } = useQuery<{
    posts: BlogPost[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>({
    queryKey: ["blog", "posts", selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append("category", selectedCategory);
      params.append("published", "true");
      params.append("limit", "12");
      const response = await api.get(`/blog?${params.toString()}`);
      return response.data;
    },
  });

  const { data: categories } = useQuery<string[]>({
    queryKey: ["blog", "categories"],
    queryFn: async () => {
      const response = await api.get("/blog/categories");
      return response.data;
    },
  });

  const filteredPosts = postsData?.posts.filter((post) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(query) ||
      post.excerpt?.toLowerCase().includes(query) ||
      post.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  const getImageUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith("/")) return url;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `/${url}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 w-full">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Blog & News</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Stay updated with the latest news, tips, and updates from Juelle Hair
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-8 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {categories && categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === "" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory("")}
                >
                  All
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Blog Posts Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading posts...</p>
            </div>
          ) : filteredPosts && filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    {post.featuredImage && (
                      <div className="relative w-full h-48 md:h-64 overflow-hidden rounded-t-lg">
                        <Image
                          src={getImageUrl(post.featuredImage) || ""}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      {post.category && (
                        <span className="inline-block bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded mb-3">
                          {post.category}
                        </span>
                      )}
                      <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{post.title}</h2>
                      {post.excerpt && (
                        <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          {post.authorName && (
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {post.authorName}
                            </span>
                          )}
                          {post.publishedAt && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(post.publishedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <span className="flex items-center gap-1 text-primary">
                          Read More
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No blog posts found.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
