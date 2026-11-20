import Link from "next/link";
import { headers } from "next/headers";
import { CheckCircle2, ChevronLeft, Package, RotateCcw, Truck } from "lucide-react";

import { OrderCard } from "@/components/account/order-card";
import { auth } from "@/lib/auth";
import { getOrdersForCustomer } from "@/lib/queries/orders";
import { toPersianDigits } from "@/lib/format";

export const metadata = { title: "پیشخوان حساب", robots: { index: false } };

const ACTIVE = ["PENDING_PAYMENT", "PAID", "PROCESSING", "SHIPPED"];

export default async function AccountDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session!.user as unknown as { id: string; name: string; email: string };
  const orders = await getOrdersForCustomer(user.id);

  const firstName = user.email.endsWith("@delana-phone.local") && !user.name ? "" : user.name.split(" ")[0];
  const stats = [
    { Icon: Truck, value: orders.filter((o) => ACTIVE.includes(o.status)).length, label: "سفارش جاری" },
    { Icon: CheckCircle2, value: orders.filter((o) => o.status === "DELIVERED").length, label: "تحویل‌شده" },
    { Icon: RotateCcw, value: orders.filter((o) => o.status === "REFUNDED").length, label: "مرجوعی" },
  ];

  return (
    <>
      <div>
        <h1 className="t-h1">{firstName ? `سلام ${firstName}، خوش آمدی` : "خوش آمدی"}</h1>
        <p className="text-muted-600">از اینجا سفارش‌ها، آدرس‌ها و اطلاعات حسابت را مدیریت کن.</p>
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        {stats.map(({ Icon, value, label }) => (
          <div key={label} className="flex flex-col items-start gap-2 rounded-lg bg-cream-100 p-4 sm:flex-row sm:items-center sm:gap-3.5 sm:p-5">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-sand-200 text-cocoa-700">
              <Icon className="size-6" strokeWidth={1.7} />
            </span>
            <div>
              <b className="block text-lg leading-[1.3] sm:text-[22px]">{toPersianDigits(value)}</b>
              <span className="text-[13px] text-muted-600">{label}</span>
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className="mb-3.5 flex items-end justify-between gap-4">
          <h2 className="t-h2">سفارش‌های اخیر</h2>
          {orders.length > 0 && (
            <Link href="/account/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-cocoa-700">
              همه سفارش‌ها
              <ChevronLeft className="size-[18px]" strokeWidth={1.7} />
            </Link>
          )}
        </div>
        {orders.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg bg-cream-100 py-12 text-center text-muted-600">
            <Package className="size-9" strokeWidth={1.4} />
            هنوز سفارشی ثبت نکرده‌اید.
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {orders.slice(0, 3).map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
