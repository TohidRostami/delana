import Link from "next/link";
import { ArrowDownUp, PackageSearch, X } from "lucide-react";

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { EmptyState } from "@/components/shared/empty-state";
import { ProductCard } from "@/components/shared/product-card";
import { MobileFilterBar } from "@/components/shop/mobile-filter-bar";
import { ProductsPagination } from "@/components/shop/products-pagination";
import { ShopFilters } from "@/components/shop/shop-filters";
import { TransitionRegion } from "@/components/shared/transition-region";
import {
  getCategoriesWithCounts,
  getProducts,
  getShopFacets,
} from "@/lib/queries/products";
import { SORT_OPTIONS, SHOP_PER_PAGE } from "@/lib/product-constants";
import {
  listingHref,
  parseListing,
  toURLSearchParams,
  toggleListValue,
  type ListingSearchParams,
} from "@/lib/product-filters";
import { formatPrice, toPersianDigits } from "@/lib/format";
import { cn } from "@/lib/utils";

export type ProductsListingSearchParams = ListingSearchParams;

export async function ProductsListing({
  categorySlug,
  categoryTitle,
  categoryDescription,
  searchParams,
}: {
  categorySlug?: string;
  categoryTitle?: string;
  categoryDescription?: string | null;
  searchParams: ListingSearchParams;
}) {
  const parsed = parseListing(searchParams);
  const params = toURLSearchParams(searchParams);
  const basePath = categorySlug
    ? `/products/category/${categorySlug}`
    : "/products";

  const [categories, facets, result] = await Promise.all([
    getCategoriesWithCounts(),
    getShopFacets(categorySlug),
    getProducts({
      categorySlug,
      sort: parsed.sort,
      query: parsed.query,
      page: parsed.page,
      perPage: SHOP_PER_PAGE,
      sizes: parsed.sizes,
      colors: parsed.colors,
      minPrice: parsed.minPrice,
      maxPrice: parsed.maxPrice,
      inStockOnly: parsed.inStockOnly,
      onSaleOnly: parsed.onSaleOnly,
    }),
  ]);
  const { products, totalCount, totalPages, page } = result;

  const href = (o: Record<string, string | undefined>) =>
    listingHref(basePath, params, o);

  // chips of applied filters
  const chips: { label: string; href: string }[] = [];
  if (categorySlug) {
    chips.push({
      label: `دسته ${categoryTitle ?? ""}`.trim(),
      href: listingHref("/products", params, {}),
    });
  }
  parsed.sizes.forEach((s) =>
    chips.push({
      label: `سایز ${toPersianDigits(s)}`,
      href: href({ size: toggleListValue(params, "size", s) }),
    }),
  );
  parsed.colors.forEach((c) =>
    chips.push({
      label: `رنگ ${c}`,
      href: href({ color: toggleListValue(params, "color", c) }),
    }),
  );
  if (parsed.minPrice != null || parsed.maxPrice != null) {
    chips.push({
      label: `قیمت ${formatPrice(parsed.minPrice ?? 0)} تا ${formatPrice(parsed.maxPrice ?? facets.maxPrice)}`,
      href: href({ min: undefined, max: undefined }),
    });
  }
  if (parsed.inStockOnly)
    chips.push({ label: "فقط موجودها", href: href({ stock: undefined }) });
  if (parsed.onSaleOnly)
    chips.push({ label: "فقط تخفیف‌دارها", href: href({ sale: undefined }) });
  if (parsed.query)
    chips.push({ label: `«${parsed.query}»`, href: href({ q: undefined }) });

  const title =
    categoryTitle ??
    (parsed.onSaleOnly && !parsed.query ? "حراج" : "همه محصولات");
  const from = totalCount === 0 ? 0 : (page - 1) * SHOP_PER_PAGE + 1;
  const to = Math.min(page * SHOP_PER_PAGE, totalCount);
  const sortHrefs = Object.fromEntries(
    SORT_OPTIONS.map((s) => [
      s.value,
      href({ sort: s.value === "newest" ? undefined : s.value }),
    ]),
  );
  const filtersNode = (
    <ShopFilters
      basePath={basePath}
      params={params}
      parsed={parsed}
      facets={facets}
      categories={categories}
      activeCategory={categorySlug}
    />
  );

  return (
    <div className="wrap pb-10">
      <Breadcrumbs
        items={[
          { label: "خانه", href: "/" },
          ...(categorySlug
            ? [{ label: "همه محصولات", href: "/products" }, { label: title }]
            : [{ label: title }]),
        ]}
      />
      <div className="mb-2 flex flex-wrap items-baseline gap-3">
        <h1 className="t-h1">{title}</h1>
        <span className="text-muted-600">
          {toPersianDigits(totalCount)} کالا
        </span>
      </div>
      {categoryDescription && (
        <p className="t-sm max-w-[640px] text-muted-600">
          {categoryDescription}
        </p>
      )}

      <MobileFilterBar
        filtersNode={filtersNode}
        activeCount={chips.length}
        activeSort={parsed.sort}
        sortHrefs={sortHrefs}
        resultCount={totalCount}
      />

      <div className="mt-5 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside
          aria-label="فیلترها"
          className="sticky top-[108px] hidden self-start rounded-lg bg-cream-100 px-5 py-2 lg:block"
        >
          {filtersNode}
        </aside>

        <div>
          <div className="mb-[22px] hidden flex-wrap items-center justify-between gap-4 sm:flex">
            <div className="flex flex-wrap items-center gap-1 text-sm">
              <span className="me-2 inline-flex items-center gap-1.5 text-muted-600">
                <ArrowDownUp className="size-[18px]" strokeWidth={1.7} />
                مرتب‌سازی:
              </span>
              {SORT_OPTIONS.map((s) => (
                <Link
                  key={s.value}
                  href={sortHrefs[s.value]}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 transition-colors hover:bg-sand-200",
                    parsed.sort === s.value && "bg-sand-200 font-bold",
                  )}
                >
                  {s.label}
                </Link>
              ))}
            </div>
            <span className="text-[13px] text-muted-600">
              {totalCount > 0 &&
                `نمایش ${toPersianDigits(from)} تا ${toPersianDigits(to)} از ${toPersianDigits(totalCount)} کالا`}
            </span>
          </div>

          {chips.length > 0 && (
            <div className="mb-5 mt-4 flex flex-wrap items-center gap-2 sm:mt-0">
              {chips.map((c) => (
                <Link
                  key={c.label}
                  href={c.href}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line-200 bg-white px-4 text-sm transition-colors hover:border-cocoa-700"
                >
                  {c.label}
                  <X className="size-4" strokeWidth={1.7} />
                </Link>
              ))}
              <Link
                href={listingHref("/products", params, {
                  size: undefined,
                  color: undefined,
                  min: undefined,
                  max: undefined,
                  stock: undefined,
                  sale: undefined,
                  q: undefined,
                })}
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-cocoa-700 px-4 text-sm font-semibold text-cream-100 transition-colors hover:bg-espresso-900"
              >
                پاک کردن همه فیلترها
              </Link>
            </div>
          )}

          <TransitionRegion>
            {products.length === 0 ? (
              <EmptyState
                icon={PackageSearch}
                title="محصولی با این فیلترها پیدا نشد"
                description="فیلترها را کمتر کنید یا دسته‌بندی دیگری را ببینید."
                actionLabel="نمایش همه محصولات"
                actionHref="/products"
              />
            ) : (
              <div className="grid grid-cols-2 gap-x-3 gap-y-3.5 sm:grid-cols-2 sm:gap-5 md:grid-cols-3">
                {products.map((p, i) => (
                  <ProductCard key={p.id} product={p} priority={i < 3} />
                ))}
              </div>
            )}
          </TransitionRegion>

          <ProductsPagination
            currentPage={page}
            totalPages={totalPages}
            hrefFor={(n) => href({ page: n === 1 ? undefined : String(n) })}
          />
        </div>
      </div>
    </div>
  );
}
