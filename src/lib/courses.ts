import { getCollection, type CollectionEntry } from "astro:content";

export type Track = CollectionEntry<"tracks">;
export type Module = CollectionEntry<"modules">;
export type StepType = "explainer" | "video" | "scenario" | "check" | "reflect" | "recap" | "activity";
export type Step = { id: string; title: string; type: StepType; minutes: number; href: string };
export type Course = { track: Track; modules: Module[] };

/** Classroom time per module from the curriculum templates ("60-90 min each"), shown until a module sets duration_minutes. */
export const MODULE_MINUTES = { min: 60, max: 90 } as const;

/** Tracks in order, each with its modules in order. Throws on inconsistent content so the build fails. */
export async function getCourses(): Promise<Course[]> {
  const [tracks, modules] = await Promise.all([getCollection("tracks"), getCollection("modules")]);
  return tracks
    .sort((a, b) => a.data.order - b.data.order)
    .map((track) => {
      const mods = modules.filter((m) => m.data.track === track.id).sort((a, b) => a.data.order - b.data.order);
      mods.forEach((m, i) => {
        if (!m.id.startsWith(`${track.id}/`)) throw new Error(`Module "${m.id}" says track: ${m.data.track} but its folder is under a different track.`);
        if (m.data.order !== i + 1) throw new Error(`Track "${track.id}": module order values must run 1 to ${mods.length} with no gaps or repeats (see "${m.id}").`);
      });
      return { track, modules: mods };
    });
}

export const moduleSlug = (m: Module) => m.id.split("/")[1];
export const moduleHref = (m: Module) => `/courses/${m.data.track}/${moduleSlug(m)}`;
export const trackHref = (t: Track) => `/courses/${t.id}`;

const hours = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

export function moduleTime(m: Module) {
  return m.data.duration_minutes ? `${m.data.duration_minutes} min` : `${MODULE_MINUTES.min} to ${MODULE_MINUTES.max} min`;
}

export function courseTime(mods: Module[]) {
  const min = mods.reduce((s, m) => s + (m.data.duration_minutes ?? MODULE_MINUTES.min), 0) / 60;
  const max = mods.reduce((s, m) => s + (m.data.duration_minutes ?? MODULE_MINUTES.max), 0) / 60;
  return min === max ? `About ${hours.format(min)} hours` : `About ${hours.format(min)} to ${hours.format(max)} hours`;
}

/** Lesson steps for a module. Returns [] until the steps collection lands in Phase 2. */
export function getModuleSteps(_m: Module): Step[] {
  return [];
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
