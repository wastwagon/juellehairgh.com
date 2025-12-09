"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Order } from "@/types";
import { formatCurrency, formatOrderStatus } from "@/lib/utils";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Search, Package, Truck, CheckCircle2, Clock, MapPin, Phone, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default function OrderTrackingPage() {
  const [orderId, setOrderId] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      let response;

      // Clean order ID - remove # and whitespace
      const cleanOrderId = orderId.trim().replace(/^#/, "");

      if (cleanOrderId) {
        // Search by order ID using public tracking endpoint
        response = await api.get(`/orders/track/id/${cleanOrderId}`);
      } else if (trackingNumber.trim()) {
        // Search by tracking number
        response = await api.get(`/orders/track/${trackingNumber.trim()}`);
      } else {
        setError("Please enter an order ID or tracking number");
        setLoading(false);
        return;
      }

      setOrder(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Order not found. Please check your order ID or tracking number.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return <CheckCircle2 className="h-6 w-6 text-green-600" />;
      case "SHIPPED":
        return <Truck className="h-6 w-6 text-blue-600" />;
      case "PROCESSING":
        return <Package className="h-6 w-6 text-purple-600" />;
      case "PAID":
        return <CheckCircle2 className="h-6 w-6 text-green-600" />;
      case "AWAITING_PAYMENT":
        return <Clock className="h-6 w-6 text-orange-600" />;
      default:
        return <Clock className="h-6 w-6 text-yellow-600" />;
    }
  };

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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50/40 via-white to-pink-50/40">
      <Header />
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
          {/* Breadcrumbs */}
          <div className="mb-6 md:mb-8">
            <Breadcrumbs items={[{ label: "Track Order" }]} />
          </div>
          {/* Premium Search Form */}
          <div className="relative mb-8">
            {/* Decorative background elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-100/20 via-pink-100/20 to-purple-100/20 rounded-3xl blur-3xl" />
            <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-purple-100/50 border border-purple-100/50 p-8 md:p-10">
              <form onSubmit={handleSearch} className="space-y-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-200/50 mb-4">
                    <Search className="h-8 w-8 md:h-10 md:w-10 text-white" />
                  </div>
                  <p className="text-gray-600 text-sm md:text-base">
                    Enter your order ID or tracking number to see the current status of your order
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Order ID
                    </label>
                    <input
                      type="text"
                      value={orderId}
                      onChange={(e) => {
                        setOrderId(e.target.value);
                        setTrackingNumber("");
                      }}
                      placeholder="e.g., #5E03CB57"
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white/50 backdrop-blur-sm text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Tracking Number
                    </label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => {
                        setTrackingNumber(e.target.value);
                        setOrderId("");
                      }}
                      placeholder="Enter tracking number"
                      className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white/50 backdrop-blur-sm text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-200/50 hover:shadow-xl hover:shadow-purple-300/50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5" />
                      <span>Track Order</span>
                    </>
                  )}
                </button>
              </form>

              {error && (
                <div className="mt-6 p-4 bg-red-50/80 backdrop-blur-sm border-2 border-red-200 rounded-xl text-red-700 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Details */}
          {order && (
            <>
              {/* Order Summary */}
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-100/20 via-pink-100/20 to-purple-100/20 rounded-3xl blur-3xl" />
                <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-purple-100/50 border border-purple-100/50 p-8 md:p-10">
                <div className="flex items-center gap-4 mb-8 pb-6 border-b-2 border-purple-100/50">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl blur-md opacity-30" />
                    <div className="relative bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl shadow-lg">
                      <Image
                        src="/logo.png"
                        alt="Juelle Hair"
                        width={50}
                        height={50}
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
                  <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-xl p-4 border border-purple-100/50">
                    <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Order Status</p>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold border-2 ${getStatusColor(order.status)}`}>
                        {formatOrderStatus(order.status)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-xl p-4 border border-purple-100/50">
                    <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Payment Status</p>
                    <p className={`text-lg font-bold ${order.paymentStatus === "PAID" ? "text-green-600" : "text-yellow-600"}`}>
                      {order.paymentStatus}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-xl p-4 border border-purple-100/50">
                    <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Order Total</p>
                    <p className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {formatCurrency(Number(order.totalGhs), "GHS")}
                    </p>
                  </div>
                </div>

                {order.trackingNumber && (
                  <div className="bg-gradient-to-r from-purple-50/80 to-pink-50/80 backdrop-blur-sm border-2 border-purple-200/50 rounded-xl p-5 mb-6 shadow-sm">
                    <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Tracking Number</p>
                    <p className="text-xl font-mono font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {order.trackingNumber}
                    </p>
                  </div>
                )}

                {/* Status Timeline */}
                <div className="border-t-2 border-purple-100/50 pt-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-6 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
                    Order Status Timeline
                  </h3>
                  <div className="relative">
                    {statusSteps.map((step, index) => {
                      const currentStepIndex = getCurrentStepIndex(order.status);
                      const isCompleted = index <= currentStepIndex;
                      const isCurrent = index === currentStepIndex;

                      return (
                        <div key={step.key} className="relative flex items-start gap-4 mb-6 last:mb-0">
                          {/* Connecting line */}
                          {index < statusSteps.length - 1 && (
                            <div className={`absolute left-5 top-10 w-0.5 h-full ${
                              isCompleted ? "bg-gradient-to-b from-purple-500 to-pink-500" : "bg-gray-200"
                            }`} />
                          )}
                          <div className={`relative flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border-2 shadow-lg transition-all duration-300 ${
                            isCompleted
                              ? "bg-gradient-to-br from-purple-600 to-pink-600 border-purple-600 text-white scale-110"
                              : "bg-white border-gray-300 text-gray-400"
                          }`}>
                            {isCompleted ? (
                              <CheckCircle2 className="h-6 w-6" />
                            ) : (
                              <div className="w-3 h-3 rounded-full bg-gray-300" />
                            )}
                            {isCurrent && (
                              <div className="absolute -inset-1 bg-purple-400 rounded-xl blur-md opacity-50 animate-pulse" />
                            )}
                          </div>
                          <div className="flex-1 pt-1 pb-4">
                            <p className={`font-bold text-base ${isCompleted ? "text-gray-900" : "text-gray-400"}`}>
                              {step.label}
                            </p>
                            <p className={`text-sm mt-1 ${isCompleted ? "text-gray-600" : "text-gray-400"}`}>
                              {step.description}
                            </p>
                            {isCurrent && (
                              <span className="inline-block mt-2 px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs font-semibold rounded-full border border-purple-200">
                                Current Status
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-100/20 via-pink-100/20 to-purple-100/20 rounded-3xl blur-3xl" />
                <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-purple-100/50 border border-purple-100/50 p-6 md:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Shipping Address</h3>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                  <p>{order.shippingAddress?.addressLine1}</p>
                  {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                  <p>{order.shippingAddress?.city}, {order.shippingAddress?.region}</p>
                  <p>{order.shippingAddress?.country}</p>
                  <p className="mt-2">Phone: {order.shippingAddress?.phone}</p>
                </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-100/20 via-pink-100/20 to-purple-100/20 rounded-3xl blur-3xl" />
                <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-purple-100/50 border border-purple-100/50 p-6 md:p-8">
                <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
                <div className="space-y-3">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-purple-100/50 hover:border-purple-200/50 transition-all hover:shadow-md">
                      <div className="relative w-20 h-20 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl flex items-center justify-center border-2 border-purple-100/50 overflow-hidden">
                        {item.product?.images?.[0] ? (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.title || "Product"}
                            width={80}
                            height={80}
                            className="object-cover rounded-xl"
                          />
                        ) : (
                          <Package className="h-10 w-10 text-purple-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 mb-1 truncate">{item.product?.title || "Product"}</p>
                        {item.variantIds && item.variantIds.length > 0 ? (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {item.variantIds.map((variantId, idx) => {
                              // Try to find variant from product variants
                              const variant = item.product?.variants?.find((v: any) => v.id === variantId);
                              return variant ? (
                                <span key={idx} className="inline-flex items-center px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-lg border border-purple-200/50">
                                  {variant.name}: {variant.value}
                                </span>
                              ) : null;
                            })}
                          </div>
                        ) : item.variant ? (
                          <span className="inline-flex items-center px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-lg border border-purple-200/50 mb-2">
                            {item.variant.name}: {item.variant.value}
                          </span>
                        ) : null}
                        <p className="text-sm text-gray-600 font-medium">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {formatCurrency(Number(item.priceGhs) * item.quantity, "GHS")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-200/30 via-pink-200/30 to-purple-200/30 rounded-3xl blur-3xl" />
                <div className="relative bg-gradient-to-r from-purple-50/90 to-pink-50/90 backdrop-blur-xl rounded-2xl p-6 md:p-8 border-2 border-purple-200/50 shadow-xl">
                <h3 className="font-semibold text-gray-900 mb-4">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  If you have any questions about your order, please contact us.
                </p>
                <div className="flex flex-wrap gap-6 text-sm">
                  <a href="mailto:sales@juellehairgh.com" className="flex items-center gap-2 text-purple-600 hover:text-purple-700">
                    <Mail className="h-4 w-4" />
                    sales@juellehairgh.com
                  </a>
                  <a href="tel:+233539506949" className="flex items-center gap-2 text-purple-600 hover:text-purple-700">
                    <Phone className="h-4 w-4" />
                    +233 539506949
                  </a>
                </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Link
                  href={`/account/orders/${order.id}`}
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg shadow-purple-200/50 hover:shadow-xl hover:shadow-purple-300/50 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  View Full Order Details
                </Link>
                <Link
                  href="/account/orders"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/80 backdrop-blur-sm text-purple-600 border-2 border-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  View All Orders
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

