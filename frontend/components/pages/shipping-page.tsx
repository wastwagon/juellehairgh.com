"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, Package, Clock, MapPin } from "lucide-react";

export function ShippingPage() {
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

  const freeShippingThreshold = 950; // Default, can be fetched from settings
  const standardDays = "3-7"; // Default

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Shipping Policy</h1>
        <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-6">
        {/* Free Shipping */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Truck className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Free Shipping</h2>
                <p className="text-gray-600">
                  Enjoy free shipping on all orders over <strong className="text-gray-900">GHS {freeShippingThreshold}</strong> within Ghana.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Methods */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-pink-100 rounded-lg">
                <Package className="h-6 w-6 text-pink-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Shipping Methods</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Standard Shipping</h3>
                    <p className="text-gray-600 mb-2">
                      Standard shipping typically takes <strong>{standardDays} business days</strong> for delivery within Ghana.
                    </p>
                    <p className="text-sm text-gray-500">
                      Orders are processed within 1-2 business days after payment confirmation.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Express Shipping</h3>
                    <p className="text-gray-600 mb-2">
                      Express shipping is available for faster delivery (1-3 business days).
                    </p>
                    <p className="text-sm text-gray-500">
                      Additional charges apply. Contact us for express shipping rates.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Areas */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Delivery Areas</h2>
                <p className="text-gray-600 mb-4">
                  We currently ship to all regions within Ghana. Delivery times may vary based on location.
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Greater Accra Region: 2-4 business days</li>
                  <li>Other Regions: 3-7 business days</li>
                  <li>Remote Areas: 5-10 business days</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Processing */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Processing</h2>
                <div className="space-y-3 text-gray-600">
                  <p>
                    <strong className="text-gray-900">Processing Time:</strong> Orders are typically processed within 1-2 business days after payment confirmation.
                  </p>
                  <p>
                    <strong className="text-gray-900">Tracking:</strong> Once your order ships, you'll receive a tracking number via email to monitor your package.
                  </p>
                  <p>
                    <strong className="text-gray-900">Delivery Confirmation:</strong> You'll receive a notification when your order is delivered.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About Shipping?</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about shipping, delivery times, or tracking your order, please contact us:
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
