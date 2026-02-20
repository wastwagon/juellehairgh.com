"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Fallback images when CMS has no custom images (live site safety)
const FALLBACK_MOBILE = "/Mobile-hero-banner.jpeg";
const FALLBACK_DESKTOP = "/NewPoroHeroBanner.jpeg";
const FALLBACK_LINK = "/categories/shop-all";

function getImageSrc(url: string | undefined): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/media/")) return `/api${url}`;
  if (url.startsWith("/")) return url;
  return `/api/media/banners/${url.split("/").pop() || url}`;
}

export function HeroBanner() {
  const { data: hero } = useQuery({
    queryKey: ["hero-banner"],
    queryFn: async () => {
      try {
        const res = await api.get("/settings/hero-banner");
        return res.data;
      } catch {
        return null;
      }
    },
    staleTime: 60 * 1000, // 1 min
  });

  const mobileImage = hero?.mobileImage ? getImageSrc(hero.mobileImage) : FALLBACK_MOBILE;
  const desktopImage = hero?.desktopImage ? getImageSrc(hero.desktopImage) : FALLBACK_DESKTOP;
  const link = hero?.link || FALLBACK_LINK;

  return (
    <section className="hero-banner-section relative w-full overflow-hidden m-0 p-0">
      <Link href={link} className="block w-full h-full cursor-pointer">
        {/* Mobile Hero Image */}
        <div className="block md:hidden w-full m-0 p-0">
          <Image
            src={mobileImage}
            alt="Hero Banner"
            width={1280}
            height={1280}
            priority
            className="w-full h-auto object-contain"
            sizes="100vw"
            quality={90}
            unoptimized={mobileImage.startsWith("/api") || mobileImage.startsWith("http")}
          />
        </div>

        {/* Desktop Hero Image */}
        <div className="hidden md:block relative w-full aspect-[3/1] m-0 p-0">
          <Image
            src={desktopImage}
            alt="Hero Banner"
            fill
            priority
            className="object-contain object-center"
            sizes="100vw"
            quality={100}
            unoptimized={desktopImage.startsWith("/api") || desktopImage.startsWith("http")}
          />
        </div>
      </Link>
    </section>
  );
}

