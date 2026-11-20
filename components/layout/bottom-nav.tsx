"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingBag, User, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { toPersianDigits } from "@/lib/format";
import { useCartCount } from "@/lib/store/cart";

/** Routes where the mobile chrome (bottom nav, search bar) is replaced by a sticky buy bar. */
export function hasBuyBar(pathname: string) {
  return (
    pathname === "/cart" ||
    pathname === "/checkout" ||
    (/^\/products\/[^/]+$/.test(pathname) && pathname !== "/products/category")
  );
}

const ITEMS: { href: string; label: string; Icon: LucideIcon; match: (p: string) => boolean }[] = [
  { href: "/", label: "خانه", Icon: Home, match: (p) => p === "/" },
  { href: "/search", label: "جستجو", Icon: Search, match: (p) => p.startsWith("/search") },
  { href: "/cart", label: "سبد خرید", Icon: ShoppingBag, match: (p) => p.startsWith("/cart") },
  { href: "/account", label: "حساب من", Icon: User, match: (p) => p.startsWith("/account") },
];

export function BottomNav() {
  const pathname = usePathname();
  const count = useCartCount();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (hasBuyBar(pathname)) return null;

  return (
    <div className="sticky bottom-0 z-[15] bg-gradient-to-b from-white/0 to-white to-40% px-3 pb-3 pt-2 sm:hidden">
      <nav
        aria-label="منوی پایین"
        className="flex h-16 items-center justify-around rounded-hero bg-white shadow-dl-md"
      >
        {ITEMS.map(({ href, label, Icon, match }) => {
          const on = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex min-w-14 flex-col items-center gap-0.5 text-[11px] text-muted-600",
                on && "font-bold text-espresso-900",
              )}
            >
              <Icon className="size-[22px]" strokeWidth={1.7} />
              {href === "/cart" && mounted && count > 0 && (
                <span className="absolute -top-1.5 left-2.5 h-[18px] min-w-[18px] rounded-[9px] bg-sale-700 px-1 text-center text-[11px] font-bold leading-[18px] text-white">
                  {toPersianDigits(count)}
                </span>
              )}
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
