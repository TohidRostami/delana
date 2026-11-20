import type { SortOption } from "@/lib/product-constants";
import { isSortOption } from "@/lib/product-constants";

/** پارامترهای URL صفحه‌ی لیست محصولات / دسته‌بندی / جستجو. */
export type ListingSearchParams = {
  sort?: string;
  q?: string;
  page?: string;
  size?: string; // «۳۸,۴۰»
  color?: string; // «کرم,شرابی»
  min?: string;
  max?: string;
  stock?: string; // "1"
  sale?: string; // "1"
};

export type ParsedListing = {
  sort: SortOption;
  query: string;
  page: number;
  sizes: string[];
  colors: string[];
  minPrice?: number;
  maxPrice?: number;
  inStockOnly: boolean;
  onSaleOnly: boolean;
};

function list(v?: string) {
  return v
    ? v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
}

function num(v?: string) {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : undefined;
}

export function parseListing(sp: ListingSearchParams): ParsedListing {
  return {
    sort: isSortOption(sp.sort) ? sp.sort : "newest",
    query: sp.q?.trim() ?? "",
    page: Math.max(1, Number(sp.page) || 1),
    sizes: list(sp.size),
    colors: list(sp.color),
    minPrice: num(sp.min),
    maxPrice: num(sp.max),
    inStockOnly: sp.stock === "1",
    onSaleOnly: sp.sale === "1",
  };
}

export function toURLSearchParams(sp: ListingSearchParams): URLSearchParams {
  return new URLSearchParams(
    Object.entries(sp).filter(
      (e): e is [string, string] => typeof e[1] === "string" && e[1] !== "",
    ),
  );
}

/** href ساخته‌شده از مسیر پایه + پارامترهای فعلی با تغییرات؛ مقدار تهی = حذف. صفحه همیشه ریست می‌شود مگر صراحتاً داده شود. */
export function listingHref(
  basePath: string,
  current: URLSearchParams,
  overrides: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams(current.toString());
  if (!("page" in overrides)) params.delete("page");
  for (const [k, v] of Object.entries(overrides)) {
    if (v === undefined || v === "") params.delete(k);
    else params.set(k, v);
  }
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/** مقدار value را در پارامتر لیستی key روشن/خاموش می‌کند. */
export function toggleListValue(
  current: URLSearchParams,
  key: string,
  value: string,
): string | undefined {
  const items = list(current.get(key) ?? undefined);
  const next = items.includes(value)
    ? items.filter((i) => i !== value)
    : [...items, value];
  return next.length ? next.join(",") : undefined;
}
