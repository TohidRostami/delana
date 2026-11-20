"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

const INTERVAL = 5500;

/** ارتفاع بخش هیرو (موبایل / تبلت / دسکتاپ). عکس همیشه دقیقاً همین ارتفاع و عرض را پر می‌کند. */
const HEIGHT = "h-[250px] sm:h-[400px] lg:h-[430px]";
const SWIPE_MIN = 40;

/**
 * اسلایدر تمام‌عرض هیرو. خود تصویر لینک به صفحهٔ فروشگاه است؛ فلش‌ها و نقطه‌ها
 * بیرون از لینک قرار دارند تا عنصر تعاملی تودرتو نداشته باشیم.
 */
export function HeroSlider({
  images,
  href,
  label,
  alt,
}: {
  images: string[];
  href: string;
  label: string;
  alt: string;
}) {
  const count = images.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);

  const go = useCallback(
    (to: number) => setIndex(((to % count) + count) % count),
    [count],
  );

  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % count), INTERVAL);
    return () => clearTimeout(t);
  }, [index, count, paused]);

  function onTouchStart(e: React.TouchEvent) {
    swiped.current = false;
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  }

  function onTouchEnd(e: React.TouchEvent) {
    const start = touch.current;
    touch.current = null;
    if (!start || count < 2) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < SWIPE_MIN || Math.abs(dx) < Math.abs(dy)) return;
    swiped.current = true;
    // سایت راست‌به‌چپ است: کشیدن به راست = اسلاید بعدی
    go(dx > 0 ? index + 1 : index - 1);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (count < 2) return;
    if (e.key === "ArrowLeft") go(index + 1);
    if (e.key === "ArrowRight") go(index - 1);
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className={cn(
        "group relative touch-pan-y overflow-hidden rounded-lg bg-cocoa-700 sm:rounded-xl",
        HEIGHT,
      )}
    >
      {images.map((src, i) => {
        const active = i === index;
        const isSvg = /\.svg(\?|$)/i.test(src);
        return (
          <Link
            key={src}
            href={href}
            aria-label={label}
            aria-hidden={!active}
            tabIndex={active ? 0 : -1}
            onClickCapture={(e) => {
              if (swiped.current) {
                e.preventDefault();
                swiped.current = false;
              }
            }}
            draggable={false}
            className={cn(
              "absolute inset-0 block transition-opacity duration-[900ms] ease-dl motion-reduce:transition-none",
              active ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0",
            )}
          >
            <Image
              src={src}
              alt={active ? alt : ""}
              fill
              sizes="(min-width: 1280px) 1200px, 100vw"
              priority={i === 0}
              unoptimized={isSvg}
              draggable={false}
              // object-fill: تصویر در صورت نیاز کشیده می‌شود تا کادر را کاملاً پر کند (بدون برش)
              className="select-none object-fill"
            />
          </Link>
        );
      })} 

      {count > 1 && (
        <>
          {/* <button
            type="button"
            aria-label="اسلاید قبلی"
            onClick={() => go(index - 1)}
            className="absolute end-3 top-1/2 z-20 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-ivory-50/85 text-cocoa-700 opacity-0 shadow-dl-sm transition-opacity hover:bg-ivory-50 focus-visible:opacity-100 group-hover:opacity-100 sm:flex"
          >
            <ChevronRight className="size-5" strokeWidth={1.7} />
          </button>
          <button
            type="button"
            aria-label="اسلاید بعدی"
            onClick={() => go(index + 1)}
            className="absolute start-3 top-1/2 z-20 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-ivory-50/85 text-cocoa-700 opacity-0 shadow-dl-sm transition-opacity hover:bg-ivory-50 focus-visible:opacity-100 group-hover:opacity-100 sm:flex"
          >
            <ChevronLeft className="size-5" strokeWidth={1.7} />
          </button> */}

          <div
            className="absolute inset-x-0 bottom-2 z-10 flex justify-center"
            role="group"
            aria-label="انتخاب اسلاید"
          >
            <div className="flex items-center rounded-full bg-cocoa-700/35 px-1.5 backdrop-blur-sm">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`اسلاید ${i + 1}`}
                  aria-current={i === index}
                  onClick={() => go(i)}
                  className="group/dot flex h-7 w-5 items-center justify-center"
                >
                  <span
                    className={cn(
                      "h-2 rounded-full bg-cream-100 transition-all duration-300",
                      i === index
                        ? "w-6 opacity-100"
                        : "w-2 opacity-60 group-hover/dot:opacity-90",
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
