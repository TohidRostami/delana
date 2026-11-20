import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  ProductsListing,
  type ProductsListingSearchParams,
} from "@/components/shop/products-listing";
import { siteConfig } from "@/lib/content";
import { getCategoryBySlug } from "@/lib/queries/products";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<ProductsListingSearchParams>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.title,
    description:
      category.description ?? `مجموعه‌ی ${category.title} در بوتیک ${siteConfig.site.name}.`,
    alternates: { canonical: `/products/category/${category.slug}` },
  };
}

export default async function ProductCategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  return (
    <ProductsListing
      categorySlug={category.slug}
      categoryTitle={category.title}
      categoryDescription={category.description}
      searchParams={await searchParams}
    />
  );
}
