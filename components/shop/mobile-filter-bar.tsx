"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDownUp, Check, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SORT_OPTIONS } from "@/lib/product-constants";
import { toPersianDigits } from "@/lib/format";
import { cn } from "@/lib/utils";

/** نوار «فیلترها / مرتب‌سازی» برای موبایل و تبلت؛ شیت‌ها از پایین باز می‌شوند. */
export function MobileFilterBar({
  filtersNode,
  activeCount,
  activeSort,
  sortHrefs,
  resultCount,
}: {
  filtersNode: React.ReactNode;
  activeCount: number;
  activeSort: string;
  sortHrefs: Record<string, string>;
  resultCount: number;
}) {
  const [fOpen, setFOpen] = useState(false);
  const [sOpen, setSOpen] = useState(false);
  const sortLabel = SORT_OPTIONS.find((s) => s.value === activeSort)?.label ?? "مرتب‌سازی";
  const sheet =
    "max-h-[88vh] gap-0 rounded-t-[28px] border-0 bg-white p-0 data-[state=open]:animate-dl-sheet";

  return (
    <div className="mt-4 flex gap-2.5 lg:hidden">
      <Sheet open={fOpen} onOpenChange={setFOpen}>
        <SheetTrigger asChild>
          <Button variant="pill-outline" size="pill-sm">
            <SlidersHorizontal strokeWidth={1.7} />
            فیلترها{activeCount > 0 && ` (${toPersianDigits(activeCount)})`}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className={sheet}>
          <SheetTitle className="border-b border-line-200 px-5 py-4 text-base font-bold">فیلترها</SheetTitle>
          <div className="overflow-y-auto px-5">{filtersNode}</div>
          <div className="border-t border-line-200 p-4">
            <Button variant="pill" size="pill" className="w-full" onClick={() => setFOpen(false)}>
              نمایش {toPersianDigits(resultCount)} کالا
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={sOpen} onOpenChange={setSOpen}>
        <SheetTrigger asChild>
          <Button variant="pill-outline" size="pill-sm">
            <ArrowDownUp strokeWidth={1.7} />
            {sortLabel}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className={sheet}>
          <SheetTitle className="border-b border-line-200 px-5 py-4 text-base font-bold">مرتب‌سازی</SheetTitle>
          <div className="flex flex-col p-3 pb-6">
            {SORT_OPTIONS.map((s) => (
              <Link
                key={s.value}
                href={sortHrefs[s.value]}
                onClick={() => setSOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-field px-3.5 py-3.5 text-[15px]",
                  activeSort === s.value ? "bg-sand-200 font-bold" : "hover:bg-cream-100",
                )}
              >
                {s.label}
                {activeSort === s.value && <Check className="size-5 text-cocoa-700" />}
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
