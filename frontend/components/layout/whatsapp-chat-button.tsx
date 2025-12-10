"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WhatsAppChatButton() {
  const phoneNumber = "233539506949"; // +233 539506949 without +
  const message = encodeURIComponent("Hello, I need help with...");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-4 md:bottom-6 z-50"
    >
      <Button
        size="lg"
        className="rounded-full w-14 h-14 p-0 bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl transition-all"
        title="Chat with us on WhatsApp"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>
    </a>
  );
}
