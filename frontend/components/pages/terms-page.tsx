"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";

export function TermsPage() {
  const { data: termsContent, isLoading } = useQuery<{ content: string }>({
    queryKey: ["settings", "terms"],
    queryFn: async () => {
      const response = await api.get("/settings/terms");
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

  const content = termsContent?.content || `
    <h2>Terms & Conditions</h2>
    <p>Last updated: ${new Date().toLocaleDateString()}</p>
    <p>Please read these Terms and Conditions carefully before using our website.</p>
    <h3>Acceptance of Terms</h3>
    <p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>
    <h3>Use License</h3>
    <p>Permission is granted to temporarily download one copy of the materials on our website for personal, non-commercial transitory viewing only.</p>
    <h3>Product Information</h3>
    <p>We strive to provide accurate product information, but we do not warrant that product descriptions or other content on this site is accurate, complete, reliable, current, or error-free.</p>
    <h3>Pricing</h3>
    <p>All prices are in Ghana Cedis (GHS) unless otherwise stated. We reserve the right to change prices at any time without notice.</p>
    <h3>Shipping & Returns</h3>
    <p>Shipping terms and return policies are outlined in our shipping and returns section. Please review these policies before making a purchase.</p>
    <h3>Limitation of Liability</h3>
    <p>In no event shall Juelle Hair Ghana or its suppliers be liable for any damages arising out of the use or inability to use the materials on our website.</p>
  `;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Terms & Conditions</h1>
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
