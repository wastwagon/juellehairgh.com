"use client";

import Image from "next/image";
import Link from "next/link";

export function HeroBanner() {
  return (
    <section className="hero-banner-section relative w-full overflow-hidden m-0 p-0">
      <Link href="/categories/drawstring-half-wigs" className="block w-full h-full cursor-pointer">
        {/* Mobile Hero Image - Screens smaller than 768px; fits mobile and small devices */}
        <div className="block md:hidden relative w-full aspect-[3/4] min-h-[280px] m-0 p-0">
          <Image
            src="/Mobile-hero-banner.jpeg"
            alt="Hero Banner"
            fill
            priority
            className="object-cover object-center"
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

