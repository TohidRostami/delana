"use client";

import { useEffect, useRef, useState } from "react";
import { useRouteTransition } from "@/components/shared/route-transition-provider";
import { formatPrice } from "@/lib/format";

const STEP = 50_000;

/**
 * اسلایدر دوسرهٔ قیمت. بعد از ۴۰۰ms سکون، مقدار را در URL می‌نویسد
 * (hrefBase شامل بقیهٔ فیلترهاست و min/max نباید در آن باشد).
 */
export function PriceFilter({
  bound,
  min,
  max,
  hrefBase,
}: {
  bound: number;
  min?: number;
  max?: number;
  hrefBase: string;
}) {
  const { push } = useRouteTransition();
  const [lo, setLo] = useState(min ?? 0);
  const [hi, setHi] = useState(max ?? bound);
  const first = useRef(true);

  useEffect(() => {
    setLo(min ?? 0);
    setHi(max ?? bound);
  }, [min, max, bound]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (lo === (min ?? 0) && hi === (max ?? bound)) return;
    const t = setTimeout(() => {
      const u = new URL(hrefBase, "http://x");
      if (lo > 0) u.searchParams.set("min", String(lo));
      if (hi < bound) u.searchParams.set("max", String(hi));
      push(u.pathname + (u.search || ""));
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lo, hi]);

  const pct = (v: number) => (bound === 0 ? 0 : (v / bound) * 100);

  return (
    <div>
      <div className="relative h-6" dir="ltr">
        <span className="absolute inset-x-0 top-2.5 h-1 rounded-sm bg-sand-200" />
        <span
          className="absolute top-2.5 h-1 bg-cocoa-700"
          style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
        />
        {(["lo", "hi"] as const).map((k) => (
          <input
            key={k}
            type="range"
            min={0}
            max={bound}
            step={STEP}
            value={k === "lo" ? lo : hi}
            aria-label={k === "lo" ? "حداقل قیمت" : "حداکثر قیمت"}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (k === "lo") setLo(Math.min(v, hi - STEP));
              else setHi(Math.max(v, lo + STEP));
            }}
            className="pointer-events-none absolute inset-0 h-6 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-cocoa-700 [&::-moz-range-thumb]:bg-white [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-cocoa-700 [&::-webkit-slider-thumb]:bg-white"
          />
        ))}
      </div>
      <div className="mt-3 flex justify-between text-[13px] text-muted-600">
        <span>از {formatPrice(lo)}</span>
        <span>تا {formatPrice(hi)} تومان</span>
      </div>
    </div>
  );
}
