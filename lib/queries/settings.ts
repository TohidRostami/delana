import { prisma } from "@/lib/db";
import type { ShippingMethodKey } from "@/lib/content";

export type SiteSettings = {
  emailLoginEnabled: boolean;
  smsLoginEnabled: boolean;
  freeShippingThreshold: number | null;
  /** هزینه ارسال با پست پیشتاز */
  standardShippingCost: number;
  /** هزینه ارسال با تیپاکس */
  tipaxShippingCost: number;
};

const DEFAULTS: SiteSettings = {
  emailLoginEnabled: true,
  smsLoginEnabled: true,
  freeShippingThreshold: null,
  standardShippingCost: 0,
  tipaxShippingCost: 0,
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const settings = await prisma.siteSetting.findUnique({ where: { id: "singleton" } });
  if (!settings) return DEFAULTS;
  return settings as unknown as SiteSettings;
}

/**
 * Shipping cost for one method given the cart subtotal. The free-shipping
 * threshold (when set) applies to every method — it's what the storefront
 * announcement bar promises.
 */
export function shippingCostFor(
  settings: SiteSettings,
  method: ShippingMethodKey,
  subtotal: number,
): number {
  if (
    settings.freeShippingThreshold != null &&
    subtotal >= settings.freeShippingThreshold
  ) {
    return 0;
  }
  return method === "TIPAX"
    ? settings.tipaxShippingCost
    : settings.standardShippingCost;
}
