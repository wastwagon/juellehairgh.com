"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  generateSchema?: boolean;
  className?: string;
}

export function Breadcrumbs({ items, generateSchema = true, className }: BreadcrumbsProps) {
  // Generate BreadcrumbList schema
  useEffect(() => {
    if (!generateSchema || typeof window === "undefined") return;

    const baseUrl = window.location.origin;
    const breadcrumbItems = [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${baseUrl}/`,
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: item.label,
        item: item.href ? `${baseUrl}${item.href}` : undefined,
      })),
    ];

    const schema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbItems.filter((item) => item.item !== undefined),
    };

    // Remove existing breadcrumb schema if any
    const existingScript = document.querySelector('script[data-breadcrumb-schema="true"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new schema script
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-breadcrumb-schema", "true");
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector('script[data-breadcrumb-schema="true"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [items, generateSchema]);

  return (
    <nav
      className={cn(
        "relative flex items-center gap-2 md:gap-3 py-3 px-4 md:px-6 mb-6 md:mb-8",
        "bg-gradient-to-r from-white via-purple-50/30 to-pink-50/30",
        "backdrop-blur-sm border border-purple-100/50 rounded-xl",
        "shadow-sm shadow-purple-100/20",
        "overflow-x-auto scrollbar-hide",
        className
      )}
      aria-label="Breadcrumb"
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-50/20 to-transparent rounded-xl pointer-events-none" />
      
      <div className="relative flex items-center gap-2 md:gap-3 min-w-max">
        {/* Home Icon */}
        <Link
          href="/"
          className={cn(
            "group relative flex items-center justify-center",
            "w-8 h-8 md:w-9 md:h-9 rounded-lg",
            "bg-gradient-to-br from-purple-500 to-pink-500",
            "text-white shadow-md shadow-purple-200/50",
            "hover:shadow-lg hover:shadow-purple-300/50",
            "hover:scale-110 active:scale-95",
            "transition-all duration-300 ease-out",
            "focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
          )}
          aria-label="Home"
        >
          <Home className="h-4 w-4 md:h-5 md:w-5 transition-transform duration-300 group-hover:scale-110" />
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-white rounded-full group-hover:w-4 transition-all duration-300" />
        </Link>

        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2 md:gap-3">
            {/* Separator */}
            <div className="flex items-center">
              <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-purple-300/60 dark:text-purple-400/40" />
            </div>

            {/* Breadcrumb Item */}
            {item.href ? (
              <Link
                href={item.href}
                className={cn(
                  "relative px-3 py-1.5 md:px-4 md:py-2",
                  "text-sm md:text-base font-medium",
                  "text-gray-700 hover:text-purple-600",
                  "rounded-lg transition-all duration-300",
                  "hover:bg-white/80 hover:shadow-sm",
                  "group focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:rounded-lg"
                )}
              >
                <span className="relative z-10">{item.label}</span>
                {/* Hover underline effect */}
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
              </Link>
            ) : (
              <span
                className={cn(
                  "relative px-3 py-1.5 md:px-4 md:py-2",
                  "text-sm md:text-base font-semibold",
                  "text-gray-900",
                  "bg-gradient-to-r from-purple-50 to-pink-50",
                  "rounded-lg border border-purple-200/50",
                  "shadow-sm"
                )}
              >
                {item.label}
                {/* Active indicator */}
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Scroll gradient indicators */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none rounded-l-xl" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none rounded-r-xl" />
    </nav>
  );
}

