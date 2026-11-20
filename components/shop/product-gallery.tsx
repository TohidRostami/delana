"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { ProductImage } from "@/components/shared/product-image";
import type { ProductImageDTO } from "@/lib/types";
import { toPersianDigits } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  productName,
}: {
  images: ProductImageDTO[];
  productName: string;
}) {
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);
  const safe = Math.min(index, Math.max(0, images.length - 1));
  const current = images[safe];
  const go = (d: number) => setIndex((safe + d + images.length) % images.length);

  if (!current) {
    return <div className="aspect-[4/5] rounded-lg bg-sand-200 sm:rounded-xl" />;
  }

  return (
    <div className={cn("grid gap-2.5 sm:gap-4", images.length > 1 && "lg:grid-cols-[88px_1fr]")}>
      <div
        className="relative aspect-[4/5] overflow-hidden rounded-lg bg-sand-200 sm:rounded-xl lg:order-2"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current == null || images.length < 2) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        <ProductImage
          key={current.id}
          src={current.url}
          alt={current.alt ?? productName}
          priority
          sizes="(min-width: 1024px) 560px, 100vw"
          className="p-[8%] animate-dl-fade"
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="تصویر قبل"
              onClick={() => go(-1)}
              className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-ivory-50/90 shadow-dl-sm transition-colors hover:bg-white"
            >
              <ChevronRight className="size-5" strokeWidth={1.7} />
            </button>
            <button
              type="button"
              aria-label="تصویر بعد"
              onClick={() => go(1)}
              className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-ivory-50/90 shadow-dl-sm transition-colors hover:bg-white"
            >
              <ChevronLeft className="size-5" strokeWidth={1.7} />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="no-scrollbar flex gap-2.5 overflow-x-auto lg:order-1 lg:flex-col lg:gap-3 lg:overflow-visible">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              aria-label={`تصویر ${toPersianDigits(i + 1)}`}
              aria-current={i === safe}
              onClick={() => setIndex(i)}
              className={cn(
                "relative h-[78px] w-16 shrink-0 overflow-hidden rounded-md border-2 bg-sand-200 sm:h-[108px] sm:w-[88px] lg:w-[88px]",
                i === safe ? "border-cocoa-700" : "border-transparent",
              )}
            >
              <ProductImage src={img.url} alt="" sizes="88px" className="p-1.5" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
