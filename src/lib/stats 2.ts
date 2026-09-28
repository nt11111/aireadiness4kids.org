/**
 * Running-total impact counters (brief section 8.2). Every server write that changes a metric calls
 * bumpStats() in the same batch or transaction, so /admin reads a handful of small docs and never
 * loads individual learners.
 *
 *   stats/global                  everything
 *   stats/bySrc_{src}             one workshop or partner ("bySrc__none" for no src), with a
 *                                 nested byModule map
 *   stats/byModule_{track__slug}  one module (starts, completions, pre/post scores)
 *   stats/daily_{yyyy-mm-dd}      one UTC day, with nested byModule and bySrc maps (each src has
 *                                 its own byModule), so /admin can filter by src and date range
 *                                 together, down to each module's pre/post scores
 *
 * Counters only go up: they count sign-ups, starts, and check submissions as they happen, so
 * deleting an account later doesn't rewrite past totals (and they hold nothing personal).
 * Score sums are in percentage points (score / outOf * 100), so modules with different numbers of
 * questions average correctly: average = preScoreSum / preCount.
 */
import { FieldValue, type DocumentReference, type SetOptions } from "firebase-admin/firestore";
import { db } from "./firebase-admin";
import { moduleDocId } from "./catalog";

export type Counter =
  | "accounts_13to17"
  | "accounts_18plus"
  | "learners"
  | "moduleStarts"
  | "moduleCompletions"
  | "certificates"
  | "preScoreSum"
  | "preCount"
  | "postScoreSum"
  | "postCount";

export type Counts = Partial<Record<Counter, number>>;

/** Anything that can set a document: a WriteBatch or a Transaction. */
type Writer = { set(ref: DocumentReference, data: FirebaseFirestore.DocumentData, options: SetOptions): unknown };

/** "bySrc__none" can't clash with a real src: srcs are only lowercase letters, digits, and dashes. */
const srcKey = (src: string | null | undefined) => (src ? src : "_none");
const day = (at: Date) => at.toISOString().slice(0, 10);

function increments(counts: Counts) {
  const out: Record<string, FieldValue> = {};
  for (const [name, n] of Object.entries(counts)) if (n) out[name] = FieldValue.increment(n);
  return out;
}

export function bumpStats(writer: Writer, counts: Counts, { src, moduleId, at = new Date() }: { src?: string | null; moduleId?: string; at?: Date }) {
  const inc = increments(counts);
  if (!Object.keys(inc).length) return;
  const stats = db().collection("stats");
  const merge = { merge: true };
  writer.set(stats.doc("global"), inc, merge);
  const byModule = moduleId ? { byModule: { [moduleDocId(moduleId)]: inc } } : {};
  writer.set(stats.doc(`bySrc_${srcKey(src)}`), { src: src ?? null, ...inc, ...byModule }, merge);
  if (moduleId) writer.set(stats.doc(`byModule_${moduleDocId(moduleId)}`), { moduleId, ...inc }, merge);
  writer.set(stats.doc(`daily_${day(at)}`), { date: day(at), ...inc, ...byModule, bySrc: { [srcKey(src)]: { ...inc, ...byModule } } }, merge);
}

/** A score as whole percentage points, for the score-sum counters. */
export const percent = (score: number, outOf: number) => (outOf > 0 ? Math.round((score / outOf) * 100) : 0);
