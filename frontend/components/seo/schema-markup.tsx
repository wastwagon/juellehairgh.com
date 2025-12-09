"use client";

import { useEffect } from "react";

interface SchemaMarkupProps {
  schema: any;
}

export function SchemaMarkup({ schema }: SchemaMarkupProps) {
  useEffect(() => {
    if (!schema || typeof window === "undefined") return;

    // Remove existing schema script if any
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new schema script
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount
      const scriptToRemove = document.querySelector('script[type="application/ld+json"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [schema]);

  return null; // This component doesn't render anything
}







