"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Order } from "@/types";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { CheckCircle2, Package, Truck, Home, ShoppingBag, Phone, Mail, Sparkles, Gift, Loader2 } from "lucide-react";
import Image from "next/image";

export const dynamic = 'force-dynamic';

export default function ThankYouPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    if (orderId) {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        api
          .get(`/orders/${orderId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((response) => {
            setOrder(response.data);
            setLoading(false);
          })
          .catch(() => {
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [orderId]);

  // Hide confetti after animation
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-16 h-16 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
              </div>
            </div>
            <p className="text-gray-600 mt-4">Loading order details...</p>
          </div>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  if (!order && !loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-6 shadow-lg animate-scale-in">
              <CheckCircle2 className="h-14 w-14 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-pink-600">
              Thank You for Your Order!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Your order has been placed successfully. {orderId && `Order ID: ${orderId.slice(0, 8).toUpperCase()}`}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/account/orders"
                className="inline-flex items-center justify-center px-4 py-2 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-sm"
              >
                <ShoppingBag className="h-4 w-4 mr-1.5" />
                View Orders
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center px-4 py-2 bg-white text-gray-700 border-2 border-gray-200 rounded-lg font-semibold hover:bg-gray-50 transition-all shadow-md hover:shadow-lg text-sm"
              >
                <Home className="h-4 w-4 mr-1.5" />
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      <Header />
      <main className="flex-1 relative z-10">
        <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
          {/* Success Header with Celebration */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-6 shadow-2xl animate-scale-in relative">
              <CheckCircle2 className="h-16 w-16 text-white" />
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-8 w-8 text-yellow-400 animate-pulse" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-4 bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 bg-clip-text text-transparent animate-fade-in tracking-tight">
              Order Confirmed!
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-2">
              Thank you for your purchase!
            </p>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              We've received your order and will begin processing it right away. You'll receive an email confirmation shortly.
            </p>
          </div>

          {/* Order Summary Card - Premium Design */}
          {order && (
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 mb-8 border border-gray-100 transform transition-all hover:shadow-3xl">
              {/* Header with Logo */}
              <div className="flex items-center gap-4 mb-8 pb-6 border-b-2 border-pink-100">
                <div className="relative">
                  <Image
                    src="/logo.png"
                    alt="Juelle Hair"
                    width={60}
                    height={60}
                    className="object-contain"
                  />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">Order Confirmation</h2>
                  <p className="text-sm text-gray-500">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(order.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-pink-50 rounded-lg">
                  <Gift className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-600">Order Placed</span>
                </div>
              </div>

              {/* Order Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Package className="h-5 w-5 text-purple-600" />
                    Order Details
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Order Total:</span>
                      <span className="font-bold text-xl text-gray-900">{formatCurrency(Number(order.totalGhs), "GHS")}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-gray-600">Payment Status:</span>
                      <span className="font-semibold text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        {order.paymentStatus}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-gray-600">Order Status:</span>
                      <span className="font-semibold text-purple-600">{order.status}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Truck className="h-5 w-5 text-purple-600" />
                    Shipping Address
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600 space-y-2">
                    <p className="font-semibold text-gray-900">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                    <p>{order.shippingAddress?.addressLine1}</p>
                    {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                    <p>{order.shippingAddress?.city}, {order.shippingAddress?.region}</p>
                    <p>{order.shippingAddress?.country}</p>
                    <p className="pt-2 border-t border-gray-200">
                      <Phone className="h-4 w-4 inline mr-1" />
                      {order.shippingAddress?.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items - Enhanced */}
              <div className="border-t-2 border-gray-100 pt-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-purple-600" />
                  Order Items ({order.items?.length || 0})
                </h3>
                <div className="space-y-4">
                  {order.items?.map((item, index) => (
                    <div 
                      key={item.id} 
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-all animate-slide-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-100">
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
                        <p className="font-semibold text-gray-900 mb-1">{item.product?.title || "Product"}</p>
                        {item.variantIds && item.variantIds.length > 0 ? (
                          <div className="text-xs text-gray-600 space-y-0.5 mb-2">
                            {item.variantIds.map((variantId, idx) => {
                              const variant = item.product?.variants?.find((v: any) => v.id === variantId);
                              return variant ? (
                                <span key={idx} className="inline-block mr-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                                  {variant.name}: {variant.value}
                                </span>
                              ) : null;
                            })}
                          </div>
                        ) : item.variant ? (
                          <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs mb-2">
                            {item.variant.name}: {item.variant.value}
                          </span>
                        ) : null}
                        <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900">
                          {formatCurrency(Number(item.priceGhs) * item.quantity, "GHS")}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-gray-500">
                            {formatCurrency(Number(item.priceGhs), "GHS")} each
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* What's Next Section - Premium */}
          <div className="bg-pink-50 rounded-2xl p-8 md:p-10 mb-8 border-2 border-pink-100 shadow-xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What Happens Next?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-105">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-600 rounded-full mb-4 shadow-lg">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Order Processing</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  We're preparing your order for shipment. This usually takes 1-2 business days.
                </p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-105">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-600 rounded-full mb-4 shadow-lg">
                  <Truck className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Shipping</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Once shipped, you'll receive a tracking number via email to monitor your package.
                </p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-105">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full mb-4 shadow-lg">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Delivery</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Your order will arrive within 3-7 business days. We'll notify you when it's out for delivery.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information - Enhanced */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5 text-purple-600" />
              Need Help?
            </h3>
            <p className="text-gray-600 mb-6">
              If you have any questions about your order, please don't hesitate to contact us. We're here to help!
            </p>
            <div className="flex flex-wrap gap-6">
              <a 
                href="mailto:sales@juellehairgh.com" 
                className="flex items-center gap-2 px-3 py-1.5 bg-pink-50 rounded-lg text-pink-600 hover:bg-pink-100 transition-all shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
              >
                <Mail className="h-5 w-5" />
                <span className="font-semibold">sales@juellehairgh.com</span>
              </a>
              <a 
                href="tel:+233539506949" 
                className="flex items-center gap-2 px-3 py-1.5 bg-pink-50 rounded-lg text-pink-600 hover:bg-pink-100 transition-all shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
              >
                <Phone className="h-5 w-5" />
                <span className="font-semibold">+233 539506949</span>
              </a>
            </div>
          </div>

          {/* Action Buttons - Premium */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {order && (
              <Link
                href={`/account/orders/${order.id}`}
                className="inline-flex items-center justify-center px-4 py-2 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-sm"
              >
                <ShoppingBag className="h-4 w-4 mr-1.5" />
                View Order Details
              </Link>
            )}
            <Link
              href="/account/orders"
              className="inline-flex items-center justify-center px-4 py-2 bg-white text-pink-600 border-2 border-pink-600 rounded-lg font-semibold hover:bg-pink-50 transition-all shadow-md hover:shadow-lg text-sm"
            >
              View All Orders
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all shadow-md hover:shadow-lg text-sm"
            >
              <Home className="h-4 w-4 mr-1.5" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
      
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scale-in {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.6s ease-out;
        }
        .animate-slide-in {
          animation: slide-in 0.5s ease-out forwards;
          opacity: 0;
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
      `}</style>
    </div>
  );
}
