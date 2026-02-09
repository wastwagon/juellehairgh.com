"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useCurrencyStore } from "@/store/currency-store";
import { Truck } from "lucide-react";
import { Select } from "@/components/ui/select";

interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  cost?: number | null;
  freeShippingThreshold?: number | null;
  estimatedDays?: string;
  calculatedCost: number;
  zoneName: string;
}

interface ShippingMethodSelectorProps {
  country: string;
  region?: string;
  city?: string;
  orderTotal: number;
  selectedMethodId?: string;
  onSelect: (method: ShippingMethod) => void;
}

/** Display name for checkout: show "Pay to Rider on Delivery" instead of "PAY CASH ON DELIVERY". */
function getShippingMethodDisplayName(name: string): string {
  const u = name.toUpperCase();
  if (u.includes("PAY CASH ON DELIVERY") || u.includes("CASH ON DELIVERY")) {
    return "Pay to Rider on Delivery";
  }
  return name;
}

/** Display description: same wording as display name where relevant. */
function getShippingMethodDisplayDescription(description?: string | null): string | undefined {
  if (!description) return undefined;
  return description
    .replace(/Pay cash on delivery/gi, "Pay to rider on delivery")
    .replace(/pay cash on delivery/gi, "Pay to rider on delivery");
}

export function ShippingMethodSelector({
  country,
  region = "",
  city = "",
  orderTotal,
  selectedMethodId,
  onSelect,
}: ShippingMethodSelectorProps) {
  const { displayCurrency, convert } = useCurrencyStore();
  const [selectedId, setSelectedId] = useState<string | undefined>(selectedMethodId);

  const { data: methods, isLoading } = useQuery<ShippingMethod[]>({
    queryKey: ["shipping-methods", country, region, city, orderTotal],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          country: country || "Ghana",
          orderTotal: orderTotal.toString(),
        });
        if (region) params.append("region", region);
        if (city) params.append("city", city);
        
        const response = await api.get(`/shipping/methods?${params.toString()}`);
        return response.data;
      } catch (error) {
        console.error("Error fetching shipping methods:", error);
        return [];
      }
    },
    enabled: !!country,
    staleTime: 60000,
  });

  useEffect(() => {
    if (methods && methods.length > 0 && !selectedId) {
      // Default to "Pay to rider on delivery" / "Pay cash on delivery" when available
      const payToRiderMethod = methods.find((m) => {
        const name = m.name.toUpperCase();
        return (
          name.includes("PAY TO RIDER") ||
          name.includes("PAY TO RIDER ON ARRIVAL") ||
          name.includes("PAY CASH ON DELIVERY") ||
          name.includes("CASH ON DELIVERY")
        );
      });
      const defaultMethod = payToRiderMethod || methods[0];
      setSelectedId(defaultMethod.id);
      onSelect(defaultMethod);
    }
  }, [methods, selectedId, onSelect]);

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const methodId = e.target.value;
    const method = methods?.find((m) => m.id === methodId);
    if (method) {
      setSelectedId(methodId);
      onSelect(method);
    }
  };

  // Find methods with free shipping threshold
  const freeShippingMethods = methods?.filter(
    (m) => m.freeShippingThreshold && m.freeShippingThreshold > 0
  ) || [];

  // Calculate minimum threshold
  const minFreeShippingThreshold = freeShippingMethods.length > 0
    ? Math.min(...freeShippingMethods.map((m) => Number(m.freeShippingThreshold)))
    : null;

  // Calculate amount left for free shipping
  const amountLeftForFreeShipping = minFreeShippingThreshold && orderTotal < minFreeShippingThreshold
    ? minFreeShippingThreshold - orderTotal
    : null;

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
          <Truck className="h-5 w-5 text-purple-600" />
          Shipping Method
        </h2>
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded-md" />
        </div>
      </div>
    );
  }

  if (!methods || methods.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
          <Truck className="h-5 w-5 text-purple-600" />
          Shipping Method
        </h2>
        <p className="text-gray-600">No shipping methods available for this region.</p>
      </div>
    );
  }

  const selectedMethod = methods.find((m) => m.id === selectedId);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
        <Truck className="h-5 w-5 text-purple-600" />
        Shipping Method
      </h2>

      {/* Free Shipping Message */}
      {amountLeftForFreeShipping && amountLeftForFreeShipping > 0 && (
        <div className="mb-4 p-3 bg-pink-50 border border-pink-200 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-purple-700">
              Spend {formatCurrency(convert(amountLeftForFreeShipping), displayCurrency)}
            </span>
            {" "}more on this order and get free shipping!
          </p>
        </div>
      )}

      {/* Dropdown Select */}
      <Select
        value={selectedId || ""}
        onChange={handleSelect}
        className="w-full"
      >
        {methods.map((method) => {
          const cost = method.calculatedCost;
          const isLocalPickup = method.name.toUpperCase().includes("LOCAL PICK-UP") ||
                               method.name.toUpperCase().includes("PICK-UP") ||
                               method.name.toUpperCase().includes("DANSOMAN");
          const isPayToRider = method.name.toUpperCase().includes("PAY TO RIDER") ||
                               method.name.toUpperCase().includes("PAY CASH ON DELIVERY") ||
                               method.name.toUpperCase().includes("CASH ON DELIVERY");
          // Do not show "FREE" for local pickup or pay-to-rider (user request: zero cost but no "free" label)
          const qualifiesForFreeShipping = method.freeShippingThreshold &&
                                           orderTotal >= Number(method.freeShippingThreshold);
          const shouldShowFree = (cost === 0 && qualifiesForFreeShipping && !isLocalPickup && !isPayToRider);
          const showZeroAsFree = shouldShowFree;
          const costDisplay = showZeroAsFree
            ? "FREE"
            : (cost >= 0 ? formatCurrency(convert(cost), displayCurrency) : "");
          const displayName = getShippingMethodDisplayName(method.name);
          const displayText = `${displayName}${method.estimatedDays ? ` (${method.estimatedDays})` : ""}${costDisplay ? ` - ${costDisplay}` : ""}`;

          return (
            <option key={method.id} value={method.id}>
              {displayText}
            </option>
          );
        })}
      </Select>

      {/* Selected Method Details */}
      {selectedMethod && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-700">
            <p className="font-medium mb-1">{getShippingMethodDisplayName(selectedMethod.name)}</p>
            {getShippingMethodDisplayDescription(selectedMethod.description) && (
              <p className="text-gray-600 mb-1">{getShippingMethodDisplayDescription(selectedMethod.description)}</p>
            )}
            {selectedMethod.estimatedDays && (
              <p className="text-xs text-gray-500">Estimated: {selectedMethod.estimatedDays}</p>
            )}
            {(() => {
              const isLocalPickup = selectedMethod.name.toUpperCase().includes("LOCAL PICK-UP") ||
                                    selectedMethod.name.toUpperCase().includes("PICK-UP") ||
                                    selectedMethod.name.toUpperCase().includes("DANSOMAN");
              const isPayToRider = selectedMethod.name.toUpperCase().includes("PAY TO RIDER") ||
                                  selectedMethod.name.toUpperCase().includes("PAY CASH ON DELIVERY") ||
                                  selectedMethod.name.toUpperCase().includes("CASH ON DELIVERY");
              const qualifiesForFreeShipping = selectedMethod.freeShippingThreshold &&
                                               orderTotal >= Number(selectedMethod.freeShippingThreshold);
              // Do not show "FREE" for local pickup or pay-to-rider; show GH¢0.00 instead
              const shouldShowFree = (selectedMethod.calculatedCost === 0 && qualifiesForFreeShipping && !isLocalPickup && !isPayToRider);
              const cost = selectedMethod.calculatedCost;
              const showAmount = cost > 0 || !shouldShowFree;
              const amountDisplay = shouldShowFree ? "FREE" : formatCurrency(convert(cost), displayCurrency);
              if (showAmount || shouldShowFree) {
                return (
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Shipping Cost:</span>
                    <span className={`text-base font-bold ${shouldShowFree ? "text-green-600" : "text-gray-900"}`}>
                      {amountDisplay}
                    </span>
                  </div>
                );
              }
              return null;
            })()}
            {selectedMethod.freeShippingThreshold && orderTotal < selectedMethod.freeShippingThreshold && (
              <p className="text-xs text-purple-600 mt-2 font-medium">
                Free shipping available for orders over {formatCurrency(convert(Number(selectedMethod.freeShippingThreshold)), displayCurrency)}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
