"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function HashScrollHandler() {
  const pathname = usePathname();

  useEffect(() => {
    // Only handle hash scrolling on the homepage
    if (pathname === "/" && typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash === "#appointment") {
        // Small delay to ensure the DOM is fully rendered
        setTimeout(() => {
          const appointmentSection = document.getElementById("appointment");
          if (appointmentSection) {
            appointmentSection.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
      }
    }
  }, [pathname]);

  return null;
}
