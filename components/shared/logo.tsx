import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/content";

/**
 * لوگوتایپ تایپی دلانا: DELANA با Cormorant Garamond (حروف بزرگ، فاصله ۰٫۲em)
 * و زیرنویس فارسی. فایل لوگوی رسمی هنوز وجود ندارد؛ هر زمان آماده شد فقط
 * همین کامپوننت را عوض کنید.
 */
export function Logo({
  className,
  tone = "dark",
  align = "center",
}: {
  className?: string;
  tone?: "dark" | "light";
  align?: "center" | "start";
}) {
  return (
    <span
      className={cn(
        "inline-flex flex-col leading-none",
        align === "center" ? "items-center" : "items-start",
        tone === "dark" ? "text-espresso-900" : "text-cream-100",
        className,
      )}
    >
      <span
        dir="ltr"
        className="font-brand text-[24px] font-semibold tracking-[0.2em] ps-[0.2em] sm:text-[30px]"
      >
        {siteConfig.site.nameLatin.toUpperCase()}
      </span>
      <span
        className={cn(
          "mt-1 text-[10px] font-medium tracking-[0.04em] sm:text-[11px]",
          tone === "dark" ? "text-muted-600" : "text-sand-200",
        )}
      >
        {siteConfig.site.shortDescription}
      </span>
    </span>
  );
}

/** Kept for the admin sidebar, which uses the light variant. */
export function WhiteLogo({ className }: { className?: string }) {
  return <Logo tone="light" className={className} />;
}
