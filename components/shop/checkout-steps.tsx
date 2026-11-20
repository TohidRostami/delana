import { Check } from "lucide-react";
import { toPersianDigits } from "@/lib/format";
import { cn } from "@/lib/utils";

const STEPS = ["سبد خرید", "ارسال و پرداخت", "ثبت سفارش"];

/** نوار مراحل خرید؛ current از ۱ تا ۳ (۳ یعنی سفارش ثبت شده). */
export function CheckoutSteps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol
      aria-label="مراحل خرید"
      className="flex items-center justify-center gap-1.5 pb-1 pt-[18px] sm:gap-3 sm:pb-2 sm:pt-7"
    >
      {STEPS.map((label, i) => {
        const n = i + 1;
        const on = n === current;
        const done = n < current;
        return (
          <li key={label} className="flex items-center gap-1.5 sm:gap-3">
            <span
              aria-current={on ? "step" : undefined}
              className={cn(
                "flex items-center gap-1.5 text-xs font-semibold sm:gap-2.5 sm:text-sm",
                on ? "text-espresso-900" : "text-muted-600",
              )}
            >
              <i
                className={cn(
                  "flex size-7 items-center justify-center rounded-full text-xs not-italic sm:size-8 sm:text-sm",
                  on && "bg-cocoa-700 text-cream-100",
                  done && "bg-caramel-500 text-espresso-900",
                  !on && !done && "bg-sand-200 text-cocoa-700",
                )}
              >
                {done ? <Check className="size-4" strokeWidth={2.4} /> : toPersianDigits(n)}
              </i>
              <span className={cn(!on && "hidden sm:inline")}>{label}</span>
            </span>
            {n < STEPS.length && (
              <span
                aria-hidden
                className={cn("h-0.5 w-[18px] sm:w-16", n < current ? "bg-cocoa-700" : "bg-line-200")}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
