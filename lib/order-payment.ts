import { prisma } from "@/lib/db";
import { syncProductInStock } from "@/lib/inventory";

/**
 * تغییر وضعیت سفارش بعد از پرداخت. هر دو تابع idempotent هستند: فقط سفارشی که
 * هنوز PENDING_PAYMENT است تغییر می‌کند، پس برگشت دوباره‌ی کاربر از درگاه
 * (یا رفرش صفحه) اثر دوباره‌ای ندارد.
 */
export async function markOrderPaid(orderId: string, gatewayRef: string): Promise<boolean> {
  const res = await prisma.order.updateMany({
    where: { id: orderId, status: "PENDING_PAYMENT" },
    data: { status: "PAID", paidAt: new Date(), gatewayRef },
  });
  return res.count > 0;
}

/** پرداخت ناموفق: موجودی رزروشده و یک بار استفاده‌ی کد تخفیف برمی‌گردد و سفارش لغو می‌شود. */
export async function markOrderFailed(orderId: string): Promise<void> {
  const claimed = await prisma.order.updateMany({
    where: { id: orderId, status: "PENDING_PAYMENT" },
    data: { status: "CANCELLED" },
  });
  if (claimed.count === 0) return;

  const order = (await prisma.order.findUnique({ where: { id: orderId } })) as {
    discountCodeId: string | null;
  } | null;
  const items = (await prisma.orderItem.findMany({ where: { orderId } })) as {
    productId: string;
    variantId: string | null;
    quantity: number;
  }[];

  for (const item of items) {
    if (!item.variantId) continue;
    await prisma.productVariant.updateMany({
      where: { id: item.variantId },
      data: { stock: { increment: item.quantity }, version: { increment: 1 } },
    });
  }
  for (const productId of new Set(items.map((i) => i.productId))) {
    await syncProductInStock(prisma, productId);
  }
  if (order?.discountCodeId) {
    await prisma.discountCode.update({
      where: { id: order.discountCodeId },
      data: { usedCount: { decrement: 1 } },
    });
  }
}
