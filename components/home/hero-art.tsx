"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** تصویر هیرو؛ اگر چند تصویر از پنل مدیریت ثبت شده باشد هر ۶ ثانیه می‌چرخد. */
export function HeroArt({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((v) => (v + 1) % images.length), 6000);
    return () => clearInterval(t);
  }, [images.length]);

  return (
    <>
      <div className="relative flex aspect-square w-full max-w-[220px] justify-center sm:max-w-[520px]">
        {images.map((src, idx) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt={idx === i ? alt : ""}
            className={cn(
              "absolute inset-0 size-full object-contain transition-opacity duration-700",
              idx === i ? "opacity-100" : "opacity-0",
            )}
            loading={idx === 0 ? "eager" : "lazy"}
          />
        ))}
      </div>
      {images.length > 1 && (
        <div
          className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5"
          role="tablist"
          aria-label="تصاویر بنر"
        >
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              role="tab"
              aria-selected={idx === i}
              aria-label={`تصویر ${idx + 1}`}
              onClick={() => setI(idx)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                idx === i ? "w-6 bg-cream-100" : "w-1.5 bg-cream-100/40",
              )}
            />
          ))}
        </div>
      )}
    </>
  );
}
