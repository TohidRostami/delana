"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Lock, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { CheckoutSteps } from "@/components/shop/checkout-steps";
import { EmptyState } from "@/components/shared/empty-state";
import { ProductImage } from "@/components/shared/product-image";
import { Field, SelectInput, TextArea, TextInput } from "@/components/shop/form-ui";
import { OptionCard, Panel, PanelHead, SummaryRow } from "@/components/shop/ui-bits";
import { Button } from "@/components/ui/button";
import { addressSchema } from "@/lib/address";
import { computeDiscountAmount } from "@/lib/discount-calc";
import { siteConfig, type ShippingMethodKey } from "@/lib/content";
import { formatPrice, formatToman, toLatinDigits, toPersianDigits } from "@/lib/format";
import { IRAN_PROVINCES } from "@/lib/iran-provinces";
import { useCartStore } from "@/lib/store/cart";
import { cn } from "@/lib/utils";
import { placeOrder } from "@/app/(shop)/checkout/actions";

export type CheckoutAddress = {
  id: string;
  fullName: string;
  phone: string;
  province: string;
  city: string;
  addressLine: string;
  postalCode: string;
  isDefault: boolean;
};

type Settings = {
  freeShippingThreshold: number | null;
  standardShippingCost: number;
  tipaxShippingCost: number;
};

type FormErrors = Partial<Record<"fullName" | "phone" | "province" | "city" | "addressLine" | "postalCode", string>>;

export function CheckoutForm({
  defaultName,
  defaultPhone,
  addresses,
  settings,
}: {
  defaultName: string;
  defaultPhone: string;
  addresses: CheckoutAddress[];
  settings: Settings;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const items = useCartStore((s) => s.items);
  const discountCode = useCartStore((s) => s.discountCode);

  const [selectedId, setSelectedId] = useState<string | "new">(
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? "new",
  );
  const [showNew, setShowNew] = useState(addresses.length === 0);
  const [form, setForm] = useState({
    fullName: defaultName,
    phone: defaultPhone,
    province: "تهران",
    city: "",
    addressLine: "",
    postalCode: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [method, setMethod] = useState<ShippingMethodKey>("POST");
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const count = items.reduce((n, i) => n + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const listTotal = items.reduce((s, i) => s + (i.compareAtPrice ?? i.price) * i.quantity, 0);
  const saved = listTotal - subtotal;
  const discountAmount = discountCode
    ? computeDiscountAmount(discountCode.type, discountCode.value, subtotal)
    : 0;

  const freeShip = settings.freeShippingThreshold != null && subtotal >= settings.freeShippingThreshold;
  const costOf = (m: ShippingMethodKey) =>
    freeShip ? 0 : m === "TIPAX" ? settings.tipaxShippingCost : settings.standardShippingCost;
  const shippingCost = costOf(method);
  const payable = Math.max(0, subtotal + shippingCost - discountAmount);

  const usingNew = selectedId === "new";

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    let address: typeof form | undefined;
    if (usingNew) {
      const parsed = addressSchema.safeParse({
        ...form,
        phone: toLatinDigits(form.phone),
        postalCode: toLatinDigits(form.postalCode),
      });
      if (!parsed.success) {
        const next: FormErrors = {};
        for (const issue of parsed.error.issues) {
          const key = issue.path[0] as keyof FormErrors;
          next[key] ??= issue.message;
        }
        setErrors(next);
        setError("اطلاعات آدرس را بررسی کنید.");
        return;
      }
      address = parsed.data;
    }
    if (!terms) {
      setError("برای ادامه باید قوانین و مقررات را بپذیرید.");
      return;
    }

    setLoading(true);
    const result = await placeOrder({
      items: items.map((i) => ({ productId: i.productId, variantId: i.variantId, quantity: i.quantity })),
      shippingMethod: method,
      ...(usingNew ? { address } : { addressId: selectedId }),
      discountCode: discountCode?.code ?? null,
    });

    if ("error" in result) {
      setError(result.error);
      toast.error(result.error);
      setLoading(false);
      return;
    }
    // به درگاه (یا شبیه‌ساز) می‌رویم؛ سبد در صفحهٔ نتیجه پاک می‌شود.
    window.location.href = result.redirectUrl;
  }

  if (!mounted) return <div className="wrap min-h-[60vh]" />;

  if (items.length === 0) {
    return (
      <div className="wrap py-10 sm:py-16">
        <EmptyState
          icon={ShoppingBag}
          title="سبد خرید شما خالی است"
          description="برای ادامه، ابتدا چند محصول به سبد اضافه کنید."
          actionLabel="مشاهده محصولات"
          actionHref="/products"
        />
      </div>
    );
  }

  const methods = (["POST", "TIPAX"] as const).map((key) => ({
    key,
    ...siteConfig.shipping.methods[key],
    cost: costOf(key),
  }));

  return (
    <form onSubmit={handleSubmit} noValidate className="wrap pb-28 sm:pb-12">
      <CheckoutSteps current={2} />
      <div className="mt-[18px]">
        <h1 className="t-h1">ارسال و پرداخت</h1>
      </div>

      <div className="mt-3 grid items-start gap-5 lg:grid-cols-[1fr_380px] lg:gap-8">
        <div className="flex flex-col gap-5">
          {addresses.length > 0 && (
          <Panel>
            <PanelHead
              title="آدرس تحویل"
              action={
                addresses.length > 0 && (
                  <Button
                    type="button"
                    variant="pill-ghost"
                    size="pill-sm"
                    onClick={() => {
                      setSelectedId("new");
                      setShowNew(true);
                    }}
                  >
                    <Plus strokeWidth={1.7} />
                    آدرس جدید
                  </Button>
                )
              }
            />
            {addresses.length > 0 && (
              <div className="flex flex-col gap-3">
                {addresses.map((a) => (
                  <OptionCard
                    key={a.id}
                    name="address"
                    value={a.id}
                    checked={selectedId === a.id}
                    onSelect={() => setSelectedId(a.id)}
                    title={a.fullName}
                    description={`${a.province}، ${a.city}، ${a.addressLine} · کد پستی ${toPersianDigits(a.postalCode)} · ${toPersianDigits(a.phone)}`}
                  />
                ))}
              </div>
            )}
          </Panel>
          )}

          {(showNew || usingNew) && (
            <Panel className={cn(!usingNew && "hidden")}>
              <h2 className="t-h3 mb-[18px]">{addresses.length > 0 ? "افزودن آدرس جدید" : "آدرس تحویل"}</h2>
              <div className="grid gap-[18px] sm:grid-cols-2">
                <Field label="نام و نام خانوادگی گیرنده" htmlFor="f-name" error={errors.fullName}>
                  <TextInput id="f-name" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="مثلاً سارا محمدی" aria-invalid={!!errors.fullName} autoComplete="name" />
                </Field>
                <Field label="شماره موبایل" htmlFor="f-phone" error={errors.phone}>
                  <TextInput id="f-phone" dir="ltr" inputMode="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="09123456789" className="text-right" aria-invalid={!!errors.phone} autoComplete="tel" />
                </Field>
                <Field label="استان" htmlFor="f-province" error={errors.province}>
                  <SelectInput id="f-province" value={form.province} onChange={(e) => set("province", e.target.value)}>
                    {IRAN_PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </SelectInput>
                </Field>
                <Field label="شهر" htmlFor="f-city" error={errors.city}>
                  <TextInput id="f-city" value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="مثلاً تهران" aria-invalid={!!errors.city} />
                </Field>
                <Field label="نشانی کامل" htmlFor="f-address" error={errors.addressLine} className="sm:col-span-2">
                  <TextArea id="f-address" value={form.addressLine} onChange={(e) => set("addressLine", e.target.value)} placeholder="خیابان، کوچه، پلاک، واحد" aria-invalid={!!errors.addressLine} />
                </Field>
                <Field label="کد پستی" htmlFor="f-postal" error={errors.postalCode} hint="۱۰ رقم، بدون خط تیره">
                  <TextInput id="f-postal" dir="ltr" inputMode="numeric" value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} placeholder="1234567890" className="text-right" aria-invalid={!!errors.postalCode} autoComplete="postal-code" />
                </Field>
              </div>
            </Panel>
          )}

          <Panel>
            <PanelHead title="روش ارسال" />
            <div className="flex flex-col gap-3">
              {methods.map((m) => (
                <OptionCard
                  key={m.key}
                  name="shipping"
                  value={m.key}
                  checked={method === m.key}
                  onSelect={() => setMethod(m.key)}
                  title={m.label}
                  description={m.description}
                  trailing={
                    <b className="whitespace-nowrap text-sm">
                      {m.cost === 0 ? "رایگان" : formatToman(m.cost)}
                    </b>
                  }
                />
              ))}
            </div>
          </Panel>

          <Panel>
            <PanelHead title="روش پرداخت" />
            <OptionCard
              name="payment"
              value="online"
              checked
              readOnly
              title="پرداخت اینترنتی"
              description="با تمام کارت‌های عضو شبکه شتاب"
            />
            <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                className="size-5 accent-cocoa-700"
              />
              <span>
                <Link href="/terms" target="_blank" className="font-semibold underline underline-offset-4">
                  قوانین و مقررات
                </Link>{" "}
                خرید از {siteConfig.site.name} را خوانده‌ام و می‌پذیرم.
              </span>
            </label>
          </Panel>
        </div>

        <aside className="lg:sticky lg:top-[108px]">
          <Panel>
            <h2 className="t-h3 mb-4">سفارش شما</h2>
            <ul className="mb-4 border-b border-line-200 pb-2.5">
              {items.map((item) => (
                <li key={item.variantId} className="flex items-center gap-3 py-2.5">
                  <span className="relative block h-[78px] w-16 shrink-0 rounded-xl bg-sand-200">
                    {item.image && (
                      <ProductImage src={item.image} alt="" sizes="64px" className="rounded-xl p-[8%]" />
                    )}
                    <em className="absolute -top-1.5 -right-1.5 z-[1] flex size-[22px] items-center justify-center rounded-full bg-cocoa-700 text-xs font-bold not-italic text-cream-100">
                      {toPersianDigits(item.quantity)}
                    </em>
                  </span>
                  <div className="min-w-0 flex-1 text-sm">
                    <b className="block">{item.name}</b>
                    <span className="text-xs text-muted-600">
                      {[item.size && `سایز ${toPersianDigits(item.size)}`, item.color].filter(Boolean).join(" · ")}
                    </span>
                  </div>
                  <b className="text-[13px]">{formatPrice(item.price * item.quantity)}</b>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-3.5 text-sm">
              <SummaryRow label={`قیمت کالاها (${toPersianDigits(count)})`} value={formatToman(listTotal)} />
              {saved > 0 && <SummaryRow tone="off" label="سود شما از تخفیف" value={`${formatPrice(saved)}− تومان`} />}
              {discountCode && (
                <SummaryRow tone="off" label={`کد «${discountCode.code}»`} value={`${formatPrice(discountAmount)}− تومان`} />
              )}
              <SummaryRow
                label={`هزینه ارسال (${siteConfig.shipping.methods[method].label})`}
                value={shippingCost === 0 ? "رایگان" : formatToman(shippingCost)}
              />
              <div className="flex justify-between gap-3 border-t border-dashed border-line-200 pt-3.5 text-[17px] font-extrabold">
                <span>مبلغ قابل پرداخت</span>
                <span>{formatToman(payable)}</span>
              </div>

              {error && (
                <p role="alert" className="rounded-field bg-white px-3.5 py-3 text-[13px] text-sale-700">
                  {error}
                </p>
              )}

              <Button type="submit" variant="pill" size="pill-lg" disabled={loading} className="hidden w-full sm:flex">
                {loading ? "در حال انتقال به درگاه…" : "پرداخت و ثبت سفارش"}
              </Button>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-600">
                <Lock className="size-4" strokeWidth={1.7} />
                پرداخت امن از طریق درگاه بانکی
              </div>
            </div>
          </Panel>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-[15] flex items-center gap-3 border-t border-line-200 bg-white px-4 py-3 sm:hidden">
        <div className="shrink-0 leading-tight">
          <div className="text-[11px] text-muted-600">مبلغ قابل پرداخت</div>
          <div className="text-lg font-extrabold">
            {formatPrice(payable)} <small className="text-[11px] font-medium text-muted-600">تومان</small>
          </div>
        </div>
        <Button type="submit" variant="pill" size="pill" disabled={loading} className="flex-1">
          {loading ? "در حال انتقال…" : "پرداخت و ثبت سفارش"}
        </Button>
      </div>
    </form>
  );
}
