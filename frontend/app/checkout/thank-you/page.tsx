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
import { CheckCircle2, Package, Truck, Home, ShoppingBag, Phone, Mail } from "lucide-react";
import Image from "next/image";

export const dynamic = 'force-dynamic';

export default function ThankYouPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </main>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  if (!order && !loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Thank You for Your Order!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Your order has been placed successfully. {orderId && `Order ID: ${orderId.slice(0, 8).toUpperCase()}`}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/account/orders"
                className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                View Orders
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                <Home className="h-5 w-5 mr-2" />
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50/50 via-white to-pink-50/30">
      <Header />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Thank You for Your Order!
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We've received your order and will begin processing it right away. You'll receive an email confirmation shortly.
            </p>
          </div>

          {/* Order Summary Card */}
          {order && (
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8 border border-gray-200">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b">
                <Image
                  src="/logo.png"
                  alt="Juelle Hair"
                  width={50}
                  height={50}
                  className="object-contain"
                />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Order Confirmation</h2>
                  <p className="text-sm text-gray-600">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Order Details</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                    <p><strong>Order Total:</strong> <span className="font-bold text-gray-900">{formatCurrency(Number(order.totalGhs), "GHS")}</span></p>
                    <p><strong>Payment Status:</strong> <span className="text-green-600 font-semibold">{order.paymentStatus}</span></p>
                    <p><strong>Order Status:</strong> <span className="text-purple-600 font-semibold">{order.status}</span></p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Shipping Address</h3>
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
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
                <div className="space-y-4">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        {item.product?.images?.[0] ? (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.title || "Product"}
                            width={64}
                            height={64}
                            className="object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{item.product?.title || "Product"}</p>
                        {item.variantIds && item.variantIds.length > 0 ? (
                          <div className="text-sm text-gray-600 space-y-0.5">
                            {item.variantIds.map((variantId, idx) => {
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
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-8 mb-8 border border-purple-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What's Next?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Order Processing</h3>
                <p className="text-sm text-gray-600">
                  We're preparing your order for shipment. This usually takes 1-2 business days.
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
                  <Truck className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Shipping</h3>
                <p className="text-sm text-gray-600">
                  Once shipped, you'll receive a tracking number via email to monitor your package.
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
                  <CheckCircle2 className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Delivery</h3>
                <p className="text-sm text-gray-600">
                  Your order will arrive within 3-7 business days. We'll notify you when it's out for delivery.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-4">
              If you have any questions about your order, please don't hesitate to contact us.
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {order && (
              <Link
                href={`/account/orders/${order.id}`}
                className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                View Order Details
              </Link>
            )}
            <Link
              href="/account/orders"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-purple-600 border-2 border-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
            >
              View All Orders
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              <Home className="h-5 w-5 mr-2" />
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


