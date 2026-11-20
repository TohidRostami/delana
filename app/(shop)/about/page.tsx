import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { ConfigIcon } from "@/components/shared/config-icon";
import { ProductCard } from "@/components/shared/product-card";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/content";
import { getFeaturedProducts, getLatestProducts } from "@/lib/queries/products";

export const revalidate = 300;

export const metadata: Metadata = {
  title: `درباره ${siteConfig.site.name}`,
  description: siteConfig.site.description,
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const { about } = siteConfig;
  const featured = await getFeaturedProducts(4);
  const products = featured.length >= 4 ? featured : await getLatestProducts(4);

  return (
    <div className="wrap">
      <Breadcrumbs items={[{ label: "خانه", href: "/" }, { label: `درباره ${siteConfig.site.name}` }]} />

      <section className="grid items-center gap-7 py-5 lg:grid-cols-2 lg:gap-12 lg:py-10">
        <div className="flex flex-col gap-4">
          <span className="t-eyebrow">{about.eyebrow}</span>
          <h1 className="t-display">{about.title}</h1>
          {about.paragraphs.map((p, i) => (
            <p key={i} className="t-body text-muted-600">{p}</p>
          ))}
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="pill" size="pill">
              <Link href="/products">مشاهده محصولات</Link>
            </Button>
            <Button asChild variant="pill-outline" size="pill">
              <Link href="/contact">تماس با ما</Link>
            </Button>
          </div>
        </div>
        <div className="flex aspect-[5/4] items-center justify-center rounded-xl bg-sand-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={about.image} alt="" className="h-[86%] w-[70%] object-contain" />
        </div>
      </section>

      <section className="py-8 sm:py-11">
        <h2 className="t-h2 mb-3.5 sm:mb-[22px]">{about.pillarsTitle}</h2>
        <div className="grid gap-3.5 sm:gap-5 md:grid-cols-3">
          {about.pillars.map((p) => (
            <div key={p.title} className="flex flex-col gap-2.5 rounded-lg bg-cream-100 p-6 sm:p-7">
              <span className="flex size-14 items-center justify-center rounded-full bg-sand-200 text-cocoa-700">
                <ConfigIcon name={p.icon} className="size-7" />
              </span>
              <h3 className="t-h3">{p.title}</h3>
              <p className="t-sm text-muted-600">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-8 sm:py-11">
        <figure className="flex flex-col items-center gap-3.5 rounded-lg bg-cocoa-700 px-5 py-8 text-center text-cream-100 sm:rounded-xl sm:p-14">
          <p className="max-w-[760px] text-lg font-semibold leading-[1.8] sm:text-2xl">{about.quote.text}</p>
          <figcaption className="text-sm text-sand-200">{about.quote.author}</figcaption>
        </figure>
      </section>

      {products.length > 0 && (
        <section className="pb-14 pt-8 sm:pt-11">
          <div className="mb-3.5 flex items-end justify-between gap-4 sm:mb-[22px]">
            <h2 className="t-h2">{about.collectionTitle}</h2>
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
    </div>
  );
}
