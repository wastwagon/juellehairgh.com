"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Save, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface PageContent {
  key: string;
  name: string;
  description: string;
  content: string;
  isJSON?: boolean; // For FAQ which is JSON
}

const pages: PageContent[] = [
  {
    key: "TERMS_CONDITIONS",
    name: "Terms & Conditions",
    description: "Legal terms and conditions for using the website",
    content: "",
  },
  {
    key: "PRIVACY_POLICY",
    name: "Privacy Policy",
    description: "Privacy policy explaining data collection and usage",
    content: "",
  },
  {
    key: "ABOUT_US",
    name: "About Us",
    description: "Company information, mission, and values",
    content: "",
  },
  {
    key: "SHIPPING_POLICY",
    name: "Shipping Policy",
    description: "Shipping methods, delivery times, and costs",
    content: "",
  },
  {
    key: "RETURNS_POLICY",
    name: "Return & Refund Policy",
    description: "Return process, conditions, and refund information",
    content: "",
  },
  {
    key: "FAQ_CONTENT",
    name: "FAQ",
    description: "Frequently asked questions (JSON format: array of {question, answer})",
    content: "",
    isJSON: true,
  },
];

export function AdminPages() {
  const queryClient = useQueryClient();
  const [editingPage, setEditingPage] = useState<string | null>(null);
  const [pageContents, setPageContents] = useState<Record<string, string>>({});
  const [faqItems, setFaqItems] = useState<Array<{ question: string; answer: string }>>([]);

  // Fetch all page contents
  const { data: allPages, isLoading } = useQuery({
    queryKey: ["admin", "pages"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");

      const contents: Record<string, string> = {};
      // Map page keys to API endpoints
      const endpointMap: Record<string, string> = {
        TERMS_CONDITIONS: "terms",
        PRIVACY_POLICY: "privacy",
        ABOUT_US: "about",
        SHIPPING_POLICY: "shipping",
        RETURNS_POLICY: "returns",
        FAQ_CONTENT: "faq",
      };
      
      for (const page of pages) {
        try {
          const endpoint = endpointMap[page.key];
          const response = await api.get(`/settings/${endpoint}`);
          contents[page.key] = response.data?.content || "";
        } catch (error) {
          console.error(`Error fetching ${page.key}:`, error);
          contents[page.key] = "";
        }
      }
      return contents;
    },
  });

  useEffect(() => {
    if (allPages) {
      setPageContents(allPages);
      // Parse FAQ if it exists
      if (allPages.FAQ_CONTENT) {
        try {
          const parsed = JSON.parse(allPages.FAQ_CONTENT);
          if (Array.isArray(parsed)) {
            setFaqItems(parsed);
          }
        } catch (error) {
          console.error("Error parsing FAQ:", error);
        }
      }
    }
  }, [allPages]);

  const updateMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");

      return api.put(
        `/admin/settings/${key}`,
        { value, category: "content" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "pages"] });
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Page content saved successfully!");
      setEditingPage(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to save page content");
    },
  });

  const handleSave = (pageKey: string, isJSON: boolean = false) => {
    let content = pageContents[pageKey] || "";
    
    if (isJSON && pageKey === "FAQ_CONTENT") {
      // Validate and format FAQ JSON
      try {
        const jsonContent = JSON.stringify(faqItems, null, 2);
        content = jsonContent;
      } catch (error) {
        toast.error("Invalid FAQ format. Please check your entries.");
        return;
      }
    }

    updateMutation.mutate({ key: pageKey, value: content });
  };

  const handleEdit = (pageKey: string) => {
    setEditingPage(pageKey);
  };

  const handleCancel = () => {
    setEditingPage(null);
    // Reset to original content
    if (allPages) {
      setPageContents(allPages);
      if (allPages.FAQ_CONTENT) {
        try {
          const parsed = JSON.parse(allPages.FAQ_CONTENT);
          if (Array.isArray(parsed)) {
            setFaqItems(parsed);
          }
        } catch (error) {
          setFaqItems([]);
        }
      }
    }
  };

  const addFAQItem = () => {
    setFaqItems([...faqItems, { question: "", answer: "" }]);
  };

  const removeFAQItem = (index: number) => {
    setFaqItems(faqItems.filter((_, i) => i !== index));
  };

  const updateFAQItem = (index: number, field: "question" | "answer", value: string) => {
    const updated = [...faqItems];
    updated[index] = { ...updated[index], [field]: value };
    setFaqItems(updated);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Page Content Management</h1>
        <p className="text-gray-600 mt-1">Edit and manage content for public pages</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {pages.map((page) => {
          const isEditing = editingPage === page.key;
          const content = pageContents[page.key] || "";

          return (
            <Card key={page.key}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {page.name}
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{page.description}</p>
                  </div>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(page.key)}
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    {page.isJSON && page.key === "FAQ_CONTENT" ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600">
                            Add, edit, or remove FAQ items. Each item requires both a question and answer.
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addFAQItem}
                          >
                            Add FAQ Item
                          </Button>
                        </div>
                        <div className="space-y-4">
                          {faqItems.map((item, index) => (
                            <Card key={index}>
                              <CardContent className="p-4 space-y-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-700">
                                    FAQ Item #{index + 1}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeFAQItem(index)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    Remove
                                  </Button>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1">Question</label>
                                  <Input
                                    value={item.question}
                                    onChange={(e) => updateFAQItem(index, "question", e.target.value)}
                                    placeholder="Enter question..."
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1">Answer</label>
                                  <textarea
                                    value={item.answer}
                                    onChange={(e) => updateFAQItem(index, "answer", e.target.value)}
                                    placeholder="Enter answer..."
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                                  />
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                          {faqItems.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4">
                              No FAQ items. Click "Add FAQ Item" to get started.
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Content (HTML supported)
                        </label>
                        <textarea
                          value={content}
                          onChange={(e) =>
                            setPageContents({ ...pageContents, [page.key]: e.target.value })
                          }
                          rows={15}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder={`Enter ${page.name.toLowerCase()} content...`}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          You can use HTML tags for formatting. For example: &lt;h2&gt;Heading&lt;/h2&gt;, &lt;p&gt;Paragraph&lt;/p&gt;, &lt;ul&gt;&lt;li&gt;List item&lt;/li&gt;&lt;/ul&gt;
                        </p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleSave(page.key, page.isJSON)}
                        disabled={updateMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        {updateMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={updateMutation.isPending}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {content ? (
                      <div className="prose prose-sm max-w-none">
                        {page.isJSON && page.key === "FAQ_CONTENT" ? (
                          <div className="space-y-2">
                            {(() => {
                              try {
                                const parsed = JSON.parse(content);
                                if (Array.isArray(parsed)) {
                                  return parsed.map((item: any, index: number) => (
                                    <div key={index} className="border-b pb-2 mb-2">
                                      <p className="font-semibold">{item.question}</p>
                                      <p className="text-gray-600">{item.answer}</p>
                                    </div>
                                  ));
                                }
                              } catch (error) {
                                return <p className="text-gray-500">Invalid FAQ format</p>;
                              }
                              return <p className="text-gray-500">No FAQ items</p>;
                            })()}
                          </div>
                        ) : (
                          <div dangerouslySetInnerHTML={{ __html: content }} />
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No content set. Click Edit to add content.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

