"use client";

import Image from "next/image";

export function HeroBanner() {
  return (
    <section className="hero-banner-section relative w-full overflow-hidden mb-0 pb-8 md:pb-0">
      {/* Mobile Hero Image - Shows on screens smaller than 768px (md breakpoint) */}
      <div className="block md:hidden relative w-full h-[220px] mb-0 pb-0">
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
      <div className="hidden md:block relative w-full h-[550px] lg:h-[650px] xl:h-[750px]">
        <Image
          src="/bannerhero.jpeg"
          alt="Hero Banner"
          fill
          priority
          className="object-cover object-top"
          sizes="100vw"
          quality={100}
        />
      </div>
    </section>
  );
}

