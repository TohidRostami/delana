import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Check, Package, X, Clock } from "lucide-react";

import { CheckoutSteps } from "@/components/shop/checkout-steps";
import { ClearCart } from "@/components/shop/clear-cart";
import { ProductImage } from "@/components/shared/product-image";
import { Panel } from "@/components/shop/ui-bits";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { siteConfig } from "@/lib/content";
import { formatJalali } from "@/lib/date";
import { formatToman, toPersianDigits } from "@/lib/format";

export const metadata: Metadata = { title: "نتیجه پرداخت", robots: { index: false } };

type OrderRow = {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  shippingMethod: "POST" | "TIPAX";
  createdAt: Date;
  items: { id: string; name: string; size: string | null; color: string | null; price: number; quantity: number; productId: string }[];
};

export default async function CheckoutResultPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; status?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login?redirect=/account/orders");

  const { order: orderId, status } = await searchParams;
  const order = orderId
    ? ((await prisma.order.findFirst({
        where: { id: orderId, userId: session.user.id },
        include: { items: true },
      })) as OrderRow | null)
    : null;

  if (!order) {
    return (
      <div className="wrap py-16 text-center">
        <p className="text-muted-600">سفارشی با این مشخصات پیدا نشد.</p>
        <Button asChild variant="pill" size="pill" className="mt-6">
          <Link href="/products">بازگشت به فروشگاه</Link>
        </Button>
      </div>
    );
  }

  // وضعیت از دیتابیس خوانده می‌شود، نه از پارامتر URL.
  const paid = !["PENDING_PAYMENT", "CANCELLED"].includes(order.status);
  const pending = order.status === "PENDING_PAYMENT" && status === "pending";

  // تصاویر کالاها برای رسید
  const images = paid
    ? ((await prisma.productImage.findMany({
        where: { productId: { in: order.items.map((i) => i.productId) } },
        orderBy: { sortOrder: "asc" },
        select: { productId: true, url: true },
      })) as { productId: string; url: string }[])
    : [];
  const imageOf = (pid: string) => images.find((i) => i.productId === pid)?.url;

  return (
    <div className="wrap">
      <CheckoutSteps current={paid ? 3 : 2} />
      {paid && <ClearCart />}

      <div className="flex flex-col items-center gap-4 pb-6 pt-10 text-center sm:pt-12">
        <span
          className={`flex size-[88px] items-center justify-center rounded-full ${
            paid ? "bg-success-100 text-success-700" : pending ? "bg-warn-100 text-warn-700" : "bg-sale-700/10 text-sale-700"
          }`}
        >
          {paid ? <Check className="size-11" strokeWidth={2.2} /> : pending ? <Clock className="size-11" strokeWidth={2} /> : <X className="size-11" strokeWidth={2.2} />}
        </span>
        <h1 className="t-h1">
          {paid ? "سفارش شما با موفقیت ثبت شد" : pending ? "پرداخت در حال بررسی است" : "پرداخت ناموفق بود"}
        </h1>
        <p className="max-w-[520px] text-muted-600">
          {paid
            ? "از خرید شما سپاسگزاریم. وضعیت سفارش و کد رهگیری مرسوله را از بخش «سفارش‌های من» می‌توانید ببینید."
            : pending
              ? "ارتباط با درگاه برقرار نشد. اگر مبلغی از حساب شما کسر شده، تا چند ساعت دیگر به‌طور خودکار برمی‌گردد یا با ما تماس بگیرید و شمارهٔ سفارش را اعلام کنید."
              : "مبلغی از حساب شما کسر نشده است. کالاها دوباره آزاد شدند؛ می‌توانید سفارش را از سبد خرید دوباره ثبت کنید."}
        </p>
      </div>

      <div className="mx-auto max-w-[720px] pb-14">
        <Panel>
          <div className="grid grid-cols-2 gap-4 text-[13px] text-muted-600 sm:grid-cols-4">
            <div>شماره سفارش<b className="mt-1 block text-[15px] text-espresso-900">{toPersianDigits(order.orderNumber)}</b></div>
            <div>تاریخ ثبت<b className="mt-1 block text-[15px] text-espresso-900">{formatJalali(order.createdAt)}</b></div>
            <div>مبلغ سفارش<b className="mt-1 block text-[15px] text-espresso-900">{formatToman(order.total)}</b></div>
            <div>روش ارسال<b className="mt-1 block text-[15px] text-espresso-900">{siteConfig.shipping.methods[order.shippingMethod].label}</b></div>
          </div>
        </Panel>

        {paid && (
          <Panel className="mt-5">
            <h2 className="t-h3 mb-2">کالاهای سفارش</h2>
            {order.items.map((item) => {
              const img = imageOf(item.productId);
              return (
                <div key={item.id} className="flex items-center gap-3 py-2.5">
                  <span className="relative block h-[78px] w-16 shrink-0 rounded-xl bg-sand-200">
                    {img && <ProductImage src={img} alt="" sizes="64px" className="rounded-xl p-[8%]" />}
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
                  <b className="text-[13px]">{formatToman(item.price * item.quantity)}</b>
                </div>
              );
            })}
          </Panel>
        )}

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {paid ? (
            <Button asChild variant="pill" size="pill">
              <Link href={`/account/orders/${order.id}`}>
                <Package strokeWidth={1.7} />
                پیگیری سفارش
              </Link>
            </Button>
          ) : (
            <Button asChild variant="pill" size="pill">
              <Link href="/cart">بازگشت به سبد خرید</Link>
            </Button>
          )}
          <Button asChild variant="pill-outline" size="pill">
            <Link href="/products">{paid ? "بازگشت به فروشگاه" : "ادامه خرید"}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
