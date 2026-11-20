import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { markOrderFailed, markOrderPaid } from "@/lib/order-payment";
import { verifyPayment } from "@/lib/payment";

/**
 * آدرس بازگشت از درگاه (زرین‌پال: ?Authority=...&Status=OK|NOK).
 * این URL دقیقاً همان callback_url است که هنگام ساخت تراکنش به درگاه داده می‌شود:
 *   {NEXT_PUBLIC_SITE_URL}/api/payment/callback
 */
export async function GET(request: NextRequest) {
  const authority = request.nextUrl.searchParams.get("Authority");
  const status = request.nextUrl.searchParams.get("Status");
  const to = (path: string) => NextResponse.redirect(new URL(path, request.url));

  if (!authority) return to("/checkout/result");

  const order = (await prisma.order.findFirst({
    where: { gatewayRef: authority },
    select: { id: true, total: true, status: true },
  })) as { id: string; total: number; status: string } | null;
  if (!order) return to("/checkout/result");

  // کاربر قبلاً برگشته بود (رفرش یا کلیک دوباره): نتیجه‌ی ذخیره‌شده را نشان بده.
  if (order.status !== "PENDING_PAYMENT") {
    return to(`/checkout/result?order=${order.id}&status=${order.status === "CANCELLED" ? "failed" : "success"}`);
  }

  try {
    if (status !== "OK") {
      await markOrderFailed(order.id);
      return to(`/checkout/result?order=${order.id}&status=failed`);
    }
    const result = await verifyPayment({ authority, total: order.total });
    if (result.success) {
      await markOrderPaid(order.id, result.refId ?? authority);
      return to(`/checkout/result?order=${order.id}&status=success`);
    }
    await markOrderFailed(order.id);
  } catch {
    // خطای شبکه هنگام verify: سفارش را لغو نکن (ممکن است پول کسر شده باشد)؛
    // در PENDING_PAYMENT می‌ماند تا پشتیبانی بررسی کند.
    return to(`/checkout/result?order=${order.id}&status=pending`);
  }
  return to(`/checkout/result?order=${order.id}&status=failed`);
}
