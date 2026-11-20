import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { CheckoutForm } from "@/components/shop/checkout-form";
import { auth } from "@/lib/auth";
import { listAddressesForUser } from "@/lib/queries/addresses";
import { getSiteSettings } from "@/lib/queries/settings";

export const metadata: Metadata = { title: "ارسال و پرداخت", robots: { index: false } };

export default async function CheckoutPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login?redirect=/checkout");

  const [addresses, settings] = await Promise.all([
    listAddressesForUser(session.user.id),
    getSiteSettings(),
  ]);

  const phone = (session.user as unknown as { phoneNumber?: string }).phoneNumber;
  const isPlaceholderEmail = session.user.email.endsWith("@delana-phone.local");

  return (
    <CheckoutForm
      defaultName={isPlaceholderEmail ? "" : session.user.name}
      defaultPhone={phone ? `0${phone.replace(/^\+98/, "")}` : ""}
      addresses={addresses.map((a) => ({
        id: a.id,
        fullName: a.fullName,
        phone: a.phone,
        province: a.province,
        city: a.city,
        addressLine: a.addressLine,
        postalCode: a.postalCode,
        isDefault: a.isDefault,
      }))}
      settings={{
        freeShippingThreshold: settings.freeShippingThreshold,
        standardShippingCost: settings.standardShippingCost,
        tipaxShippingCost: settings.tipaxShippingCost,
      }}
    />
  );
}
