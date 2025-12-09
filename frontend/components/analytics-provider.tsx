"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useFormTracking, useLinkTracking, useButtonTracking } from "./analytics/tracking-helpers";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize analytics
    import("@/lib/analytics");
  }, []);

  useEffect(() => {
    // Track page views on route changes
    if (typeof window !== "undefined") {
      import("@/lib/analytics").then(({ analytics }) => {
        analytics.pageView(pathname);
      });
    }
  }, [pathname]);

  // Auto-track forms, links, and buttons
  useFormTracking();
  useLinkTracking();
  useButtonTracking();

  return <>{children}</>;
}

