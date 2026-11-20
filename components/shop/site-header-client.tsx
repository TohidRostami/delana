"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronLeft,
  LayoutDashboard,
  Menu,
  ShoppingBag,
  User,
} from "lucide-react";

import { Logo } from "@/components/shared/logo";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LiveSearch } from "@/components/shop/live-search";
import { ShopMobileNav } from "@/components/shop/shop-mobile-nav";
import { siteConfig } from "@/lib/content";
import { cn } from "@/lib/utils";
import { toPersianDigits } from "@/lib/format";
import { useCartCount } from "@/lib/store/cart";
import { useSession } from "@/lib/auth-client";
import type { CategoryDTO } from "@/lib/types";

const iconBtn =
  "relative inline-flex size-11 items-center justify-center rounded-full text-espresso-900 transition-colors hover:bg-sand-200";

export function SiteHeaderClient({
  categories,
  freeShipping,
}: {
  categories: CategoryDTO[];
  freeShipping: string | null;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [ddOpen, setDdOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cartCount = useCartCount();
  const { data: session } = useSession();
  useEffect(() => setMounted(true), []);

  // Close menus on navigation.
  useEffect(() => {
    setDdOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  const role = (session?.user as { role?: string } | undefined)?.role;
  const isStaff = role === "ADMIN" || role === "SUBADMIN";
  const menu = siteConfig.nav.categoryMenu;
  const accessorySlugs = new Set(menu.accessorySlugs);
  const clothing = categories.filter((c) => !accessorySlugs.has(c.slug));
  const accessories = categories.filter((c) => accessorySlugs.has(c.slug));

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* {pathname !== "/" && (
        <div className="bg-cocoa-700 px-3 py-1.5 text-center text-xs text-cream-100 sm:px-4 sm:py-2 sm:text-[13px]">
          {freeShipping && (
            <>
              ارسال رایگان برای سفارش‌های بالای{" "}
              <b className="font-bold">{freeShipping}</b>
              <span className="hidden sm:inline">{" · "}</span>
            </>
          )}
          <span className="hidden sm:inline">
            ضمانت بازگشت {toPersianDigits(siteConfig.shipping.returnDays)} روزه
          </span>
        </div>
      )} */}

      <header className="sticky top-0 z-20 border-b border-line-200 bg-white">
        <div className="wrap flex h-16 items-center justify-between gap-2 sm:h-[72px] sm:gap-6 lg:h-[84px]">
          {/* tablet / mobile: hamburger */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="منو"
                className={cn(iconBtn, "lg:hidden")}
              >
                <Menu className="size-[22px]" strokeWidth={1.7} />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[86%] max-w-sm gap-0 overflow-y-auto border-line-200 bg-white p-0"
            >
              <SheetTitle className="sr-only">منوی اصلی</SheetTitle>
              <ShopMobileNav
                categories={categories}
                isStaff={isStaff}
                loggedIn={mounted && !!session}
                onNavigate={() => setMenuOpen(false)}
              />
            </SheetContent>
          </Sheet>

          <Link href="/" aria-label={`${siteConfig.site.name} — صفحه اصلی`}>
            <Logo />
          </Link>

          {/* desktop nav */}
          <nav
            className="hidden items-center gap-8 text-[15px] font-medium lg:flex"
            aria-label="منوی اصلی"
          >
            {siteConfig.nav.main.map((item) =>
              item.href === "/categories" ? (
                <div
                  key={item.href}
                  className="group/dd relative"
                  data-open={ddOpen}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget))
                      setDdOpen(false);
                  }}
                >
                  <button
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={ddOpen}
                    onClick={() => setDdOpen((v) => !v)}
                    className={cn(
                      "inline-flex items-center gap-1.5 border-b-2 border-transparent py-1.5 transition-colors group-hover/dd:border-cocoa-700 group-data-[open=true]/dd:border-cocoa-700",
                      isActive("/categories") && "border-cocoa-700",
                    )}
                  >
                    {item.label}
                    <ChevronDown
                      className="size-[18px] transition-transform duration-300 group-hover/dd:rotate-180 group-focus-within/dd:rotate-180 group-data-[open=true]/dd:rotate-180"
                      strokeWidth={1.7}
                    />
                  </button>

                  <div
                    role="menu"
                    className="invisible absolute right-[-28px] top-[calc(100%+18px)] z-40 grid w-[660px] -translate-y-2.5 grid-cols-[1fr_1fr_210px] gap-5 rounded-card border border-line-200 bg-white p-[22px] opacity-0 shadow-dl-md transition-[opacity,transform,visibility] duration-300 ease-dl group-hover/dd:visible group-hover/dd:translate-y-0 group-hover/dd:opacity-100 group-focus-within/dd:visible group-focus-within/dd:translate-y-0 group-focus-within/dd:opacity-100 group-data-[open=true]/dd:visible group-data-[open=true]/dd:translate-y-0 group-data-[open=true]/dd:opacity-100"
                  >
                    <span
                      className="absolute inset-x-0 -top-5 h-5"
                      aria-hidden
                    />
                    <MenuColumn title={menu.clothingTitle}>
                      {clothing.map((c) => (
                        <MenuLink
                          key={c.slug}
                          href={`/products/category/${c.slug}`}
                        >
                          {c.title}
                        </MenuLink>
                      ))}
                    </MenuColumn>
                    <MenuColumn title={menu.accessoriesTitle}>
                      {accessories.map((c) => (
                        <MenuLink
                          key={c.slug}
                          href={`/products/category/${c.slug}`}
                        >
                          {c.title}
                        </MenuLink>
                      ))}
                      {menu.extraLinks.map((l) => (
                        <MenuLink
                          key={l.href}
                          href={l.href}
                          sale={l.tone === "sale"}
                        >
                          {l.label}
                        </MenuLink>
                      ))}
                    </MenuColumn>
                    <Link
                      href={menu.promo.href}
                      className="group/promo flex flex-col gap-1 rounded-field bg-sand-200 p-3.5 text-sm"
                    >
                      <span className="mb-1.5 flex h-[150px] items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={menu.promo.image}
                          alt=""
                          className="h-full object-contain transition-transform duration-500 ease-dl group-hover/promo:-rotate-2 group-hover/promo:scale-[1.06]"
                        />
                      </span>
                      <b>{menu.promo.title}</b>
                      <span className="t-xs text-muted-600">
                        {menu.promo.subtitle}
                      </span>
                    </Link>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "border-b-2 border-transparent py-1.5 transition-colors hover:border-cocoa-700",
                    isActive(item.href) && "border-cocoa-700",
                  )}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="flex items-center gap-1.5">
            <LiveSearch
              placeholder={`جستجو در ${siteConfig.site.name}…`}
              className="hidden w-[240px] lg:block"
              panelClassName="inset-x-auto left-0 w-[420px]"
            />
            {isStaff && (
              <Link
                href="/admin"
                aria-label="پنل مدیریت"
                className={cn(iconBtn, "hidden sm:inline-flex")}
              >
                <LayoutDashboard className="size-[22px]" strokeWidth={1.7} />
              </Link>
            )}
            <Link
              href={mounted && session ? "/account" : "/login"}
              aria-label={siteConfig.ui.account}
              className={cn(iconBtn, "hidden sm:inline-flex")}
            >
              <User className="size-[22px]" strokeWidth={1.7} />
            </Link>
            <Link
              href="/cart"
              aria-label={siteConfig.ui.cart}
              className={iconBtn}
            >
              <ShoppingBag className="size-[22px]" strokeWidth={1.7} />
              {mounted && cartCount > 0 && (
                <span className="absolute left-1 top-1 h-[18px] min-w-[18px] rounded-[9px] bg-sale-700 px-1 text-center text-[11px] font-bold leading-[18px] text-white">
                  {toPersianDigits(cartCount > 99 ? "99+" : cartCount)}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}

function MenuColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <h5 className="mb-2 px-2.5 text-xs font-semibold text-muted-600">
        {title}
      </h5>
      {children}
    </div>
  );
}

function MenuLink({
  href,
  sale,
  children,
}: {
  href: string;
  sale?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group/link flex items-center justify-between gap-2 rounded-[10px] px-2.5 py-[9px] text-sm transition-[background,padding] hover:bg-sand-200 hover:ps-3.5",
        sale && "text-sale-700",
      )}
    >
      {children}
      <ChevronLeft
        className="size-[18px] translate-x-1.5 opacity-0 transition-[opacity,transform] group-hover/link:translate-x-0 group-hover/link:opacity-100"
        strokeWidth={1.7}
      />
    </Link>
  );
}
