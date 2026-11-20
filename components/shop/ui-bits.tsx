import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section className={cn("rounded-[18px] bg-cream-100 p-[18px] sm:rounded-lg sm:p-6", className)}>
      {children}
    </section>
  );
}

export function PanelHead({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="t-h3">{title}</h2>
      {action}
    </div>
  );
}

/** کارت رادیویی انتخاب (آدرس، روش ارسال، روش پرداخت). */
export function OptionCard({
  checked,
  onSelect,
  title,
  description,
  trailing,
  name,
  value,
  readOnly,
}: {
  checked: boolean;
  onSelect?: () => void;
  title: string;
  description?: string;
  trailing?: ReactNode;
  name: string;
  value: string;
  readOnly?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3.5 rounded-md border-[1.5px] p-4 transition-colors",
        checked ? "border-cocoa-700 bg-ivory-50" : "border-line-200 bg-white hover:border-caramel-500",
        readOnly && "cursor-default",
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onSelect?.()}
        className="sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "mt-[3px] size-[22px] shrink-0 rounded-full border-2 transition-all",
          checked ? "border-[7px] border-cocoa-700" : "border-line-200",
        )}
      />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <b className="text-[15px]">{title}</b>
        {description && <span className="text-[13px] leading-[1.8] text-muted-600">{description}</span>}
      </span>
      {trailing && <span className="self-center">{trailing}</span>}
    </label>
  );
}

export function SummaryRow({
  label,
  value,
  tone,
  muted,
}: {
  label: string;
  value: ReactNode;
  tone?: "off";
  muted?: boolean;
}) {
  return (
    <div className={cn("flex justify-between gap-3", tone === "off" && "text-sale-700")}>
      <span>{label}</span>
      <span className={cn(muted && "text-muted-600")}>{value}</span>
    </div>
  );
}
