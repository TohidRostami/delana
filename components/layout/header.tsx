import { SiteHeaderClient } from "@/components/shop/site-header-client";
import { getCategories } from "@/lib/queries/products";
import { getSiteSettings } from "@/lib/queries/settings";
import { formatTomanShort } from "@/lib/format";

export async function SiteHeader() {
  const [categories, settings] = await Promise.all([
    getCategories(),
    getSiteSettings(),
  ]);
  const freeShipping =
    settings.freeShippingThreshold != null
      ? formatTomanShort(settings.freeShippingThreshold)
      : null;
  return <SiteHeaderClient categories={categories} freeShipping={freeShipping} />;
}
