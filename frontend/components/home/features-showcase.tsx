"use client";

import { Shield, Truck, Gift, CreditCard, Headphones, Wallet, Globe, Zap } from "lucide-react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Secure Payments",
    description: "100% secure checkout with Paystack",
  },
  {
    icon: <Truck className="h-6 w-6" />,
    title: "Free Shipping",
    description: "On all orders GHS 950+ within Ghana",
  },
  {
    icon: <Gift className="h-6 w-6" />,
    title: "Rewards System",
    description: "Earn points on every purchase & redeem rewards",
  },
  {
    icon: <CreditCard className="h-6 w-6" />,
    title: "Multiple Payment Options",
    description: "Pay with card, mobile money & more",
  },
  {
    icon: <Headphones className="h-6 w-6" />,
    title: "24/7 Support",
    description: "We're here to help anytime",
  },
  {
    icon: <Wallet className="h-6 w-6" />,
    title: "Quick Checkout",
    description: "Wallet integration for instant payments",
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Multi-Currency",
    description: "Shop in 170+ currencies",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Fast Delivery",
    description: "Same day (Accra), Next day, or standard delivery",
  },
];

export function FeaturesShowcase() {
  return (
    <section className="py-12 md:py-16 bg-white border-t border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-center mb-8 md:mb-12">
          <span className="inline-block px-4 py-1.5 md:px-5 md:py-2 rounded-full bg-pink-600 text-white text-xs md:text-sm font-bold shadow-lg">
            Why Shop With Us
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative overflow-hidden bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
            >
              {/* Background on Hover */}
              <div className="absolute inset-0 bg-pink-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
              
              {/* Content */}
              <div className="relative p-5 md:p-6 flex flex-col items-center text-center">
                {/* Icon Container */}
                <div className="mb-3 md:mb-4 p-3 md:p-4 rounded-2xl bg-pink-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                
                {/* Title */}
                <h3 className="font-bold text-sm md:text-base text-gray-900 mb-1 md:mb-2 group-hover:text-pink-600 transition-colors">
                  {feature.title}
                </h3>
                
                {/* Description */}
                <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
              
              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 bg-pink-600 opacity-5 rounded-bl-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

