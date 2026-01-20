export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  title?: string;
  comment?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name?: string;
    email: string;
  };
}

export interface ProductSEO {
  id: string;
  productId: string;
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  keywords?: string[];
  schemaType?: string;
  schemaData?: any;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  description: string;
  brand?: string | Brand; // Can be string or Brand object
  brandId?: string;
  priceGhs: number;
  compareAtPriceGhs?: number;
  images: string[];
  badges?: string[];
  categoryId: string;
  category?: Category;
  variants?: ProductVariant[];
  reviews?: Review[];
  seo?: ProductSEO;
  sku?: string;
  stock?: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  value: string;
  image?: string; // Image URL for this variant (e.g., color swatch)
  priceGhs?: number;
  compareAtPriceGhs?: number; // Sale price for this variant
  stock: number;
  sku?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  image?: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  products?: Product[];
}

export interface CartItem {
  productId: string;
  variantId?: string; // Keep for backward compatibility
  variantIds?: string[]; // Array of variant IDs for multiple selections (Color + Length, etc.)
  variants?: ProductVariant[]; // Full variant objects for display
  quantity: number;
  product?: Partial<Product>; // Make product optional and partial to allow incomplete product data
  variant?: ProductVariant; // Keep for backward compatibility - use variants array instead
}

export interface Cart {
  id: string;
  userId?: string;
  items: CartItem[];
  totalGhs: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  user?: User;
  status: OrderStatus;
  totalGhs: number;
  displayCurrency?: string;
  displayTotal?: number;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  paymentReference?: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string; // Keep for backward compatibility
  variantIds?: string[]; // Array of variant IDs for multiple selections (Color + Length, etc.)
  quantity: number;
  priceGhs: number;
  product?: Product;
  variant?: ProductVariant;
}

export type OrderStatus = "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface Address {
  id?: string;
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region: string;
  postalCode?: string;
  country: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  profilePicture?: string;
  displayCurrency?: string;
  emailMarketing?: boolean;
  emailOrderUpdates?: boolean;
  emailReviewReminders?: boolean;
  emailNewsletter?: boolean;
  addresses?: Address[];
  role?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CurrencyRate {
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  updatedAt: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export type WalletTransactionType = "TOP_UP" | "PAYMENT" | "REFUND" | "ADMIN_ADD" | "ADMIN_DEDUCT";

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  user?: {
    id: string;
    email: string;
    name?: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: WalletTransactionType;
  amount: number;
  balanceAfter: number;
  description?: string;
  reference?: string;
  orderId?: string;
  createdAt: string;
  wallet?: Wallet;
}

