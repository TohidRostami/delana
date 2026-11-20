"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Lock, Minus, Plus, ShoppingBag, Trash2, Check } from "lucide-react";
import { toast } from "sonner";

import { CheckoutSteps } from "@/components/shop/checkout-steps";
import { EmptyState } from "@/components/shared/empty-state";
import { ProductImage } from "@/components/shared/product-image";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/shop/form-ui";
import { computeDiscountAmount } from "@/lib/discount-calc";
import { formatPrice, formatToman, toPersianDigits } from "@/lib/format";
import { useCartStore } from "@/lib/store/cart";
import { getCartItemsStatus, applyDiscountCode } from "@/app/(shop)/cart/actions";

export function CartView({ freeShippingThreshold }: { freeShippingThreshold: number | null }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const updatePrice = useCartStore((s) => s.updatePrice);
  const discountCode = useCartStore((s) => s.discountCode);
  const setDiscountCode = useCartStore((s) => s.setDiscountCode);

  const [codeInput, setCodeInput] = useState("");
  const [applying, setApplying] = useState(false);
  const [stockByVariant, setStockByVariant] = useState<Record<string, number>>({});

  // سبد ذخیره‌شده در مرورگر ممکن است قدیمی باشد؛ یک بار با دیتابیس هم‌خوان می‌شود:
  // کالاهای ناموجود حذف، تعداد به موجودی کاهش و قیمت به‌روز می‌شود.
  useEffect(() => {
    if (!mounted || items.length === 0) return;
    let cancelled = false;

    getCartItemsStatus(items.map((i) => ({ productId: i.productId, variantId: i.variantId }))).then(
      (statuses) => {
        if (cancelled) return;
        const byVariant = new Map(statuses.map((s) => [s.variantId, s]));
        const stocks: Record<string, number> = {};

        for (const item of items) {
          const status = byVariant.get(item.variantId);
          if (!status || !status.available) {
            removeItem(item.variantId);
            toast.error(`«${item.name}» دیگر در دسترس نیست و از سبد خرید حذف شد.`);
            continue;
          }
          stocks[item.variantId] = status.stock;
          if (status.stock < item.quantity) {
            if (status.stock <= 0) {
              removeItem(item.variantId);
              toast.error(`موجودی «${item.name}» تمام شده و از سبد خرید حذف شد.`);
            } else {
              setQuantity(item.variantId, status.stock);
              toast.error(
                `موجودی «${item.name}» کاهش یافته — تعداد به ${toPersianDigits(status.stock)} تغییر کرد.`,
              );
            }
            continue;
          }
          if (status.price !== item.price) {
            updatePrice(item.variantId, status.price);
            toast(`قیمت «${item.name}» به‌روزرسانی شد.`);
          }
        }
        setStockByVariant(stocks);
      },
    );
    return () => {
      cancelled = true;
    };
    // فقط یک بار پس از mount (setQuantity/updatePrice در غیر این صورت دوباره اجرا می‌کردند).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  const count = items.reduce((n, i) => n + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const listTotal = items.reduce((sum, i) => sum + (i.compareAtPrice ?? i.price) * i.quantity, 0);
  const saved = listTotal - subtotal;
  const discountAmount = discountCode
    ? computeDiscountAmount(discountCode.type, discountCode.value, subtotal)
    : 0;
  const payable = subtotal - discountAmount;

  const remaining = freeShippingThreshold != null ? Math.max(0, freeShippingThreshold - subtotal) : null;
  const progress =
    freeShippingThreshold != null && freeShippingThreshold > 0
      ? Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))
      : 0;

  async function handleApplyDiscount() {
    if (!codeInput.trim()) return;
    setApplying(true);
    const result = await applyDiscountCode(codeInput.trim(), subtotal);
    setApplying(false);
    if (!result.valid) {
      toast.error(result.error);
      return;
    }
    setDiscountCode({ id: result.id, code: result.code, type: result.type, value: result.value });
    toast.success(`کد «${result.code}» با موفقیت اعمال شد.`);
    setCodeInput("");
  }

  if (!mounted) return <div className="wrap min-h-[60vh]" />;

  if (items.length === 0) {
    return (
      <div className="wrap py-10 sm:py-16">
        <EmptyState
          icon={ShoppingBag}
          title="سبد خرید شما خالی است"
          description="هنوز محصولی به سبد خریدتان اضافه نکرده‌اید. سری به مجموعهٔ دلانا بزنید."
          actionLabel="مشاهده محصولات"
          actionHref="/products"
        />
      </div>
    );
  }

  return (
    <div className="wrap pb-28 sm:pb-14">
      <CheckoutSteps current={1} />
      <div className="mb-3 mt-[18px] flex items-baseline gap-3">
        <h1 className="t-h1">سبد خرید</h1>
        <span className="text-muted-600">{toPersianDigits(count)} کالا</span>
      </div>

      <div className="mt-3 grid items-start gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="rounded-[18px] bg-cream-100 p-[18px] sm:rounded-lg sm:p-6">
            <ul className="divide-y divide-sand-300">
              {items.map((item) => {
                const stock = stockByVariant[item.variantId];
                const maxed = stock != null && item.quantity >= stock;
                return (
                  <li
                    key={item.variantId}
                    className="grid grid-cols-[88px_1fr] gap-3.5 py-4 first:pt-0 last:pb-0 sm:grid-cols-[120px_1fr_auto] sm:gap-5 sm:py-5"
                  >
                    <Link
                      href={`/products/${item.slug}`}
                      className="relative block h-[108px] w-[88px] overflow-hidden rounded-md bg-sand-200 sm:h-[146px] sm:w-[120px]"
                    >
                      {item.image && (
                        <ProductImage src={item.image} alt={item.name} sizes="120px" className="p-[8%]" />
                      )}
                    </Link>

                    <div className="flex min-w-0 flex-col gap-1.5">
                      <Link
                        href={`/products/${item.slug}`}
                        className="text-[13px] font-semibold leading-[1.6] hover:underline sm:text-[15px]"
                      >
                        {item.name}
                      </Link>
                      <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-[13px] text-muted-600">
                        {item.color && <span>رنگ: {item.color}</span>}
                        {item.size && <span>سایز: {toPersianDigits(item.size)}</span>}
                        <span className="inline-flex items-center gap-1.5 text-success-700">
                          <Check className="size-4" strokeWidth={2} />
                          موجود در انبار
                        </span>
                      </div>
                    </div>

                    <div className="col-span-2 flex items-center justify-between gap-3 sm:col-span-1 sm:flex-col sm:items-end">
                      <div className="text-left">
                        {item.compareAtPrice && item.compareAtPrice > item.price && (
                          <span className="block text-xs text-muted-600 line-through">
                            {formatPrice(item.compareAtPrice)}
                          </span>
                        )}
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-extrabold">{formatPrice(item.price * item.quantity)}</span>
                          <span className="text-xs text-muted-600">تومان</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="inline-flex h-11 items-center gap-1.5 rounded-full bg-sand-200 p-1">
                          <button
                            type="button"
                            aria-label="افزایش"
                            disabled={maxed}
                            onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                            className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-sand-300 disabled:opacity-40"
                          >
                            <Plus className="size-[18px]" strokeWidth={1.7} />
                          </button>
                          <b className="min-w-7 text-center">{toPersianDigits(item.quantity)}</b>
                          <button
                            type="button"
                            aria-label="کاهش"
                            onClick={() => setQuantity(item.variantId, item.quantity - 1)}
                            className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-sand-300"
                          >
                            <Minus className="size-[18px]" strokeWidth={1.7} />
                          </button>
                        </div>
                        <button
                          type="button"
                          aria-label="حذف از سبد"
                          onClick={() => removeItem(item.variantId)}
                          className="flex size-11 items-center justify-center rounded-full transition-colors hover:bg-sand-200"
                        >
                          <Trash2 className="size-5" strokeWidth={1.7} />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <Link href="/products" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-cocoa-700">
            <ChevronLeft className="size-[18px] rotate-180" strokeWidth={1.7} />
            ادامه خرید از فروشگاه
          </Link>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-[108px]">
          {freeShippingThreshold != null && (
            <div className="flex flex-col gap-2.5 rounded-md bg-sand-200 px-4 py-3.5 text-[13px]">
              {remaining === 0 ? (
                <span className="font-semibold">ارسال سفارش شما رایگان است 🎉</span>
              ) : (
                <span>
                  <b>{formatToman(remaining ?? 0)}</b> دیگر خرید کنید تا ارسال رایگان شود.
                </span>
              )}
              <i className="block h-1.5 overflow-hidden rounded-[3px] bg-ivory-50">
                <b className="block h-full rounded-[3px] bg-cocoa-700 transition-[width] duration-500" style={{ width: `${progress}%` }} />
              </i>
            </div>
          )}

          <div className="rounded-[18px] bg-cream-100 p-5 sm:rounded-lg sm:p-6">
            <h2 className="t-h3 mb-4">خلاصه سفارش</h2>
            <div className="flex flex-col gap-3 text-sm">
              <Row label={`قیمت کالاها (${toPersianDigits(count)})`} value={formatToman(listTotal)} />
              {saved > 0 && <Row tone="off" label="سود شما از تخفیف" value={`${formatPrice(saved)}− تومان`} />}
              {discountCode && (
                <div className="flex items-center justify-between gap-2 text-success-700">
                  <span className="flex items-center gap-2">
                    کد «{discountCode.code}»
                    <button type="button" onClick={() => setDiscountCode(null)} className="text-xs text-muted-600 underline">
                      حذف
                    </button>
                  </span>
                  <span>{formatPrice(discountAmount)}− تومان</span>
                </div>
              )}
              <Row label="هزینه ارسال" value="در مرحله بعد" muted />
              <div className="flex items-center justify-between border-t border-dashed border-sand-300 pt-3.5 text-base font-extrabold">
                <span>مبلغ قابل پرداخت</span>
                <span>{formatToman(payable)}</span>
              </div>

              {!discountCode && (
                <div className="flex gap-2">
                  <TextInput
                    aria-label="کد تخفیف"
                    placeholder="کد تخفیف دارید؟"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleApplyDiscount()}
                    disabled={applying}
                    className="h-12"
                  />
                  <Button variant="pill-outline" className="h-12" onClick={handleApplyDiscount} disabled={applying || !codeInput.trim()}>
                    {applying ? "…" : "ثبت"}
                  </Button>
                </div>
              )}

              <Button asChild variant="pill" size="pill-lg" className="hidden w-full sm:flex">
                <Link href="/checkout">ادامه فرایند خرید</Link>
              </Button>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-600">
                <Lock className="size-4" strokeWidth={1.7} />
                پرداخت امن از طریق درگاه بانکی
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-[15] flex items-center gap-3 border-t border-line-200 bg-white px-4 py-3 sm:hidden">
        <div className="shrink-0 leading-tight">
          <div className="text-[11px] text-muted-600">مبلغ قابل پرداخت</div>
          <div className="text-lg font-extrabold">
            {formatPrice(payable)} <small className="text-[11px] font-medium text-muted-600">تومان</small>
          </div>
        </div>
        <Button asChild variant="pill" size="pill" className="flex-1">
          <Link href="/checkout">ادامه خرید</Link>
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value, muted, tone }: { label: string; value: string; muted?: boolean; tone?: "off" }) {
  return (
    <div className={`flex items-center justify-between gap-2 ${tone === "off" ? "text-sale-700" : ""}`}>
      <span>{label}</span>
      <span className={muted ? "text-muted-600" : ""}>{value}</span>
    </div>
  );
}
