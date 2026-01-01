"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ShoppingCart, User, Heart, Search, Menu, X, Home, Phone, Mail, Package, Facebook, Instagram, Twitter, Clock, Zap, Sparkles, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { SearchBar } from "./search-bar";
import { SearchModal } from "./search-modal";
import { CurrencySelector } from "./currency-selector";
import { useCartStore } from "@/store/cart-store";
import { cn } from "@/lib/utils";
import { Category, Brand } from "@/types";

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

  // Fetch categories for navigation
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useQuery<Category[]>({
    queryKey: ["categories", "navigation"],
    queryFn: async () => {
      try {
        const response = await api.get("/categories");
        const categoriesData = response.data || [];
        
        // Debug logging only in development
        if (process.env.NODE_ENV === 'development' && typeof window !== "undefined") {
          console.log("📋 Categories fetched:", categoriesData.length, "categories");
          const braidsCat = categoriesData.find((cat: Category) => cat.slug === "braids");
          if (braidsCat) {
            console.log("📋 Braids category children:", braidsCat.children?.length || 0, braidsCat.children);
          }
        }
        
        return categoriesData;
      } catch (error) {
        console.error("❌ Error fetching categories:", error);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes (reduced for production debugging)
    retry: 3, // Retry failed requests
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Always refetch on mount
    cacheTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  // Fetch brands for navigation
  const { data: brands } = useQuery<Brand[]>({
    queryKey: ["brands", "navigation"],
    queryFn: async () => {
      try {
        const response = await api.get("/brands");
        return response.data || [];
      } catch (error) {
        console.error("Error fetching brands:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Build navigation structure matching the website menu
  // Order: Home, Shop All, Braids, Ponytails, Lace Wigs, Clip-Ins, Hair Growth Oils, Brands
  const getCategoryBySlug = (slug: string) => {
    return categories?.find((cat) => cat.slug === slug);
  };

  const braidsCategory = getCategoryBySlug("braids");
  const ponytailsCategory = getCategoryBySlug("ponytails");
  const laceWigsCategory = getCategoryBySlug("lace-wigs");
  const clipInsCategory = getCategoryBySlug("clip-ins");
  const hairGrowthOilsCategory = getCategoryBySlug("hair-growth-oils");

  // Debug: Log category children counts (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && categories && typeof window !== "undefined") {
      console.log("📋 Navigation Debug:", {
        braidsChildren: braidsCategory?.children?.length || 0,
        ponytailsChildren: ponytailsCategory?.children?.length || 0,
        laceWigsChildren: laceWigsCategory?.children?.length || 0,
        clipInsChildren: clipInsCategory?.children?.length || 0,
        categoriesError: categoriesError?.message,
        categoriesLoading,
      });
    }
  }, [categories, braidsCategory, ponytailsCategory, laceWigsCategory, clipInsCategory, categoriesError, categoriesLoading]);

  const navItems = [
    { name: "Home", href: "/", icon: Home, hasDropdown: false },
    { name: "Shop All", href: "/categories/shop-all", hasDropdown: false },
    {
      name: "Braids",
      href: "/categories/braids",
      hasDropdown: true,
      subItems: braidsCategory?.children?.map((child) => ({
        name: child.name,
        href: `/categories/${child.slug}`,
      })) || [],
    },
    {
      name: "Ponytails",
      href: "/categories/ponytails",
      hasDropdown: true,
      subItems: ponytailsCategory?.children?.map((child) => ({
        name: child.name,
        href: `/categories/${child.slug}`,
      })) || [],
    },
    {
      name: "Lace Wigs",
      href: "/categories/lace-wigs",
      hasDropdown: true,
      subItems: [
        ...(laceWigsCategory?.children?.map((child) => ({
          name: child.name,
          href: `/categories/${child.slug}`,
        })) || []),
        // Add Wig Care to Lace Wigs dropdown (it's standalone but appears here too)
        ...(getCategoryBySlug("wig-care") ? [{
          name: "Wig Care",
          href: "/categories/wig-care",
        }] : []),
      ],
    },
    {
      name: "Clip-Ins",
      href: "/categories/clip-ins",
      hasDropdown: true,
      subItems: clipInsCategory?.children?.map((child) => ({
        name: child.name,
        href: `/categories/${child.slug}`,
      })) || [],
    },
    {
      name: "Hair Growth Oils",
      href: "/categories/hair-growth-oils",
      hasDropdown: false,
    },
    {
      name: "Brands",
      href: "/brands",
      hasDropdown: true,
      subItems: brands?.map((brand) => ({
        name: brand.name,
        href: `/brands/${brand.slug}`,
      })) || [],
    },
    {
      name: "Wig Care",
      href: "/categories/wig-care",
      hasDropdown: false,
    },
    {
      name: "Contact Us",
      href: "/contact",
      hasDropdown: false,
    },
  ];

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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
      <div className="bg-black text-white text-xs md:text-sm">
        <div className="container mx-auto px-3 md:px-4">
          <div className="flex items-center justify-between py-2 md:py-2.5">
            {/* Left Side - Phone & Email */}
            <div className="hidden md:flex items-center gap-4">
              {phone && (
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="flex items-center gap-1.5 hover:text-gray-300 transition-colors"
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
                    className="flex items-center gap-1.5 hover:text-gray-300 transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>{email}</span>
                  </a>
                </>
              )}
            </div>

            {/* Middle - Flash Sale Content */}
            {flashSale && timeLeft ? (
              <div className="hidden md:flex items-center gap-2 md:gap-3 flex-1 justify-center">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4 animate-pulse text-pink-300" />
                  <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4 animate-pulse text-yellow-300" />
                  <span className="font-bold text-xs md:text-sm whitespace-nowrap">{flashSale.title || "Christmas Mega Sale"}</span>
                  {(flashSale.discountPercent || 30) && (
                    <span className="bg-white/20 px-2 py-0.5 rounded text-xs md:text-sm font-semibold whitespace-nowrap">
                      {Number(flashSale.discountPercent || 30).toFixed(0)}% OFF
                    </span>
                  )}
                </div>
                <div className="hidden lg:flex items-center gap-2">
                  <Clock className="h-3 w-3 md:h-3.5 md:w-3.5" />
                  <span className="text-xs md:text-sm">Ends in:</span>
                </div>
                <div className="hidden lg:flex gap-1 md:gap-1.5">
                  <div className="bg-white/20 rounded px-1.5 py-0.5 min-w-[30px] md:min-w-[35px] text-center">
                    <div className="text-xs md:text-sm font-bold">{String(timeLeft.days).padStart(2, "0")}</div>
                    <div className="text-[9px] md:text-[10px] opacity-90">D</div>
                  </div>
                  <div className="bg-white/20 rounded px-1.5 py-0.5 min-w-[30px] md:min-w-[35px] text-center">
                    <div className="text-xs md:text-sm font-bold">{String(timeLeft.hours).padStart(2, "0")}</div>
                    <div className="text-[9px] md:text-[10px] opacity-90">H</div>
                  </div>
                  <div className="bg-white/20 rounded px-1.5 py-0.5 min-w-[30px] md:min-w-[35px] text-center">
                    <div className="text-xs md:text-sm font-bold">{String(timeLeft.minutes).padStart(2, "0")}</div>
                    <div className="text-[9px] md:text-[10px] opacity-90">M</div>
                  </div>
                  <div className="bg-white/20 rounded px-1.5 py-0.5 min-w-[30px] md:min-w-[35px] text-center">
                    <div className="text-xs md:text-sm font-bold">{String(timeLeft.seconds).padStart(2, "0")}</div>
                    <div className="text-[9px] md:text-[10px] opacity-90">S</div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Right Side - Icons, Order Tracking & Social Media */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Search Icon */}
              <button
                onClick={() => setSearchModalOpen(true)}
                className="p-1.5 hover:bg-white/10 rounded transition-all duration-200"
                title="Search"
              >
                <Search className="h-4 w-4 md:h-4.5 md:w-4.5 text-white hover:text-gray-300 transition-colors" />
              </button>
              
              {/* Wishlist Icon */}
              <Link 
                href="/account/wishlist" 
                className="p-1.5 hover:bg-white/10 rounded relative transition-all duration-200"
                title="Wishlist"
              >
                <Heart className="h-4 w-4 md:h-4.5 md:w-4.5 text-white hover:text-pink-300 transition-colors" />
              </Link>
              
              {/* Shopping Cart Icon */}
              <Link 
                href="/cart" 
                className="p-1.5 hover:bg-white/10 rounded relative transition-all duration-200"
                title="Shopping Cart"
              >
                <ShoppingCart className="h-4 w-4 md:h-4.5 md:w-4.5 text-white hover:text-gray-300 transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-semibold shadow-lg">
                    {cartCount}
                  </span>
                )}
              </Link>
              
              {/* User Profile Icon */}
              <Link
                href="/account"
                className="p-1.5 hover:bg-white/10 rounded transition-all duration-200"
                title="My Account"
              >
                <User className="h-4 w-4 md:h-4.5 md:w-4.5 text-white hover:text-gray-300 transition-colors" />
              </Link>
              
              {/* Separator */}
              <span className="text-white/30 hidden md:inline mx-1">|</span>
              
              {/* Order Tracking */}
              <Link
                href="/orders/track"
                className="hidden md:flex items-center gap-1.5 hover:text-gray-300 transition-colors"
              >
                <Package className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Order Tracking</span>
              </Link>
              
              {/* Social Media Icons */}
              {facebook && (
                <>
                  <span className="text-white/30 hidden md:inline mx-1">|</span>
                  <a
                    href={facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-white/20 transition-all duration-200 hover:scale-110"
                    title="Facebook"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                </>
              )}
              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-white/20 transition-all duration-200 hover:scale-110"
                  title="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {twitter && (
                <a
                  href={twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-7 h-7 rounded-full hover:bg-white/20 transition-all duration-200 hover:scale-110"
                  title="Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              )}
              
              {/* Separator */}
              <span className="text-white/30 hidden md:inline mx-1">|</span>
              
              {/* Currency Selector */}
              <div className="hidden md:block">
                <CurrencySelector />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-3 md:px-4">
          <div className="flex h-14 md:h-16 items-center justify-between gap-2">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
              <img
                src="/logo.png"
                alt="Juelle Hair"
                className="h-10 md:h-14 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-0.5 flex-nowrap relative">
              {navItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                const isDropdownOpen = openDropdown === item.name;
                
                return (
                  <div
                    key={item.name}
                    className="relative flex-shrink-0"
                    onMouseEnter={() => item.hasDropdown && setOpenDropdown(item.name)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "px-2 xl:px-3 py-2 text-xs xl:text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-1 xl:gap-1.5 whitespace-nowrap",
                        active
                        ? "bg-pink-600 text-white shadow-lg font-semibold"
                        : "text-gray-700 hover:text-pink-600 hover:bg-pink-50"
                      )}
                    >
                      {Icon && <Icon className="h-3.5 w-3.5 xl:h-4 xl:w-4 flex-shrink-0" />}
                      <span className="truncate">{item.name}</span>
                      {item.hasDropdown && (
                        <ChevronDown className={cn(
                          "h-3 w-3 xl:h-3.5 xl:w-3.5 transition-transform duration-200 flex-shrink-0",
                          isDropdownOpen && "rotate-180"
                        )} />
                      )}
                    </Link>
                    
                    {/* Dropdown Menu */}
                    {item.hasDropdown && isDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-2">
                        {categoriesLoading ? (
                          <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
                        ) : item.subItems && item.subItems.length > 0 ? (
                          item.subItems.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-pink-600 transition-colors"
                              onClick={() => setOpenDropdown(null)}
                            >
                              {subItem.name}
                            </Link>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-sm text-gray-500">
                            No subcategories available
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Right Side - Mobile Menu Button Only */}
            <div className="flex items-center">
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
                const isDropdownOpen = openDropdown === item.name;
                
                return (
                  <div key={item.name}>
                    <div className="flex items-center justify-between">
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all flex-1",
                          active
                            ? "bg-pink-600 text-white shadow-lg font-semibold"
                            : "text-gray-700 hover:bg-pink-50"
                        )}
                        onClick={() => {
                          if (!item.hasDropdown) {
                            setMobileMenuOpen(false);
                          }
                        }}
                      >
                        {Icon && <Icon className="h-5 w-5" />}
                        {item.name}
                      </Link>
                      {item.hasDropdown && (
                        <button
                          onClick={() => setOpenDropdown(isDropdownOpen ? null : item.name)}
                          className="px-4 py-3 text-gray-700"
                        >
                          <ChevronDown className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            isDropdownOpen && "rotate-180"
                          )} />
                        </button>
                      )}
                    </div>
                    {item.hasDropdown && isDropdownOpen && item.subItems && item.subItems.length > 0 && (
                      <div className="pl-8 pr-4 pb-2 space-y-1">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className="block px-4 py-2 text-sm text-gray-600 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                            onClick={() => {
                              setMobileMenuOpen(false);
                              setOpenDropdown(null);
                            }}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
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

