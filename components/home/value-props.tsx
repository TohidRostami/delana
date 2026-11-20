import { ConfigIcon } from "@/components/shared/config-icon";
import { siteConfig } from "@/lib/content";

export function ValueProps() {
  return (
    <section className="py-8 sm:py-11">
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        {siteConfig.home.valueProps.map((v) => (
          <div
            key={v.title}
            className="flex flex-col items-center gap-2 rounded-lg bg-cream-100 px-2.5 py-4 text-center sm:flex-row sm:gap-3.5 sm:p-5 sm:text-start"
          >
            <span className="flex size-11 flex-none items-center justify-center rounded-full bg-sand-200 text-cocoa-700 sm:size-[52px]">
              <ConfigIcon name={v.icon} className="size-6" />
            </span>
            <div>
              <b className="block text-[13px] sm:text-[15px]">{v.title}</b>
              <span className="text-[11px] text-muted-600 sm:text-[13px]">{v.description}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
