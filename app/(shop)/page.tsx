import type { Metadata } from "next";

import { Hero } from "@/components/home/hero";
import { CategoriesSection } from "@/components/home/categories-section";
import { LatestSection } from "@/components/home/latest-section";
import { Promos } from "@/components/home/promos";
import { ValueProps } from "@/components/home/value-props";
import { siteConfig } from "@/lib/content";
import { getCategories, getLatestProducts } from "@/lib/queries/products";

export const revalidate = 300;

export const metadata: Metadata = {
  title: siteConfig.seo.defaultTitle,
  description: siteConfig.seo.defaultDescription,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [categories, latest] = await Promise.all([
    getCategories(),
    getLatestProducts(24),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: siteConfig.site.name,
    alternateName: siteConfig.site.nameLatin,
    description: siteConfig.site.description,
    url: process.env.NEXT_PUBLIC_SITE_URL ?? siteConfig.site.url,
    telephone: siteConfig.contact.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.contact.address,
      addressCountry: "IR",
    },
  };

  return (
    <div className="wrap">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="pt-2 sm:pt-7">
        <Hero thumbs={latest.slice(0, 6)} />
      </div>
      <CategoriesSection categories={categories} />
      <LatestSection products={latest} />
      <Promos />
      <ValueProps />
    </div>
  );
}
