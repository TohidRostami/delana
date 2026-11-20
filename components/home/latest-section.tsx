"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { ProductCard } from "@/components/shared/product-card";
import { siteConfig } from "@/lib/content";
import { cn } from "@/lib/utils";
import type { ProductDTO } from "@/lib/types";

const SHOWN = 8;

export function LatestSection({ products }: { products: ProductDTO[] }) {
  const { latest } = siteConfig.home;
  const [tab, setTab] = useState(0);
  const [swap, setSwap] = useState(false);

  const slugs = latest.tabs[tab]?.slugs ?? [];
  const visible = (slugs.length === 0
    ? products
    : products.filter((p) => slugs.includes(p.category.slug))
  ).slice(0, SHOWN);

  return (
    <section className="py-8 sm:py-11">
      <div className="mb-3.5 flex items-end justify-between gap-4 sm:mb-[22px]">
        <div>
          <h2 className="t-h2">{latest.title}</h2>
          <p className="text-sm text-muted-600">{latest.subtitle}</p>
        </div>
        <Link
          href="/products?sort=newest"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-cocoa-700"
        >
          مشاهده همه
          <ChevronLeft className="size-[18px]" strokeWidth={1.7} />
        </Link>
      </div>

      <div
        role="tablist"
        className="no-scrollbar mb-5 flex gap-2.5 overflow-x-auto sm:mb-[26px]"
      >
        {latest.tabs.map((t, idx) => (
          <button
            key={t.label}
            type="button"
            role="tab"
            aria-selected={tab === idx}
            onClick={() => {
              setTab(idx);
              setSwap((v) => !v);
            }}
            className={cn(
              "inline-flex h-10 shrink-0 items-center rounded-full px-[18px] text-sm font-medium transition-[background,color,transform] duration-200 hover:-translate-y-0.5",
              tab === idx
                ? "bg-cocoa-700 text-cream-100"
                : "bg-sand-200 text-cocoa-700 hover:bg-sand-300",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-card bg-cream-100 py-12 text-center text-muted-600">
          در این دسته فعلاً محصولی ثبت نشده است.
        </p>
      ) : (
        <div
          key={`${tab}-${swap}`}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4"
        >
          {visible.map((p, idx) => (
            <div
              key={p.id}
              className="animate-dl-rise"
              style={{ animationDelay: `${idx * 0.07}s`, animationDuration: "0.7s" }}
            >
              <ProductCard product={p} className="h-full" priority={idx < 4 && tab === 0} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
