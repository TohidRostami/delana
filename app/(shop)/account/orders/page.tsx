import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Package } from "lucide-react";

import { OrderCard } from "@/components/account/order-card";
import { EmptyState } from "@/components/shared/empty-state";
import { auth } from "@/lib/auth";
import { getOrdersForCustomer } from "@/lib/queries/orders";

export const metadata = { title: "سفارش‌های من", robots: { index: false } };

export default async function OrdersPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login?redirect=/account/orders");
  const orders = await getOrdersForCustomer(session.user.id);

  return (
    <>
      <h1 className="t-h1">سفارش‌های من</h1>
      {orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="هنوز سفارشی ثبت نکرده‌اید"
          description="بعد از اولین خرید، سفارش‌ها و وضعیت ارسال‌شان را اینجا می‌بینید."
          actionLabel="مشاهده محصولات"
          actionHref="/products"
        />
      ) : (
        <div className="flex flex-col gap-3.5">
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}
    </>
  );
}
