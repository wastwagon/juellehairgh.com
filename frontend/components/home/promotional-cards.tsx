"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Tag, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PromotionalCard {
  title: string;
  description: string;
  image?: string;
  link: string;
  buttonText: string;
  gradient: string;
  icon: React.ReactNode;
}

const promotionalCards: PromotionalCard[] = [
  {
    title: "Free Shipping",
    description: "On all orders GHS 950+ within Ghana",
    link: "/categories/shop-all",
    buttonText: "Shop Now",
    gradient: "from-purple-500 via-pink-500 to-purple-600",
    icon: <Sparkles className="h-8 w-8" />,
  },
  {
    title: "Special Offers",
    description: "Up to 50% off selected items",
    link: "/sale",
    buttonText: "View Sale",
    gradient: "from-pink-500 via-rose-500 to-pink-600",
    icon: <Tag className="h-8 w-8" />,
  },
  {
    title: "New Customer Bonus",
    description: "Get 10% off your first order",
    link: "/categories/shop-all",
    buttonText: "Claim Offer",
    gradient: "from-purple-600 via-pink-600 to-rose-600",
    icon: <Gift className="h-8 w-8" />,
  },
];

export function PromotionalCards() {
  return (
    <section className="py-8 md:py-12 container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {promotionalCards.map((card, index) => (
          <Link
            key={index}
            href={card.link}
            className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${card.gradient} p-6 md:p-8 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
          >
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
            <div className="relative z-10">
              <div className="mb-4 opacity-90 group-hover:opacity-100 transition-opacity">
                {card.icon}
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2">{card.title}</h3>
              <p className="text-sm md:text-base opacity-90 mb-4">{card.description}</p>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                {card.buttonText}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

