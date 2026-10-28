import { cn } from "./utils";

type Track = "aware" | "literate" | "fluent" | "brand";

// Fills use the course colors (the Hull's bars); the empty part is a 3:1 gray so the meter reads on white.
const FILL: Record<Track, string> = {
  aware: "var(--track-aware)",
  literate: "var(--track-literate)",
  fluent: "var(--track-fluent)",
  brand: "var(--accent-strong)",
};
const SIZE = {
  sm: { px: 40, bar: 6, text: "text-[0.75rem]" },
  md: { px: 64, bar: 8, text: "text-small" },
  lg: { px: 96, bar: 12, text: "text-ui" },
} as const;

type Props = {
  done: number;
  total: number;
  /** Accessible name, e.g. "Bias in AI progress". */
  label: string;
  track?: Track;
  size?: keyof typeof SIZE;
  showValue?: boolean;
  className?: string;
};

/**
 * Progress for course headers and module rows (brief section 3). Square, like everything else: an ink
 * frame with the count inside and a bar along the bottom that fills in the course color.
 * (Still called a ring for its callers; it was a circle before the October 2026 redesign.)
 */
export function ProgressRing({ done, total, label, track = "brand", size = "md", showValue = true, className }: Props) {
  const clamped = Math.max(0, Math.min(done, total));
  const pct = total > 0 ? clamped / total : 0;
  const { px, bar, text } = SIZE[size];
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={clamped}
      aria-valuetext={`${clamped} of ${total} complete`}
      className={cn("relative inline-flex shrink-0 flex-col border-2 border-ink bg-surface", className)}
      style={{ width: px, height: px }}
    >
      <span aria-hidden="true" className={cn("grid flex-1 place-items-center font-display font-bold tabular-nums text-ink", text)}>
        {showValue ? `${clamped}/${total}` : ""}
      </span>
      <span aria-hidden="true" className="block border-t-2 border-ink bg-line-strong/40" style={{ height: bar }}>
        <span className="block h-full transition-[width] duration-[var(--dur-slow)] ease-out" style={{ width: `${pct * 100}%`, background: FILL[track] }} />
      </span>
    </div>
  );
}
