"use client";

import { useRef, useEffect } from "react";

export function HeroBanner() {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Ensure video plays and loops smoothly
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch((error) => {
        console.log("Video autoplay prevented:", error);
      });
      
      // Handle video end to restart smoothly
      const handleEnded = () => {
        video.currentTime = 0;
        video.play().catch((error) => {
          console.log("Video replay prevented:", error);
        });
      };
      
      video.addEventListener("ended", handleEnded);
      
      return () => {
        video.removeEventListener("ended", handleEnded);
      };
    }
  }, []);

  return (
    <section className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
      {/* Video Background */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        onEnded={(e) => {
          // Smooth restart
          const video = e.currentTarget;
          video.currentTime = 0;
          video.play().catch(() => {});
        }}
      >
        <source src="/hero-banner-video.mp4" type="video/mp4" />
        {/* Fallback for browsers that don't support video */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600" />
      </video>

    </section>
  );
}

