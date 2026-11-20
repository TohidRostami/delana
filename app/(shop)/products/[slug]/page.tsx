import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ProductCard } from "@/components/shared/product-card";
import { ProductPurchaseSection } from "@/components/shop/product-purchase-section";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getSiteSettings } from "@/lib/queries/settings";
import { formatTomanShort, parseSpecifications } from "@/lib/format";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries/products";
import { siteConfig } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  return {
    title: product.metaTitle ?? product.name,
    description: product.metaDescription ?? product.description.slice(0, 160),
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: product.images[0] ? [{ url: product.images[0].url }] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, settings] = await Promise.all([
    getRelatedProducts(product.id, product.category.id, 4),
    getSiteSettings(),
  ]);
  const inStock =
    product.variants.length === 0 || product.variants.some((v) => v.stock > 0);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? siteConfig.site.url;
  const productUrl = `${siteUrl}/products/${product.slug}`;
  const categoryUrl = `${siteUrl}/products/category/${product.category.slug}`;
  const freeShipping =
    settings.freeShippingThreshold != null
      ? formatTomanShort(settings.freeShippingThreshold)
      : null;
  const specs = parseSpecifications(product.specifications);
  const paragraphs = product.description.split(/\n{1,}/).map((p) => p.trim()).filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    category: product.category.title,
    image: product.images.map((img) => img.url),
    sku: product.sku ?? undefined,
    brand: { "@type": "Brand", name: siteConfig.site.name },
    offers: {
      "@type": "Offer",
      // قیمت‌ها تومان‌اند؛ گوگل فقط IRR را می‌پذیرد (۱ تومان = ۱۰ ریال).
      price: product.price * 10,
      priceCurrency: "IRR",
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: productUrl,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "خانه", item: siteUrl },
      { "@type": "ListItem", position: 2, name: product.category.title, item: categoryUrl },
      { "@type": "ListItem", position: 3, name: product.name, item: productUrl },
    ],
  };

  return (
    <div className="wrap pb-24 sm:pb-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <Breadcrumbs
        items={[
          { label: "خانه", href: "/" },
          { label: product.category.title, href: `/products/category/${product.category.slug}` },
          { label: product.name },
        ]}
      />

      <ProductPurchaseSection product={product} freeShipping={freeShipping} />

      <section className="py-8 sm:py-11">
        <div className="no-scrollbar flex gap-5 overflow-x-auto border-b border-line-200 sm:gap-7" role="tablist">
          <span role="tab" aria-selected className="whitespace-nowrap border-b-2 border-cocoa-700 py-3.5 font-semibold">
            توضیحات و مشخصات
          </span>
        </div>
        <div className="grid gap-6 py-7 md:grid-cols-2 md:gap-10">
          <div className="flex flex-col gap-3">
            <h2 className="t-h3">درباره این محصول</h2>
            {paragraphs.map((p, i) => (
              <p key={i} className="t-body text-muted-600">{p}</p>
            ))}
          </div>
          {specs.length > 0 && (
            <dl className="grid grid-cols-[110px_1fr] gap-y-3 self-start text-sm sm:grid-cols-[140px_1fr]">
              {specs.map((s, i) => (
                <div key={i} className="contents">
                  <dt className="text-muted-600">{s.label}</dt>
                  <dd className="m-0 font-semibold">{s.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="pb-8">
          <div className="mb-3.5 flex items-end justify-between gap-4 sm:mb-[22px]">
            <h2 className="t-h2">ممکن است بپسندید</h2>
            <Link
              href={`/products/category/${product.category.slug}`}
              className="inline-flex items-center gap-1 text-sm font-semibold text-cocoa-700"
            >
              مشاهده همه
              <ChevronLeft className="size-[18px]" strokeWidth={1.7} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
