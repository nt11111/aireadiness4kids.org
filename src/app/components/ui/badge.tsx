import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

// Chips. Each variant's text/background pair is covered by scripts/check-contrast.mjs.
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-small font-bold leading-none [&>svg]:pointer-events-none [&>svg]:size-3.5",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-ink",
        neutral: "border-transparent bg-surface-2 text-ink-soft",
        outline: "border-input bg-surface text-ink",
        accent: "border-transparent bg-accent text-accent-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        draft: "border-warning/40 bg-surface-2 text-warning",
        reviewed: "border-brand/30 bg-brand-soft text-brand",
        explorers: "border-transparent bg-track-explorers-soft text-track-explorers-ink",
        investigators: "border-transparent bg-track-investigators-soft text-track-investigators-ink",
        architects: "border-transparent bg-track-architects-soft text-track-architects-ink",
        "explorers-solid": "border-transparent bg-track-explorers text-track-explorers-on",
        "investigators-solid": "border-transparent bg-track-investigators text-track-investigators-on",
        "architects-solid": "border-transparent bg-track-architects text-track-architects-on",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({ className, variant, asChild = false, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";
  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
