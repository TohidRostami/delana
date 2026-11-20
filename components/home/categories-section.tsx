import Link from "next/link";

import { ProductImage } from "@/components/shared/product-image";
import { siteConfig } from "@/lib/content";
import type { CategoryDTO } from "@/lib/types";

export function CategoriesSection({ categories }: { categories: CategoryDTO[] }) {
  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  const items = siteConfig.home.homeCategorySlugs
    .map((s) => bySlug.get(s))
    .filter((c): c is CategoryDTO => !!c);
  if (items.length === 0) return null;

  return (
    <section className="pt-8 sm:pt-11">
      <div className="mb-3.5 sm:mb-[22px]">
        <h2 className="t-h2">{siteConfig.home.categoriesTitle}</h2>
      </div>
      <div className="no-scrollbar flex gap-3.5 overflow-x-auto sm:grid sm:grid-cols-6 sm:gap-3.5 sm:overflow-visible lg:gap-5">
        {items.map((c, idx) => (
          <Link
            key={c.slug}
            href={`/products/category/${c.slug}`}
            style={{ animationDelay: `${idx * 0.08}s` }}
            className="group/cat flex w-[84px] flex-none animate-dl-rise flex-col items-center gap-2.5 text-[13px] font-semibold sm:w-auto sm:text-[15px]"
          >
            <span className="relative aspect-square w-full rounded-full bg-sand-200 transition-[background,transform,box-shadow] duration-[500ms] ease-dl before:pointer-events-none before:absolute before:-inset-2 before:scale-90 before:rounded-full before:border-[1.5px] before:border-cocoa-700 before:opacity-0 before:transition-[opacity,transform] before:duration-[450ms] before:ease-dl before:content-[''] group-hover/cat:-translate-y-2 group-hover/cat:bg-sand-300 group-hover/cat:shadow-[0_22px_32px_-22px_rgba(43,31,24,0.55)] group-hover/cat:before:scale-100 group-hover/cat:before:opacity-100">
              {c.image && (
                <span className="absolute inset-0 origin-[50%_6%] group-hover/cat:animate-dl-sway">
                  <ProductImage src={c.image} alt="" sizes="160px" className="p-[11%]" />
                </span>
              )}
            </span>
            <span className="bg-[linear-gradient(var(--cocoa-700),var(--cocoa-700))] bg-[length:0_2px] bg-[position:50%_100%] bg-no-repeat pb-0.5 transition-[background-size] duration-[500ms] group-hover/cat:bg-[length:100%_2px]">
              {c.title}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
