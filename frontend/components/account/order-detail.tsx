"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Order } from "@/types";
import { formatCurrency, formatOrderStatus } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Package, Truck, CheckCircle2, Clock, MapPin, Phone, Mail, ExternalLink } from "lucide-react";
import Image from "next/image";

interface OrderDetailProps {
  orderId: string;
}

export function OrderDetail({ orderId }: OrderDetailProps) {
  const { data: order, isLoading } = useQuery<Order>({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const response = await api.get(`/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
        <Link href="/account/orders" className="text-purple-600 hover:underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-200";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PROCESSING":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "PAID":
        return "bg-green-100 text-green-800 border-green-200";
      case "AWAITING_PAYMENT":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "SHIPPED":
        return <Truck className="h-5 w-5 text-blue-600" />;
      case "PROCESSING":
        return <Package className="h-5 w-5 text-purple-600" />;
      case "PAID":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "AWAITING_PAYMENT":
        return <Clock className="h-5 w-5 text-orange-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const statusSteps = [
    { key: "AWAITING_PAYMENT", label: "Awaiting Payment", description: "Waiting for payment confirmation" },
    { key: "PAID", label: "Payment Confirmed", description: "Payment has been processed" },
    { key: "PROCESSING", label: "Processing", description: "We're preparing your order" },
    { key: "SHIPPED", label: "Shipped", description: "Your order is on the way" },
    { key: "DELIVERED", label: "Delivered", description: "Order has been delivered" },
  ];

  const getCurrentStepIndex = (status: string) => {
    const index = statusSteps.findIndex((step) => step.key === status);
    return index >= 0 ? index : 0;
  };

  const currentStepIndex = getCurrentStepIndex(order.status);

  return (
    <div className="space-y-6">
      {/* Header with Logo */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-100">
        <div className="flex items-center gap-4 mb-4">
          <Image
            src="/logo.png"
            alt="Juelle Hair"
            width={60}
            height={60}
            className="object-contain"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
            <p className="text-gray-600">Order #{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
      </div>

      {/* Order Status Timeline */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Order Status</h2>
        <div className="relative">
          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div key={step.key} className="flex items-start gap-4 mb-6 last:mb-0">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  isCompleted
                    ? "bg-purple-600 border-purple-600 text-white"
                    : "bg-white border-gray-300 text-gray-400"
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-gray-300" />
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <p className={`font-semibold ${isCompleted ? "text-gray-900" : "text-gray-400"}`}>
                    {step.label}
                  </p>
                  <p className={`text-sm ${isCompleted ? "text-gray-600" : "text-gray-400"}`}>
                    {step.description}
                  </p>
                  {isCurrent && (
                    <p className="text-xs text-purple-600 font-medium mt-1">Current Status</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Status Badge */}
        <div className="mt-6 pt-6 border-t flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon(order.status)}
            <div>
              <p className="text-sm text-gray-600">Current Status</p>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(order.status)}`}>
                {formatOrderStatus(order.status)}
              </span>
            </div>
          </div>
          {order.trackingNumber && (
            <Link
              href={`/orders/track?trackingNumber=${order.trackingNumber}`}
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 text-sm font-semibold"
            >
              Track Order
              <ExternalLink className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Order Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Address */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-bold text-gray-900">Shipping Address</h2>
          </div>
          <div className="text-sm space-y-1 text-gray-700">
            <p className="font-semibold">
              {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
            </p>
            <p>{order.shippingAddress?.addressLine1}</p>
            {order.shippingAddress?.addressLine2 && (
              <p>{order.shippingAddress.addressLine2}</p>
            )}
            <p>
              {order.shippingAddress?.city}, {order.shippingAddress?.region}
            </p>
            <p>{order.shippingAddress?.country}</p>
            <p className="mt-3 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              {order.shippingAddress?.phone}
            </p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Date:</span>
              <span className="font-semibold">
                {new Date(order.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Status:</span>
              <span className={`font-semibold ${
                order.paymentStatus === "PAID" ? "text-green-600" : "text-yellow-600"
              }`}>
                {order.paymentStatus}
              </span>
            </div>
            {order.trackingNumber && (
              <div className="flex justify-between">
                <span className="text-gray-600">Tracking Number:</span>
                <span className="font-mono text-xs">{order.trackingNumber}</span>
              </div>
            )}
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-2xl font-bold text-purple-600">
                  {formatCurrency(Number(order.totalGhs), "GHS")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Order Items</h2>
        <div className="space-y-4">
          {order.items?.map((item) => (
            <div key={item.id} className="flex items-center gap-4 pb-4 border-b last:border-0">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                {item.product?.images?.[0] ? (
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.title || "Product"}
                    width={80}
                    height={80}
                    className="object-cover rounded-lg"
                  />
                ) : (
                  <Package className="h-10 w-10 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{item.product?.title || "Product"}</p>
                {item.variantIds && item.variantIds.length > 0 ? (
                  <div className="text-sm text-gray-600 space-y-0.5">
                    {item.variantIds.map((variantId: string, idx: number) => {
                      // Try to find variant from product variants
                      const variant = item.product?.variants?.find((v: any) => v.id === variantId);
                      return variant ? (
                        <p key={idx}>
                          {variant.name}: {variant.value}
                        </p>
                      ) : null;
                    })}
                  </div>
                ) : item.variant ? (
                  <p className="text-sm text-gray-600">
                    {item.variant.name}: {item.variant.value}
                  </p>
                ) : null}
                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {formatCurrency(Number(item.priceGhs) * item.quantity, "GHS")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-100">
        <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
        <p className="text-sm text-gray-600 mb-4">
          If you have any questions about your order, please don't hesitate to contact us.
        </p>
        <div className="flex flex-wrap gap-6 text-sm">
          <a
            href="mailto:sales@juellehairgh.com"
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
          >
            <Mail className="h-4 w-4" />
            sales@juellehairgh.com
          </a>
          <a
            href="tel:+233539506949"
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
          >
            <Phone className="h-4 w-4" />
            +233 539506949
          </a>
        </div>
      </div>
    </div>
  );
}
