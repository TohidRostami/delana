import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card bg-cream-100 px-6 py-14 text-center sm:py-16">
      <span className="flex size-16 items-center justify-center rounded-full bg-sand-200 text-cocoa-700">
        <Icon className="size-8" strokeWidth={1.5} />
      </span>
      <p className="text-base font-bold">{title}</p>
      {description && (
        <p className="max-w-sm text-sm leading-relaxed text-muted-600">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Button asChild variant="pill" size="pill-sm" className="mt-2">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}
