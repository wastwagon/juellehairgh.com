import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: string = "GHS",
  locale: string = "en-GH"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPrice(
  amountGhs: number,
  rate: number,
  displayCurrency: string
): number {
  return Number((amountGhs * rate).toFixed(2));
}

export function formatOrderStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Calculate the best sale price and discount for a product
 * For variation products, finds the variant with the best discount
 * Returns regular price, sale price, discount percentage, and whether product is on sale
 */
export function calculateProductSalePrice(product: {
  priceGhs: number;
  compareAtPriceGhs?: number | null;
  variants?: Array<{
    priceGhs?: number | null;
    compareAtPriceGhs?: number | null;
  }>;
}): {
  regularPrice: number;
  salePrice: number | null;
  isOnSale: boolean;
  discountPercent: number;
} {
  const hasVariants = product.variants && product.variants.length > 0;
  
  // For simple products, use product-level prices
  if (!hasVariants) {
    const regularPrice = Number(product.priceGhs);
    const salePrice = product.compareAtPriceGhs ? Number(product.compareAtPriceGhs) : null;
    const isOnSale = salePrice !== null && salePrice < regularPrice;
    const discountPercent = isOnSale
      ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
      : 0;
    
    return {
      regularPrice,
      salePrice,
      isOnSale,
      discountPercent,
    };
  }
  
  // For variation products, find the best sale price from all variants
  let bestRegularPrice = Number(product.priceGhs);
  let bestSalePrice: number | null = null;
  let bestDiscountPercent = 0;
  
  // Check all variants for sale prices
  for (const variant of product.variants) {
    const variantRegularPrice = variant.priceGhs ? Number(variant.priceGhs) : Number(product.priceGhs);
    const variantSalePrice = variant.compareAtPriceGhs ? Number(variant.compareAtPriceGhs) : null;
    
    if (variantSalePrice !== null && variantSalePrice < variantRegularPrice) {
      const variantDiscountPercent = Math.round(((variantRegularPrice - variantSalePrice) / variantRegularPrice) * 100);
      
      // Keep the variant with the highest discount percentage
      if (variantDiscountPercent > bestDiscountPercent) {
        bestRegularPrice = variantRegularPrice;
        bestSalePrice = variantSalePrice;
        bestDiscountPercent = variantDiscountPercent;
      }
    }
  }
  
  // If no variant is on sale, check product-level sale price
  if (bestDiscountPercent === 0 && product.compareAtPriceGhs) {
    const productSalePrice = Number(product.compareAtPriceGhs);
    if (productSalePrice < bestRegularPrice) {
      bestSalePrice = productSalePrice;
      bestDiscountPercent = Math.round(((bestRegularPrice - productSalePrice) / bestRegularPrice) * 100);
    }
  }
  
  return {
    regularPrice: bestRegularPrice,
    salePrice: bestSalePrice,
    isOnSale: bestDiscountPercent > 0,
    discountPercent: bestDiscountPercent,
  };
}


