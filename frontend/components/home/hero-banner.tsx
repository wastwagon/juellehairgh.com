"use client";

import Image from "next/image";
import Link from "next/link";

export function HeroBanner() {
  return (
    <section className="hero-banner-section relative w-full overflow-hidden m-0 p-0">
      <Link href="/categories/drawstring-half-wigs" className="block w-full h-full cursor-pointer">
        {/* Mobile Hero Image - Shows on screens smaller than 768px (md breakpoint) */}
        <div className="block md:hidden relative w-full aspect-[3/1] m-0 p-0">
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

        {/* Desktop Hero Image - Shows on screens 768px and larger (md breakpoint and up) */}
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

