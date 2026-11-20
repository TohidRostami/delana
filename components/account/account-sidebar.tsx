"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, LogOut, MapPin, Package, UserRound } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "پیشخوان", href: "/account", Icon: LayoutGrid },
  { label: "سفارش‌های من", href: "/account/orders", Icon: Package },
  { label: "آدرس‌ها", href: "/account/addresses", Icon: MapPin },
  { label: "اطلاعات حساب", href: "/account/profile", Icon: UserRound },
];

export function AccountSidebar({ name, subtitle }: { name: string; subtitle: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const link =
    "flex items-center gap-3 whitespace-nowrap rounded-md px-3 py-3 text-sm font-medium transition-colors hover:bg-sand-200";

  return (
    <aside
      aria-label="منوی حساب"
      className="no-scrollbar flex gap-1 overflow-x-auto rounded-lg bg-cream-100 p-2 lg:sticky lg:top-[108px] lg:flex-col lg:self-start lg:overflow-visible lg:p-5"
    >
      <div className="mb-2.5 hidden items-center gap-3 border-b border-line-200 px-1.5 pb-[18px] pt-1.5 lg:flex">
        <span className="flex size-[52px] shrink-0 items-center justify-center rounded-full bg-caramel-500 text-lg font-extrabold text-espresso-900">
          {name.trim().charAt(0) || "؟"}
        </span>
        <div className="min-w-0">
          <b className="block truncate">{name}</b>
          <span dir="ltr" className="block truncate text-start text-xs text-muted-600">{subtitle}</span>
        </div>
      </div>

      {NAV.map(({ label, href, Icon }) => {
        const active = href === "/account" ? pathname === "/account" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(link, active && "bg-cocoa-700 text-cream-100 hover:bg-cocoa-700")}
          >
            <Icon className="size-5" strokeWidth={1.7} />
            {label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={async () => {
          await authClient.signOut();
          router.push("/");
          router.refresh();
        }}
        className={cn(link, "text-sale-700")}
      >
        <LogOut className="size-5" strokeWidth={1.7} />
        خروج از حساب
      </button>
    </aside>
  );
}
