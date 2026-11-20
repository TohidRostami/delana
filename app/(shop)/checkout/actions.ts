"use server";

import { headers } from "next/headers";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { addressSchema } from "@/lib/address";
import { syncProductInStock } from "@/lib/inventory";
import { validateDiscountCode } from "@/lib/discount";
import { markOrderFailed, markOrderPaid } from "@/lib/order-payment";
import { generateOrderNumber, initiatePayment, isSimulatorEnabled } from "@/lib/payment";
import { getSiteSettings, shippingCostFor } from "@/lib/queries/settings";
import { toLatinDigits } from "@/lib/format";

export type CheckoutItem = { productId: string; variantId: string; quantity: number };

export type PlaceOrderResult = { error: string } | { redirectUrl: string; orderId: string };

const itemsSchema = z
  .array(
    z.object({
      productId: z.string().min(1),
      variantId: z.string().min(1),
      quantity: z.number().int().min(1).max(50),
    }),
  )
  .min(1)
  .max(100);

const inputSchema = z.object({
  items: itemsSchema,
  shippingMethod: z.enum(["POST", "TIPAX"]),
  addressId: z.string().min(1).optional(),
  address: addressSchema.optional(),
  discountCode: z.string().trim().max(50).nullish(),
});

export type PlaceOrderInput = {
  items: CheckoutItem[];
  shippingMethod: "POST" | "TIPAX";
  /** آدرس ذخیره‌شده‌ی کاربر */
  addressId?: string;
  /** یا آدرس تازه (ذخیره می‌شود و بعداً در «آدرس‌های من» هم دیده می‌شود) */
  address?: {
    fullName: string;
    phone: string;
    province: string;
    city: string;
    addressLine: string;
    postalCode: string;
  };
  discountCode?: string | null;
};

export async function placeOrder(raw: PlaceOrderInput): Promise<PlaceOrderResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "برای ثبت سفارش ابتدا وارد حساب کاربری شوید." };

  // فیلدهای عددی که با کیبورد فارسی تایپ شده‌اند نرمال می‌شوند.
  const normalized = {
    ...raw,
    address: raw.address
      ? {
          ...raw.address,
          phone: toLatinDigits(raw.address.phone),
          postalCode: toLatinDigits(raw.address.postalCode),
        }
      : undefined,
  };
  const parsed = inputSchema.safeParse(normalized);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "اطلاعات سفارش معتبر نیست." };
  }
  const { items, shippingMethod, discountCode } = parsed.data;
  if (!parsed.data.addressId && !parsed.data.address) {
    return { error: "آدرس تحویل را انتخاب یا وارد کنید." };
  }

  // آدرس: یا مال همین کاربر است، یا تازه ساخته می‌شود.
  let addressId = parsed.data.addressId;
  if (addressId) {
    const owned = await prisma.address.findFirst({
      where: { id: addressId, userId: session.user.id },
      select: { id: true },
    });
    if (!owned) return { error: "آدرس انتخاب‌شده معتبر نیست." };
  }

  // قیمت‌ها همیشه از دیتابیس خوانده می‌شود؛ سبد مرورگر فقط برای نمایش است.
  let subtotal = 0;
  const orderItemsData: {
    productId: string;
    variantId: string | null;
    name: string;
    size: string | null;
    color: string | null;
    price: number;
    quantity: number;
  }[] = [];
  // فقط اقلامی که به یک ProductVariant واقعی می‌رسند موجودی رزرو می‌کنند.
  const reservationMap = new Map<string, { productId: string; variantId: string; quantity: number; name: string }>();

  for (const item of items) {
    const product = (await prisma.product.findUnique({
      where: { id: item.productId },
      include: { variants: { include: { size: true, color: true } } },
    })) as {
      id: string;
      name: string;
      price: number;
      isPublished: boolean;
      isArchived: boolean;
      variants: { id: string; size: { name: string } | null; color: { name: string } | null }[];
    } | null;

    if (!product || !product.isPublished || product.isArchived) {
      return { error: "یکی از محصولات سبد خرید دیگر در دسترس نیست." };
    }

    const variant = product.variants.find((v) => v.id === item.variantId);
    if (product.variants.length > 0 && !variant) {
      return { error: `مشخصات انتخاب‌شده برای «${product.name}» دیگر موجود نیست.` };
    }
    if (variant) {
      // یک واریانت ممکن است دو بار در سبد آمده باشد؛ تعدادها جمع می‌شوند.
      const prev = reservationMap.get(variant.id);
      reservationMap.set(variant.id, {
        productId: item.productId,
        variantId: variant.id,
        quantity: (prev?.quantity ?? 0) + item.quantity,
        name: product.name,
      });
    }

    subtotal += product.price * item.quantity;
    orderItemsData.push({
      productId: item.productId,
      variantId: variant?.id ?? null,
      name: product.name,
      size: variant?.size?.name ?? null,
      color: variant?.color?.name ?? null,
      price: product.price,
      quantity: item.quantity,
    });
  }

  // تخفیف از صفر دوباره اعتبارسنجی می‌شود (قبل از رزرو موجودی، تا شکست آن چیزی نیمه‌کاره نگذارد).
  let discountAmount = 0;
  let discountCodeId: string | null = null;
  if (discountCode) {
    const result = await validateDiscountCode(discountCode, subtotal);
    if (!result.valid) return { error: result.error };
    discountAmount = result.discountAmount;
    discountCodeId = result.id;
  }

  // رزرو موجودی همه‌ی اقلام در یک تراکنش همه‌یا‌هیچ، با قفل خوش‌بینانه (version).
  const stockReservations = [...reservationMap.values()];
  try {
    await prisma.$transaction(async (tx) => {
      for (const r of stockReservations) {
        const variant = await tx.productVariant.findUnique({ where: { id: r.variantId } });
        if (!variant) throw new Error(`یکی از اقلام سبد خرید («${r.name}») دیگر در دسترس نیست.`);
        if (variant.stock < r.quantity) throw new Error(`موجودی «${r.name}» کافی نیست.`);

        const updated = await tx.productVariant.updateMany({
          where: { id: r.variantId, version: variant.version },
          data: { stock: { decrement: r.quantity }, version: { increment: 1 } },
        });
        if (updated.count === 0) {
          throw new Error(`موجودی «${r.name}» هم‌زمان توسط سفارش دیگری تغییر کرد — لطفاً دوباره تلاش کنید.`);
        }
      }
      for (const productId of new Set(stockReservations.map((r) => r.productId))) {
        await syncProductInStock(tx, productId);
      }
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "خطا در بررسی موجودی." };
  }

  // از اینجا به بعد موجودی رزرو شده؛ هر شکستی باید رزرو را برگرداند.
  let orderId: string | null = null;
  try {
    if (!addressId && parsed.data.address) {
      const a = parsed.data.address;
      const existing = await prisma.address.findFirst({
        where: {
          userId: session.user.id,
          fullName: a.fullName,
          phone: a.phone,
          province: a.province,
          city: a.city,
          addressLine: a.addressLine,
          postalCode: a.postalCode,
        },
        select: { id: true },
      });
      if (existing) {
        addressId = existing.id;
      } else {
        const count = await prisma.address.count({ where: { userId: session.user.id } });
        const created = (await prisma.address.create({
          data: {
            fullName: a.fullName,
            phone: a.phone,
            province: a.province,
            city: a.city,
            addressLine: a.addressLine,
            postalCode: a.postalCode,
            userId: session.user.id,
            isDefault: count === 0,
          },
        })) as { id: string };
        addressId = created.id;
      }
    }

    const settings = await getSiteSettings();
    const shippingCost = shippingCostFor(settings, shippingMethod, subtotal);
    const total = Math.max(0, subtotal + shippingCost - discountAmount);

    const order = (await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: session.user.id,
        addressId,
        shippingMethod,
        subtotal,
        discountAmount,
        discountCodeId,
        shippingCost,
        total,
        items: { create: orderItemsData },
      },
    })) as { id: string; orderNumber: string };
    orderId = order.id;

    if (discountCodeId) {
      await prisma.discountCode.update({
        where: { id: discountCodeId },
        data: { usedCount: { increment: 1 } },
      });
    }

    const phone = (session.user as unknown as { phoneNumber?: string }).phoneNumber;
    const payment = await initiatePayment({
      id: order.id,
      orderNumber: order.orderNumber,
      total,
      mobile: phone ? `0${phone.replace(/^\+98/, "")}` : undefined,
    });
    if (payment.authority) {
      await prisma.order.update({ where: { id: order.id }, data: { gatewayRef: payment.authority } });
    }
    return { redirectUrl: payment.redirectUrl, orderId: order.id };
  } catch (e) {
    if (orderId) {
      await markOrderFailed(orderId);
    } else {
      // سفارش ساخته نشده؛ فقط رزرو موجودی را آزاد کن.
      for (const r of stockReservations) {
        await prisma.productVariant.updateMany({
          where: { id: r.variantId },
          data: { stock: { increment: r.quantity }, version: { increment: 1 } },
        });
      }
      for (const productId of new Set(stockReservations.map((r) => r.productId))) {
        await syncProductInStock(prisma, productId);
      }
    }
    return { error: e instanceof Error ? e.message : "ثبت سفارش با خطا مواجه شد. دوباره تلاش کنید." };
  }
}

/**
 * جایگزین بازگشت از درگاه، فقط وقتی درگاه واقعی وصل نیست (حالت توسعه یا
 * ALLOW_PAYMENT_SIMULATOR=true). فقط مالک سفارش می‌تواند آن را شبیه‌سازی کند.
 */
export async function completeSimulatedPayment(
  orderId: string,
  outcome: "success" | "fail",
): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  const order = (await prisma.order.findUnique({
    where: { id: orderId },
    select: { userId: true, status: true },
  })) as { userId: string | null; status: string } | null;

  if (!isSimulatorEnabled() || process.env.PAYMENT_GATEWAY_MERCHANT_ID) return "/";
  if (!session || !order || order.userId !== session.user.id) return "/";

  if (order.status === "PENDING_PAYMENT") {
    if (outcome === "success") await markOrderPaid(orderId, `SIM-${Date.now()}`);
    else await markOrderFailed(orderId);
  }
  const final = (await prisma.order.findUnique({ where: { id: orderId }, select: { status: true } })) as {
    status: string;
  };
  return `/checkout/result?order=${orderId}&status=${final.status === "CANCELLED" ? "failed" : "success"}`;
}
