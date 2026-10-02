/**
 * Track styling. Tailwind needs literal class names, so each track's classes are
 * spelled out here rather than built from the id. Contrast for every pair is
 * checked by scripts/check-contrast.mjs.
 */
export type TrackId = "aware" | "literate" | "fluent";

export const TRACK_STYLE: Record<TrackId, {
  /** Solid fill + readable text on it (course headers, number badges). */
  fill: string;
  /** Text on the fill, for icons and secondary text. */
  onFill: string;
  /** Tinted chip: soft background + track ink text. */
  chip: string;
  /** Track color as text/strokes on light surfaces. */
  ink: string;
  /** Thin accent bar color. */
  bar: string;
  /** Focus-ring color for anything sitting on the fill (3:1 against it). */
  ring: string;
  /** Button variant that reads clearly on the fill. */
  button: "ink" | "light";
}> = {
  aware: {
    fill: "bg-track-aware text-track-aware-on",
    onFill: "text-track-aware-on",
    chip: "bg-track-aware-soft text-track-aware-ink",
    ink: "text-track-aware-ink",
    bar: "bg-track-aware",
    ring: "[--ring:var(--ink)]",
    button: "ink",
  },
  literate: {
    fill: "bg-track-literate text-track-literate-on",
    onFill: "text-track-literate-on",
    chip: "bg-track-literate-soft text-track-literate-ink",
    ink: "text-track-literate-ink",
    bar: "bg-track-literate",
    ring: "[--ring:#ffffff]",
    button: "light",
  },
  fluent: {
    fill: "bg-track-fluent text-track-fluent-on",
    onFill: "text-track-fluent-on",
    chip: "bg-track-fluent-soft text-track-fluent-ink",
    ink: "text-track-fluent-ink",
    bar: "bg-track-fluent",
    ring: "[--ring:#ffffff]",
    button: "light",
  },
};

export const trackStyle = (id: string) => TRACK_STYLE[id as TrackId] ?? TRACK_STYLE.literate;
