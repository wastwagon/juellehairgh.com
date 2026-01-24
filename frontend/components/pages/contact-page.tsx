"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";

export function ContactPage() {
  const { data: settings } = useQuery({
    queryKey: ["settings", "site"],
    queryFn: async () => {
      const response = await api.get("/settings/site");
      return response.data;
    },
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
        <p className="text-gray-600">Get in touch with us. We're here to help!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <Phone className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
            <a href={`tel:${settings?.phone || "+233539506949"}`} className="text-purple-600 hover:text-purple-700">
              {settings?.phone || "+233 539506949"}
            </a>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Mail className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
            <a href={`mailto:${settings?.email || "sales@juellehairgh.com"}`} className="text-purple-600 hover:text-purple-700">
              {settings?.email || "sales@juellehairgh.com"}
            </a>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <MapPin className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Address</h3>
            <p className="text-gray-600 text-sm">Dansoman, Accra, Ghana</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
