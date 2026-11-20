import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { siteConfig } from "@/lib/content";

/** صفحهٔ ورود/ثبت‌نام: بدون هدر و فوتر، دو ستون مثل دیزاین. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2 lg:gap-6 lg:p-6">
      <aside className="hidden flex-col justify-between overflow-hidden rounded-xl bg-cocoa-700 p-12 text-cream-100 lg:flex">
        <Link href="/" aria-label={`${siteConfig.site.name} — صفحه اصلی`}>
          <Logo tone="light" align="start" />
        </Link>
        <div className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={siteConfig.home.hero.fallbackImage} alt="" className="w-full max-w-[420px]" />
        </div>
        <div>
          <h2 className="t-h2">به {siteConfig.site.name} خوش آمدید</h2>
          <p className="mt-1.5 text-sand-200">
            با یک حساب، سفارش‌ها و آدرس‌هایتان همیشه در دسترس است.
          </p>
        </div>
      </aside>

      <main className="flex flex-col items-center gap-6 px-4 pb-10 pt-6 lg:justify-center lg:p-6">
        <Link href="/" className="lg:hidden" aria-label={`${siteConfig.site.name} — صفحه اصلی`}>
          <Logo />
        </Link>
        <div className="flex w-full max-w-[440px] flex-col gap-5 rounded-lg bg-cream-100 p-6 shadow-dl-sm sm:rounded-xl sm:p-9">
          {children}
        </div>
        <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-cocoa-700">
          <ChevronRight className="size-[18px]" strokeWidth={1.7} />
          بازگشت به فروشگاه
        </Link>
      </main>
    </div>
  );
}
