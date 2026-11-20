import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AccountSidebar } from "@/components/account/account-sidebar";
import { auth } from "@/lib/auth";
import { formatPhoneDisplay } from "@/lib/format";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login?redirect=/account");

  const user = session.user as unknown as { name: string; email: string; phoneNumber?: string };
  const placeholder = user.email.endsWith("@delana-phone.local");
  const subtitle = user.phoneNumber ? formatPhoneDisplay(user.phoneNumber) : placeholder ? "" : user.email;

  return (
    <div className="wrap grid items-start gap-5 py-6 lg:grid-cols-[270px_1fr] lg:gap-8 lg:py-10">
      <AccountSidebar name={placeholder && !user.name ? "کاربر دلانا" : user.name} subtitle={subtitle} />
      <div className="flex min-w-0 flex-col gap-6">{children}</div>
    </div>
  );
}
