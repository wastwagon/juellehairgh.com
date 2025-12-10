"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";

export function PrivacyPage() {
  const { data: privacyContent, isLoading } = useQuery<{ content: string }>({
    queryKey: ["settings", "privacy"],
    queryFn: async () => {
      const response = await api.get("/settings/privacy");
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

  const content = privacyContent?.content || `
    <h2>Privacy Policy</h2>
    <p>Last updated: ${new Date().toLocaleDateString()}</p>
    <p>At Juelle Hair Ghana, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information.</p>
    <h3>Information We Collect</h3>
    <p>We collect information that you provide directly to us, including:</p>
    <ul>
      <li>Name and contact information</li>
      <li>Payment information</li>
      <li>Shipping and billing addresses</li>
      <li>Order history</li>
    </ul>
    <h3>How We Use Your Information</h3>
    <p>We use the information we collect to:</p>
    <ul>
      <li>Process and fulfill your orders</li>
      <li>Communicate with you about your orders</li>
      <li>Send you marketing communications (with your consent)</li>
      <li>Improve our services</li>
    </ul>
    <h3>Data Security</h3>
    <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
  `;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
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
