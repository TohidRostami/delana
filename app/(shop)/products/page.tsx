import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

import {
  ProductsListing,
  type ProductsListingSearchParams,
} from "@/components/shop/products-listing";
import { siteConfig } from "@/lib/content";

export const metadata: Metadata = {
  title: "همه محصولات",
  description: `همه‌ی محصولات بوتیک ${siteConfig.site.name} — مانتو، پالتو، لباس مجلسی، بافت و شال و روسری.`,
  alternates: { canonical: "/products" },
};

type Params = ProductsListingSearchParams & { category?: string };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const params = await searchParams;

  // لینک‌های قدیمی ?category=slug به مسیر دسته‌بندی منتقل می‌شوند.
  if (params.category) {
    const { category, ...rest } = params;
    const qs = new URLSearchParams(
      Object.entries(rest).filter((e): e is [string, string] => !!e[1]),
    ).toString();
    permanentRedirect(`/products/category/${encodeURIComponent(category)}${qs ? `?${qs}` : ""}`);
  }

  return <ProductsListing searchParams={params} />;
}
