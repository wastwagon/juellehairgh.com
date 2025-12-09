"use client";

import Link from "next/link";
import { useState } from "react";
import { Facebook, Youtube, Instagram, Twitter, Mail, Phone, MapPin, CreditCard, Shield, Truck, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
    console.log("Newsletter subscription:", email);
    setEmail("");
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="hidden md:block bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Juelle Hair
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Premium hair products for every style. Shop the latest wigs, braids, and hair care products.
              </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone className="h-4 w-4 text-gray-400" />
                <a href="tel:+233539506949" className="hover:text-gray-900 transition-colors">
                  +(233) 539506949
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Mail className="h-4 w-4 text-gray-400" />
                <a href="mailto:sales@juellehairgh.com" className="hover:text-gray-900 transition-colors">
                  sales@juellehairgh.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>Dansoman, Accra, Ghana</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5 text-gray-700" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5 text-gray-700" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5 text-gray-700" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5 text-gray-700" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-base font-semibold mb-6 text-gray-900">
              Shop
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/categories/lace-wigs" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Lace Wigs
                </Link>
              </li>
              <li>
                <Link href="/categories/braids" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Braids
                </Link>
              </li>
              <li>
                <Link href="/categories/ponytails" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Ponytails
                </Link>
              </li>
              <li>
                <Link href="/categories/clip-ins" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Clip-ins
                </Link>
              </li>
              <li>
                <Link href="/categories/hair-growth-oils" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Hair Growth Oils
                </Link>
              </li>
            </ul>
          </div>

          {/* Collections */}
          <div>
            <h4 className="text-base font-semibold mb-6 text-gray-900">
              Collections
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/collections/new-arrivals" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/collections/best-sellers" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link href="/collections/featured-products" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Featured Products
                </Link>
              </li>
              <li>
                <Link href="/collections/protective-styles" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Protective Styles
                </Link>
              </li>
              <li>
                <Link href="/collections/trending" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Trending
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-base font-semibold mb-6 text-gray-900">
              Customer Service
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/account/orders" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Track My Order
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Return & Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-base font-semibold mb-6 text-gray-900">
              Newsletter
            </h4>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Sign up for exclusive offers, original stories, events and more.
            </p>
            <form
              onSubmit={handleNewsletterSubmit}
              className="space-y-3"
              data-form-id="newsletter"
              data-form-name="Newsletter Subscription"
              data-form-type="newsletter"
            >
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-gray-400"
                required
              />
              <Button
                type="submit"
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium transition-colors"
              >
                <Mail className="h-4 w-4 mr-2" />
                Subscribe
              </Button>
            </form>

            {/* Trust Badges */}
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Shield className="h-4 w-4 text-gray-400" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Truck className="h-4 w-4 text-gray-400" />
                <span>Free Shipping on Orders GHS 950+</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Gift className="h-4 w-4 text-gray-400" />
                <span>Rewards Program</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border-t border-gray-200 pt-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-4">We Accept:</p>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                  <CreditCard className="h-5 w-5 text-gray-500" />
                  <span className="text-sm text-gray-700">Visa</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                  <CreditCard className="h-5 w-5 text-gray-500" />
                  <span className="text-sm text-gray-700">Mastercard</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                  <CreditCard className="h-5 w-5 text-gray-500" />
                  <span className="text-sm text-gray-700">Paystack</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                  <CreditCard className="h-5 w-5 text-gray-500" />
                  <span className="text-sm text-gray-700">Mobile Money</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              &copy; {currentYear} Juelle Hair Ghana. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/terms"
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Terms of Service
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                href="/privacy"
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
