/**
 * Analytics (brief section 8.7). A no-op until Phase 4 plugs in the cookie-free provider.
 * Events never carry emails, names, IDs, or free text; callers pass buckets and flags only.
 */
export type AnalyticsEvent =
  | { name: "check_submit"; props: { phase: "pre" | "lesson" | "post"; score_bucket: "low" | "mid" | "high" } }
  | { name: "step_complete"; props: { type: string } };

export function track(_event: AnalyticsEvent): void {
  // Intentionally empty until the provider is chosen (brief section 11).
}

/** Score as a coarse bucket: under half, half to 79%, 80% and up. */
export const scoreBucket = (score: number, total: number): "low" | "mid" | "high" => {
  const pct = total ? score / total : 0;
  return pct >= 0.8 ? "high" : pct >= 0.5 ? "mid" : "low";
};
