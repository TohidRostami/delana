export type PaymentInitResult = {
  redirectUrl: string;
  /** شناسه‌ی تراکنش نزد درگاه (Authority)؛ در Order.gatewayRef ذخیره می‌شود. */
  authority?: string;
};
export type PaymentVerifyResult = { success: boolean; refId?: string; message?: string };

/**
 * لایه‌ی اتصال به درگاه پرداخت.
 *
 * • اگر PAYMENT_GATEWAY_MERCHANT_ID تنظیم شده باشد → درگاه زرین‌پال (API نسخه‌ی ۴).
 *   با PAYMENT_GATEWAY_SANDBOX=true به sandbox.zarinpal.com وصل می‌شود.
 * • اگر خالی باشد → درگاه شبیه‌سازی‌شده‌ی داخلی، که فقط در حالت توسعه
 *   (یا وقتی ALLOW_PAYMENT_SIMULATOR=true) فعال است؛ در پروداکشن بدون merchant id
 *   ثبت سفارش خطا می‌دهد تا کسی بدون پرداخت واقعی سفارش «پرداخت‌شده» نسازد.
 *
 * برای درگاه دیگر (زیبال، آی‌دی‌پی، ...) فقط همین دو تابع عوض می‌شوند.
 */
const CURRENCY_FACTOR = 10; // تومان → ریال

export function isSimulatorEnabled(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.ALLOW_PAYMENT_SIMULATOR === "true";
}

function zarinpalBase() {
  return process.env.PAYMENT_GATEWAY_SANDBOX === "true"
    ? { api: "https://sandbox.zarinpal.com/pg/v4/payment", start: "https://sandbox.zarinpal.com/pg/StartPay" }
    : { api: "https://api.zarinpal.com/pg/v4/payment", start: "https://www.zarinpal.com/pg/StartPay" };
}

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export async function initiatePayment(order: {
  id: string;
  orderNumber: string;
  total: number;
  mobile?: string;
}): Promise<PaymentInitResult> {
  const merchantId = process.env.PAYMENT_GATEWAY_MERCHANT_ID;

  if (!merchantId) {
    if (!isSimulatorEnabled()) {
      throw new Error("درگاه پرداخت هنوز تنظیم نشده است. PAYMENT_GATEWAY_MERCHANT_ID را در محیط اجرا قرار دهید.");
    }
    return { redirectUrl: `/checkout/payment-simulator/${order.id}` };
  }

  const { api, start } = zarinpalBase();
  const res = await fetch(`${api}/request.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      merchant_id: merchantId,
      amount: order.total * CURRENCY_FACTOR,
      callback_url: `${siteUrl()}/api/payment/callback`,
      description: `سفارش ${order.orderNumber}`,
      metadata: order.mobile ? { mobile: order.mobile } : undefined,
    }),
    cache: "no-store",
  });
  const json = (await res.json().catch(() => null)) as {
    data?: { code?: number; authority?: string };
  } | null;

  if (json?.data?.code !== 100 || !json.data.authority) {
    throw new Error("اتصال به درگاه پرداخت برقرار نشد. چند دقیقه دیگر دوباره تلاش کنید.");
  }
  return { redirectUrl: `${start}/${json.data.authority}`, authority: json.data.authority };
}

/** تایید تراکنش پس از بازگشت کاربر از درگاه. amount همیشه از دیتابیس می‌آید، نه از URL. */
export async function verifyPayment(input: {
  authority: string;
  total: number;
}): Promise<PaymentVerifyResult> {
  const merchantId = process.env.PAYMENT_GATEWAY_MERCHANT_ID;
  if (!merchantId) return { success: false, message: "درگاه تنظیم نشده است." };

  const { api } = zarinpalBase();
  const res = await fetch(`${api}/verify.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      merchant_id: merchantId,
      amount: input.total * CURRENCY_FACTOR,
      authority: input.authority,
    }),
    cache: "no-store",
  });
  const json = (await res.json().catch(() => null)) as {
    data?: { code?: number; ref_id?: number };
  } | null;

  // ۱۰۰ = تایید شد، ۱۰۱ = قبلاً تایید شده بود.
  const code = json?.data?.code;
  if (code === 100 || code === 101) {
    return { success: true, refId: String(json?.data?.ref_id ?? input.authority) };
  }
  return { success: false, message: "تراکنش تایید نشد." };
}

export function generateOrderNumber(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `DLN-${y}${m}${d}-${rand}`;
}
