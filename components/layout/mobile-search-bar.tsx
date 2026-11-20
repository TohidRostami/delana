"use client";

import { usePathname } from "next/navigation";

import { hasBuyBar } from "@/components/layout/bottom-nav";
import { LiveSearch } from "@/components/shop/live-search";
import { siteConfig } from "@/lib/content";

/** نوار جستجوی زیر هدر در موبایل و تبلت (جستجوی زنده با پنجرهٔ نتایج). */
export function MobileSearchBar() {
  const pathname = usePathname();
  if (
    hasBuyBar(pathname) ||
    pathname.startsWith("/search") ||
    pathname.startsWith("/checkout")
  ) {
    return null;
  }
  return (
    <div className="relative z-40 px-4 py-3.5 sm:px-7 lg:hidden">
      <LiveSearch placeholder={siteConfig.search.placeholder} />
    </div>
  );
}
