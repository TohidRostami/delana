import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/shared/product-image";
import { formatJalali } from "@/lib/date";
import { formatToman, toPersianDigits } from "@/lib/format";
import { ORDER_STATUS_LABELS, ORDER_TRACK_STEPS, orderTrackProgress } from "@/lib/order-status";
import type { CustomerOrderDTO } from "@/lib/queries/orders";
import { cn } from "@/lib/utils";

const BADGE: Record<string, "warn" | "ok" | "quiet" | "new" | "dark"> = {
  PENDING_PAYMENT: "warn",
  PAID: "warn",
  PROCESSING: "warn",
  SHIPPED: "dark",
  DELIVERED: "ok",
  CANCELLED: "quiet",
  REFUNDED: "quiet",
};

export function OrderCard({ order }: { order: CustomerOrderDTO }) {
  const progress = orderTrackProgress(order.status);
  const count = order.items.reduce((n, i) => n + i.quantity, 0);

  return (
    <article className="flex flex-col gap-4 rounded-lg bg-cream-100 p-4 sm:px-6 sm:py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <b>سفارش {toPersianDigits(order.orderNumber)}</b>
        <Badge variant={BADGE[order.status] ?? "quiet"}>{ORDER_STATUS_LABELS[order.status] ?? order.status}</Badge>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-muted-600 sm:gap-x-7">
        <span>تاریخ<b className="ms-1.5 font-bold text-espresso-900">{formatJalali(order.createdAt)}</b></span>
        <span>مبلغ<b className="ms-1.5 font-bold text-espresso-900">{formatToman(order.total)}</b></span>
        <span>تعداد<b className="ms-1.5 font-bold text-espresso-900">{toPersianDigits(count)} کالا</b></span>
      </div>

      {progress != null && progress > 0 && progress < 4 && (
        <div className="flex items-center gap-2 text-xs text-muted-600" aria-label="وضعیت ارسال">
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {order.items.slice(0, 4).map((it) => (
            <span key={it.id} className="relative block h-[72px] w-[60px] rounded-xl bg-sand-200">
              {it.image && <ProductImage src={it.image} alt={it.name} sizes="60px" className="rounded-xl p-[8%]" />}
            </span>
          ))}
          {order.items.length > 4 && (
            <span className="text-sm text-muted-600">+{toPersianDigits(order.items.length - 4)}</span>
          )}
        </div>
        <Button asChild variant="pill-outline" size="pill-sm">
          <Link href={`/account/orders/${order.id}`}>
            جزئیات سفارش
            <ChevronLeft strokeWidth={1.7} />
          </Link>
        </Button>
      </div>
    </article>
  );
}
