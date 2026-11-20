import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/content";

export function Promos() {
  const { party, sale } = siteConfig.home.promos;
  return (
    <section className="py-8 sm:py-11">
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="grid grid-cols-[1.2fr_1fr] items-center gap-4 overflow-hidden rounded-lg bg-sand-200 p-[22px] sm:min-h-[300px] sm:grid-cols-2 sm:rounded-xl sm:p-10">
          <div className="flex flex-col items-start gap-3">
            <span className="t-eyebrow">{party.eyebrow}</span>
            <h3 className="t-h2">{party.title}</h3>
            <p className="text-muted-600">{party.body}</p>
            <Button asChild variant="pill" size="pill-sm">
              <Link href={party.cta.href}>{party.cta.label}</Link>
            </Button>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={party.image} alt="" loading="lazy" className="max-h-[160px] w-full object-contain sm:max-h-[260px]" />
        </div>

        <div className="grid grid-cols-[1.2fr_1fr] items-center gap-4 overflow-hidden rounded-lg bg-caramel-500 p-[22px] text-espresso-900 sm:min-h-[300px] sm:grid-cols-2 sm:rounded-xl sm:p-10">
          <div className="flex flex-col items-start gap-3">
            <Badge variant="dark">{sale.badge}</Badge>
            <h3 className="t-h2">{sale.title}</h3>
            <p>{sale.body}</p>
            <Button asChild variant="pill-light" size="pill-sm">
              <Link href={sale.cta.href}>{sale.cta.label}</Link>
            </Button>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={sale.image} alt="" loading="lazy" className="max-h-[160px] w-full object-contain sm:max-h-[260px]" />
        </div>
      </div>
    </section>
  );
}
