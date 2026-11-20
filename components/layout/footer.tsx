import Link from "next/link";
import { toJalaali } from "jalaali-js";
import { FaInstagram, FaTelegramPlane, FaWhatsapp } from "react-icons/fa";
import { MapPin, Phone } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { siteConfig } from "@/lib/content";
import { toPersianDigits } from "@/lib/format";

function socialHref(url: string, fallback = "#") {
  return url || fallback;
}

export function SiteFooter() {
  const year = toJalaali(new Date()).jy;
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
    ? `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`
    : "";
  const social = [
    { label: "اینستاگرام", href: socialHref(siteConfig.social.instagram), Icon: FaInstagram },
    { label: "تلگرام", href: socialHref(siteConfig.social.telegram), Icon: FaTelegramPlane },
    { label: "واتس‌اپ", href: socialHref(siteConfig.social.whatsapp, wa || "#"), Icon: FaWhatsapp },
  ];

  return (
    <footer className="mt-6 bg-espresso-900 pt-9 text-sand-200 sm:pt-14">
      <div className="wrap">
        <div className="grid grid-cols-2 gap-7 border-b border-[rgba(230,213,193,0.18)] pb-10 sm:grid-cols-2 sm:gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Link
              href="/"
              aria-label={`${siteConfig.site.name} — صفحه اصلی`}
              className="mb-4 inline-block"
            >
              <Logo tone="light" align="start" />
            </Link>
            <p className="text-sm leading-[1.9]">{siteConfig.site.description}</p>
            <div className="mt-[18px] flex gap-2.5">
              {social.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="flex size-9 items-center justify-center rounded-full border border-[rgba(230,213,193,0.3)] text-cream-100 transition-colors hover:bg-[rgba(243,233,221,0.1)]"
                >
                  <Icon className="size-5" />
                </a>
              ))}
            </div>
          </div>

          {siteConfig.nav.footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-[15px] font-bold text-cream-100">{col.title}</h4>
              <ul className="flex flex-col gap-2.5 text-sm">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="transition-colors hover:text-cream-100">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="mb-4 text-[15px] font-bold text-cream-100">
              تماس با {siteConfig.site.name}
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="size-[18px] shrink-0" strokeWidth={1.7} />
                {siteConfig.contact.phone}
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="size-[18px] shrink-0" strokeWidth={1.7} />
                {siteConfig.contact.address}
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-cream-100">
                  صفحه تماس با ما
                </Link>
              </li>
            </ul>
            <div className="mt-[18px] flex gap-3">
              {["نماد اعتماد الکترونیکی", "نشان ساماندهی"].map((t) => (
                <span
                  key={t}
                  className="flex h-24 w-[88px] items-center justify-center rounded-field border border-dashed border-[rgba(230,213,193,0.35)] bg-[rgba(243,233,221,0.08)] p-1.5 text-center text-[11px] leading-[1.6] text-sand-200"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 py-[22px] text-center text-[13px] sm:flex-row sm:justify-between sm:text-start">
          <span>
            © {toPersianDigits(year)} — تمامی حقوق برای بوتیک {siteConfig.site.name} محفوظ است.
          </span>
          <span>
            {siteConfig.nav.legalLinks.map((l, i) => (
              <span key={l.href}>
                {i > 0 && " · "}
                <Link href={l.href} className="transition-colors hover:text-cream-100">
                  {l.label}
                </Link>
              </span>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}
