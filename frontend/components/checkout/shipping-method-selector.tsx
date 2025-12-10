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
  region: string;
  orderTotal: number;
  selectedMethodId?: string;
  onSelect: (method: ShippingMethod) => void;
}

export function ShippingMethodSelector({
  region,
  orderTotal,
  selectedMethodId,
  onSelect,
}: ShippingMethodSelectorProps) {
  const { displayCurrency, convert } = useCurrencyStore();
  const [selectedId, setSelectedId] = useState<string | undefined>(selectedMethodId);

  const { data: methods, isLoading } = useQuery<ShippingMethod[]>({
    queryKey: ["shipping-methods", region, orderTotal],
    queryFn: async () => {
      try {
        const response = await api.get(
          `/shipping/methods?region=${encodeURIComponent(region)}&orderTotal=${orderTotal}`
        );
        return response.data;
      } catch (error) {
        console.error("Error fetching shipping methods:", error);
        return [];
      }
    },
    enabled: !!region,
    staleTime: 60000,
  });

  useEffect(() => {
    if (methods && methods.length > 0 && !selectedId) {
      // Auto-select first method
      setSelectedId(methods[0].id);
      onSelect(methods[0]);
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
        <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
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
          const isFree = cost === 0;
          // Don't show "FREE" for LOCAL PICK-UP and PAY TO RIDER methods
          const shouldShowFree = isFree && 
            !method.name.includes("LOCAL PICK-UP") && 
            !method.name.includes("PAY TO RIDER");
          
          const costDisplay = shouldShowFree 
            ? "FREE" 
            : (cost > 0 ? formatCurrency(convert(cost), displayCurrency) : "");
          
          const displayText = `${method.name}${method.estimatedDays ? ` (${method.estimatedDays})` : ""}${costDisplay ? ` - ${costDisplay}` : ""}`;

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
            <p className="font-medium mb-1">{selectedMethod.name}</p>
            {selectedMethod.description && (
              <p className="text-gray-600 mb-1">{selectedMethod.description}</p>
            )}
            {selectedMethod.estimatedDays && (
              <p className="text-xs text-gray-500">Estimated: {selectedMethod.estimatedDays}</p>
            )}
            {selectedMethod.calculatedCost > 0 && (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Shipping Cost:</span>
                <span className="text-base font-bold text-gray-900">
                  {formatCurrency(convert(selectedMethod.calculatedCost), displayCurrency)}
                </span>
              </div>
            )}
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
