import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Truck, RotateCcw, CreditCard, Ruler, type LucideIcon } from "lucide-react";

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { siteConfig } from "@/lib/content";

export const metadata: Metadata = {
  title: siteConfig.faq.title,
  description: `پاسخ سوالات پرتکرار دربارهٔ سفارش، ارسال و بازگشت کالا در ${siteConfig.site.name}.`,
  alternates: { canonical: "/faq" },
};

const ICONS: Record<string, LucideIcon> = {
  shipping: Truck,
  returns: RotateCcw,
  payment: CreditCard,
  size: Ruler,
};

export default function FaqPage() {
  const { title, groups } = siteConfig.faq;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: groups.flatMap((g) =>
      g.items.map((it) => ({
        "@type": "Question",
        name: it.q,
        acceptedAnswer: { "@type": "Answer", text: it.a },
      })),
    ),
  };

  return (
    <div className="wrap pb-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs items={[{ label: "خانه", href: "/" }, { label: title }]} />
      <h1 className="t-h1">{title}</h1>
      <p className="mb-5 mt-2 text-muted-600">
        جواب سوالتان را پیدا نکردید؟{" "}
        <Link href="/contact" className="font-semibold text-cocoa-700 underline underline-offset-4">با ما تماس بگیرید</Link>.
      </p>

      <div className="grid items-start gap-5 pb-4 pt-3 lg:grid-cols-[260px_1fr] lg:gap-10">
        <nav
          aria-label="دسته‌بندی سوالات"
          className="no-scrollbar flex gap-1.5 overflow-x-auto lg:sticky lg:top-[108px] lg:flex-col lg:overflow-visible"
        >
          {groups.map((g) => {
            const Icon = ICONS[g.id] ?? Ruler;
            return (
              <a
                key={g.id}
                href={`#${g.id}`}
                className="flex items-center gap-2.5 whitespace-nowrap rounded-md px-4 py-3 text-sm font-medium transition-colors hover:bg-sand-200"
              >
                <Icon className="size-5" strokeWidth={1.7} />
                {g.title}
              </a>
            );
          })}
        </nav>

        <div>
          {groups.map((g, gi) => (
            <section key={g.id} id={g.id} className="mb-9 flex scroll-mt-28 flex-col gap-3">
              <h2 className="t-h3">{g.title}</h2>
              {g.items.map((it, i) => (
                <details key={it.q} open={gi === 0 && i === 0} className="group rounded-lg bg-cream-100 px-[22px]">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-[18px] font-semibold [&::-webkit-details-marker]:hidden">
                    {it.q}
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sand-200 text-cocoa-700">
                      <Plus className="size-5 transition-transform duration-300 group-open:rotate-45" strokeWidth={1.7} />
                    </span>
                  </summary>
                  <p className="pb-5 text-sm leading-[1.9] text-muted-600">{it.a}</p>
                </details>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
