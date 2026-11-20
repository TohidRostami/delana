import Link from "next/link";
import { Eye } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/shared/product-image";
import type { ProductDTO } from "@/lib/types";
import { discountPercent, formatPrice, toPersianDigits } from "@/lib/format";
import { cn } from "@/lib/utils";

const MAX_SWATCHES = 5;

/** منحنی نرم و کند‌شونده برای هاور (ease-out-quint) */
const SOFT = "ease-[cubic-bezier(0.22,1,0.36,1)]";

export function ProductCard({
  product,
  className,
  priority,
}: {
  product: ProductDTO;
  className?: string;
  priority?: boolean;
}) {
  const image = product.images[0];
  const off = discountPercent(product.price, product.compareAtPrice);
  const colors = product.colors.slice(0, MAX_SWATCHES);
  const hidden = product.colors.length - colors.length;

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        "group/card relative flex min-w-0 flex-col gap-2 rounded-[18px] border border-line-100 bg-white p-2 pb-3 transition-[transform,box-shadow,border-color] duration-[700ms] will-change-transform motion-reduce:transition-none sm:gap-3 sm:rounded-card sm:p-2.5 sm:pb-3.5",
        SOFT,
        "hover:-translate-y-1 hover:border-caramel-500 hover:shadow-dl-lift focus-visible:-translate-y-1 focus-visible:border-caramel-500 sm:hover:-translate-y-1.5 sm:focus-visible:-translate-y-1.5",
        className,
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-sand-200 transition-colors duration-700 group-hover/card:bg-sand-300 sm:rounded-[16px]">
        {image && (
          <ProductImage
            src={image.url}
            alt={image.alt ?? product.name}
            priority={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className={cn(
              "transition-transform duration-[1100ms] will-change-transform motion-reduce:transition-none group-hover/card:scale-[1.05]",
              SOFT,
              !product.inStock && "opacity-60",
            )}
          />
        )}

        <span className="absolute end-2.5 top-2.5 flex flex-col items-end gap-1.5 sm:end-3.5 sm:top-3.5">
          {!product.inStock ? (
            <Badge
              variant="quiet"
              className="h-[22px] px-2 text-[11px] sm:h-[26px] sm:px-3 sm:text-xs"
            >
              ناموجود
            </Badge>
          ) : off > 0 ? (
            <Badge
              variant="sale"
              className="h-[22px] px-2 text-[11px] sm:h-[26px] sm:px-3 sm:text-xs"
            >
              ٪{toPersianDigits(off)}
            </Badge>
          ) : (
            product.isNew && (
              <Badge
                variant="new"
                className="h-[22px] bg-ivory-50 px-2 text-[11px] sm:h-[26px] sm:px-3 sm:text-xs"
              >
                جدید
              </Badge>
            )
          )}
        </span>

        <span className="absolute inset-x-3 bottom-3 hidden h-[42px] translate-y-3 items-center justify-center gap-2 rounded-full bg-ivory-50 text-[13px] font-semibold text-cocoa-700 opacity-0 transition-[opacity,transform] duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:translate-y-0 group-hover/card:opacity-100 sm:flex">
          <Eye className="size-[18px]" strokeWidth={1.7} />
          مشاهده سریع
        </span>
      </div>

      <div className="flex flex-col gap-1 px-1">
        <span className="text-xs text-muted-600">{product.category.title}</span>
        <h3 className="text-[13px] font-semibold leading-[1.6] transition-[background-size] duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:bg-[length:100%_1.5px] sm:text-[15px]">
          {product.name}
        </h3>

        {colors.length > 0 && (
          <div className="flex items-center gap-1.5" aria-label="رنگ‌های موجود">
            {colors.map((c) => (
              <span
                key={c.id}
                title={c.name}
                className="size-3.5 shrink-0 rounded-full border border-espresso-900/20"
                style={{ backgroundColor: c.hexValue ?? "#d4d4d4" }}
              />
            ))}
            {hidden > 0 && (
              <span className="text-[11px] text-muted-600">
                +{toPersianDigits(hidden)}
              </span>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-sm font-extrabold sm:text-base">
            {formatPrice(product.price)}
          </span>
          <span className="text-xs font-medium text-muted-600">تومان</span>
        </div>
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-xs text-muted-600 line-through sm:text-[13px]">
              {formatPrice(product.compareAtPrice)}
            </span>
            {off > 0 && (
              <span className="text-xs font-bold text-sale-700">
                ٪{toPersianDigits(off)} تخفیف
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
