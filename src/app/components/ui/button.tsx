import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "./utils";

// Focus styling comes from the global :focus-visible rule in theme.css.
// Hover states darken rather than fade, so label contrast never drops.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-bold cursor-pointer select-none transition-[background-color,border-color,color,box-shadow,transform] duration-[var(--dur)] ease-out active-state:translate-y-px active-state:shadow-none disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[1.1em]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-1 hover-state:bg-[color-mix(in_srgb,var(--primary)_86%,black)]",
        accent: "bg-accent text-accent-foreground shadow-1 hover-state:bg-[color-mix(in_srgb,var(--accent)_88%,black)]",
        secondary: "bg-secondary text-secondary-foreground hover-state:bg-[color-mix(in_srgb,var(--secondary)_82%,var(--brand))]",
        outline: "border-[1.5px] border-input bg-surface text-ink hover-state:border-ink-soft hover-state:bg-surface-2",
        ghost: "text-ink hover-state:bg-secondary",
        link: "rounded-sm text-brand underline decoration-2 underline-offset-4 hover-state:decoration-[3px]",
        destructive: "bg-destructive text-destructive-foreground shadow-1 hover-state:bg-[color-mix(in_srgb,var(--destructive)_86%,black)]",
        ink: "bg-ink text-white shadow-1 hover-state:bg-[color-mix(in_srgb,var(--ink)_82%,white)]",
        light: "bg-surface text-ink shadow-1 hover-state:bg-surface-2",
        "outline-light": "border-[1.5px] border-white/70 text-white hover-state:border-white hover-state:bg-white/10",
      },
      size: {
        sm: "h-9 px-4 text-small",
        default: "h-11 px-6 text-ui",
        lg: "h-12 px-8 text-[1.0625rem]",
        icon: "size-11",
      },
    },
    compoundVariants: [{ variant: "link", className: "h-auto px-0" }],
    defaultVariants: { variant: "default", size: "default" },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    /** Shows a spinner, sets aria-busy, and disables the button. */
    loading?: boolean;
  };

function Button({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }: ButtonProps) {
  if (asChild) {
    return (
      <Slot data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props}>
        {children}
      </Slot>
    );
  }
  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

export { Button, buttonVariants };
export type { ButtonProps };
