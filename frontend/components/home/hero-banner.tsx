"use client";

import Image from "next/image";

export function HeroBanner() {
  return (
    <section className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] xl:h-[650px] overflow-hidden">
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

