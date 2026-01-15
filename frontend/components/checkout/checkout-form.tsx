"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cart-store";
import { useCurrencyStore } from "@/store/currency-store";
import { formatCurrency } from "@/lib/utils";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShippingMethodSelector } from "./shipping-method-selector";
import { CheckoutLoginPrompt } from "./checkout-login-prompt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GHANA_REGIONS } from "@/lib/ghana-regions";
import { COUNTRIES } from "@/lib/countries";

export function CheckoutForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { items, clearCart } = useCartStore();
  const { displayCurrency, convert } = useCurrencyStore();
  const [redirectingToCart, setRedirectingToCart] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setIsLoggedIn(!!token);
  }, []);

  // Fetch user data and saved addresses if logged in
  const { data: userData } = useQuery({
    queryKey: ["user", "me", "checkout"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get("/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: isLoggedIn,
    retry: false,
  });

  const savedAddresses = userData?.addresses || [];
  const defaultAddress = savedAddresses.find((addr: any) => addr.isDefault) || savedAddresses[0];

  // Fetch wallet balance if logged in
  const { data: walletData } = useQuery({
    queryKey: ["wallet", "me"],
    queryFn: async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      const response = await api.get("/wallet/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: isLoggedIn,
    retry: false,
  });

  const walletBalance = walletData ? Number(walletData.balance || 0) : 0;

  const [formData, setFormData] = useState({
    email: "",
    shippingAddress: {
      firstName: "",
      lastName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      region: "",
      postalCode: "",
      country: "Ghana",
    },
    billingAddress: {
      firstName: "",
      lastName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      region: "",
      postalCode: "",
      country: "Ghana",
    },
    useShippingForBilling: true,
    shippingMethod: null as any,
    shippingMethodId: null as string | null,
    paymentMethod: "paystack" as "paystack" | "wallet",
  });

  // Auto-populate form with saved address and user email when logged in
  useEffect(() => {
    if (defaultAddress && isLoggedIn && !isAddingNewAddress && !selectedAddressId) {
      setFormData((prev) => ({
        ...prev,
        email: userData?.email || prev.email,
        shippingAddress: {
          firstName: defaultAddress.firstName || "",
          lastName: defaultAddress.lastName || "",
          phone: defaultAddress.phone || "",
          addressLine1: defaultAddress.addressLine1 || "",
          addressLine2: defaultAddress.addressLine2 || "",
          city: defaultAddress.city || "",
          region: defaultAddress.region || "",
          postalCode: defaultAddress.postalCode || "",
          country: defaultAddress.country || "Ghana",
        },
      }));
      setSelectedAddressId(defaultAddress.id);
    }
  }, [defaultAddress, isLoggedIn, userData, isAddingNewAddress, selectedAddressId]);

  // Handle saved address selection
  const handleSelectSavedAddress = (value: string) => {
    if (value === "new") {
      // User wants to add a new address
      setIsAddingNewAddress(true);
      setSelectedAddressId(null);
      setFormData((prev) => ({
        ...prev,
        shippingAddress: {
          firstName: "",
          lastName: "",
          phone: "",
          addressLine1: "",
          addressLine2: "",
          city: "",
          region: "",
          postalCode: "",
          country: "Ghana",
        },
      }));
    } else if (value) {
      // User selected a saved address
      setIsAddingNewAddress(false);
      setSelectedAddressId(value);
      const selectedAddress = savedAddresses.find((addr: any) => addr.id === value);
      if (selectedAddress) {
        setFormData((prev) => ({
          ...prev,
          shippingAddress: {
            firstName: selectedAddress.firstName || "",
            lastName: selectedAddress.lastName || "",
            phone: selectedAddress.phone || "",
            addressLine1: selectedAddress.addressLine1 || "",
            addressLine2: selectedAddress.addressLine2 || "",
            city: selectedAddress.city || "",
            region: selectedAddress.region || "",
            postalCode: selectedAddress.postalCode || "",
            country: selectedAddress.country || "Ghana",
          },
        }));
      }
    }
  };

  // Save new address to account
  const saveAddressMutation = useMutation({
    mutationFn: async (addressData: any) => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) throw new Error("Not authenticated");
      return api.post("/addresses", addressData, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "me", "checkout"] });
      setIsAddingNewAddress(false);
    },
  });

  const handleSaveNewAddress = async () => {
    if (!isLoggedIn) return;
    
    try {
      await saveAddressMutation.mutateAsync({
        ...formData.shippingAddress,
        isDefault: false,
      });
      // After saving, select the newly saved address
      // The query will refetch and update the dropdown
    } catch (error) {
      console.error("Failed to save address:", error);
    }
  };

  // Helper function to get effective price (considering variant sale price)
  const getEffectivePrice = (item: any) => {
    // Check if item has variants with prices
    if (item.variants && item.variants.length > 0) {
      // Find variant with price (prefer first variant with price)
      const variantWithPrice = item.variants.find((v: any) => v.priceGhs);
      if (variantWithPrice) {
        const regularPrice = Number(variantWithPrice.priceGhs);
        const salePrice = variantWithPrice.compareAtPriceGhs ? Number(variantWithPrice.compareAtPriceGhs) : null;
        // Use sale price if available and lower than regular price
        return salePrice && salePrice < regularPrice ? salePrice : regularPrice;
      }
    }
    // Fall back to variant price (backward compatibility)
    if (item.variant?.priceGhs) {
      const regularPrice = Number(item.variant.priceGhs);
      const salePrice = item.variant.compareAtPriceGhs ? Number(item.variant.compareAtPriceGhs) : null;
      return salePrice && salePrice < regularPrice ? salePrice : regularPrice;
    }
    // Fall back to product price
    return item.product?.priceGhs ? Number(item.product.priceGhs) : 0;
  };

  const subtotalGhs = items.reduce((sum, item) => {
    const price = getEffectivePrice(item);
    return sum + price * item.quantity;
  }, 0);

  // Calculate shipping cost
  const shippingCost = formData.shippingMethod?.calculatedCost || 0;
  const totalGhs = subtotalGhs + shippingCost;

  const displaySubtotal = convert(subtotalGhs);
  const displayShipping = convert(shippingCost);
  const displayTotal = convert(totalGhs);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Track begin checkout
    if (typeof window !== "undefined") {
      const { analytics } = await import("@/lib/analytics");
      analytics.beginCheckout(Number(totalGhs), items.length);
    }

    try {
      const token = localStorage.getItem("token");
      
      // Sync cart items to backend if user is logged in
      if (token && isLoggedIn && items.length > 0) {
        try {
          // Clear backend cart first
          await api.delete("/cart", {
            headers: { Authorization: `Bearer ${token}` },
          });

          // Add all items to backend cart
          for (const item of items) {
            await api.post(
              "/cart/items",
              {
                productId: item.productId,
                variantId: item.variantId || undefined,
                variantIds: item.variantIds && item.variantIds.length > 0 ? item.variantIds : (item.variantId ? [item.variantId] : undefined),
                quantity: item.quantity,
              },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
          }
        } catch (syncError) {
          console.warn("Failed to sync cart to backend, proceeding with order creation:", syncError);
          // Continue with order creation even if sync fails
        }
      }

      // Prepare billing address
      const billingAddress = formData.useShippingForBilling
        ? formData.shippingAddress
        : formData.billingAddress;

      // Create order
      const orderResponse = await api.post(
        "/orders",
        {
          email: formData.email,
          shippingAddress: formData.shippingAddress,
          billingAddress: billingAddress,
          shippingMethod: formData.shippingMethod?.name || null,
          shippingMethodId: formData.shippingMethodId || null,
          shippingCost: shippingCost,
          displayCurrency,
          displayTotal,
          paymentMethod: formData.paymentMethod,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const order = orderResponse.data;

      // Track purchase event
      if (typeof window !== "undefined") {
        const { analytics } = await import("@/lib/analytics");
        analytics.purchase(order.id, Number(order.totalGhs), order.items || []);
      }

      // Handle payment based on selected method
      if (formData.paymentMethod === "wallet") {
        // Wallet payment is already processed in order creation
        // Clear cart and redirect to thank you page
        // Use window.location.href for full page navigation to prevent useEffect interference
        clearCart();
        window.location.href = `/checkout/thank-you?orderId=${order.id}`;
        return; // Exit early to prevent further execution
      } else {
        // Initialize Paystack payment
        const paymentResponse = await api.post(
          "/payments/initialize",
          {
            orderId: order.id,
            email: formData.email,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        // Redirect to Paystack
        window.location.href = paymentResponse.data.authorizationUrl;
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      alert(error.response?.data?.message || "Checkout failed");
      setLoading(false);
    }
  };

  // Redirect to cart outside render to avoid React setState-in-render warnings
  useEffect(() => {
    if (items.length === 0) {
      setRedirectingToCart(true);
      router.replace("/cart");
    } else {
      setRedirectingToCart(false);
    }
  }, [items.length, router]);

  if (redirectingToCart) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
      {/* Login/Registration Prompt */}
      <CheckoutLoginPrompt />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4 text-gray-900">Contact Information</h2>
            <Input
              type="email"
              required
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full"
            />
          </div>

          {/* Shipping Address */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <h2 className="text-lg font-bold text-gray-900">Shipping Address</h2>
              {isLoggedIn && savedAddresses.length > 0 && (
                <div className="flex items-center gap-2">
                  <select
                    value={isAddingNewAddress ? "new" : (selectedAddressId || defaultAddress?.id || "")}
                    onChange={(e) => handleSelectSavedAddress(e.target.value)}
                    className="w-auto min-w-[200px] h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select address</option>
                    {savedAddresses.map((addr: any) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.firstName} {addr.lastName} - {addr.city}, {addr.region}
                        {addr.isDefault && " (Default)"}
                      </option>
                    ))}
                    <option value="new">+ Add New Address</option>
                  </select>
                </div>
              )}
            </div>
            {isLoggedIn && !isAddingNewAddress && selectedAddressId && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✓ Using your saved address: <strong>
                    {savedAddresses.find((a: any) => a.id === selectedAddressId)?.firstName}{" "}
                    {savedAddresses.find((a: any) => a.id === selectedAddressId)?.lastName}
                  </strong> - {savedAddresses.find((a: any) => a.id === selectedAddressId)?.city}, {savedAddresses.find((a: any) => a.id === selectedAddressId)?.region}
                </p>
              </div>
            )}
            {isLoggedIn && isAddingNewAddress && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                <p className="text-sm text-blue-800">
                  Entering a new address
                </p>
                <Button
                  type="button"
                  onClick={handleSaveNewAddress}
                  disabled={saveAddressMutation.isPending}
                  className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {saveAddressMutation.isPending ? "Saving..." : "Save to Account"}
                </Button>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">First Name</label>
                <Input
                  type="text"
                  required
                  placeholder="John"
                  value={formData.shippingAddress.firstName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shippingAddress: {
                        ...formData.shippingAddress,
                        firstName: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Last Name</label>
                <Input
                  type="text"
                  required
                  placeholder="Doe"
                  value={formData.shippingAddress.lastName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shippingAddress: {
                        ...formData.shippingAddress,
                        lastName: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Phone Number</label>
              <Input
                type="tel"
                required
                placeholder="+233 XX XXX XXXX"
                value={formData.shippingAddress.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shippingAddress: {
                      ...formData.shippingAddress,
                      phone: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Address Line 1</label>
              <Input
                type="text"
                required
                placeholder="Street address"
                value={formData.shippingAddress.addressLine1}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shippingAddress: {
                      ...formData.shippingAddress,
                      addressLine1: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Address Line 2 (Optional)</label>
              <Input
                type="text"
                placeholder="Apartment, suite, etc."
                value={formData.shippingAddress.addressLine2}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shippingAddress: {
                      ...formData.shippingAddress,
                      addressLine2: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">City</label>
                <Input
                  type="text"
                  required
                  placeholder="Accra"
                  value={formData.shippingAddress.city}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shippingAddress: {
                        ...formData.shippingAddress,
                        city: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Country *</label>
                <Select
                  required
                  value={formData.shippingAddress.country}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shippingAddress: {
                        ...formData.shippingAddress,
                        country: e.target.value,
                        // Reset region when country changes (if not Ghana, region may not apply)
                        region: e.target.value === "Ghana" ? formData.shippingAddress.region : "",
                      },
                    })
                  }
                >
                  <option value="">Select Country</option>
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            {formData.shippingAddress.country === "Ghana" && (
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-700 mb-1 block">Region *</label>
                <Select
                  required
                  value={formData.shippingAddress.region}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shippingAddress: {
                        ...formData.shippingAddress,
                        region: e.target.value,
                      },
                    })
                  }
                >
                  <option value="">Select Region</option>
                  {GHANA_REGIONS.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </Select>
              </div>
            )}
          </div>

          {/* Shipping Method Selection */}
          <ShippingMethodSelector
            country={formData.shippingAddress.country || "Ghana"}
            region={formData.shippingAddress.region || ""}
            city={formData.shippingAddress.city || ""}
            orderTotal={subtotalGhs}
            selectedMethodId={formData.shippingMethodId || undefined}
            onSelect={(method) => {
              setFormData({
                ...formData,
                shippingMethod: method,
                shippingMethodId: method.id,
              });
            }}
          />

          {/* Billing Address */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <label className="flex items-center gap-3 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.useShippingForBilling}
                onChange={(e) =>
                  setFormData({ ...formData, useShippingForBilling: e.target.checked })
                }
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-sm font-medium text-gray-700">Use shipping address for billing</span>
            </label>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4 text-gray-900">Payment Method</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50"
                style={{ borderColor: formData.paymentMethod === "paystack" ? "#9333ea" : "#e5e7eb" }}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="paystack"
                  checked={formData.paymentMethod === "paystack"}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as "paystack" | "wallet" })}
                  className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">Paystack</span>
                    <span className="text-xs text-gray-500">🔒 Secure</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Pay with card, bank transfer, or mobile money</p>
                </div>
              </label>
              {isLoggedIn && (
                <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50"
                  style={{ borderColor: formData.paymentMethod === "wallet" ? "#9333ea" : "#e5e7eb" }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="wallet"
                    checked={formData.paymentMethod === "wallet"}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as "paystack" | "wallet" })}
                    className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                    disabled={walletBalance < totalGhs}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">Wallet Balance</span>
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(walletBalance, "GHS")}</span>
                    </div>
                    {walletBalance < totalGhs ? (
                      <p className="text-xs text-red-600 mt-1">
                        Insufficient balance. Need {formatCurrency(totalGhs - walletBalance, "GHS")} more
                      </p>
                    ) : (
                      <p className="text-xs text-green-600 mt-1">✓ Sufficient balance available</p>
                    )}
                  </div>
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-4 shadow-sm">
            <h2 className="text-lg font-bold mb-4 text-gray-900">Order Summary</h2>
            <div className="space-y-3 mb-4 pb-4 border-b">
              {items.map((item) => {
                // Create unique key from productId and variantIds
                const variantKey = item.variantIds && item.variantIds.length > 0
                  ? item.variantIds.sort().join(',')
                  : item.variantId || "default";
                
                return (
                <div key={`${item.productId}-${variantKey}`} className="flex gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {item.product?.images?.[0] && (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.product?.title}</p>
                    {(item.variants && item.variants.length > 0) ? (
                      <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                        {item.variants.map((variant, idx) => (
                          <p key={idx}>
                            {variant.name}: {variant.value}
                          </p>
                        ))}
                      </div>
                    ) : item.variant ? (
                      <p className="text-xs text-gray-600 mt-1">
                        {item.variant.name}: {item.variant.value}
                      </p>
                    ) : null}
                    <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                    {(() => {
                      const effectivePrice = getEffectivePrice(item);
                      const regularPrice = item.variants && item.variants.length > 0
                        ? (item.variants.find((v: any) => v.priceGhs)?.priceGhs ? Number(item.variants.find((v: any) => v.priceGhs).priceGhs) : (item.variant?.priceGhs ? Number(item.variant.priceGhs) : (item.product?.priceGhs ? Number(item.product.priceGhs) : 0)))
                        : (item.variant?.priceGhs ? Number(item.variant.priceGhs) : (item.product?.priceGhs ? Number(item.product.priceGhs) : 0));
                      const salePrice = item.variants && item.variants.length > 0
                        ? (item.variants.find((v: any) => v.priceGhs)?.compareAtPriceGhs ? Number(item.variants.find((v: any) => v.priceGhs).compareAtPriceGhs) : null)
                        : (item.variant?.compareAtPriceGhs ? Number(item.variant.compareAtPriceGhs) : null);
                      const isOnSale = salePrice && salePrice < regularPrice;
                      
                      return (
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {isOnSale ? (
                            <>
                              <span className="text-primary">{formatCurrency(convert(salePrice * item.quantity), displayCurrency)}</span>
                              <span className="ml-2 text-gray-400 line-through text-xs">{formatCurrency(convert(regularPrice * item.quantity), displayCurrency)}</span>
                            </>
                          ) : (
                            formatCurrency(convert(effectivePrice * item.quantity), displayCurrency)
                          )}
                        </p>
                      );
                    })()}
                  </div>
                </div>
                );
              })}
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm text-gray-700">
                <span>Subtotal</span>
                <span>{formatCurrency(displaySubtotal, displayCurrency)}</span>
              </div>
              {formData.shippingMethod && (() => {
                const methodName = formData.shippingMethod.name || "";
                const isLocalPickup = methodName.toUpperCase().includes("LOCAL PICK-UP") || 
                                      methodName.toUpperCase().includes("PICK-UP");
                const isPayToRider = methodName.toUpperCase().includes("PAY TO RIDER");
                const freeShippingThreshold = formData.shippingMethod.freeShippingThreshold;
                const qualifiesForFreeShipping = freeShippingThreshold && 
                                                 subtotalGhs >= Number(freeShippingThreshold);
                const shouldShowFree = (isLocalPickup && shippingCost === 0) || 
                                      (shippingCost === 0 && qualifiesForFreeShipping && !isPayToRider);
                
                return (
                  <div className="flex justify-between text-sm text-gray-700">
                    <span>Shipping</span>
                    <span>
                      {shouldShowFree ? (
                        <span className="text-green-600 font-semibold">FREE</span>
                      ) : (
                        formatCurrency(displayShipping, displayCurrency)
                      )}
                    </span>
                  </div>
                );
              })()}
              <div className="flex justify-between text-base font-bold text-gray-900 pt-3 border-t">
                <span>Total</span>
                <span>{formatCurrency(displayTotal, displayCurrency)}</span>
              </div>
              {displayCurrency !== "GHS" && (
                <>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>In GHS (approximate)</span>
                    <span>{formatCurrency(totalGhs, "GHS")}</span>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-3">
                    <p className="text-xs text-yellow-800">
                      <strong>Final Payment:</strong> You will be charged <strong>{formatCurrency(totalGhs, "GHS")}</strong> in GHS
                    </p>
                  </div>
                </>
              )}
            </div>
            <Button
              type="submit"
              disabled={loading || (formData.paymentMethod === "wallet" && walletBalance < totalGhs)}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 rounded-lg shadow-lg hover:shadow-xl disabled:opacity-50 transition-all duration-300 transform hover:scale-[1.02] disabled:transform-none text-sm px-4"
            >
              {loading ? "Processing..." : formData.paymentMethod === "wallet" ? `Pay with Wallet (${formatCurrency(walletBalance, "GHS")})` : "Pay Securely with Paystack"}
            </Button>
            <p className="text-xs text-center text-gray-500 mt-3">
              {formData.paymentMethod === "wallet" ? "💳 Payment from your wallet balance" : "🔒 Secure payment powered by Paystack"}
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

