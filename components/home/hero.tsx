import { HeroSlider } from "@/components/home/hero-slider";
import { siteConfig } from "@/lib/content";
import { getHeroImages } from "@/lib/queries/hero-images";
import type { ProductDTO } from "@/lib/types";

/**
 * هیرو: اسلایدر تمام‌عرض از تصاویر ثبت‌شده در پنل مدیریت (تنظیمات ← تصاویر هیرو).
 * بدون متن؛ خود تصویر لینک به صفحهٔ فروشگاه است.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function Hero(_props: { thumbs?: ProductDTO[] }) {
  const hero = siteConfig.home.hero;
  const uploaded = await getHeroImages({ activeOnly: true });
  const images =
    uploaded.length > 0 ? uploaded.map((h) => h.url) : [hero.fallbackImage];

  return (
    <>
      <h1 className="sr-only">{siteConfig.site.name}</h1>
      <HeroSlider
        images={images}
        href="/products"
        label="مشاهده محصولات فروشگاه"
        alt={hero.fallbackAlt}
      />
    </>
  );
}
