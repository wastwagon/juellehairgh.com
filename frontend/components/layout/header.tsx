"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ShoppingCart, User, Heart, Search, Menu, X, Home, Phone, Mail, Package, Facebook, Instagram, Twitter, Clock, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { SearchBar } from "./search-bar";
import { SearchModal } from "./search-modal";
import { CurrencySelector } from "./currency-selector";
import { useCartStore } from "@/store/cart-store";
import { cn } from "@/lib/utils";

export function Header() {
  const { getTotalItems, items } = useCartStore();
  const [cartCount, setCartCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Fetch site settings for top bar
  const { data: settings } = useQuery({
    queryKey: ["settings", "site"],
    queryFn: async () => {
      try {
        const response = await api.get("/settings/site");
        return response.data || {};
      } catch (error) {
        console.error("Error fetching settings:", error);
        return {};
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      setCartCount(getTotalItems());
    }
  }, [mounted, items, getTotalItems]);
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  // Fetch active flash sale
  const { data: flashSale } = useQuery({
    queryKey: ["flash-sales", "active"],
    queryFn: async () => {
      try {
        const response = await api.get("/flash-sales/active");
        return response.data;
      } catch (error) {
        return null;
      }
    },
    refetchInterval: 1000, // Refetch every second to update countdown
  });

  // Update countdown timer
  useEffect(() => {
    if (!flashSale) {
      setTimeLeft(null);
      return;
    }

    const updateCountdown = () => {
      const now = new Date().getTime();
      const end = new Date(flashSale.endDate).getTime();
      const difference = end - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [flashSale]);

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Shop All", href: "/categories/shop-all" },
    { name: "Sale", href: "/sale" },
    { name: "Lace Wigs", href: "/categories/lace-wigs" },
    { name: "Braids", href: "/categories/braids" },
    { name: "Ponytails", href: "/categories/ponytails" },
    { name: "Hair Care", href: "/categories/wig-care" },
    { name: "Clip-ins", href: "/categories/clip-ins" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(href);
  };

  const phone = settings?.phone || "+233539506949";
  const email = settings?.email || "sales@juellehairgh.com";
  const facebook = settings?.facebook || "";
  const instagram = settings?.instagram || "";
  const twitter = settings?.twitter || "";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-sm shadow-sm">
      {/* Top Bar - Phone, Email, Order Tracking, Social Media */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white text-xs md:text-sm">
        <div className="container mx-auto px-3 md:px-4">
          <div className="flex items-center justify-between py-2 md:py-2.5">
            {/* Left Side - Phone & Email */}
            <div className="hidden md:flex items-center gap-4">
              {phone && (
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="flex items-center gap-1.5 hover:text-purple-200 transition-colors"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>{phone}</span>
                </a>
              )}
              {email && (
                <>
                  <span className="text-white/60">|</span>
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-1.5 hover:text-purple-200 transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>{email}</span>
                  </a>
                </>
              )}
            </div>

            {/* Right Side - Order Tracking & Social Media */}
            <div className="flex items-center gap-3 md:gap-4">
              <Link
                href="/orders/track"
                className="flex items-center gap-1.5 hover:text-purple-200 transition-colors"
              >
                <Package className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Order Tracking</span>
              </Link>
              {facebook && (
                <>
                  <span className="text-white/60 hidden md:inline">|</span>
                  <a
                    href={facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-purple-200 transition-colors"
                    title="Facebook"
                  >
                    <Facebook className="h-3.5 w-3.5" />
                    <span className="hidden lg:inline">Facebook</span>
                  </a>
                </>
              )}
              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-purple-200 transition-colors"
                  title="Instagram"
                >
                  <Instagram className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline">Instagram</span>
                </a>
              )}
              {twitter && (
                <a
                  href={twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-purple-200 transition-colors"
                  title="Twitter"
                >
                  <Twitter className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline">Twitter</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Flash Sale Counter Banner */}
      {flashSale && timeLeft ? (
        <div className="bg-gradient-to-r from-red-600 via-orange-600 to-red-600 text-white py-2 md:py-3 px-2">
          <div className="container mx-auto">
            <div className="flex items-center justify-center gap-2 md:gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 md:h-5 md:w-5 animate-pulse" />
                <span className="font-bold text-xs md:text-sm whitespace-nowrap">{flashSale.title}</span>
                {flashSale.discountPercent && (
                  <span className="bg-white/20 px-2 py-0.5 rounded text-xs md:text-sm font-semibold whitespace-nowrap">
                    {Number(flashSale.discountPercent).toFixed(0)}% OFF
                  </span>
                )}
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="text-xs md:text-sm">Ends in:</span>
              </div>
              <div className="flex gap-1.5 md:gap-2">
                <div className="bg-white/20 rounded px-2 py-1 min-w-[35px] md:min-w-[45px] text-center">
                  <div className="text-sm md:text-base font-bold">{String(timeLeft.days).padStart(2, "0")}</div>
                  <div className="text-[10px] md:text-xs opacity-90">D</div>
                </div>
                <div className="bg-white/20 rounded px-2 py-1 min-w-[35px] md:min-w-[45px] text-center">
                  <div className="text-sm md:text-base font-bold">{String(timeLeft.hours).padStart(2, "0")}</div>
                  <div className="text-[10px] md:text-xs opacity-90">H</div>
                </div>
                <div className="bg-white/20 rounded px-2 py-1 min-w-[35px] md:min-w-[45px] text-center">
                  <div className="text-sm md:text-base font-bold">{String(timeLeft.minutes).padStart(2, "0")}</div>
                  <div className="text-[10px] md:text-xs opacity-90">M</div>
                </div>
                <div className="bg-white/20 rounded px-2 py-1 min-w-[35px] md:min-w-[45px] text-center">
                  <div className="text-sm md:text-base font-bold">{String(timeLeft.seconds).padStart(2, "0")}</div>
                  <div className="text-[10px] md:text-xs opacity-90">S</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white text-center py-2 md:py-2.5 text-xs md:text-sm font-medium px-2">
          <p>💥 Black Friday Sale - Everything Must Go! 💥</p>
        </div>
      )}

      {/* Main Header */}
      <div className="bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-3 md:px-4">
          <div className="flex h-14 md:h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <img
                src="/logo.png"
                alt="Juelle Hair"
                className="h-10 md:h-14 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2",
                      active
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg font-semibold"
                        : "text-gray-700 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50"
                    )}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSearchModalOpen(true)}
                className="p-2 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-lg transition-all duration-200"
                title="Search"
              >
                <Search className="h-5 w-5 text-gray-700 hover:text-purple-600 transition-colors" />
              </button>
              <Link href="/account/wishlist" className="p-2 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-lg relative transition-all duration-200">
                <Heart className="h-5 w-5 text-gray-700 hover:text-pink-600 transition-colors" />
              </Link>
              <div className="hidden md:block">
                <CurrencySelector />
              </div>
              <Link href="/cart" className="p-2 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-lg relative transition-all duration-200">
                <ShoppingCart className="h-5 w-5 text-gray-700 hover:text-purple-600 transition-colors" />
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold shadow-lg" style={{ display: cartCount > 0 ? 'flex' : 'none' }}>
                  {cartCount > 0 ? cartCount : ''}
                </span>
              </Link>
              <Link
                href="/account"
                className="p-2 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 rounded-lg transition-all duration-200"
                title="My Account"
              >
                <User className="h-5 w-5 text-gray-700 hover:text-purple-600 transition-colors" />
              </Link>
              <button
                className="lg:hidden p-2 hover:bg-gray-100 rounded-md"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 text-gray-700" />
                ) : (
                  <Menu className="h-5 w-5 text-gray-700" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t bg-white shadow-lg">
            <div className="container mx-auto px-4 py-4 space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all",
                      active
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg font-semibold"
                        : "text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {Icon && <Icon className="h-5 w-5" />}
                    {item.name}
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  setSearchModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="md:hidden px-4 py-2 pt-4 border-t w-full flex items-center gap-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <Search className="h-5 w-5" />
                <span>Search</span>
              </button>
              <div className="md:hidden px-4 py-2">
                <CurrencySelector />
              </div>
            </div>
          </div>
        )}

        {/* Search Modal */}
        <SearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
      </div>
    </header>
  );
}

