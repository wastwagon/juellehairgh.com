"use client";

import { Truck, Package, Clock, MapPin } from "lucide-react";

export function ShippingInfo() {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 md:p-6 mb-6">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Truck className="h-5 w-5 text-purple-600" />
        Shipping Information
      </h3>
      <div className="space-y-3 text-sm">
        <div className="flex items-start gap-3">
          <Package className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-900">Free Shipping</p>
            <p className="text-gray-600">On all orders GHS 950+ within Ghana</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-900">Delivery Options</p>
            <p className="text-gray-600">Same day (Accra), Next day (Accra/Tema), or standard delivery</p>
          </div>
        </div>
        <div className="pt-2 border-t border-purple-200">
          <p className="text-xs text-gray-600">
            <strong>Contact:</strong> +(233) 539506949 | <strong>Email:</strong> sales@juellehairgh.com
          </p>
        </div>
      </div>
    </div>
  );
}


