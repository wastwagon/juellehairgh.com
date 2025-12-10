"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  User, 
  Package, 
  MapPin, 
  Heart, 
  Settings,
  Wallet,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/auth";

interface AccountLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/account", label: "Overview", icon: User },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/wallet", label: "Wallet", icon: Wallet },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/settings", label: "Settings", icon: Settings },
];

export function AccountLayout({ children }: AccountLayoutProps) {
  const pathname = usePathname();

  const handleLogout = () => {
    if (confirm("Are you sure you want to sign out?")) {
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8 container mx-auto px-4 py-6 md:py-8">
        <aside className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm sticky top-20 lg:top-24">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || 
                  (item.href !== "/account" && pathname?.startsWith(item.href));
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "bg-primary text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full text-left transition-all"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </nav>
          </div>
        </aside>

        <main className="lg:col-span-3">
          {children}
        </main>
      </div>
    </div>
  );
}

