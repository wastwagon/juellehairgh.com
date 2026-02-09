"use client";

import Image from "next/image";
import Link from "next/link";

export function HeroBanner() {
  return (
    <section className="hero-banner-section relative w-full overflow-hidden m-0 p-0">
      <Link href="/categories/shop-all" className="block w-full h-full cursor-pointer">
        {/* Mobile Hero Image - Container fits image (1280×1280); full image visible, no cropping */}
        <div className="block md:hidden w-full m-0 p-0">
          <Image
            src="/Mobile-hero-banner.jpeg"
            alt="Hero Banner"
            width={1280}
            height={1280}
            priority
            className="w-full h-auto object-contain"
            sizes="100vw"
            quality={90}
          />
        </div>

        {/* Desktop Hero Image - Screens 768px and up; unchanged */}
        <div className="hidden md:block relative w-full aspect-[3/1] m-0 p-0">
          <Image
            src="/NewPoroHeroBanner.jpeg"
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

