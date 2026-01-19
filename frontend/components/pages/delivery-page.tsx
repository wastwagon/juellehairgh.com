"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Clock, Truck, Package, Globe } from "lucide-react";

export function DeliveryPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Delivery Policy</h1>
        <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-6">
        {/* General Information */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">General Information</h2>
                <p className="text-gray-600 mb-4">
                  We process our orders within a 24-business hour frame.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Day Orders Before 3pm */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Business Day Orders Before 3pm</h2>
                <p className="text-gray-600 mb-4">
                  For example, if an order is placed Monday before 3pm, we will pack your item on Monday and ship it that same day.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Day Orders After 3pm */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-pink-100 rounded-lg">
                <Clock className="h-6 w-6 text-pink-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Business Day Orders After 3pm</h2>
                <p className="text-gray-600 mb-4">
                  For example, if an order is placed Monday after 3pm, we will pack your item on Monday and ship it first thing in the morning Tuesday!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Times */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Truck className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Delivery Times</h2>
                <div className="space-y-3 text-gray-600">
                  <p>
                    <strong className="text-gray-900">Within Accra:</strong> Delivery within 24 hours
                  </p>
                  <p>
                    <strong className="text-gray-900">Other Regions:</strong> 1 to 2 days
                  </p>
                  <p className="mt-4">
                    Deliveries to all other regions in Ghana can either be delivered by FEDEX or sent via a bus station (VIP, STC, or O.A) upon request of the customer.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekend Orders */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Weekend & Holiday Orders</h2>
                <p className="text-gray-600">
                  All orders placed after 3PM (Ghana Time) on Fridays will be processed and shipped on the following Monday, with the exception of national holidays.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Free Shipping */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Truck className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Free Shipping*</h2>
                <p className="text-gray-600">
                  All orders over <strong className="text-gray-900">GHS 950</strong> with a shipping address within Ghana are eligible for free shipping.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* International Orders */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">International Orders</h2>
                <p className="text-gray-600">
                  No international shipping available at this time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
