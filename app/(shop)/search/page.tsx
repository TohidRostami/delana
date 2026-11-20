import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { ProductCard } from "@/components/shared/product-card";
import { SearchBox } from "@/components/shop/search-box";
import { siteConfig } from "@/lib/content";
import { toPersianDigits } from "@/lib/format";
import { getProducts } from "@/lib/queries/products";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "جستجو",
  robots: { index: false, follow: true },
};

type SP = Promise<{ q?: string | string[]; cat?: string | string[] }>;

const first = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function SearchPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = first(sp.q).trim().slice(0, 80);
  const cat = first(sp.cat);

  const result = q ? await getProducts({ query: q, perPage: 60 }) : null;

  const cats = new Map<string, string>();
  result?.products.forEach((p) => cats.set(p.category.slug, p.category.title));
  const shown = result ? (cat ? result.products.filter((p) => p.category.slug === cat) : result.products) : [];
  const href = (c?: string) => `/search?q=${encodeURIComponent(q)}${c ? `&cat=${encodeURIComponent(c)}` : ""}`;

  return (
    <div className="wrap pb-14 pt-6 sm:pt-7">
      <SearchBox initialQuery={q} placeholder={siteConfig.search.placeholder} popular={siteConfig.search.popular} />

      {result && (
        <section className="pt-8 sm:pt-10">
          <div className="mb-4">
            <h1 className="t-h2">
              {result.totalCount > 0
                ? `${toPersianDigits(result.totalCount)} نتیجه برای «${q}»`
                : `نتیجه‌ای برای «${q}» پیدا نشد`}
            </h1>
            {cats.size > 1 && (
              <p className="mt-1 text-muted-600">در دسته‌های {[...cats.values()].join("، ")}</p>
            )}
          </div>

          {cats.size > 1 && (
            <div className="no-scrollbar mb-5 flex gap-2.5 overflow-x-auto">
              {[["", "همه"], ...cats.entries()].map(([slug, title]) => (
                <Link
                  key={slug || "all"}
                  href={href(slug || undefined)}
                  className={cn(
                    "inline-flex h-9 shrink-0 items-center rounded-full px-3.5 text-[13px] font-medium whitespace-nowrap sm:h-10 sm:px-[18px] sm:text-sm",
                    (cat || "") === slug ? "bg-cocoa-700 text-cream-100" : "bg-sand-200 text-cocoa-700 hover:bg-sand-300",
                  )}
                >
                  {title}
                </Link>
              ))}
            </div>
          )}

          {shown.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {shown.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={SearchX}
              title="محصولی با این عبارت پیدا نشد"
              description="املای عبارت را بررسی کنید یا از جستجوهای پرطرفدار بالا استفاده کنید."
              actionLabel="مشاهده همهٔ محصولات"
              actionHref="/products"
            />
          )}
        </section>
      )}
    </div>
  );
}
