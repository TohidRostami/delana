export type SortOption = "newest" | "price-asc" | "price-desc" | "bestseller";

export const PER_PAGE_OPTIONS = [8, 12, 24, 48] as const;
export const DEFAULT_PER_PAGE = 8;

/** Storefront listing page size — a 3×3 grid on desktop, as in the design. */
export const SHOP_PER_PAGE = 9;

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "جدیدترین" },
  { value: "bestseller", label: "پرفروش‌ترین" },
  { value: "price-asc", label: "ارزان‌ترین" },
  { value: "price-desc", label: "گران‌ترین" },
];

export function isSortOption(value: string | undefined): value is SortOption {
  return SORT_OPTIONS.some((s) => s.value === value);
}
