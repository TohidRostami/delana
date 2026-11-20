import { headers } from "next/headers";
import { ProfileForm } from "@/components/account/profile-form";
import { auth } from "@/lib/auth";
import { formatPhoneDisplay } from "@/lib/format";

export const metadata = { title: "اطلاعات حساب", robots: { index: false } };

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session!.user as unknown as { name: string; email: string; phoneNumber?: string };
  const placeholder = user.email.endsWith("@delana-phone.local");

  return (
    <>
      <h1 className="t-h1">اطلاعات حساب</h1>
      <ProfileForm
        name={user.name}
        email={placeholder ? "" : user.email}
        phone={user.phoneNumber ? formatPhoneDisplay(user.phoneNumber) : ""}
      />
    </>
  );
}
