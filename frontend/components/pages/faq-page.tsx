"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

// Fallback FAQ data if API fails
const defaultFAQData: FAQItem[] = [
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit/debit cards, mobile money (MTN, Vodafone, AirtelTigo), and bank transfers. All payments are processed securely through Paystack.",
  },
  {
    question: "How long does shipping take?",
    answer: "Standard shipping typically takes 3-7 business days within Ghana. Express shipping (1-3 business days) is also available for an additional fee. Processing time is 1-2 business days after payment confirmation.",
  },
  {
    question: "Do you offer free shipping?",
    answer: "Yes! We offer free shipping on all orders over GHS 950 within Ghana. Orders below this amount will incur standard shipping charges.",
  },
  {
    question: "Can I return or exchange items?",
    answer: "Yes, you can return items within 14 days of delivery. Items must be unused, in original packaging with tags attached. Contact our customer service team to initiate a return.",
  },
  {
    question: "How do I track my order?",
    answer: "Once your order ships, you'll receive a tracking number via email. You can use this tracking number to monitor your package's delivery status.",
  },
  {
    question: "What if I receive a damaged or incorrect item?",
    answer: "If you receive a damaged or incorrect item, please contact us immediately with photos of the issue. We'll arrange for a replacement or full refund at no cost to you.",
  },
  {
    question: "Do you ship internationally?",
    answer: "Currently, we only ship within Ghana. We're working on expanding our shipping options to other countries in the future.",
  },
  {
    question: "How do I care for my wig or hair extensions?",
    answer: "We provide care instructions with each product. Generally, use sulfate-free shampoos, avoid excessive heat, store on a wig stand, and follow the specific care guidelines for your product type.",
  },
  {
    question: "Can I cancel my order?",
    answer: "You can cancel your order within 24 hours of placing it, provided it hasn't been shipped yet. Contact our customer service team to cancel your order.",
  },
  {
    question: "Do you offer discounts or promotions?",
    answer: "Yes! We regularly offer promotions, flash sales, and discounts. Subscribe to our newsletter and follow us on social media to stay updated on the latest deals.",
  },
  {
    question: "What is your return policy for sale items?",
    answer: "Sale items follow the same return policy as regular items. They must be returned within 14 days in unused condition with original packaging and tags.",
  },
  {
    question: "How do I contact customer service?",
    answer: "You can reach us via email at sales@juellehairgh.com, phone at +233 539506949, or through our contact page. We typically respond within 24 hours.",
  },
];

function FAQItemComponent({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <Card className="mb-4">
      <CardContent className="p-0">
        <button
          onClick={onToggle}
          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <span className="font-semibold text-gray-900 pr-4">{item.question}</span>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
          )}
        </button>
        {isOpen && (
          <div className="px-6 pb-4">
            <p className="text-gray-600 leading-relaxed">{item.answer}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function FAQPage() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  // Fetch FAQ content from API
  const { data: faqContent, isLoading } = useQuery<{ content: string }>({
    queryKey: ["settings", "faq"],
    queryFn: async () => {
      const response = await api.get("/settings/faq");
      return response.data;
    },
  });

  // Parse FAQ data from API (JSON string) or use default
  let faqData: FAQItem[] = defaultFAQData;
  if (faqContent?.content) {
    try {
      const parsed = JSON.parse(faqContent.content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        faqData = parsed;
      }
    } catch (error) {
      console.error("Error parsing FAQ content:", error);
    }
  }

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
        <p className="text-gray-600">Find answers to common questions about our products, shipping, returns, and more.</p>
      </div>

      <div className="space-y-4">
        {faqData.map((item, index) => (
          <FAQItemComponent
            key={index}
            item={item}
            isOpen={openItems.has(index)}
            onToggle={() => toggleItem(index)}
          />
        ))}
      </div>

      <Card className="mt-8">
        <CardContent className="p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Still have questions?</h2>
          <p className="text-gray-600 mb-4">
            Can't find the answer you're looking for? Our customer service team is here to help!
          </p>
          <div className="space-y-2 text-gray-600">
            <p>
              <strong>Email:</strong> sales@juellehairgh.com
            </p>
            <p>
              <strong>Phone:</strong> +233 539506949
            </p>
            <p>
              <strong>Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM GMT
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
