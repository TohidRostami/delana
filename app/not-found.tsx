import Link from "next/link";
import { ChevronLeft, Search } from "lucide-react";

import { SiteHeader } from "@/components/layout/header";
import { SiteFooter } from "@/components/layout/footer";
import { ProductCard } from "@/components/shared/product-card";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/content";
import { getLatestProducts } from "@/lib/queries/products";

export const revalidate = 300;

export default async function NotFound() {
  const { notFound } = siteConfig;
  const products = await getLatestProducts(4).catch(() => []);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="wrap flex-1">
        <div className="flex flex-col items-center gap-[18px] pb-20 pt-14 text-center sm:pt-16">
          <span aria-hidden className="text-[110px] font-extrabold leading-none tracking-tight text-sand-300 sm:text-[160px]">
            ۴۰۴
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/seed/scarf-caramel.svg" alt="" className="-mt-16 w-40 sm:-mt-[90px] sm:w-[220px]" />
          <h1 className="t-h1">{notFound.title}</h1>
          <p className="max-w-[460px] text-muted-600">{notFound.body}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild variant="pill" size="pill">
              <Link href="/">بازگشت به خانه</Link>
            </Button>
            <Button asChild variant="pill-outline" size="pill">
              <Link href="/search">
                <Search strokeWidth={1.7} />
                جستجو در {siteConfig.site.name}
              </Link>
            </Button>
          </div>
        </div>

        {products.length > 0 && (
          <section className="pb-12">
            <div className="mb-3.5 flex items-end justify-between gap-4 sm:mb-[22px]">
              <h2 className="t-h2">{notFound.suggestionsTitle}</h2>
              <Link href="/products" className="inline-flex items-center gap-1 text-sm font-semibold text-cocoa-700">
                مشاهده همه
                <ChevronLeft className="size-[18px]" strokeWidth={1.7} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
