"use client";

import { useRef, useState, useEffect } from "react";
import { DonationLink } from "@/lib/types";
import { DonationCard } from "./DonationCard";

export function DonationCarousel({ links }: { links: DonationLink[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setShowLeft(container.scrollLeft > 0);
      setShowRight(
        Math.ceil(container.scrollLeft + container.clientWidth) < container.scrollWidth
      );
    };

    // Initial check
    handleScroll();

    container.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [links]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    // Scroll by the width of one card + gap (approx 296px)
    const scrollAmount = direction === "left" ? -296 : 296;
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <div className="relative group/carousel">
      {/* Left button */}
      <button
        onClick={() => scroll("left")}
        disabled={!showLeft}
        className={`absolute left-0 top-1/2 -translate-y-1/2 -ml-3 sm:-ml-4 z-10 p-2 rounded-full bg-white border border-zinc-200 shadow-md text-zinc-700 hover:bg-zinc-50 hover:text-blue-700 transition-all focus:outline-none ${
          showLeft ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-label="Desplazar a la izquierda"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* Container */}
      <div
        ref={scrollContainerRef}
        className="flex items-stretch overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {links.map((link) => (
          <div key={link.id} className="snap-start shrink-0 w-[280px]">
            <DonationCard link={link} />
          </div>
        ))}
      </div>

      {/* Right button */}
      <button
        onClick={() => scroll("right")}
        disabled={!showRight}
        className={`absolute right-0 top-1/2 -translate-y-1/2 -mr-3 sm:-mr-4 z-10 p-2 rounded-full bg-white border border-zinc-200 shadow-md text-zinc-700 hover:bg-zinc-50 hover:text-blue-700 transition-all focus:outline-none ${
          showRight ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-label="Desplazar a la derecha"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  );
}
