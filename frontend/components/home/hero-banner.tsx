"use client";

import Image from "next/image";

export function HeroBanner() {
  return (
    <section className="hero-banner-section relative w-full h-[500px] md:h-[600px] lg:h-[700px] xl:h-[750px] overflow-hidden">
      {/* Hero Image */}
      <div className="relative w-full h-full flex items-center justify-center bg-gray-100">
        <Image
          src="/bannerhero.jpeg"
          alt="Hero Banner"
          fill
          priority
          className="object-cover"
          sizes="100vw"
          quality={90}
        />
      </div>
    </section>
  );
}

