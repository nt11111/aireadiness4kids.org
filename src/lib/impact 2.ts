/**
 * The /admin impact numbers (brief section 7), read only from the running-total stats docs
 * (stats.ts), never from learners' own data:
 *
 *   no date range, no src   stats/global + every stats/byModule_*
 *   no date range, a src    stats/bySrc_{src} (its totals and byModule map)
 *   a date range            the stats/daily_* docs in it, summed (top level, or bySrc[src])
 *
 * Everything here is a count or an average across many people; nothing names or identifies anyone.
 */
import { z } from "astro/zod";
import { FieldPath } from "firebase-admin/firestore";
import { db } from "./firebase-admin";
import { getCatalog, moduleDocId } from "./catalog";
import type { Counter } from "./stats";

export const COUNTERS: { key: Counter; label: string }[] = [
  { key: "accounts_13to17", label: "Accounts, ages 13 to 17" },
  { key: "accounts_18plus", label: "Accounts, 18 and over (learners and parents)" },
  { key: "learners", label: "Learner profiles" },
  { key: "moduleStarts", label: "Module starts" },
  { key: "moduleCompletions", label: "Module completions" },
  { key: "certificates", label: "Certificates" },
];
const ALL_COUNTERS: Counter[] = ["accounts_13to17", "accounts_18plus", "learners", "moduleStarts", "moduleCompletions", "certificates", "preScoreSum", "preCount", "postScoreSum", "postCount"];

/** "_none" is the bucket for sign-ups and checks that came with no ?src= tag (stats.ts). */
const DAY = /^\d{4}-\d{2}-\d{2}$/;
/** A real calendar day as yyyy-mm-dd (not "2026-13-99"). */
const isDay = (v: string) => DAY.test(v) && !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;
export const ImpactFilter = z.object({
  source: z.union([z.string().regex(/^[a-z0-9-]{1,40}$/), z.literal("_none")]).nullable(),
  from: z.string().regex(DAY).nullable(),
  to: z.string().regex(DAY).nullable(),
});
export type ImpactFilter = z.infer<typeof ImpactFilter>;

/** Reads the filter from ?source=&from=&to= (source, not src: src= is a learner's tag and gets captured). Bad values are dropped. */
export function filterFrom(params: URLSearchParams): ImpactFilter {
  const pick = (name: string, ok: (v: string) => boolean) => {
    const v = (params.get(name) ?? "").trim();
    return v && ok(v) ? v : null;
  };
  const filter = {
    source: pick("source", (v) => ImpactFilter.shape.source.safeParse(v).success),
    from: pick("from", isDay),
    to: pick("to", isDay),
  };
  // A backwards range is almost certainly the two fields swapped.
  if (filter.from && filter.to && filter.from > filter.to) [filter.from, filter.to] = [filter.to, filter.from];
  return filter;
}

type Counts = Record<Counter, number>;
type Doc = Partial<Record<Counter, number>> & { byModule?: Record<string, Partial<Record<Counter, number>>> };

export type ModuleRow = {
  moduleId: string;
  title: string;
  track: string;
  starts: number;
  completions: number;
  preCount: number;
  /** Average percent correct, or null with no results. */
  preAvg: number | null;
  postCount: number;
  postAvg: number | null;
  /** postAvg minus preAvg, in percentage points, when both exist. */
  change: number | null;
};

export type ImpactReport = { filter: ImpactFilter; totals: Counts; preAvg: number | null; postAvg: number | null; modules: ModuleRow[]; sources: string[]; days: number | null };

const zero = (): Counts => Object.fromEntries(ALL_COUNTERS.map((k) => [k, 0])) as Counts;
function add(into: Counts, from: Partial<Record<Counter, unknown>> | undefined) {
  if (!from) return;
  for (const k of ALL_COUNTERS) {
    const v = from[k];
    if (typeof v === "number" && Number.isFinite(v)) into[k] += v;
  }
}
const avg = (sum: number, count: number) => (count > 0 ? Math.round(sum / count) : null);

/** Every src with stats, for the filter's list ("_none" for "no tag"). */
async function listSources(): Promise<string[]> {
  const snap = await db().collection("stats").where(FieldPath.documentId(), ">=", "bySrc_").where(FieldPath.documentId(), "<", "bySrc`").select().get();
  return snap.docs.map((d) => d.id.slice("bySrc_".length)).sort((a, b) => (a === "_none" ? 1 : b === "_none" ? -1 : a.localeCompare(b)));
}

export async function impactReport(filter: ImpactFilter): Promise<ImpactReport> {
  const stats = db().collection("stats");
  const totals = zero();
  const byModule = new Map<string, Counts>();
  const addModules = (map: Doc["byModule"]) => {
    for (const [key, counts] of Object.entries(map ?? {})) {
      const into = byModule.get(key) ?? zero();
      add(into, counts);
      byModule.set(key, into);
    }
  };
  let days: number | null = null;

  if (filter.from || filter.to) {
    let q: FirebaseFirestore.Query = stats;
    if (filter.from) q = q.where("date", ">=", filter.from);
    if (filter.to) q = q.where("date", "<=", filter.to);
    const snap = await q.get();
    days = snap.size;
    for (const d of snap.docs) {
      const data = d.data() as Doc & { bySrc?: Record<string, Doc> };
      const part = filter.source ? data.bySrc?.[filter.source] : data;
      add(totals, part);
      addModules(part?.byModule);
    }
  } else if (filter.source) {
    const data = (await stats.doc(`bySrc_${filter.source}`).get()).data() as Doc | undefined;
    add(totals, data);
    addModules(data?.byModule);
  } else {
    const [global, modules] = await Promise.all([
      stats.doc("global").get(),
      stats.where(FieldPath.documentId(), ">=", "byModule_").where(FieldPath.documentId(), "<", "byModule`").get(),
    ]);
    add(totals, global.data());
    for (const d of modules.docs) addModules({ [d.id.slice("byModule_".length)]: d.data() as Doc });
  }

  const catalog = await getCatalog();
  const modules: ModuleRow[] = [];
  for (const mod of catalog.values()) {
    const c = byModule.get(moduleDocId(mod.id));
    if (!c) continue;
    const preAvg = avg(c.preScoreSum, c.preCount);
    const postAvg = avg(c.postScoreSum, c.postCount);
    modules.push({
      moduleId: mod.id,
      title: mod.title,
      track: mod.track,
      starts: c.moduleStarts,
      completions: c.moduleCompletions,
      preCount: c.preCount,
      preAvg,
      postCount: c.postCount,
      postAvg,
      change: preAvg !== null && postAvg !== null ? postAvg - preAvg : null,
    });
  }

  return {
    filter,
    totals,
    preAvg: avg(totals.preScoreSum, totals.preCount),
    postAvg: avg(totals.postScoreSum, totals.postCount),
    modules,
    sources: await listSources(),
    days,
  };
}

/** Spreadsheet cells: quoted when needed, and text that a spreadsheet would run as a formula is defused. */
function cell(v: string | number | null) {
  if (v === null) return "";
  let s = String(v);
  if (typeof v === "string" && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
const row = (...cells: (string | number | null)[]) => cells.map(cell).join(",");

/** The report as CSV: the filter, the totals, then one row per module. Aggregates only. */
export function impactCsv(report: ImpactReport, generatedAt = new Date()) {
  const f = report.filter;
  const lines = [
    row("ARK impact numbers (aggregate totals only)"),
    row("source", f.source === "_none" ? "(no tag)" : (f.source ?? "all")),
    row("from", f.from ?? "(start)"),
    row("to", f.to ?? "(today)"),
    row("generated_at", generatedAt.toISOString()),
    "",
    row("metric", "value"),
    ...COUNTERS.map((c) => row(c.key, report.totals[c.key])),
    row("pre_check_results", report.totals.preCount),
    row("pre_check_average_pct", report.preAvg),
    row("post_check_results", report.totals.postCount),
    row("post_check_average_pct", report.postAvg),
    "",
    row("module", "track", "module_starts", "module_completions", "pre_results", "pre_average_pct", "post_results", "post_average_pct", "change_pts"),
    ...report.modules.map((m) => row(m.title, m.track, m.starts, m.completions, m.preCount, m.preAvg, m.postCount, m.postAvg, m.change)),
  ];
  return `${lines.join("\r\n")}\r\n`;
}
