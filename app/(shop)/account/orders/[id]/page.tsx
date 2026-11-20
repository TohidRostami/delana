import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ChevronRight, MapPin } from "lucide-react";

import { Panel } from "@/components/shop/ui-bits";
import { ProductImage } from "@/components/shared/product-image";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import { siteConfig } from "@/lib/content";
import { formatJalali } from "@/lib/date";
import { formatPhoneDisplay, formatPrice, formatToman, toPersianDigits } from "@/lib/format";
import { ORDER_STATUS_LABELS, ORDER_TRACK_STEPS, orderTrackProgress } from "@/lib/order-status";
import { getOrderForCustomer } from "@/lib/queries/orders";
import { cn } from "@/lib/utils";

export const metadata = { title: "جزئیات سفارش", robots: { index: false } };

export default async function CustomerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login?redirect=/account/orders");

  const { id } = await params;
  const order = await getOrderForCustomer(id, session.user.id);
  // «وجود ندارد» و «مال دیگری است» یک 404 مشترک دارند.
  if (!order) notFound();

  const progress = orderTrackProgress(order.status);

  return (
    <>
      <Link href="/account/orders" className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-cocoa-700">
        <ChevronRight className="size-[18px]" strokeWidth={1.7} />
        بازگشت به سفارش‌ها
      </Link>

      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="t-h3">سفارش {toPersianDigits(order.orderNumber)}</h1>
            <div className="mt-1 text-[13px] text-muted-600">
              {formatJalali(order.createdAt)} · {siteConfig.shipping.methods[order.shippingMethod].label}
            </div>
          </div>
          <Badge variant={order.status === "DELIVERED" ? "ok" : order.status === "CANCELLED" || order.status === "REFUNDED" ? "quiet" : "warn"}>
            {ORDER_STATUS_LABELS[order.status] ?? order.status}
          </Badge>
        </div>

        {progress != null && progress > 0 && (
          <div className="mt-5 flex items-center gap-2 text-xs text-muted-600">
            {ORDER_TRACK_STEPS.map((label, i) => (
              <span key={label} className="contents">
                <span className={cn(i < progress && "font-semibold text-espresso-900")}>{label}</span>
                {i < ORDER_TRACK_STEPS.length - 1 && (
                  <i className={cn("block h-1 flex-1 rounded-sm", i < progress - 1 ? "bg-cocoa-700" : "bg-sand-200")} />
                )}
              </span>
            ))}
          </div>
        )}
      </Panel>

      <Panel>
        <h2 className="t-h3 mb-3.5 flex items-center gap-2">
          <MapPin className="size-5 text-cocoa-700" strokeWidth={1.7} />
          آدرس ارسال
        </h2>
        <div className="flex flex-col gap-1 text-sm">
          <b>{order.address.fullName}</b>
          <span dir="ltr" className="text-start text-muted-600">{formatPhoneDisplay(order.address.phone)}</span>
          <span className="text-muted-600">
            {order.address.province}، {order.address.city}، {order.address.addressLine}
          </span>
          <span className="text-muted-600">کد پستی: {toPersianDigits(order.address.postalCode)}</span>
        </div>
      </Panel>

      <Panel>
        <h2 className="t-h3 mb-2">اقلام سفارش</h2>
        <ul className="divide-y divide-line-200">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3">
              <span className="relative block h-[78px] w-16 shrink-0 rounded-xl bg-sand-200">
                {item.image && <ProductImage src={item.image} alt={item.name} sizes="64px" className="rounded-xl p-[8%]" />}
                <em className="absolute -top-1.5 -right-1.5 z-[1] flex size-[22px] items-center justify-center rounded-full bg-cocoa-700 text-xs font-bold not-italic text-cream-100">
                  {toPersianDigits(item.quantity)}
                </em>
              </span>
              <div className="min-w-0 flex-1 text-sm">
                {item.productSlug ? (
                  <Link href={`/products/${item.productSlug}`} className="font-bold hover:underline">{item.name}</Link>
                ) : (
                  <b>{item.name}</b>
                )}
                <div className="mt-0.5 text-xs text-muted-600">
                  {[item.size && `سایز ${toPersianDigits(item.size)}`, item.color].filter(Boolean).join(" · ")}
                </div>
              </div>
              <b className="text-[13px]">{formatToman(item.price * item.quantity)}</b>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel>
        <h2 className="t-h3 mb-4">جزئیات پرداخت</h2>
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between"><span>جمع کالاها</span><span>{formatToman(order.subtotal)}</span></div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-sale-700">
              <span>تخفیف{order.discountCode ? ` (${order.discountCode.code})` : ""}</span>
              <span>{formatPrice(order.discountAmount)}− تومان</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>هزینه ارسال</span>
            <span>{order.shippingCost > 0 ? formatToman(order.shippingCost) : "رایگان"}</span>
          </div>
          <div className="flex justify-between border-t border-dashed border-line-200 pt-3.5 text-[17px] font-extrabold">
            <span>مبلغ نهایی</span>
            <span>{formatToman(order.total)}</span>
          </div>
          {order.gatewayRef && (
            <div className="flex justify-between text-xs text-muted-600">
              <span>کد پیگیری پرداخت</span>
              <span dir="ltr">{order.gatewayRef}</span>
            </div>
          )}
        </div>
      </Panel>
    </>
  );
}
