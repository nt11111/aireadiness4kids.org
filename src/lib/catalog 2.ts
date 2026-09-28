/**
 * The course catalog as the server's API routes see it: which modules and steps exist, and the
 * pre/post-check answer keys. Routes validate every moduleId and step against this, so nothing
 * that isn't real content can be written to progress, check results, or the stats counters.
 */
import type { Question } from "./lesson-types";
import { getCourses, moduleHref, moduleSlug } from "./courses";

export type CatalogModule = {
  id: string;
  track: string;
  slug: string;
  title: string;
  href: string;
  steps: { slug: string; href: string }[];
  preCheck: Question[];
  postCheck: Question[];
};

let catalog: Promise<Map<string, CatalogModule>> | undefined;

export function getCatalog(): Promise<Map<string, CatalogModule>> {
  catalog ??= getCourses().then((courses) => {
    const map = new Map<string, CatalogModule>();
    for (const course of courses) {
      for (const m of course.modules) {
        map.set(m.id, {
          id: m.id,
          track: course.track.id,
          slug: moduleSlug(m),
          title: m.data.title,
          href: moduleHref(m),
          steps: (course.steps.get(m.id) ?? []).map((s) => ({ slug: s.slug, href: s.href })),
          preCheck: m.data.pre_check,
          postCheck: m.data.post_check,
        });
      }
    }
    return map;
  });
  return catalog;
}

/** Module ids look like "investigators/bias-in-ai". Rejects anything else before a lookup. */
export const MODULE_ID = /^[a-z]+\/[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const STEP_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Firestore document ids can't contain "/", so a module's progress and stats docs use "__". */
export const moduleDocId = (moduleId: string) => moduleId.replace("/", "__");

/** Answers keyed by question id. Only questions in the check count, each answer must be one of its options. */
export type Answers = Record<string, string>;

/**
 * Scores answers against the answer key on the server (the browser's own score is never trusted).
 * Every question must be answered with one of its options, or the answers are rejected.
 */
export function scoreAnswers(questions: Question[], answers: Answers): { score: number; outOf: number } | null {
  if (!questions.length) return null;
  const ids = Object.keys(answers);
  if (ids.length !== questions.length) return null;
  let score = 0;
  for (const q of questions) {
    const pick = answers[q.id];
    if (typeof pick !== "string" || !q.options.some((o) => o.id === pick)) return null;
    if (pick === q.answer) score += 1;
  }
  return { score, outOf: questions.length };
}
