import { cn } from "./utils";

type Track = "explorers" | "investigators" | "architects" | "brand";

// Strokes use the text-safe "-ink" shades so the ring meets 3:1 on light surfaces.
const STROKE: Record<Track, string> = {
  explorers: "var(--track-explorers-ink)",
  investigators: "var(--track-investigators-ink)",
  architects: "var(--track-architects-ink)",
  brand: "var(--accent-strong)",
};
const SIZE = {
  sm: { px: 40, stroke: 4, text: "text-[0.75rem]" },
  md: { px: 64, stroke: 6, text: "text-small" },
  lg: { px: 96, stroke: 8, text: "text-ui" },
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

/** Circular progress for course headers and module rows (brief section 3). */
export function ProgressRing({ done, total, label, track = "brand", size = "md", showValue = true, className }: Props) {
  const clamped = Math.max(0, Math.min(done, total));
  const pct = total > 0 ? clamped / total : 0;
  const { px, stroke, text } = SIZE[size];
  const r = (px - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={clamped}
      aria-valuetext={`${clamped} of ${total} complete`}
      className={cn("relative inline-grid shrink-0 place-items-center", className)}
      style={{ width: px, height: px }}
    >
      <svg width={px} height={px} viewBox={`0 0 ${px} ${px}`} aria-hidden="true" className="-rotate-90">
        <circle cx={px / 2} cy={px / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={stroke} />
        <circle
          cx={px / 2}
          cy={px / 2}
          r={r}
          fill="none"
          stroke={STROKE[track]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className="transition-[stroke-dashoffset] duration-[var(--dur-slow)] ease-out"
        />
      </svg>
      {showValue && (
        <span aria-hidden="true" className={cn("absolute font-bold tabular-nums text-ink", text)}>
          {clamped}/{total}
        </span>
      )}
    </div>
  );
}
