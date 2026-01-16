"use client";

import Image from "next/image";
import Link from "next/link";

export function HeroBanner() {
  return (
    <section className="hero-banner-section relative w-full overflow-hidden mb-0 pb-8 md:pb-0">
      <Link href="/shop-all" className="block w-full h-full cursor-pointer">
        {/* Mobile Hero Image - Shows on screens smaller than 768px (md breakpoint) */}
        {/* Image dimensions: 1080 x 1350 px (Tall & Immersive) */}
        <div className="block md:hidden relative w-full h-[500px] sm:h-[600px] mb-0 pb-0">
          <Image
            src="/bannerhero-mobile.jpeg"
            alt="Hero Banner"
            fill
            priority
            className="object-cover object-top"
            sizes="100vw"
            quality={90}
          />
        </div>

        {/* Desktop Hero Image - Shows on screens 768px and larger (md breakpoint and up) */}
        <div className="hidden md:block relative w-full aspect-[2/1] min-h-[500px] md:min-h-[600px] lg:min-h-[700px] xl:min-h-[800px] 2xl:min-h-[900px]">
          <Image
            src="/New-desktop-Hero-Banner.webp"
            alt="Hero Banner"
            fill
            priority
            className="object-contain object-center"
            sizes="100vw"
            quality={100}
          />
        </div>
      </Link>
    </section>
  );
}

