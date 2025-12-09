"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Mail, Save, Eye, Code, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: "customer" | "admin";
  description?: string;
}

const emailTemplates: EmailTemplate[] = [
  {
    id: "welcome",
    name: "Welcome Email",
    subject: "Welcome to {{siteName}}!",
    body: "",
    type: "customer",
    description: "Sent when a new user registers",
  },
  {
    id: "order-confirmation",
    name: "Order Confirmation",
    subject: "Order Confirmation - Order #{{orderNumber}}",
    body: "",
    type: "customer",
    description: "Sent when an order is created",
  },
  {
    id: "payment-confirmation",
    name: "Payment Confirmation",
    subject: "Payment Received - Order #{{orderNumber}}",
    body: "",
    type: "customer",
    description: "Sent when payment is received",
  },
  {
    id: "order-shipped",
    name: "Order Shipped",
    subject: "Your Order Has Been Shipped - Order #{{orderNumber}}",
    body: "",
    type: "customer",
    description: "Sent when order status changes to SHIPPED",
  },
  {
    id: "order-delivered",
    name: "Order Delivered",
    subject: "Your Order Has Been Delivered - Order #{{orderNumber}}",
    body: "",
    type: "customer",
    description: "Sent when order status changes to DELIVERED",
  },
  {
    id: "order-cancelled",
    name: "Order Cancelled",
    subject: "Order Cancelled - Order #{{orderNumber}}",
    body: "",
    type: "customer",
    description: "Sent when order is cancelled",
  },
  {
    id: "new-order",
    name: "New Order Notification",
    subject: "New Order Received - Order #{{orderNumber}}",
    body: "",
    type: "admin",
    description: "Sent to admin when a new order is created",
  },
  {
    id: "payment-received",
    name: "Payment Received Notification",
    subject: "Payment Received - Order #{{orderNumber}}",
    body: "",
    type: "admin",
    description: "Sent to admin when payment is received",
  },
  {
    id: "new-customer",
    name: "New Customer Notification",
    subject: "New Customer Registration - {{customerEmail}}",
    body: "",
    type: "admin",
    description: "Sent to admin when a new customer registers",
  },
];

export function EmailTemplatesManager() {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [editedSubject, setEditedSubject] = useState("");
  const [editedBody, setEditedBody] = useState("");
  const [previewMode, setPreviewMode] = useState<"editor" | "preview">("editor");
  const [mounted, setMounted] = useState(false);
  const queryClient = useQueryClient();

  // Set mounted state on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch template content (if stored in database)
  const { data: templates, isLoading } = useQuery({
    queryKey: ["admin", "email-templates"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      
      try {
        const response = await api.get("/admin/email-templates", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("API Response:", response.data);
        console.log("First template body:", response.data?.[0]?.body?.substring(0, 100));
        return response.data || [];
      } catch (error: any) {
        // If endpoint doesn't exist, return default templates
        if (error.response?.status === 404) {
          return emailTemplates;
        }
        throw error;
      }
    },
    enabled: mounted && typeof window !== "undefined" && !!localStorage.getItem("token"),
  });

  // Auto-select first template when templates are loaded
  useEffect(() => {
    if (mounted && templates && templates.length > 0 && !selectedTemplate) {
      const firstTemplate = templates[0];
      console.log("Auto-selecting first template:", firstTemplate);
      console.log("First template body length:", firstTemplate.body?.length);
      setSelectedTemplate(firstTemplate);
      setEditedSubject(firstTemplate.subject || "");
      setEditedBody(firstTemplate.body || "");
    }
  }, [mounted, templates, selectedTemplate]);

  // Save template mutation
  const saveMutation = useMutation({
    mutationFn: async (data: { id: string; subject: string; body: string }) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      
      return api.put(`/admin/email-templates/${data.id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      toast.success("Template saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin", "email-templates"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to save template");
    },
  });

  const handleSelectTemplate = (template: EmailTemplate) => {
    console.log("Selecting template:", template);
    console.log("Template body:", template.body);
    console.log("Template body length:", template.body?.length);
    setSelectedTemplate(template);
    setEditedSubject(template.subject || "");
    setEditedBody(template.body || "");
    setPreviewMode("editor");
  };

  const handleSave = () => {
    if (!selectedTemplate) return;
    
    saveMutation.mutate({
      id: selectedTemplate.id,
      subject: editedSubject,
      body: editedBody,
    });
  };

  // Use templates from API, fallback to defaults if not loaded or empty
  const loadedTemplates = (templates && Array.isArray(templates) && templates.length > 0) ? templates : emailTemplates;
  const customerTemplates = loadedTemplates.filter((t: EmailTemplate) => t.type === "customer");
  const adminTemplates = loadedTemplates.filter((t: EmailTemplate) => t.type === "admin");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Email Templates</h1>
        <p className="text-gray-600 mt-1">Manage email templates for customer and admin notifications</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="customer" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="customer">Customer</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>
              
              <TabsContent value="customer" className="mt-0">
                {!mounted || isLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading templates...</div>
                ) : customerTemplates.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No customer templates found</div>
                ) : (
                  <div className="space-y-2">
                    {customerTemplates.map((template: EmailTemplate) => {
                      const description = template.description || emailTemplates.find(t => t.id === template.id)?.description || "";
                      return (
                        <button
                          key={template.id}
                          onClick={() => handleSelectTemplate(template)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            selectedTemplate?.id === template.id
                              ? "bg-primary text-white border-primary"
                              : "bg-white border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <p className={`font-medium text-sm ${selectedTemplate?.id === template.id ? "text-white" : "text-gray-900"}`}>
                            {template.name}
                          </p>
                          <p className={`text-xs mt-1 ${selectedTemplate?.id === template.id ? "text-white/80" : "text-gray-500"}`}>
                            {description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="admin" className="mt-0">
                {!mounted || isLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading templates...</div>
                ) : adminTemplates.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No admin templates found</div>
                ) : (
                  <div className="space-y-2">
                    {adminTemplates.map((template: EmailTemplate) => {
                      const description = template.description || emailTemplates.find(t => t.id === template.id)?.description || "";
                      return (
                        <button
                          key={template.id}
                          onClick={() => handleSelectTemplate(template)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            selectedTemplate?.id === template.id
                              ? "bg-primary text-white border-primary"
                              : "bg-white border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <p className={`font-medium text-sm ${selectedTemplate?.id === template.id ? "text-white" : "text-gray-900"}`}>
                            {template.name}
                          </p>
                          <p className={`text-xs mt-1 ${selectedTemplate?.id === template.id ? "text-white/80" : "text-gray-500"}`}>
                            {description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Template Editor */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {selectedTemplate ? selectedTemplate.name : "Select a Template"}
              </CardTitle>
              {selectedTemplate && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewMode(previewMode === "editor" ? "preview" : "editor")}
                  >
                    {previewMode === "editor" ? <Eye className="h-4 w-4 mr-2" /> : <Code className="h-4 w-4 mr-2" />}
                    {previewMode === "editor" ? "Preview" : "Edit"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={saveMutation.isPending}
                  >
                    {saveMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedTemplate ? (
              <div className="space-y-4">
                {previewMode === "editor" ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email Subject</label>
                      <Input
                        value={editedSubject}
                        onChange={(e) => setEditedSubject(e.target.value)}
                        placeholder="Email subject line"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Use variables like {`{{siteName}}`}, {`{{orderNumber}}`}, {`{{customerName}}`}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email Body (HTML)</label>
                      <Textarea
                        value={editedBody}
                        onChange={(e) => setEditedBody(e.target.value)}
                        placeholder="Email body content (HTML supported)"
                        className="font-mono text-sm min-h-[400px]"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        HTML is supported. Use Handlebars syntax for variables.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="border rounded-lg p-6 bg-gray-50 min-h-[400px]">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <h3 className="font-semibold mb-2">{editedSubject}</h3>
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: editedBody || "<p>No content</p>" }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select a template from the list to edit</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">General Variables</h4>
              <ul className="space-y-1 text-gray-600">
                <li><code className="bg-gray-100 px-2 py-1 rounded">{`{{siteName}}`}</code> - Site name</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">{`{{siteUrl}}`}</code> - Site URL</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Order Variables</h4>
              <ul className="space-y-1 text-gray-600">
                <li><code className="bg-gray-100 px-2 py-1 rounded">{`{{orderNumber}}`}</code> - Order number</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">{`{{orderDate}}`}</code> - Order date</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">{`{{total}}`}</code> - Order total</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">{`{{currency}}`}</code> - Currency</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Customer Variables</h4>
              <ul className="space-y-1 text-gray-600">
                <li><code className="bg-gray-100 px-2 py-1 rounded">{`{{customerName}}`}</code> - Customer name</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">{`{{customerEmail}}`}</code> - Customer email</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Shipping Variables</h4>
              <ul className="space-y-1 text-gray-600">
                <li><code className="bg-gray-100 px-2 py-1 rounded">{`{{trackingNumber}}`}</code> - Tracking number</li>
                <li><code className="bg-gray-100 px-2 py-1 rounded">{`{{shippingMethod}}`}</code> - Shipping method</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

