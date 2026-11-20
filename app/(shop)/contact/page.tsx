import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone, type LucideIcon } from "lucide-react";

import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { siteConfig } from "@/lib/content";

export const metadata: Metadata = {
  title: siteConfig.contactPage.title,
  description: `راه‌های ارتباط با بوتیک ${siteConfig.site.name}.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const { contact, contactPage } = siteConfig;
  const items: { Icon: LucideIcon; label: string; value: string; href?: string; ltr?: boolean }[] = [
    { Icon: Phone, label: "تلفن تماس", value: contact.phone, href: `tel:${contact.phone.replace(/\s/g, "")}`, ltr: true },
    { Icon: MessageCircle, label: "واتس‌اپ و تلگرام", value: contact.mobile },
    { Icon: Mail, label: "ایمیل", value: contact.email, href: `mailto:${contact.email}`, ltr: true },
    { Icon: MapPin, label: "آدرس بوتیک", value: contact.address },
    { Icon: Clock, label: contactPage.hoursLabel, value: contact.workingHours },
  ];

  return (
    <div className="wrap">
      <Breadcrumbs items={[{ label: "خانه", href: "/" }, { label: contactPage.title }]} />
      <h1 className="t-h1 mb-2">{contactPage.title}</h1>
      <p className="mb-6 text-muted-600">{contactPage.intro}</p>

      <div className="grid items-stretch gap-5 pb-14 pt-3 lg:grid-cols-[380px_1fr] lg:gap-8">
        <div className="flex flex-col gap-3.5">
          {items.map(({ Icon, label, value, href, ltr }) => (
            <div key={label} className="flex items-start gap-3.5 rounded-lg bg-cream-100 p-5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-sand-200 text-cocoa-700">
                <Icon className="size-6" strokeWidth={1.7} />
              </span>
              <div className="min-w-0">
                <span className="block text-[13px] text-muted-600">{label}</span>
                {href ? (
                  <a href={href} dir={ltr ? "ltr" : undefined} className="block font-bold hover:underline">{value}</a>
                ) : (
                  <b>{value}</b>
                )}
              </div>
            </div>
          ))}
        </div>

        <div
          role="img"
          aria-label="نقشهٔ موقعیت بوتیک"
          className="relative flex min-h-[280px] items-center justify-center overflow-hidden rounded-lg bg-sand-200 text-cocoa-700"
        >
          <svg className="absolute inset-0 size-full fill-none stroke-sand-300" strokeWidth={2} aria-hidden>
            <defs>
              <pattern id="grid" width="56" height="56" patternUnits="userSpaceOnUse">
                <path d="M56 0H0V56" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <path d="M-10 70 C 120 120, 200 20, 340 90 S 560 160, 760 60" />
            <path d="M80 -10 C 120 100, 60 200, 180 330" />
          </svg>
          <span className="relative flex size-[52px] items-center justify-center rounded-full bg-cocoa-700 text-cream-100 shadow-dl-md">
            <MapPin className="size-6" strokeWidth={1.7} />
          </span>
          {contact.mapUrl && (
            <a
              href={contact.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 start-4 rounded-full bg-ivory-50 px-4 py-2 text-sm font-semibold text-cocoa-700"
            >
              مشاهده روی نقشه
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
