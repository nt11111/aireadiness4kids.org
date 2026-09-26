import type { CSSProperties } from "react";
import { cn } from "../ui/utils";

/** The circuit-elephant mark. Brief section 3: use it at small sizes only. */
export function ARKMark({ size = 28, decorative = false, className, style }: { size?: number; decorative?: boolean; className?: string; style?: CSSProperties }) {
  return (
    <img
      src="/brand/ark-mark-web.png"
      alt={decorative ? "" : "ARK"}
      width={size}
      height={Math.round(size * 0.77)}
      className={cn("shrink-0 select-none object-contain", className)}
      style={style}
      draggable={false}
    />
  );
}

/**
 * ARK wordmark: "ARK" in Fraunces with "AIReadiness4Kids" in small caps beneath.
 * The single place to swap the logo (brief section 3).
 * fluid: sized in em, so it scales with its parent's font size (the certificate sets that in
 * container units, so the wordmark keeps its place on a phone and on paper).
 */
export function Logo({ tone = "dark", showMark = true, fluid = false, className }: { tone?: "dark" | "light"; showMark?: boolean; fluid?: boolean; className?: string }) {
  const light = tone === "light";
  return (
    <span className={cn("inline-flex items-center", fluid ? "gap-[0.625em]" : "gap-2.5", className)}>
      {showMark && <ARKMark size={30} decorative style={fluid ? { width: "1.875em", height: "auto" } : undefined} />}
      <span className="flex flex-col leading-none">
        <span className={cn("font-display font-semibold tracking-tight", fluid ? "text-[1.625em]" : "text-[1.625rem]", light ? "text-white" : "text-ink")}>ARK</span>
        <span className={cn("font-bold tracking-[0.04em] [font-variant-caps:small-caps]", fluid ? "mt-[0.125em] text-[0.8125em]" : "mt-0.5 text-[0.8125rem]", light ? "text-glow" : "text-brand")}>
          AIReadiness4Kids
        </span>
      </span>
    </span>
  );
}
