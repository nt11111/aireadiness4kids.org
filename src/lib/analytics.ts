/**
 * Analytics (brief section 8.7), one module so the provider can change in one place.
 *
 * With PUBLIC_UMAMI_ID set, SiteHead loads Umami Cloud's cookie-free tracker and these events go to
 * it; without it, track() does nothing. Events never carry emails, names, IDs, or free text:
 * callers pass buckets, flags, and the track (a course, not a person).
 */
export type TrackId = string;
export type ScoreBucket = "low" | "mid" | "high";

export type AnalyticsEvent =
  | { name: "lesson_start"; props: { track: TrackId } }
  | { name: "step_complete"; props: { type: string } }
  | { name: "gate_shown"; props: Record<string, never> }
  | { name: "signup_complete"; props: { method: "google" | "email"; age_band: "13to17" | "18plus" } }
  | { name: "module_complete"; props: { track: TrackId } }
  | { name: "check_submit"; props: { phase: "pre" | "lesson" | "post"; score_bucket: ScoreBucket } }
  | { name: "certificate_issued"; props: { scope: "module" | "course" } }
  | { name: "present_start"; props: { track: TrackId } };

type Umami = { track: (name: string, data?: Record<string, string | number | boolean>) => unknown };

export function track(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  const umami = (window as unknown as { umami?: Umami }).umami;
  if (!umami) return; // not configured, blocked, or Do Not Track: nothing is sent
  try {
    umami.track(event.name, event.props);
  } catch {
    // analytics must never break the page
  }
}

/** Score as a coarse bucket: under half, half to 79%, 80% and up. */
export const scoreBucket = (score: number, total: number): ScoreBucket => {
  const pct = total ? score / total : 0;
  return pct >= 0.8 ? "high" : pct >= 0.5 ? "mid" : "low";
};
