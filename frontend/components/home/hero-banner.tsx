"use client";

import Image from "next/image";

export function HeroBanner() {
  return (
    <section className="hero-banner-section relative w-full overflow-hidden mb-0 pb-8 md:pb-0">
      {/* Mobile Hero Image - Fixed height with object-top to cut bottom spacing */}
      <div className="md:hidden w-full h-[220px] mb-0 pb-0">
        <img 
          src="/bannerhero-mobile.jpeg" 
          alt="Hero Banner" 
          className="w-full h-full object-cover object-top"
        />
      </div>

      {/* Desktop Hero Image - Use Next.js Image for optimization and larger height */}
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

