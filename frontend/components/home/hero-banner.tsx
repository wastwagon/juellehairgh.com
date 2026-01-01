"use client";

import Image from "next/image";

export function HeroBanner() {
  return (
    <section className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden">
      {/* Hero Image */}
      <div className="relative w-full h-full flex items-center justify-center bg-gray-100">
        <Image
          src="/bannerhero.jpeg"
          alt="Hero Banner"
          fill
          priority
          className="object-contain md:object-cover"
          sizes="100vw"
        />
      </div>
    </section>
  );
}

