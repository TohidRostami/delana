"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/store/cart";

/** بعد از پرداخت موفق سبد مرورگر پاک می‌شود. */
export function ClearCart() {
  const clear = useCartStore((s) => s.clear);
  useEffect(() => clear(), [clear]);
  return null;
}
