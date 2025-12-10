"use client";

import Link from "next/link";
import { useState } from "react";

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MegaMenu({ isOpen, onClose }: MegaMenuProps) {
  if (!isOpen) return null;

  const categories = [
    {
      title: "Sale",
      links: [
        { name: "Sale", href: "/sale" },
        { name: "New Arrivals", href: "/collections/new-arrivals" },
        { name: "Best Sellers", href: "/collections/best-sellers" },
        { name: "Clearance", href: "/sale/clearance" },
      ],
    },
    {
      title: "Lace Wigs",
      links: [
        { name: "Lace Front Wigs", href: "/categories/lace-wigs?type=lace-front" },
        { name: "Full Lace Wigs", href: "/categories/lace-wigs?type=full-lace" },
        { name: "360 Lace Wigs", href: "/categories/lace-wigs?type=360" },
        { name: "HD Lace Wigs", href: "/categories/lace-wigs?type=hd-lace" },
      ],
    },
    {
      title: "Braids",
      links: [
        { name: "Synthetic Hair Braids", href: "/categories/braids?type=synthetic" },
        { name: "Crochet Braids", href: "/categories/braids?type=crochet" },
        { name: "Twist Braids", href: "/categories/braids?type=twist" },
        { name: "Box Braids", href: "/categories/braids?type=box" },
      ],
    },
    {
      title: "Ponytails",
      links: [
        { name: "Drawstring Ponytails", href: "/categories/ponytails?type=drawstring" },
        { name: "Quick Ponytails", href: "/categories/ponytails?type=quick" },
        { name: "Wrap Ponytails", href: "/categories/ponytails?type=wrap" },
      ],
    },
    {
      title: "Hair Care",
      links: [
        { name: "Hair Growth Oils", href: "/categories/hair-growth-oils" },
        { name: "Wig Care", href: "/categories/wig-care" },
        { name: "Shampoo & Conditioner", href: "/categories/wig-care?type=shampoo" },
      ],
    },
  ];

  return (
    <div
      className="absolute top-full left-0 w-full bg-white border-b shadow-xl z-50"
      onMouseLeave={onClose}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {categories.map((category) => (
            <div key={category.title}>
              <h3 className="font-semibold text-sm mb-4 text-gray-900">{category.title}</h3>
              <ul className="space-y-2">
                {category.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-primary transition-colors"
                      onClick={onClose}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

