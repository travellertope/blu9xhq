"use client";

import { useRef, useState } from "react";
import Image from "next/image";

export default function ProductImageCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  function scrollToIndex(i: number) {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
    setIndex(i);
  }

  function handleScroll() {
    const el = containerRef.current;
    if (!el || el.clientWidth === 0) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-bg-soft rounded-site flex items-center justify-center text-ink-soft text-sm">
        No photo
      </div>
    );
  }

  return (
    <div>
      <div className="aspect-square rounded-site overflow-hidden bg-bg-soft relative">
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="h-full w-full flex overflow-x-auto snap-x snap-mandatory scroll-smooth [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((src, i) => (
            <div key={src} className="w-full h-full shrink-0 snap-center relative">
              <Image
                src={src}
                alt={alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 50vw"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => scrollToIndex(i)}
              aria-label={`Photo ${i + 1} of ${images.length}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-5 bg-[var(--shop-accent)]" : "w-1.5 bg-line"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
