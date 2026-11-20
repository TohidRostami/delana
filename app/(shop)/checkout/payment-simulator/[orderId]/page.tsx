import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

import { PaymentSimulatorActions } from "@/components/shop/payment-simulator-actions";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatToman, toPersianDigits } from "@/lib/format";
import { isSimulatorEnabled } from "@/lib/payment";

export const metadata: Metadata = { title: "درگاه پرداخت (آزمایشی)", robots: { index: false } };

export default async function PaymentSimulatorPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  if (!isSimulatorEnabled() || process.env.PAYMENT_GATEWAY_MERCHANT_ID) notFound();

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { orderId } = await params;
  const order = (await prisma.order.findFirst({
    where: { id: orderId, userId: session.user.id, status: "PENDING_PAYMENT" },
    select: { id: true, orderNumber: true, total: true },
  })) as { id: string; orderNumber: string; total: number } | null;
  if (!order) notFound();

  return (
    <div className="wrap flex min-h-[70vh] max-w-md flex-col justify-center py-16 text-center">
      <div className="w-full rounded-lg border-2 border-dashed border-caramel-500 bg-white p-8">
        <p className="text-xs font-bold text-caramel-700">درگاه پرداخت — نسخهٔ آزمایشی</p>
        <p className="mt-2 text-xs leading-6 text-muted-600">
          این صفحه فقط برای آزمایش مسیر سفارش است و تا وقتی <code dir="ltr">PAYMENT_GATEWAY_MERCHANT_ID</code>{" "}
          تنظیم نشده فعال می‌ماند. با تنظیم آن، کاربر مستقیم به درگاه واقعی می‌رود.
        </p>
        <div className="mt-6 border-t border-line-200 pt-6">
          <p className="text-sm text-muted-600">مبلغ قابل پرداخت</p>
          <p className="mt-1 text-2xl font-extrabold">{formatToman(order.total)}</p>
          <p className="mt-1 text-xs text-muted-600">سفارش {toPersianDigits(order.orderNumber)}</p>
        </div>
        <PaymentSimulatorActions orderId={order.id} />
      </div>
    </div>
  );
}
