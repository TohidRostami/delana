import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-sm border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 [&_svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border-transparent",
        secondary: "bg-secondary text-secondary-foreground border-transparent",
        accent: "bg-accent-2 text-accent-2-foreground border-transparent",
        outline: "text-foreground border-foreground/25 bg-transparent",
        destructive: "bg-destructive text-destructive-foreground border-transparent",
        // ---- storefront (Delana) badges ----
        new: "h-[26px] rounded-full border-transparent bg-sand-200 px-3 py-0 text-xs font-bold text-cocoa-700",
        sale: "h-[26px] rounded-full border-transparent bg-sale-700 px-3 py-0 text-xs font-bold text-white",
        ok: "h-[26px] rounded-full border-transparent bg-success-100 px-3 py-0 text-xs font-bold text-success-700",
        warn: "h-[26px] rounded-full border-transparent bg-warn-100 px-3 py-0 text-xs font-bold text-warn-700",
        quiet: "h-[26px] rounded-full border-transparent bg-sand-200 px-3 py-0 text-xs font-bold text-muted-600",
        dark: "h-[26px] rounded-full border-transparent bg-cocoa-700 px-3 py-0 text-xs font-bold text-cream-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";
  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
