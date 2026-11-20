import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/70 border border-border",
        outline:
          "border border-foreground/25 bg-transparent text-foreground hover:bg-foreground hover:text-background",
        ghost: "hover:bg-secondary text-foreground",
        link: "text-foreground underline-offset-4 hover:underline p-0 h-auto",
        accent: "bg-accent text-accent-foreground hover:bg-accent/85",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        // ---- storefront (Delana) — pill buttons, see design/design-system.md ----
        pill: "rounded-full border-[1.5px] border-cocoa-700 bg-cocoa-700 text-cream-100 hover:border-espresso-900 hover:bg-espresso-900",
        "pill-outline":
          "rounded-full border-[1.5px] border-cocoa-700 bg-transparent text-cocoa-700 hover:bg-sand-200",
        "pill-ghost":
          "rounded-full border-[1.5px] border-transparent bg-transparent text-cocoa-700 hover:border-sand-200 hover:bg-sand-200",
        "pill-light":
          "rounded-full border-[1.5px] border-ivory-50 bg-ivory-50 text-espresso-900 hover:border-white hover:bg-white",
      },
      size: {
        default: "h-11 px-6 has-[>svg]:px-5",
        sm: "h-9 px-4 text-xs has-[>svg]:px-3.5",
        m: "h-11 px-6 text-s has-[>svg]:px-5",
        lg: "h-13 px-8 text-base has-[>svg]:px-7",
        icon: "size-11",
        pill: "h-[52px] gap-2.5 px-7 text-[15px] font-semibold [&_svg:not([class*='size-'])]:size-5",
        "pill-lg":
          "h-[52px] gap-2.5 px-7 text-[15px] font-semibold sm:h-[60px] sm:px-9 sm:text-[17px] [&_svg:not([class*='size-'])]:size-5",
        "pill-sm":
          "h-10 gap-2 px-[18px] text-sm font-semibold [&_svg:not([class*='size-'])]:size-[18px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
