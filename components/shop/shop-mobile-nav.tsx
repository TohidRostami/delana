"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Info,
  LayoutDashboard,
  LayoutGrid,
  LogIn,
  Package,
  Phone,
  Store,
  User,
  House,
  type LucideIcon,
} from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { siteConfig } from "@/lib/content";
import { cn } from "@/lib/utils";
import type { CategoryDTO } from "@/lib/types";

/** آیکن هر گزینهٔ منوی اصلی (بر اساس href) */
const MAIN_ICONS: Record<string, LucideIcon> = {
  "/": House,
  "/products": Store,
  "/contact": Phone,
  "/about": Info,
};

const SOFT = "ease-[cubic-bezier(0.22,1,0.36,1)]";
/** ورود نرم هر ردیف هنگام باز شدن منو (کشیده‌شدن از کنارهٔ منو) */
const enter =
  "animate-in fade-in-0 slide-in-from-right-6 duration-500 fill-mode-backwards motion-reduce:animate-none";

function NavRow({
  href,
  icon: Icon,
  label,
  active,
  onNavigate,
  index,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
  onNavigate: () => void;
  index: number;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      style={{ animationDelay: `${120 + index * 55}ms` }}
      className={cn(
        "group relative flex items-center gap-3 rounded-field px-3 py-2.5 text-[15px] transition-[background-color,color,transform] duration-300 active:scale-[0.98] motion-reduce:transition-none",
        enter,
        active
          ? "bg-sand-200 font-bold text-cocoa-700"
          : "font-medium hover:bg-cream-100",
      )}
    >
      <ActiveBar active={active} />
      <IconBubble active={active}>
        <Icon className="size-5" strokeWidth={1.7} />
      </IconBubble>
      {label}
    </Link>
  );
}

function ActiveBar({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute start-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-caramel-500 transition-transform duration-500 motion-reduce:transition-none",
        SOFT,
        active ? "scale-y-100" : "scale-y-0",
      )}
    />
  );
}

function IconBubble({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full transition-[background-color,color,transform] duration-300 group-hover:scale-105 motion-reduce:transition-none",
        active
          ? "bg-cocoa-700 text-cream-100"
          : "bg-cream-100 text-cocoa-700 group-hover:bg-sand-200",
      )}
    >
      {children}
    </span>
  );
}

export function ShopMobileNav({
  categories,
  isStaff,
  loggedIn,
  onNavigate,
}: {
  categories: CategoryDTO[];
  isStaff: boolean;
  loggedIn: boolean;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const inCategory = pathname.startsWith("/products/category");
  // «فروشگاه»: لیست کل محصولات و صفحهٔ هر محصول (نه صفحهٔ دسته‌بندی‌ها)
  const inShop = pathname.startsWith("/products") && !inCategory;
  const [open, setOpen] = useState(inCategory);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
  const label = (href: string) =>
    siteConfig.nav.main.find((m) => m.href === href)?.label;

  // ترتیب منو: خانه، فروشگاه، دسته‌بندی‌ها (کشویی)، تماس با ما، درباره ما
  const flat = [
    { href: "/", label: label("/") ?? "خانه" },
    { href: "/products", label: "فروشگاه" },
    { href: "/contact", label: label("/contact") ?? "تماس با ما" },
    { href: "/about", label: label("/about") ?? "درباره ما" },
  ];
  const topItems: (
    | { kind: "link"; href: string; label: string }
    | { kind: "categories" }
  )[] = [
    { kind: "link", ...flat[0] },
    { kind: "link", ...flat[1] },
    { kind: "categories" },
    { kind: "link", ...flat[2] },
    { kind: "link", ...flat[3] },
  ];

  const account =
    pathname.startsWith("/account") && !pathname.startsWith("/account/orders");

  return (
    <div className="flex h-full flex-col">
      <div className="flex justify-center border-b border-line-200 px-5 py-5 animate-in fade-in-0 duration-500 motion-reduce:animate-none">
        <Link href="/" onClick={onNavigate} aria-label="صفحه اصلی">
          <Logo />
        </Link>
      </div>

      <nav className="flex flex-col gap-1 p-3" aria-label="منوی موبایل">
        {topItems.map((item, i) => {
          if (item.kind === "link") {
            return (
              <NavRow
                key={item.href}
                href={item.href}
                icon={MAIN_ICONS[item.href]}
                label={item.label}
                active={
                  item.href === "/products" ? inShop : isActive(item.href)
                }
                onNavigate={onNavigate}
                index={i}
              />
            );
          }

          return (
            <div key="categories">
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="mobile-categories"
                style={{ animationDelay: `${120 + i * 55}ms` }}
                className={cn(
                  "group relative flex w-full items-center gap-3 rounded-field px-3 py-2.5 text-[15px] transition-[background-color,color,transform] duration-300 active:scale-[0.98] motion-reduce:transition-none",
                  enter,
                  inCategory
                    ? "font-bold text-cocoa-700"
                    : "font-medium hover:bg-cream-100",
                  inCategory && !open && "bg-sand-200",
                )}
              >
                <ActiveBar active={inCategory} />
                <IconBubble active={inCategory}>
                  <LayoutGrid className="size-5" strokeWidth={1.7} />
                </IconBubble>
                <span className="flex-1 text-start">دسته‌بندی‌ها</span>
                <ChevronDown
                  className={cn(
                    "size-[18px] transition-transform duration-500 motion-reduce:transition-none",
                    SOFT,
                    open && "rotate-180",
                  )}
                  strokeWidth={1.7}
                />
              </button>

              {/* آکاردئون: ارتفاع با grid-rows نرم باز و بسته می‌شود */}
              <div
                id="mobile-categories"
                inert={!open}
                className={cn(
                  "grid transition-[grid-template-rows,opacity] duration-500 motion-reduce:transition-none",
                  SOFT,
                  open
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0",
                )}
              >
                <div className="overflow-hidden">
                  <div className="mb-1 me-[22px] mt-1 flex flex-col gap-0.5 border-e-2 border-sand-200 pe-2">
                    {categories.map((c, idx) => {
                      const href = `/products/category/${c.slug}`;
                      const active = pathname === href;
                      return (
                        <Link
                          key={c.slug}
                          href={href}
                          onClick={onNavigate}
                          aria-current={active ? "page" : undefined}
                          tabIndex={open ? 0 : -1}
                          style={{
                            transitionDelay: open
                              ? `${80 + idx * 35}ms`
                              : "0ms",
                          }}
                          className={cn(
                            "flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-sm transition-[opacity,transform,background-color,color] duration-500 motion-reduce:transition-none",
                            SOFT,
                            open
                              ? "translate-x-0 opacity-100"
                              : "translate-x-3 opacity-0",
                            active
                              ? "bg-sand-200 font-bold text-cocoa-700"
                              : "text-muted-600 hover:bg-cream-100 hover:text-espresso-900",
                          )}
                        >
                          <span
                            aria-hidden
                            className={cn(
                              "size-1.5 shrink-0 rounded-full transition-[background-color,transform] duration-300",
                              active
                                ? "scale-150 bg-caramel-500"
                                : "bg-sand-300",
                            )}
                          />
                          {c.title}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-line-200 p-3">
        {loggedIn ? (
          <NavRow
            href="/account"
            icon={User}
            label="حساب کاربری"
            active={account}
            onNavigate={onNavigate}
            index={5}
          />
        ) : (
          <NavRow
            href="/login"
            icon={LogIn}
            label="ورود یا ثبت‌نام"
            active={
              pathname.startsWith("/login") || pathname.startsWith("/register")
            }
            onNavigate={onNavigate}
            index={5}
          />
        )}
        {isStaff && (
          <NavRow
            href="/admin"
            icon={LayoutDashboard}
            label="پنل مدیریت"
            active={pathname.startsWith("/admin")}
            onNavigate={onNavigate}
            index={7}
          />
        )}
      </div>
    </div>
  );
}
