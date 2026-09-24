/**
 * Track styling. Tailwind needs literal class names, so each track's classes are
 * spelled out here rather than built from the id. Contrast for every pair is
 * checked by scripts/check-contrast.mjs.
 */
export type TrackId = "explorers" | "investigators" | "architects";

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
}> = {
  explorers: {
    fill: "bg-track-explorers text-track-explorers-on",
    onFill: "text-track-explorers-on",
    chip: "bg-track-explorers-soft text-track-explorers-ink",
    ink: "text-track-explorers-ink",
    bar: "bg-track-explorers",
  },
  investigators: {
    fill: "bg-track-investigators text-track-investigators-on",
    onFill: "text-track-investigators-on",
    chip: "bg-track-investigators-soft text-track-investigators-ink",
    ink: "text-track-investigators-ink",
    bar: "bg-track-investigators",
  },
  architects: {
    fill: "bg-track-architects text-track-architects-on",
    onFill: "text-track-architects-on",
    chip: "bg-track-architects-soft text-track-architects-ink",
    ink: "text-track-architects-ink",
    bar: "bg-track-architects",
  },
};

export const trackStyle = (id: string) => TRACK_STYLE[id as TrackId] ?? TRACK_STYLE.investigators;
