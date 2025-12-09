"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";

export function WhatsAppButton() {
  const phoneNumber = "233539506949"; // +233 539506949 without +
  const message = encodeURIComponent("Hello, I need help with...");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <Link
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 animate-bounce hover:animate-none"
      aria-label="Chat with us on WhatsApp"
    >
      <MessageCircle className="h-6 w-6 md:h-7 md:w-7" />
      <span className="sr-only">Chat with us on WhatsApp</span>
    </Link>
  );
}
