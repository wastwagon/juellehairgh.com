"use client";

import { useEffect } from "react";
import { Product } from "@/types";

interface ProductStructuredDataProps {
  product: Product;
  siteUrl: string;
}

export function ProductStructuredData({ product, siteUrl }: ProductStructuredDataProps) {
  useEffect(() => {
    if (typeof window === "undefined" || !product) return;

    // Generate Product schema automatically if not provided in SEO data
    const getImageUrl = (image: string | undefined) => {
      if (!image) return `${siteUrl}/logo.png`;
      if (image.startsWith("http://") || image.startsWith("https://")) return image;
      return `${siteUrl}${image.startsWith("/") ? "" : "/"}${image}`;
    };

    const productImage = product.images?.[0] ? getImageUrl(product.images[0]) : `${siteUrl}/logo.png`;
    const productUrl = `${siteUrl}/products/${product.slug}`;
    const brandName = typeof product.brand === "object" ? product.brand?.name : product.brand || "Le Juelle Hair";
    
    const { regularPrice, salePrice } = {
      regularPrice: product.priceGhs,
      salePrice: product.compareAtPriceGhs ? product.priceGhs : null,
    };

    const productSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.title,
      description: product.description
        ? product.description.replace(/<[^>]*>/g, "").substring(0, 500)
        : `Shop ${product.title} at Le Juelle Hair. Premium quality hair products in Ghana.`,
      image: product.images?.map((img) => getImageUrl(img)) || [productImage],
      brand: {
        "@type": "Brand",
        name: brandName,
      },
      category: product.category?.name || "Hair Products",
      sku: product.sku || product.id,
      mpn: product.sku || product.id,
      offers: {
        "@type": "Offer",
        url: productUrl,
        priceCurrency: "GHS",
        price: regularPrice.toString(),
        availability: product.stock && product.stock > 0 
          ? "https://schema.org/InStock" 
          : "https://schema.org/OutOfStock",
        priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 1 year from now
        seller: {
          "@type": "Organization",
          name: "Le Juelle Hair",
        },
      },
      aggregateRating: product.reviews && product.reviews.length > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: (
              product.reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) /
              product.reviews.length
            ).toFixed(1),
            reviewCount: product.reviews.length,
            bestRating: "5",
            worstRating: "1",
          }
        : undefined,
    };

    // Remove existing product schema
    const existingSchema = document.querySelector('script[data-product-schema="true"]');
    if (existingSchema) {
      existingSchema.remove();
    }

    // Add product schema
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-product-schema", "true");
    script.text = JSON.stringify(productSchema);
    document.head.appendChild(script);

    return () => {
      const schemaToRemove = document.querySelector('script[data-product-schema="true"]');
      if (schemaToRemove) {
        schemaToRemove.remove();
      }
    };
  }, [product, siteUrl]);

  return null;
}
