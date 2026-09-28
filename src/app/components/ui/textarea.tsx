import * as React from "react";

import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Focus uses the global :focus-visible ring (theme.css), which meets 3:1.
        "resize-y border-input placeholder:text-ink-faint focus-visible:border-ring aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-md border bg-input-background px-3 py-2 text-base text-ink transition-[border-color] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
