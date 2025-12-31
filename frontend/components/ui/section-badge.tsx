import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionBadgeProps {
  children: ReactNode;
  variant?: "purple" | "pink" | "gradient";
  className?: string;
}

export function SectionBadge({ children, variant = "gradient", className }: SectionBadgeProps) {
  const variantClasses = {
    purple: "bg-gradient-to-r from-purple-600 to-purple-700",
    pink: "bg-gradient-to-r from-pink-600 to-rose-600",
    gradient: "bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600",
  };

  return (
    <span
      className={cn(
        "inline-block px-4 py-1.5 md:px-5 md:py-2 rounded-full text-white text-xs md:text-sm font-bold shadow-lg",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

