import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { toPersianDigits } from "@/lib/format";
import { cn } from "@/lib/utils";

function getPageList(current: number, total: number): (number | "gap")[] {
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

const cell =
  "flex size-11 items-center justify-center rounded-full bg-cream-100 font-semibold transition-colors hover:bg-sand-200";

export function ProductsPagination({
  currentPage,
  totalPages,
  hrefFor,
}: {
  currentPage: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}) {
  if (totalPages <= 1) return null;
  const pages = getPageList(currentPage, totalPages);

  return (
    <nav aria-label="صفحه‌ها" className="mt-10 flex items-center justify-center gap-2">
      {currentPage > 1 ? (
        <Link href={hrefFor(currentPage - 1)} aria-label="صفحه قبل" className={cell}>
          <ChevronRight className="size-5" strokeWidth={1.7} />
        </Link>
      ) : (
        <span className={cn(cell, "pointer-events-none opacity-40")} aria-hidden>
          <ChevronRight className="size-5" strokeWidth={1.7} />
        </span>
      )}
      {pages.map((p, i) =>
        p === "gap" ? (
          <span key={`g${i}`} className="px-1 text-muted-600">…</span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === currentPage ? "page" : undefined}
            className={cn(cell, p === currentPage && "bg-cocoa-700 text-cream-100 hover:bg-cocoa-700")}
          >
            {toPersianDigits(p)}
          </Link>
        ),
      )}
      {currentPage < totalPages ? (
        <Link href={hrefFor(currentPage + 1)} aria-label="صفحه بعد" className={cell}>
          <ChevronLeft className="size-5" strokeWidth={1.7} />
        </Link>
      ) : (
        <span className={cn(cell, "pointer-events-none opacity-40")} aria-hidden>
          <ChevronLeft className="size-5" strokeWidth={1.7} />
        </span>
      )}
    </nav>
  );
}
