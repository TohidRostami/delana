import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Storefront text field — 52px tall, 14px radius, cocoa focus ring. */
export const fieldInput =
  "h-[52px] w-full rounded-field border border-line-200 bg-white px-4 text-[15px] text-espresso-900 outline-none transition-shadow placeholder:text-[#8a7464] focus:border-cocoa-700 focus:shadow-[0_0_0_3px_rgba(107,78,61,0.18)] aria-invalid:border-sale-700 disabled:opacity-60";

export function TextInput({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(fieldInput, className)} {...props} />;
}

export function TextArea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(fieldInput, "h-auto min-h-[96px] resize-y py-3.5", className)}
      {...props}
    />
  );
}

export function SelectInput({ className, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={cn(fieldInput, "appearance-none bg-no-repeat", className)}
      {...props}
    />
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string | null;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <label htmlFor={htmlFor} className="text-[13px] font-semibold">
        {label}
      </label>
      {children}
      {error ? (
        <span className="text-xs text-sale-700">{error}</span>
      ) : hint ? (
        <span className="text-xs text-muted-600">{hint}</span>
      ) : null}
    </div>
  );
}
