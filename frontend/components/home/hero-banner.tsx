"use client";

import Image from "next/image";

export function HeroBanner() {
  return (
    <section className="relative w-full h-[350px] md:h-[450px] lg:h-[550px] overflow-hidden">
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

