import { cn } from "../ui/utils";

/** The circuit-elephant mark. Brief section 3: use it at small sizes only. */
export function ARKMark({ size = 28, decorative = false, className }: { size?: number; decorative?: boolean; className?: string }) {
  return (
    <img
      src="/brand/ark-mark-web.png"
      alt={decorative ? "" : "ARK"}
      width={size}
      height={Math.round(size * 0.77)}
      className={cn("shrink-0 select-none object-contain", className)}
      draggable={false}
    />
  );
}

/**
 * ARK wordmark: "ARK" in Fraunces with "AIReadiness4Kids" in small caps beneath.
 * The single place to swap the logo (brief section 3).
 */
export function Logo({ tone = "dark", showMark = true, className }: { tone?: "dark" | "light"; showMark?: boolean; className?: string }) {
  const light = tone === "light";
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {showMark && <ARKMark size={30} decorative />}
      <span className="flex flex-col leading-none">
        <span className={cn("font-display text-[1.625rem] font-semibold tracking-tight", light ? "text-white" : "text-ink")}>ARK</span>
        <span className={cn("mt-0.5 text-[0.8125rem] font-bold tracking-[0.04em] [font-variant-caps:small-caps]", light ? "text-glow" : "text-brand")}>
          AIReadiness4Kids
        </span>
      </span>
    </span>
  );
}
