"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, Ruler, RotateCcw, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductGallery } from "@/components/shop/product-gallery";
import { SizeGuideDialog } from "@/components/shop/size-guide-dialog";
import { discountPercent, formatPrice, toPersianDigits } from "@/lib/format";
import { siteConfig } from "@/lib/content";
import { useCartStore } from "@/lib/store/cart";
import { cn } from "@/lib/utils";
import type { ProductDetailDTO } from "@/lib/types";

const LOW_STOCK = 3;
const MAX_QTY = 10;

export function ProductPurchaseSection({
  product,
  freeShipping,
}: {
  product: ProductDetailDTO;
  freeShipping: string | null;
}) {
  const hasColors = product.colors.length > 0;
  const addItem = useCartStore((s) => s.addItem);
  const [colorId, setColorId] = useState<string | null>(product.colors[0]?.id ?? null);

  const variantsForColor = useMemo(
    () => (hasColors ? product.variants.filter((v) => v.colorId === colorId) : product.variants),
    [hasColors, product.variants, colorId],
  );
  const hasVariants = variantsForColor.length > 0;
  const firstAvailable = (list: typeof variantsForColor) =>
    list.find((v) => v.stock > 0)?.id ?? list[0]?.id ?? null;

  const [variantId, setVariantId] = useState<string | null>(() => firstAvailable(variantsForColor));
  const [qty, setQty] = useState(1);
  const [guideOpen, setGuideOpen] = useState(false);

  const variant = product.variants.find((v) => v.id === variantId);
  const stock = hasVariants ? (variant?.stock ?? 0) : MAX_QTY;
  const inStock = hasVariants ? stock > 0 : product.inStock;
  const maxQty = Math.max(1, Math.min(MAX_QTY, stock));
  const safeQty = Math.min(qty, maxQty);

  const colorImages = hasColors ? product.images.filter((i) => i.colorId === colorId) : product.images;
  const gallery = colorImages.length > 0 ? colorImages : product.images;
  const colorName = product.colors.find((c) => c.id === colorId)?.name;
  const off = discountPercent(product.price, product.compareAtPrice);

  const guideRows = useMemo(() => {
    const seen = new Set<string>();
    const rows: { name: string; description: string | null }[] = [];
    for (const v of product.variants) {
      if (!v.size || seen.has(v.size.name)) continue;
      seen.add(v.size.name);
      rows.push({ name: v.size.name, description: v.size.description });
    }
    return rows;
  }, [product.variants]);

  function selectColor(id: string) {
    setColorId(id);
    setVariantId(firstAvailable(product.variants.filter((v) => v.colorId === id)));
    setQty(1);
  }

  function handleAdd() {
    if (!inStock || (hasVariants && !variant)) return;
    const img = product.images.find((i) => i.colorId === variant?.colorId) ?? product.images[0];
    addItem(
      {
        productId: product.id,
        variantId: variant?.id ?? product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        size: variant?.size?.name ?? null,
        color: variant?.color?.name ?? null,
        categorySlug: product.category.slug,
        image: img?.url ?? null,
      },
      safeQty,
    );
    toast.success("به سبد خرید اضافه شد", {
      description: product.name,
      action: { label: "مشاهده سبد", onClick: () => window.location.assign(`${window.location.origin}/cart`) },
    });
  }

  const total = product.price * safeQty;
  const totalOld = product.compareAtPrice ? product.compareAtPrice * safeQty : null;
  const addLabel = inStock ? siteConfig.ui.addToCart : siteConfig.ui.outOfStock;

  const perks = [
    { Icon: Truck, text: freeShipping ? `ارسال رایگان بالای ${freeShipping}` : "ارسال به سراسر ایران" },
    { Icon: RotateCcw, text: `${toPersianDigits(siteConfig.shipping.returnDays)} روز ضمانت بازگشت` },
    { Icon: ShieldCheck, text: "ضمانت اصالت کالا" },
  ];

  return (
    <>
      <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
        <ProductGallery key={colorId ?? "all"} images={gallery} productName={product.name} />

        <div className="flex flex-col gap-5 sm:gap-6">
          {(off > 0 || product.isNew) && (
            <div className="flex gap-2">
              {product.isNew && <Badge variant="new">جدید</Badge>}
              {off > 0 && <Badge variant="sale">{toPersianDigits(off)}٪ تخفیف</Badge>}
            </div>
          )}

          <div>
            <h1 className="t-h1">{product.name}</h1>
            <p className="t-sm text-muted-600">
              {product.category.title}
              {product.sku && ` · کد کالا ${toPersianDigits(product.sku)}`}
            </p>
          </div>

          {hasColors && (
            <div>
              <span className="mb-2.5 block text-sm font-semibold">
                رنگ{colorName ? `: ${colorName}` : ""}
              </span>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectColor(c.id)}
                    aria-label={c.name}
                    aria-pressed={c.id === colorId}
                    title={c.name}
                    className={cn(
                      "size-10 rounded-full border-[3px] border-white shadow-[0_0_0_1px_var(--line-200)] transition-shadow",
                      c.id === colorId && "shadow-[0_0_0_2px_var(--cocoa-700)]",
                    )}
                    style={{ backgroundColor: c.hexValue ?? "#d4d4d4" }}
                  />
                ))}
              </div>
            </div>
          )}

          {hasVariants && variantsForColor.some((v) => v.size) && (
            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-sm font-semibold">انتخاب سایز</span>
                <button
                  type="button"
                  onClick={() => setGuideOpen(true)}
                  aria-haspopup="dialog"
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-cocoa-700 hover:underline"
                >
                  <Ruler className="size-[18px]" strokeWidth={1.7} />
                  راهنمای سایز
                </button>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {variantsForColor.map((v) => {
                  const out = v.stock <= 0;
                  const on = v.id === variantId;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={out}
                      aria-label={`سایز ${v.size?.name ?? ""}`}
                      aria-pressed={on}
                      onClick={() => {
                        setVariantId(v.id);
                        setQty(1);
                      }}
                      className={cn(
                        "flex size-[46px] items-center justify-center rounded-full text-[15px] font-semibold transition-colors sm:size-[52px]",
                        out && "cursor-not-allowed border border-dashed border-line-200 bg-transparent text-[#9b8574] line-through",
                        !out && on && "bg-cocoa-700 text-cream-100",
                        !out && !on && "bg-sand-200 hover:bg-sand-300",
                      )}
                    >
                      {toPersianDigits(v.size?.name ?? "—")}
                    </button>
                  );
                })}
              </div>
              {inStock && hasVariants && stock <= LOW_STOCK && (
                <p className="mt-2.5 text-[13px] text-warn-700">
                  فقط {toPersianDigits(stock)} عدد
                  {variant?.size ? ` از سایز ${toPersianDigits(variant.size.name)}` : ""} باقی مانده است.
                </p>
              )}
            </div>
          )}

          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="mb-2 block text-sm font-semibold">تعداد</span>
              <div className="inline-flex h-[52px] items-center gap-1.5 rounded-full bg-sand-200 p-1">
                <button
                  type="button"
                  aria-label="افزایش"
                  disabled={!inStock || safeQty >= maxQty}
                  onClick={() => setQty(safeQty + 1)}
                  className="flex size-11 items-center justify-center rounded-full transition-colors hover:bg-sand-300 disabled:opacity-40"
                >
                  <Plus className="size-5" strokeWidth={1.7} />
                </button>
                <b className="min-w-7 text-center text-base">{toPersianDigits(safeQty)}</b>
                <button
                  type="button"
                  aria-label="کاهش"
                  disabled={safeQty <= 1}
                  onClick={() => setQty(safeQty - 1)}
                  className="flex size-11 items-center justify-center rounded-full transition-colors hover:bg-sand-300 disabled:opacity-40"
                >
                  <Minus className="size-5" strokeWidth={1.7} />
                </button>
              </div>
            </div>
            <div className="text-left">
              <span className="block text-sm font-semibold">قیمت کل</span>
              {totalOld && totalOld > total && (
                <div className="text-sm text-muted-600 line-through">{formatPrice(totalOld)}</div>
              )}
              <div className="text-2xl font-extrabold leading-[1.3] sm:text-3xl">
                {formatPrice(total)}{" "}
                <small className="text-sm font-medium text-muted-600">تومان</small>
              </div>
            </div>
          </div>

          <Button
            variant="pill"
            size="pill-lg"
            disabled={!inStock}
            onClick={handleAdd}
            className="hidden w-full sm:flex"
          >
            <ShoppingBag strokeWidth={1.7} />
            {addLabel}
          </Button>

          <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
            {perks.map(({ Icon, text }) => (
              <div
                key={text}
                className="flex flex-col items-center gap-1.5 rounded-field bg-cream-100 px-1.5 py-3 text-center text-[11px] leading-[1.6] sm:text-[13px]"
              >
                <Icon className="size-[22px] text-cocoa-700" strokeWidth={1.7} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* mobile buy bar */}
      <div className="fixed inset-x-0 bottom-0 z-[15] flex items-center gap-3 border-t border-line-200 bg-white px-4 py-3 sm:hidden">
        <div className="shrink-0 leading-tight">
          <div className="text-[11px] text-muted-600">قیمت کل</div>
          <div className="text-lg font-extrabold">
            {formatPrice(total)} <small className="text-[11px] font-medium text-muted-600">تومان</small>
          </div>
        </div>
        <Button variant="pill" size="pill" disabled={!inStock} onClick={handleAdd} className="flex-1">
          <ShoppingBag strokeWidth={1.7} />
          {inStock ? "افزودن به سبد" : addLabel}
        </Button>
      </div>

      <SizeGuideDialog
        open={guideOpen}
        onOpenChange={setGuideOpen}
        productName={product.name}
        sizes={guideRows}
      />
    </>
  );
}

