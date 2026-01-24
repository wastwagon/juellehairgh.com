"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { User, ArrowLeft, Tag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SocialShare } from "@/components/shared/social-share";
import { MetaTags } from "@/components/seo/meta-tags-app";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  authorName?: string;
  category?: string;
  tags: string[];
  publishedAt?: string;
  views: number;
  seoTitle?: string;
  seoDescription?: string;
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const { data: post, isLoading } = useQuery<BlogPost>({
    queryKey: ["blog", "post", params.slug],
    queryFn: async () => {
      const response = await api.get(`/blog/${params.slug}`);
      return response.data;
    },
  });

  // Get site URL for absolute URLs (needed for meta tags)
  const siteUrl = typeof window !== "undefined" 
    ? window.location.origin 
    : (process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api", "") || "https://juellehairgh.com");

  // For Next.js Image component - returns relative URLs for API proxy
  const getImageUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    
    // Handle media library paths - use API proxy
    if (url.includes("library/") || url.includes("/media/library/")) {
      let filename = url;
      if (url.includes("library/")) {
        filename = url.split("library/").pop() || url;
      } else if (url.includes("/media/library/")) {
        filename = url.split("/media/library/").pop() || url;
      }
      return `/api/media/library/${filename}`;
    }
    
    // Handle /media/ paths (general case)
    if (url.startsWith("/media/")) {
      return `/api${url}`;
    }
    
    // Handle paths that contain "media"
    if (url.includes("/media/")) {
      const filename = url.split("/media/").pop() || url;
      return `/api/media/library/${filename}`;
    }
    
    // Handle regular paths
    if (url.startsWith("/")) return url;
    return `/${url}`;
  };
  
  // For meta tags - returns absolute URLs
  const getAbsoluteImageUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    // Use the relative URL from getImageUrl and make it absolute
    const relativeUrl = getImageUrl(url);
    if (!relativeUrl) return null;
    if (relativeUrl.startsWith("http://") || relativeUrl.startsWith("https://")) return relativeUrl;
    return `${siteUrl}${relativeUrl.startsWith("/") ? "" : "/"}${relativeUrl}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 w-full">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading post...</p>
            </div>
          </div>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 w-full">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">
              <p className="text-gray-600">Post not found.</p>
              <Link href="/blog">
                <Button className="mt-4">Back to Blog</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <MetaTags
        title={post.seoTitle || post.title}
        description={post.seoDescription || post.excerpt || post.title}
        keywords={post.tags || []}
        ogTitle={post.seoTitle || post.title}
        ogDescription={post.seoDescription || post.excerpt || post.title}
        ogImage={post.featuredImage ? getAbsoluteImageUrl(post.featuredImage) : undefined}
        canonicalUrl={`${siteUrl}/blog/${post.slug}`}
      />
      <Header />
      <main className="flex-1 w-full">
        <article className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
          <Link href="/blog">
            <Button variant="outline" size="sm" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>

          {post.featuredImage && (
            <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
              <Image
                src={getImageUrl(post.featuredImage) || ""}
                alt={post.title}
                fill
                className="object-contain"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  // Try alternative paths if image fails
                  if (post.featuredImage) {
                    const filename = post.featuredImage.split('/').pop();
                    if (filename) {
                      img.src = `/api/media/library/${filename}`;
                    }
                  }
                }}
              />
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
            {post.category && (
              <span className="inline-block bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded mb-4">
                {post.category}
              </span>
            )}

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>

            {post.excerpt && (
              <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b">
              {post.authorName && (
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {post.authorName}
                </span>
              )}
              <span>{post.views} views</span>
            </div>

            <div
              className="prose prose-lg max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Social Share */}
            <div className="pt-6 border-t">
              <SocialShare
                url={typeof window !== "undefined" ? window.location.href : ""}
                title={post.title}
                description={post.excerpt || post.title}
                image={post.featuredImage || ""}
                variant="default"
              />
            </div>
          </div>
        </article>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
