"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Heart, User, Search } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { SearchModal } from "./search-modal";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { getTotalItems } = useCartStore();
  const cartCount = getTotalItems();
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Shop", href: "/categories/shop-all", icon: ShoppingBag },
    { name: "Search", href: "#", icon: Search, action: "search" },
    { name: "Wishlist", href: "/account/wishlist", icon: Heart },
    { name: "Account", href: "/account", icon: User },
  ];

  // Hide on certain pages (admin, auth pages)
  const hideOnPages = ["/admin", "/auth"];
  const shouldHide = hideOnPages.some((page) => pathname?.startsWith(page));

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    if (href === "#") return false;
    return pathname?.startsWith(href);
  };

  const handleItemClick = (item: typeof navItems[0], e: React.MouseEvent) => {
    if (item.action === "search") {
      e.preventDefault();
      setSearchModalOpen(true);
    }
  };

  if (shouldHide) return null;

  return (
    <>
      {/* Bottom Navigation - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl lg:hidden safe-area-inset-bottom">
        <div className="flex items-center justify-around h-20 px-1 pb-2 pt-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            const isCart = item.href === "/cart";
            const count = isCart ? cartCount : 0;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => handleItemClick(item, e)}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full relative transition-all duration-200",
                  active && "text-purple-600"
                )}
              >
                <div className="relative mb-1">
                  <div
                    className={cn(
                      "p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center",
                      active
                        ? "bg-pink-600 shadow-lg"
                        : "hover:bg-gray-50"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-6 w-6 transition-all duration-200",
                        active ? "text-white" : "text-gray-700"
                      )}
                    />
                  </div>
                  {count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg border-2 border-white">
                      {count > 9 ? "9+" : count}
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-[11px] font-medium transition-all duration-200",
                    active ? "font-semibold text-purple-600" : "text-gray-700"
                  )}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Search Modal */}
      <SearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />

      {/* Spacer for bottom nav on mobile */}
      <div className="mobile-bottom-nav-spacer lg:hidden" />
    </>
  );
}

