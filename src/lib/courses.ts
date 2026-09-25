import { getCollection, type CollectionEntry } from "astro:content";
import type { StepRef } from "./lesson-types";

export type Track = CollectionEntry<"tracks">;
export type Module = CollectionEntry<"modules">;
export type StepEntry = CollectionEntry<"steps">;
export type { StepType } from "./lesson-types";
export type Step = StepRef & { entry: StepEntry };
export type Course = { track: Track; modules: Module[]; steps: Map<string, Step[]> };

/** Classroom time per module from the curriculum templates ("60-90 min each"), shown until a module has steps or sets duration_minutes. */
export const MODULE_MINUTES = { min: 60, max: 90 } as const;

/** Step URLs that can't be used because another page lives there. */
const RESERVED_STEP_SLUGS = new Set(["complete", "guide"]);

export const moduleSlug = (m: Module) => m.id.split("/")[1];
export const moduleHref = (m: Module) => `/courses/${m.data.track}/${moduleSlug(m)}`;
export const trackHref = (t: Track) => `/courses/${t.id}`;

/** Group step files by module, ordered by their NN- prefix. Throws on anything a volunteer might get wrong. */
function groupSteps(entries: StepEntry[], modules: Module[]) {
  const byModule = new Map<string, Step[]>();
  for (const entry of entries) {
    const [track, mod, file] = entry.id.split("/");
    const moduleId = `${track}/${mod}`;
    const module = modules.find((m) => m.id === moduleId);
    if (!module) throw new Error(`Step "${entry.id}" is in a folder with no index.mdx.`);
    const match = /^(\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)$/.exec(file);
    if (!match) throw new Error(`Step file "${entry.id}.mdx" must be named like 01-what-is-bias.mdx (two digits, a dash, lowercase words).`);
    const [, num, slug] = match;
    if (RESERVED_STEP_SLUGS.has(slug)) throw new Error(`Step "${entry.id}": "${slug}" is reserved; pick another name.`);
    const list = byModule.get(moduleId) ?? [];
    list.push({
      id: entry.id,
      n: Number(num),
      slug,
      title: entry.data.title,
      type: entry.data.type,
      minutes: entry.data.minutes,
      href: `${moduleHref(module)}/${slug}`,
      entry,
    });
    byModule.set(moduleId, list);
  }
  for (const [moduleId, list] of byModule) {
    list.sort((a, b) => a.n - b.n);
    list.forEach((s, i) => {
      if (s.n !== i + 1) throw new Error(`Module "${moduleId}": step numbers must run 01 to ${String(list.length).padStart(2, "0")} with no gaps or repeats (see "${s.id}").`);
      if (list.some((o) => o !== s && o.slug === s.slug)) throw new Error(`Module "${moduleId}": two steps are named "${s.slug}".`);
    });
  }
  return byModule;
}

/** Tracks in order, each with its modules and their steps in order. Throws on inconsistent content so the build fails. */
export async function getCourses(): Promise<Course[]> {
  const [tracks, modules, stepEntries] = await Promise.all([getCollection("tracks"), getCollection("modules"), getCollection("steps")]);
  const steps = groupSteps(stepEntries, modules);
  return tracks
    .sort((a, b) => a.data.order - b.data.order)
    .map((track) => {
      const mods = modules.filter((m) => m.data.track === track.id).sort((a, b) => a.data.order - b.data.order);
      mods.forEach((m, i) => {
        if (!m.id.startsWith(`${track.id}/`)) throw new Error(`Module "${m.id}" says track: ${m.data.track} but its folder is under a different track.`);
        if (m.data.order !== i + 1) throw new Error(`Track "${track.id}": module order values must run 1 to ${mods.length} with no gaps or repeats (see "${m.id}").`);
      });
      return { track, modules: mods, steps: new Map(mods.map((m) => [m.id, steps.get(m.id) ?? []])) };
    });
}

/** A module's lesson steps, in order ([] until its steps are written). */
export const getModuleSteps = (course: Course, m: Module): Step[] => course.steps.get(m.id) ?? [];

/** Self-paced time: the step minutes once a module has steps, otherwise duration_minutes or the classroom range. */
function minutesRange(m: Module, steps: StepRef[]) {
  if (steps.length) {
    const total = steps.reduce((sum, s) => sum + s.minutes, 0);
    return { min: total, max: total };
  }
  if (m.data.duration_minutes) return { min: m.data.duration_minutes, max: m.data.duration_minutes };
  return MODULE_MINUTES;
}

export function moduleTime(m: Module, steps: StepRef[] = []) {
  const { min, max } = minutesRange(m, steps);
  return min === max ? `${min} min` : `${min} to ${max} min`;
}

const hours = (minutes: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(Math.round((minutes / 60) * 2) / 2);

export function courseTime(course: Course) {
  let min = 0;
  let max = 0;
  for (const m of course.modules) {
    const r = minutesRange(m, getModuleSteps(course, m));
    min += r.min;
    max += r.max;
  }
  return hours(min) === hours(max) ? `About ${hours(min)} hours` : `About ${hours(min)} to ${hours(max)} hours`;
}

export function reviewCounts(mods: Module[]) {
  return {
    draft: mods.filter((m) => m.data.status === "draft").length,
    inReview: mods.filter((m) => m.data.status === "in-review").length,
    reviewed: mods.filter((m) => m.data.status === "reviewed").length,
  };
}

/** Everyone named on a reviewed module, once each, with the modules they reviewed. */
export function getReviewers(courses: Course[]) {
  const byName = new Map<string, { name: string; credentials?: string; modules: { title: string; href: string }[] }>();
  for (const { modules } of courses) {
    for (const m of modules.filter((x) => x.data.status === "reviewed")) {
      for (const r of m.data.reviewers) {
        const entry = byName.get(r.name) ?? { ...r, modules: [] };
        entry.modules.push({ title: m.data.title, href: moduleHref(m) });
        byName.set(r.name, entry);
      }
    }
  }
  return [...byName.values()];
}
