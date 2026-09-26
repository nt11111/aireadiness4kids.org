// Account rules shared by the server (validation) and the browser (form hints). No imports, so islands can use it.

/** Grade bands a learner can pick. Stored as-is; never a birth date or age. */
export const GRADE_BANDS = [
  { id: "k-2", label: "Kindergarten to grade 2" },
  { id: "3-5", label: "Grades 3 to 5" },
  { id: "6-8", label: "Grades 6 to 8" },
  { id: "9-12", label: "Grades 9 to 12" },
  { id: "adult", label: "Adult learner" },
] as const;
export type GradeBand = (typeof GRADE_BANDS)[number]["id"];

/** Age bands stored on an account (brief section 8.2). Under-13s never get an account of their own. */
export type AgeBand = "13to17" | "18plus";
export type AccountType = "learner" | "parent";

/**
 * Display names and nicknames: letters, numbers, spaces, and . ' - only, up to 30 characters.
 * That rules out emails, links, and phone numbers, so a child's profile can't hold contact details.
 */
export const NAME_PATTERN = /^[\p{L}\p{M}0-9 .'’-]{1,30}$/u;
export const NAME_HINT = "Use letters, numbers, spaces, and . ' - only (up to 30 characters).";

export const MIN_PASSWORD = 10;
export const MAX_LEARNERS = 10;

/** Version of the parent notice a parent agreed to (stored with their consent). */
export const PARENT_NOTICE_VERSION = "draft-2026-09";

/** Age band from a birth month (1-12) and year. Only the band leaves the browser, never the date. */
export function ageBandFrom(month: number, year: number, now = new Date()): "under13" | AgeBand {
  // The day isn't asked, so a birthday this month counts as not yet reached (the safer, younger answer).
  const age = now.getFullYear() - year - (now.getMonth() + 1 <= month ? 1 : 0);
  if (age < 13) return "under13";
  return age < 18 ? "13to17" : "18plus";
}
