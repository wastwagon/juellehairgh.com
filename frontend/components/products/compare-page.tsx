"use client";

import { useCompareStore } from "@/store/compare-store";
import { ProductCard } from "./product-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { useCurrencyStore } from "@/store/currency-store";
import { toast } from "sonner";

export function ComparePage() {
  const { products, removeProduct, clearCompare } = useCompareStore();
  const { displayCurrency, convert } = useCurrencyStore();

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Product Comparison</h1>
        <p className="text-gray-600 mb-6">You haven't added any products to compare yet.</p>
        <Link href="/shop-all">
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  // Get all unique attributes across products
  const allAttributes = new Set<string>();
  products.forEach((product) => {
    if (product.variants) {
      product.variants.forEach((variant) => {
        allAttributes.add(variant.name);
      });
    }
  });

  const attributes = Array.from(allAttributes);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Product Comparison</h1>
          <p className="text-gray-600">Compare {products.length} product{products.length !== 1 ? "s" : ""}</p>
        </div>
        <Button
          variant="outline"
          onClick={clearCompare}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear All
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white rounded-lg shadow-md">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left font-semibold text-gray-900">Features</th>
              {products.map((product) => (
                <th key={product.id} className="p-4 text-center min-w-[250px]">
                  <div className="relative">
                    <button
                      onClick={() => removeProduct(product.id)}
                      className="absolute top-0 right-0 text-gray-400 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="mt-6">
                      {product.images && product.images.length > 0 && (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-48 object-cover rounded-lg mb-3"
                        />
                      )}
                      <h3 className="font-semibold text-gray-900 mb-2">{product.title}</h3>
                      <p className="text-lg font-bold text-purple-600 mb-3">
                        {formatCurrency(
                          convert(product.priceGhs || 0),
                          displayCurrency
                        )}
                      </p>
                      <Link href={`/products/${product.slug}`}>
                        <Button size="sm" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-4 font-medium text-gray-700">Price</td>
              {products.map((product) => (
                <td key={product.id} className="p-4 text-center">
                  <span className="font-bold text-purple-600">
                    {formatCurrency(convert(product.priceGhs || 0), displayCurrency)}
                  </span>
                  {product.compareAtPriceGhs && (
                    <span className="ml-2 text-sm text-gray-500 line-through">
                      {formatCurrency(convert(product.compareAtPriceGhs), displayCurrency)}
                    </span>
                  )}
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="p-4 font-medium text-gray-700">Brand</td>
              {products.map((product) => (
                <td key={product.id} className="p-4 text-center">
                  {typeof product.brand === "string" ? product.brand : product.brand?.name || "N/A"}
                </td>
              ))}
            </tr>
            {attributes.map((attrName) => (
              <tr key={attrName} className="border-b">
                <td className="p-4 font-medium text-gray-700">{attrName}</td>
                {products.map((product) => {
                  const variant = product.variants?.find((v) => v.name === attrName);
                  return (
                    <td key={product.id} className="p-4 text-center">
                      {variant ? variant.value : "N/A"}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="border-b">
              <td className="p-4 font-medium text-gray-700">Stock Status</td>
              {products.map((product) => {
                const isOutOfStock = product.stock === 0 || (product.variants && product.variants.every((v) => v.stock === 0));
                return (
                  <td key={product.id} className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      isOutOfStock
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}>
                      {isOutOfStock ? "Out of Stock" : "In Stock"}
                    </span>
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="p-4 font-medium text-gray-700">Actions</td>
              {products.map((product) => (
                <td key={product.id} className="p-4 text-center">
                  <Link href={`/products/${product.slug}`}>
                    <Button size="sm" variant="outline" className="w-full">
                      View Product
                    </Button>
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
