"use client";

import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Package, Mail, XCircle, CheckCircle } from "lucide-react";

export function ReturnsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Return & Refund Policy</h1>
        <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-6">
        {/* Introduction */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <p className="text-gray-600">
              If for any reason you are not satisfied with any purchased item from juellehair.com, we are pleased to accept your returns.
            </p>
            <p className="text-gray-600 mt-4">
              Make sure to include your order number and return number with the returned package. Clearance items do not qualify for a return.
            </p>
          </CardContent>
        </Card>

        {/* Eligible Returns */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Eligible Returns</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Brand new, unopened and unused items in original packaging</li>
                  <li>Items that match up with customer's order invoice (color, quantity, or style)</li>
                  <li>Non-Sale, full priced items</li>
                  <li>Items that are within 7 days from delivery date in Ghana (14 days for deliveries outside Ghana)</li>
                  <li>Damaged items</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ineligible Returns */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Ineligible Returns</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Sale or Final Sale items cannot be returned for any reason</li>
                  <li>Orders with the incorrect shipping address and sent back to sender</li>
                  <li>Wigs of any kind due to sanitation guidelines</li>
                  <li>Used items</li>
                  <li>Items that are opened</li>
                  <li>Items with opened or damaged packaging</li>
                  <li>Items that are past 7 days from delivery within Ghana (14 days for deliveries outside Ghana)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exchanges */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <RefreshCw className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Exchanges</h2>
                <p className="text-gray-600 mb-4">
                  Exchanges are accepted for damaged item or shipping error. Shipping error is defined as shipping out the wrong product or wrong quantity. If you would like to exchange for color or brand type is accepted.
                </p>
                <p className="text-gray-600 mb-4">
                  The fastest way to ensure you get what you want is to return the item you have, and once the return is accepted, make a separate purchase for the new item.
                </p>
                    <p className="text-gray-600">
                  <strong className="text-gray-900">Customer is responsible for shipping cost for processing exchange.</strong> Fee will only be waived if error was made by Juelle.com
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Refunds */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Mail className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Refunds</h2>
                <p className="text-gray-600 mb-4">
                  The fastest way to ensure you get what you want is to return the item you have, and once the return is accepted, make a separate purchase for the new item.
                  </p>
                <p className="text-gray-600 mb-4">
                  We will notify you once we've received and inspected your return, and let you know if the refund was approved or not. If approved, you will be automatically refunded on your original payment method.
                  </p>
                <p className="text-gray-600">
                  Please remember it can take some time for your bank or credit card company to process and post the refund too.
                  </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help with Returns?</h2>
            <p className="text-gray-600 mb-4">
              Email at <a href="mailto:info@juellehair.com" className="text-purple-600 hover:text-purple-700 underline">info@juellehair.com</a> for any questions or suggestions.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
