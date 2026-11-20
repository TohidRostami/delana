import { headers } from "next/headers";
import { AddressList } from "@/components/account/address-list";
import { auth } from "@/lib/auth";
import { listAddressesForUser } from "@/lib/queries/addresses";

export const metadata = { title: "آدرس‌های من", robots: { index: false } };

export default async function AddressesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const addresses = await listAddressesForUser(session!.user.id);

  return (
    <AddressList
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
    />
  );
}
