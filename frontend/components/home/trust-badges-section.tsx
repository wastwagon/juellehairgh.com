"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Shield } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface TrustBadge {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  image?: string;
  link?: string;
}

export function TrustBadgesSection() {
  const { data: badges, isLoading } = useQuery<TrustBadge[]>({
    queryKey: ["trust-badges", "public"],
    queryFn: async () => {
      const response = await api.get("/trust-badges/public");
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <section className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading trust badges...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!badges || badges.length === 0) {
    return null;
  }

  const getImageUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith("/")) return url;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `/${url}`;
  };

  const BadgeContent = ({ badge }: { badge: TrustBadge }) => (
    <div className="flex flex-col items-center text-center p-4 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="mb-3">
        {badge.image ? (
          <div className="relative w-12 h-12 md:w-16 md:h-16">
            <Image
              src={getImageUrl(badge.image) || ""}
              alt={badge.title}
              fill
              className="object-contain"
            />
          </div>
        ) : badge.icon ? (
          <div className="text-4xl md:text-5xl">{badge.icon}</div>
        ) : (
          <Shield className="h-12 w-12 md:h-16 md:w-16 text-primary" />
        )}
      </div>
      <h3 className="font-semibold text-sm md:text-base text-gray-900 mb-1">{badge.title}</h3>
      {badge.description && (
        <p className="text-xs md:text-sm text-gray-600 line-clamp-2">{badge.description}</p>
      )}
    </div>
  );

  return (
    <section className="py-8 md:py-12 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {badges.map((badge) => {
            const content = <BadgeContent badge={badge} />;
            
            if (badge.link) {
              return (
                <Link
                  key={badge.id}
                  href={badge.link}
                  className="block"
                >
                  {content}
                </Link>
              );
            }
            
            return <div key={badge.id}>{content}</div>;
          })}
        </div>
      </div>
    </section>
  );
}
