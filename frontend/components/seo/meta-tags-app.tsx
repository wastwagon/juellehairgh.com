"use client";

// For Next.js App Router - use next/head in client components
// This is a workaround since App Router doesn't support dynamic metadata in client components
// For production, consider using generateMetadata in page.tsx files

import { useEffect } from "react";

interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

export function MetaTags({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  twitterCard = "summary_large_image",
  canonicalUrl,
  noindex = false,
  nofollow = false,
}: MetaTagsProps) {
  const siteName = "Juelle Hair Ghana";
  const defaultTitle = `${siteName} - Premium Hair Products`;
  const defaultDescription = "Shop premium wigs, braids, and hair care products in Ghana";
  const defaultImage = "/logo.png";

  const finalTitle = title || defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalOgTitle = ogTitle || finalTitle;
  const finalOgDescription = ogDescription || finalDescription;
  const finalOgImage = ogImage || defaultImage;
  const finalCanonical = canonicalUrl || (typeof window !== "undefined" ? window.location.href : "");

  useEffect(() => {
    // Update document title
    document.title = finalTitle;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? "property" : "name";
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Update or create link tags
    const updateLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!element) {
        element = document.createElement("link");
        element.setAttribute("rel", rel);
        document.head.appendChild(element);
      }
      element.setAttribute("href", href);
    };

    // Basic meta tags
    updateMetaTag("description", finalDescription);
    if (keywords && keywords.length > 0) {
      updateMetaTag("keywords", keywords.join(", "));
    }

    // Robots
    if (noindex) {
      updateMetaTag("robots", "noindex");
    } else if (nofollow) {
      updateMetaTag("robots", "nofollow");
    } else {
      updateMetaTag("robots", "index, follow");
    }

    // Canonical
    if (finalCanonical) {
      updateLinkTag("canonical", finalCanonical);
    }

    // Open Graph
    updateMetaTag("og:type", "website", true);
    updateMetaTag("og:title", finalOgTitle, true);
    updateMetaTag("og:description", finalOgDescription, true);
    updateMetaTag("og:image", finalOgImage, true);
    updateMetaTag("og:url", finalCanonical, true);
    updateMetaTag("og:site_name", siteName, true);

    // Twitter Card
    updateMetaTag("twitter:card", twitterCard);
    updateMetaTag("twitter:title", finalOgTitle);
    updateMetaTag("twitter:description", finalOgDescription);
    updateMetaTag("twitter:image", finalOgImage);
  }, [
    finalTitle,
    finalDescription,
    keywords,
    finalOgTitle,
    finalOgDescription,
    finalOgImage,
    finalCanonical,
    noindex,
    nofollow,
    twitterCard,
  ]);

  return null; // This component doesn't render anything
}








