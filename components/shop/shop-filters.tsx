import Link from "next/link";
import { Check, X } from "lucide-react";

import { PriceFilter } from "@/components/shop/price-filter";
import type { ShopFacets } from "@/lib/queries/products";
import type { CategoryWithCount } from "@/lib/queries/products";
import {
  listingHref,
  toggleListValue,
  type ParsedListing,
} from "@/lib/product-filters";
import { toPersianDigits } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * محتوای فیلترها (دسکتاپ: سایدبار، موبایل: داخل شیت). همه‌چیز لینک است؛
 * فقط اسلایدر قیمت کلاینتی است.
 */
export function ShopFilters({
  basePath,
  params,
  parsed,
  facets,
  categories,
  activeCategory,
}: {
  basePath: string;
  params: URLSearchParams;
  parsed: ParsedListing;
  facets: ShopFacets;
  categories: CategoryWithCount[];
  activeCategory?: string;
}) {
  const href = (o: Record<string, string | undefined>) =>
    listingHref(basePath, params, o);
  const priceBase = listingHref(basePath, params, {
    min: undefined,
    max: undefined,
  });

  const hasPrice = parsed.minPrice != null || parsed.maxPrice != null;

  return (
    <div>
      <Group title="دسته‌بندی">
        <div className="flex flex-col gap-1">
          <CheckLink
            href={listingHref("/products", params, {})}
            checked={!activeCategory}
            label="همه محصولات"
          />
          {categories.map((c) => (
            <CheckLink
              key={c.slug}
              href={listingHref(`/products/category/${c.slug}`, params, {})}
              checked={activeCategory === c.slug}
              label={c.title}
              count={c.productCount}
            />
          ))}
        </div>
      </Group>

      {facets.sizes.length > 0 && (
        <Group title="سایز">
          <div className="flex flex-wrap gap-2">
            {facets.sizes.map((s) => {
              const on = parsed.sizes.includes(s.name);
              return (
                <Link
                  key={s.id}
                  href={href({ size: toggleListValue(params, "size", s.name) })}
                  aria-pressed={on}
                  className={cn(
                    "flex h-11 min-w-11 items-center justify-center rounded-full border-[1.5px] px-3 text-sm font-semibold transition-colors",
                    on
                      ? "border-cocoa-700 bg-cocoa-700 text-cream-100"
                      : "border-line-200 bg-white hover:border-cocoa-700",
                  )}
                >
                  {toPersianDigits(s.name)}
                </Link>
              );
            })}
          </div>
        </Group>
      )}

      {facets.colors.length > 0 && (
        <Group title="رنگ">
          <div className="flex flex-wrap gap-2.5">
            {facets.colors.map((c) => {
              const on = parsed.colors.includes(c.name);
              return (
                <Link
                  key={c.name}
                  href={href({
                    color: toggleListValue(params, "color", c.name),
                  })}
                  aria-label={c.name}
                  title={c.name}
                  aria-pressed={on}
                  className={cn(
                    "size-[34px] rounded-full border border-espresso-900/20 transition-shadow",
                    on && "shadow-[0_0_0_2px_#fff,0_0_0_4px_var(--cocoa-700)]",
                  )}
                  style={{ backgroundColor: c.hexValue ?? "#d4d4d4" }}
                />
              );
            })}
          </div>
        </Group>
      )}

      <Group title="محدوده قیمت">
        <PriceFilter
          bound={facets.maxPrice}
          min={parsed.minPrice}
          max={parsed.maxPrice}
          hrefBase={priceBase}
        />
      </Group>

      <Group>
        <CheckLink
          href={href({ stock: parsed.inStockOnly ? undefined : "1" })}
          checked={parsed.inStockOnly}
          label="فقط کالاهای موجود"
        />
        <CheckLink
          href={href({ sale: parsed.onSaleOnly ? undefined : "1" })}
          checked={parsed.onSaleOnly}
          label="فقط تخفیف‌دارها"
        />
      </Group>
    </div>
  );
}

function Group({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-line-200 py-[18px] last:border-b-0">
      {title && <h4 className="text-[15px] font-bold">{title}</h4>}
      {children}
    </div>
  );
}

function CheckLink({
  href,
  checked,
  label,
  count,
}: {
  href: string;
  checked: boolean;
  label: string;
  count?: number;
}) {
  return (
    <Link
      href={href}
      role="checkbox"
      aria-checked={checked}
      className="flex min-h-9 items-center gap-2.5 text-sm"
    >
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-[6px] border-[1.5px] transition-colors",
          checked
            ? "border-cocoa-700 bg-cocoa-700 text-cream-100"
            : "border-line-200 bg-white",
        )}
      >
        {checked && <Check className="size-3.5" strokeWidth={3} />}
      </span>
      <span className="flex-1">{label}</span>
      {count != null && (
        <em className="text-xs not-italic text-muted-600">
          {toPersianDigits(count)}
        </em>
      )}
    </Link>
  );
}
