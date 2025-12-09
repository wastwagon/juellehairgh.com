"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Package, Mail, Clock } from "lucide-react";

export function ReturnsPage() {
  const { data: siteSettings, isLoading } = useQuery({
    queryKey: ["settings", "site"],
    queryFn: async () => {
      const response = await api.get("/settings/site");
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

  const returnDays = 14; // Default, can be fetched from settings

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Return & Refund Policy</h1>
        <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-6">
        {/* Return Period */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Return Period</h2>
                <p className="text-gray-600">
                  You have <strong className="text-gray-900">{returnDays} days</strong> from the date of delivery to return items for a refund or exchange.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Return Conditions */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-pink-100 rounded-lg">
                <Package className="h-6 w-6 text-pink-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Return Conditions</h2>
                <p className="text-gray-600 mb-4">To be eligible for a return, items must meet the following conditions:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Items must be unused and in their original condition</li>
                  <li>Items must be in original packaging with tags attached</li>
                  <li>Items must not be damaged, worn, or altered</li>
                  <li>Proof of purchase (order number or receipt) is required</li>
                  <li>Hygiene products and personalized items are not eligible for return</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Return Process */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <RefreshCw className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Return</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Step 1: Contact Us</h3>
                    <p className="text-gray-600">
                      Contact our customer service team to initiate a return. Provide your order number and reason for return.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Step 2: Package the Item</h3>
                    <p className="text-gray-600">
                      Package the item securely in its original packaging. Include all original tags, labels, and accessories.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Step 3: Ship the Item</h3>
                    <p className="text-gray-600">
                      Ship the item to the return address provided by our customer service team. We recommend using a trackable shipping method.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Step 4: Receive Refund</h3>
                    <p className="text-gray-600">
                      Once we receive and inspect the returned item, we'll process your refund within 5-7 business days.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Refunds */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Refunds</h2>
                <div className="space-y-3 text-gray-600">
                  <p>
                    <strong className="text-gray-900">Processing Time:</strong> Refunds are processed within 5-7 business days after we receive and inspect the returned item.
                  </p>
                  <p>
                    <strong className="text-gray-900">Refund Method:</strong> Refunds will be issued to the original payment method used for the purchase.
                  </p>
                  <p>
                    <strong className="text-gray-900">Shipping Costs:</strong> Original shipping costs are non-refundable unless the item was defective or we made an error.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help with Returns?</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about returns or need assistance, please contact us:
            </p>
            <div className="space-y-2 text-gray-600">
              <p>
                <strong>Email:</strong> {siteSettings?.email || "sales@juellehairgh.com"}
              </p>
              <p>
                <strong>Phone:</strong> {siteSettings?.phone || "+233 539506949"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
