import type { CSSProperties } from "react";
import { cn } from "../ui/utils";

/**
 * The Hull: a mast and flag over three bars, one per course (blue AI Fluent, red AI Literate,
 * yellow AI Aware). Drawn inline so it stays sharp at any size; public/brand/ark-mark.svg is the
 * same drawing, and scripts/brand-assets.mjs renders the PNG icons from it.
 * small: thicker bars and no flag, for 32 px and below.
 */
export function ARKMark({ size = 44, small = false, decorative = false, className, style }: { size?: number; small?: boolean; decorative?: boolean; className?: string; style?: CSSProperties }) {
  return (
    <svg
      viewBox="0 0 48 42"
      width={size}
      height={Math.round(size * 0.875)}
      className={cn("shrink-0", className)}
      style={style}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : "ARK"}
    >
      {small ? (
        <>
          <rect x="21" y="0" width="6" height="16" fill="#111827" />
          <rect x="0" y="16" width="48" height="9" fill="#2348C8" />
          <rect x="7" y="25" width="34" height="9" fill="#E2512C" />
          <rect x="14" y="34" width="20" height="8" fill="#F2B21B" />
        </>
      ) : (
        <>
          <rect x="22.5" y="1" width="3" height="20" fill="currentColor" />
          <path d="M25.5 2 L36 7.5 L25.5 13 Z" fill="currentColor" />
          <rect x="2" y="21" width="44" height="5" fill="#2348C8" />
          <rect x="8" y="28" width="32" height="5" fill="#E2512C" />
          <rect x="14" y="35" width="20" height="5" fill="#F2B21B" />
        </>
      )}
    </svg>
  );
}

/**
 * ARK wordmark: the Hull, "ARK" in Archivo, and "AI Readiness Kollective" in small capitals beneath.
 * The single place to swap the logo (brief section 3).
 * fluid: sized in em, so it scales with its parent's font size (the certificate sets that in
 * container units, so the wordmark keeps its place on a phone and on paper).
 */
export function Logo({ tone = "dark", showMark = true, fluid = false, className }: { tone?: "dark" | "light"; showMark?: boolean; fluid?: boolean; className?: string }) {
  const light = tone === "light";
  return (
    <span className={cn("inline-flex items-center", fluid ? "gap-[0.75em]" : "gap-3", light ? "text-white" : "text-ink", className)}>
      {showMark && <ARKMark decorative style={fluid ? { width: "2.75em", height: "auto" } : undefined} />}
      <span className="flex flex-col leading-none">
        <span className={cn("font-display font-extrabold tracking-[0.06em]", fluid ? "text-[1.5625em]" : "text-[1.5625rem]")}>ARK</span>
        <span className={cn("font-display font-bold uppercase tracking-[0.1em]", fluid ? "mt-[0.3em] text-[0.6875em]" : "mt-1 text-[0.6875rem]", light ? "text-white/80" : "text-ink-soft")}>
          AI Readiness Kollective
        </span>
      </span>
    </span>
  );
}
