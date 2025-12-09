"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";

export function AboutPage() {
  const { data: aboutContent, isLoading } = useQuery<{ content: string }>({
    queryKey: ["settings", "about"],
    queryFn: async () => {
      const response = await api.get("/settings/about");
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  const content = aboutContent?.content || `
    <h2>About Juelle Hair Ghana</h2>
    <p>Welcome to Juelle Hair Ghana, your premier destination for high-quality hair products and accessories.</p>
    <p>We are committed to providing our customers with the finest hair products, exceptional service, and an unforgettable shopping experience.</p>
    <h3>Our Mission</h3>
    <p>To empower individuals to express their unique style through premium hair products while maintaining the highest standards of quality and customer satisfaction.</p>
    <h3>Our Values</h3>
    <ul>
      <li>Quality: We source only the best products</li>
      <li>Customer First: Your satisfaction is our priority</li>
      <li>Innovation: Staying ahead of trends</li>
      <li>Integrity: Honest and transparent business practices</li>
    </ul>
  `;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">About Us</h1>
      </div>
      <Card>
        <CardContent className="p-6 md:p-8">
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
