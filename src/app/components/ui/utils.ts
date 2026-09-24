import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge the design-system scales in theme.css. Without this it reads
// custom sizes like `text-ui` as text colors and drops classes such as `text-primary-foreground`.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["display-xl", "display-lg", "display-md", "display-sm", "title", "lesson", "lesson-explorers", "ui", "small", "eyebrow"],
      shadow: ["1", "2"],
      container: ["site", "reading"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
