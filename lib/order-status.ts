export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "در انتظار پرداخت",
  PAID: "پرداخت‌شده",
  PROCESSING: "در حال آماده‌سازی",
  SHIPPED: "ارسال‌شده",
  DELIVERED: "تحویل داده‌شده",
  CANCELLED: "لغوشده",
  REFUNDED: "بازگشت‌داده‌شده",
};

export const ORDER_STATUS_TONE: Record<string, string> = {
  PENDING_PAYMENT: "bg-warn-100 text-warn-700",
  PAID: "bg-sand-200 text-cocoa-700",
  PROCESSING: "bg-sand-200 text-cocoa-700",
  SHIPPED: "bg-caramel-500 text-espresso-900",
  DELIVERED: "bg-success-100 text-success-700",
  CANCELLED: "bg-sale-700/10 text-sale-700",
  REFUNDED: "bg-sand-200 text-muted-600",
};

/** مراحل نوار پیگیری سفارش در حساب کاربری. */
export const ORDER_TRACK_STEPS = ["ثبت", "آماده‌سازی", "ارسال", "تحویل"] as const;

/** تعداد مراحل طی‌شده (۰ تا ۴)؛ برای سفارش لغو/برگشتی null. */
export function orderTrackProgress(status: string): number | null {
  switch (status) {
    case "PENDING_PAYMENT":
      return 0;
    case "PAID":
      return 1;
    case "PROCESSING":
      return 2;
    case "SHIPPED":
      return 3;
    case "DELIVERED":
      return 4;
    default:
      return null;
  }
}
