"use client";

import { useCartStore } from "@/store/cart-store";
import { useCurrencyStore } from "@/store/currency-store";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Trash2 } from "lucide-react";

export function CartView() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const { displayCurrency, convert } = useCurrencyStore();

  const totalGhs = items.reduce((sum, item) => {
    const price = item.product?.priceGhs
      ? Number(item.product.priceGhs)
      : 0;
    return sum + price * item.quantity;
  }, 0);

  const displayTotal = convert(totalGhs);

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Link
          href="/"
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg inline-block shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] font-semibold"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-16 lg:pb-0">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        <div className="lg:col-span-2 space-y-3 md:space-y-4">
          {items.map((item) => {
            // Create unique key from productId and variantIds
            const variantKey = item.variantIds && item.variantIds.length > 0
              ? item.variantIds.sort().join(',')
              : item.variantId || "default";
            
            return (
              <div
                key={`${item.productId}-${variantKey}`}
                className="flex gap-3 md:gap-4 border border-gray-200 rounded-lg p-3 md:p-4 bg-white hover:shadow-md transition-shadow"
              >
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                {item.product?.images && item.product.images.length > 0 ? (
                  <img
                    src={item.product.images[0]}
                    alt={item.product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.product?.slug}`}>
                  <h3 className="font-semibold text-gray-900 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transition-all">
                    {item.product?.title || "Product"}
                  </h3>
                </Link>
                {(item.variants && item.variants.length > 0) ? (
                  <div className="text-sm text-gray-600 mt-1 space-y-0.5">
                    {item.variants.map((variant, idx) => (
                      <p key={idx}>
                        {variant.name}: {variant.value}
                      </p>
                    ))}
                  </div>
                ) : item.variant ? (
                  <p className="text-sm text-gray-600 mt-1">
                    {item.variant.name}: {item.variant.value}
                  </p>
                ) : null}
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Qty:</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => {
                        // Use first variantId for update (backward compatibility)
                        const variantIdToUpdate = item.variantIds && item.variantIds.length > 0
                          ? item.variantIds[0]
                          : item.variantId;
                        updateQuantity(
                          item.productId,
                          variantIdToUpdate,
                          parseInt(e.target.value) || 1
                        );
                      }}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(
                      convert(
                        item.product?.priceGhs
                          ? Number(item.product.priceGhs) * item.quantity
                          : 0
                      ),
                      displayCurrency
                    )}
                  </span>
                  <button
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="ml-auto p-2 hover:bg-red-50 rounded transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <div className="border border-gray-200 rounded-lg p-6 bg-white sticky top-4">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Order Summary</h2>
            <div className="space-y-3 mb-6 pb-6 border-b">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span className="font-semibold">{formatCurrency(displayTotal, displayCurrency)}</span>
              </div>
              {displayCurrency !== "GHS" && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>In GHS (approximate)</span>
                  <span>{formatCurrency(totalGhs, "GHS")}</span>
                </div>
              )}
            </div>
            {displayCurrency !== "GHS" && (
              <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                <p className="font-semibold mb-1">Payment in GHS</p>
                <p>You will be charged: <strong>{formatCurrency(totalGhs, "GHS")}</strong></p>
              </div>
            )}
            <Link
              href="/checkout"
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl text-center block transition-all duration-300 transform hover:scale-[1.02]"
            >
              Checkout
            </Link>
            <Link
              href="/"
              className="w-full mt-3 px-6 py-3 border border-gray-300 text-gray-700 rounded-md font-semibold hover:bg-gray-50 text-center block transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

