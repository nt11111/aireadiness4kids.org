import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

// Chips. Each variant's text/background pair is covered by scripts/check-contrast.mjs.
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1 text-small font-bold leading-none [&>svg]:pointer-events-none [&>svg]:size-3.5 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-ink",
        neutral: "border-transparent bg-surface-2 text-ink-soft",
        outline: "border-input bg-surface text-ink",
        accent: "border-transparent bg-accent text-accent-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        // Review status (brief section 5). Icons carry the meaning too, never color alone.
        draft: "border-warning/35 bg-warning-soft text-warning",
        "in-review": "border-line-strong/50 bg-surface-2 text-ink-soft",
        reviewed: "border-brand/30 bg-brand-soft text-brand",
        aware: "border-transparent bg-track-aware-soft text-track-aware-ink",
        literate: "border-transparent bg-track-literate-soft text-track-literate-ink",
        fluent: "border-transparent bg-track-fluent-soft text-track-fluent-ink",
        "aware-solid": "border-transparent bg-track-aware text-track-aware-on",
        "literate-solid": "border-transparent bg-track-literate text-track-literate-on",
        "fluent-solid": "border-transparent bg-track-fluent text-track-fluent-on",
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
