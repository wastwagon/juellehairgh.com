"use client";

import { Shield, Truck, Gift, CreditCard, Headphones, Wallet, Globe, Zap } from "lucide-react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

const features: Feature[] = [
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Secure Payments",
    description: "100% secure checkout with Paystack",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    icon: <Truck className="h-6 w-6" />,
    title: "Free Shipping",
    description: "On all orders GHS 950+ within Ghana",
    gradient: "from-pink-500 to-pink-600",
  },
  {
    icon: <Gift className="h-6 w-6" />,
    title: "Rewards System",
    description: "Earn points on every purchase & redeem rewards",
    gradient: "from-purple-500 via-pink-500 to-rose-500",
  },
  {
    icon: <CreditCard className="h-6 w-6" />,
    title: "Multiple Payment Options",
    description: "Pay with card, mobile money & more",
    gradient: "from-purple-600 to-pink-600",
  },
  {
    icon: <Headphones className="h-6 w-6" />,
    title: "24/7 Support",
    description: "We're here to help anytime",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: <Wallet className="h-6 w-6" />,
    title: "Quick Checkout",
    description: "Wallet integration for instant payments",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Multi-Currency",
    description: "Shop in 170+ currencies",
    gradient: "from-pink-600 to-rose-600",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Fast Delivery",
    description: "Same day (Accra), Next day, or standard delivery",
    gradient: "from-purple-600 via-pink-600 to-rose-600",
  },
];

export function FeaturesShowcase() {
  return (
    <section className="py-12 md:py-16 bg-white border-t border-b border-gray-200">
      <div className="container mx-auto px-4">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 text-center mb-8 md:mb-12 tracking-tight">
          Why Shop With Us
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative overflow-hidden bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              {/* Content */}
              <div className="relative p-5 md:p-6 flex flex-col items-center text-center">
                {/* Icon Container with Gradient */}
                <div className={`mb-3 md:mb-4 p-3 md:p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                
                {/* Title */}
                <h3 className="font-bold text-sm md:text-base text-gray-900 mb-1 md:mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                
                {/* Description */}
                <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
              
              {/* Decorative Corner */}
              <div className={`absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br ${feature.gradient} opacity-5 rounded-bl-full`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

