"use client";

import { useEffect } from "react";

interface HomePageStructuredDataProps {
  siteUrl: string;
}

export function HomePageStructuredData({ siteUrl }: HomePageStructuredDataProps) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Organization Schema
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Le Juelle Hair",
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
      description: "Premium wigs, braids, and hair care products in Ghana",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Accra",
        addressRegion: "Greater Accra",
        addressCountry: "GH",
        streetAddress: "Dansoman",
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+233-539-506-949",
        contactType: "Customer Service",
        email: "sales@juellehairgh.com",
        areaServed: "GH",
        availableLanguage: ["en"],
      },
      sameAs: [
        // Add your social media URLs here when available
        // "https://www.facebook.com/juellehair",
        // "https://www.instagram.com/juellehair",
      ],
    };

    // WebSite Schema with SearchAction
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Le Juelle Hair",
      url: siteUrl,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteUrl}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    };

    // Store Schema
    const storeSchema = {
      "@context": "https://schema.org",
      "@type": "Store",
      name: "Le Juelle Hair",
      image: `${siteUrl}/logo.png`,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Accra",
        addressRegion: "Greater Accra",
        addressCountry: "GH",
        streetAddress: "Dansoman",
      },
      telephone: "+233-539-506-949",
      priceRange: "$$",
      currenciesAccepted: "GHS",
      paymentAccepted: "Cash, Credit Card, Mobile Money",
    };

    // Remove existing schemas
    const existingSchemas = document.querySelectorAll('script[data-homepage-schema="true"]');
    existingSchemas.forEach((script) => script.remove());

    // Add Organization schema
    const orgScript = document.createElement("script");
    orgScript.type = "application/ld+json";
    orgScript.setAttribute("data-homepage-schema", "true");
    orgScript.setAttribute("data-schema-type", "organization");
    orgScript.text = JSON.stringify(organizationSchema);
    document.head.appendChild(orgScript);

    // Add WebSite schema
    const webScript = document.createElement("script");
    webScript.type = "application/ld+json";
    webScript.setAttribute("data-homepage-schema", "true");
    webScript.setAttribute("data-schema-type", "website");
    webScript.text = JSON.stringify(websiteSchema);
    document.head.appendChild(webScript);

    // Add Store schema
    const storeScript = document.createElement("script");
    storeScript.type = "application/ld+json";
    storeScript.setAttribute("data-homepage-schema", "true");
    storeScript.setAttribute("data-schema-type", "store");
    storeScript.text = JSON.stringify(storeSchema);
    document.head.appendChild(storeScript);

    return () => {
      const schemasToRemove = document.querySelectorAll('script[data-homepage-schema="true"]');
      schemasToRemove.forEach((script) => script.remove());
    };
  }, [siteUrl]);

  return null;
}
