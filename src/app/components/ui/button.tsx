import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "./utils";

// Focus styling comes from the global :focus-visible rule in theme.css.
// Hover states darken rather than fade, so label contrast never drops.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-3 whitespace-nowrap border-2 border-transparent font-display font-bold tracking-[0.01em] cursor-pointer select-none transition-[background-color,border-color,color,transform] duration-[var(--dur-fast)] ease-out active-state:translate-y-[2px] disabled:pointer-events-none disabled:border-line disabled:bg-surface disabled:text-ink-soft aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[1.1em]",
  {
    variants: {
      variant: {
        default: "border-primary bg-primary text-primary-foreground hover-state:border-black hover-state:bg-black",
        accent: "border-accent bg-accent text-ink hover-state:border-white hover-state:bg-white",
        secondary: "border-ink bg-surface-2 text-ink hover-state:bg-line",
        outline: "border-ink bg-surface text-ink hover-state:bg-surface-2",
        ghost: "text-ink hover-state:bg-surface-2",
        link: "border-0 text-brand underline decoration-2 underline-offset-4 hover-state:decoration-[3px]",
        destructive: "border-destructive bg-destructive text-destructive-foreground hover-state:bg-[color-mix(in_srgb,var(--destructive)_86%,black)]",
        ink: "border-ink bg-ink text-white hover-state:border-black hover-state:bg-black",
        light: "border-white bg-white text-ink hover-state:bg-surface-2",
        "outline-light": "border-white text-white hover-state:bg-white hover-state:text-ink",
      },
      size: {
        sm: "min-h-11 px-4 text-small",
        default: "min-h-12 px-5 text-ui",
        lg: "min-h-13 px-6 text-[1.0625rem]",
        icon: "size-12",
      },
    },
    compoundVariants: [{ variant: "link", className: "min-h-0 px-0" }],
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
