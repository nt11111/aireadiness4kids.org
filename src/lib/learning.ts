/**
 * Learner progress in Firestore (brief sections 8.2 and 8.5), server only. Callers pass a uid from
 * the verified session and a learnerId that requireLearner() (or listLearners) has already proven
 * belongs to it; every path here is under users/{uid}/learners/{learnerId}.
 *
 *   users/{uid}/learners/{learnerId}/progress/{track__module}
 *     moduleId, steps: { [stepSlug]: timestamp }, startedAt, updatedAt, completedAt?,
 *     pre?: { score, outOf, at }, post?: { score, outOf, at }, certificateId? (certificates.ts)
 *
 * Each change and its stats counters are written in one transaction, so a module start or
 * completion is counted exactly once even if the same request arrives twice.
 */
import { createHash } from "node:crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type { AstroCookies } from "astro";
import { db } from "./firebase-admin";
import { HttpError } from "./authz";
import { listLearners, type Learner } from "./accounts";
import { getCatalog, moduleDocId, scoreAnswers, type Answers } from "./catalog";
import { bumpStats, percent } from "./stats";
import { LEARNER_COOKIE, SESSION_MS } from "./session";

export type CheckPhase = "pre" | "post";
export type ModuleProgress = {
  steps: string[];
  pre: { score: number; outOf: number } | null;
  post: { score: number; outOf: number } | null;
  startedAt: string | null;
  updatedAt: string | null;
  completedAt: string | null;
  certificateId: string | null;
};

const progressRef = (uid: string, learnerId: string, moduleId: string) =>
  db().doc(`users/${uid}/learners/${learnerId}/progress/${moduleDocId(moduleId)}`);
const iso = (t: unknown) => (t instanceof Timestamp ? t.toDate().toISOString() : null);

/**
 * The learner whose progress this browser is showing: the one in the ark_learner cookie if it's
 * one of this account's learners, otherwise the account's own profile, otherwise its first child.
 * Parents with no learner profiles yet get null.
 */
export async function activeLearner(uid: string, cookies: AstroCookies): Promise<{ learner: Learner | null; learners: Learner[] }> {
  const learners = await listLearners(uid);
  const wanted = cookies.get(LEARNER_COOKIE)?.value;
  const learner = learners.find((l) => l.id === wanted) ?? learners.find((l) => l.isSelf) ?? learners[0] ?? null;
  return { learner, learners };
}

/**
 * A tag for the signed-in account (a hash of its uid). A browser where the account was created keeps
 * the same tag with its guest progress (guest.ts accountTag), so that account gets the progress
 * without being asked; nobody else's does.
 */
export const accountTag = (uid: string) => createHash("sha256").update(`ark-guest-claim|${uid}`).digest("hex").slice(0, 32);

/** Remembers which learner a parent picked (a UI choice, not a credential: the server re-checks ownership every time). */
export function setActiveLearnerCookie(cookies: AstroCookies, learnerId: string) {
  cookies.set(LEARNER_COOKIE, learnerId, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: SESSION_MS / 1000 });
}

/** All of one learner's module progress, keyed by module id. */
export async function learnerProgress(uid: string, learnerId: string): Promise<Record<string, ModuleProgress>> {
  const snap = await db().collection(`users/${uid}/learners/${learnerId}/progress`).get();
  const out: Record<string, ModuleProgress> = {};
  for (const d of snap.docs) {
    const data = d.data();
    const moduleId = typeof data.moduleId === "string" ? data.moduleId : d.id.replace("__", "/");
    const result = (r: unknown) => (r && typeof r === "object" ? { score: Number((r as { score: number }).score), outOf: Number((r as { outOf: number }).outOf) } : null);
    out[moduleId] = {
      steps: Object.keys(data.steps ?? {}),
      pre: result(data.pre),
      post: result(data.post),
      startedAt: iso(data.startedAt),
      updatedAt: iso(data.updatedAt),
      completedAt: iso(data.completedAt),
      certificateId: typeof data.certificateId === "string" ? data.certificateId : null,
    };
  }
  return out;
}

async function requireModule(moduleId: string) {
  const mod = (await getCatalog()).get(moduleId);
  if (!mod) throw new HttpError(404, "unknown-module");
  return mod;
}

/**
 * Marks steps complete. The first completed step counts a module start; the step that finishes the
 * module counts a completion. Unknown steps are rejected. Returns what changed.
 */
export async function completeSteps(uid: string, learnerId: string, moduleId: string, slugs: string[]) {
  const mod = await requireModule(moduleId);
  const valid = new Set(mod.steps.map((s) => s.slug));
  if (!slugs.length || slugs.some((s) => !valid.has(s))) throw new HttpError(400, "unknown-step");
  const ref = progressRef(uid, learnerId, moduleId);
  const userRef = db().doc(`users/${uid}`);
  return db().runTransaction(async (tx) => {
    const [snap, user] = await Promise.all([tx.get(ref), tx.get(userRef)]);
    const done = { ...(snap.get("steps") ?? {}) } as Record<string, unknown>;
    const fresh = [...new Set(slugs)].filter((s) => !(s in done));
    if (!fresh.length) return { started: false, completed: false };
    const now = Timestamp.now();
    const wasStarted = Object.keys(done).length > 0;
    for (const s of fresh) done[s] = now;
    const completedNow = !snap.get("completedAt") && mod.steps.every((s) => s.slug in done);
    tx.set(
      ref,
      {
        moduleId,
        steps: Object.fromEntries(fresh.map((s) => [s, now])),
        updatedAt: now,
        ...(wasStarted ? {} : { startedAt: now }),
        ...(completedNow ? { completedAt: now } : {}),
      },
      { merge: true },
    );
    bumpStats(tx, { moduleStarts: wasStarted ? 0 : 1, moduleCompletions: completedNow ? 1 : 0 }, { src: user.get("firstSrc"), moduleId, at: now.toDate() });
    return { started: !wasStarted, completed: completedNow };
  });
}

/**
 * Saves a pre- or post-check, scored here against the module's answer key. The first result for
 * each phase is kept (a retake doesn't change the "before" and "after" numbers) and counted once.
 */
export async function saveModuleCheck(uid: string, learnerId: string, moduleId: string, phase: CheckPhase, answers: Answers) {
  const mod = await requireModule(moduleId);
  const result = scoreAnswers(phase === "pre" ? mod.preCheck : mod.postCheck, answers);
  if (!result) throw new HttpError(400, "invalid");
  const ref = progressRef(uid, learnerId, moduleId);
  const userRef = db().doc(`users/${uid}`);
  return db().runTransaction(async (tx) => {
    const [snap, user] = await Promise.all([tx.get(ref), tx.get(userRef)]);
    const existing = snap.get(phase) as { score: number; outOf: number } | undefined;
    if (existing) return { score: existing.score, outOf: existing.outOf, saved: false };
    const now = Timestamp.now();
    tx.set(ref, { moduleId, [phase]: { ...result, at: now } }, { merge: true });
    const counts = phase === "pre" ? { preScoreSum: percent(result.score, result.outOf), preCount: 1 } : { postScoreSum: percent(result.score, result.outOf), postCount: 1 };
    bumpStats(tx, counts, { src: user.get("firstSrc"), moduleId, at: now.toDate() });
    return { ...result, saved: true };
  });
}

export type GuestProgress = { steps: Record<string, string[]>; pre: Record<string, Answers>; anonSid?: string };

/**
 * Brings a guest's browser progress into a learner (brief section 8.5): step completions, pre-check
 * answers, and any anonymous workshop check results from the same browser. Content that no longer
 * exists is skipped rather than failing the whole merge.
 */
export async function mergeGuest(uid: string, learner: Learner, guest: GuestProgress) {
  let steps = 0;
  let pre = 0;
  for (const [moduleId, slugs] of Object.entries(guest.steps)) {
    const mod = (await getCatalog()).get(moduleId);
    const known = slugs.filter((s) => mod?.steps.some((x) => x.slug === s));
    if (!mod || !known.length) continue;
    await completeSteps(uid, learner.id, moduleId, known);
    steps += known.length;
  }
  for (const [moduleId, answers] of Object.entries(guest.pre)) {
    try {
      if ((await saveModuleCheck(uid, learner.id, moduleId, "pre", answers)).saved) pre += 1;
    } catch (error) {
      if (!(error instanceof HttpError)) throw error;
    }
  }
  const checks = guest.anonSid ? await linkAnonChecks(uid, learner, guest.anonSid) : 0;
  return { steps, pre, checks };
}

/**
 * Links workshop check results this browser submitted anonymously to the learner who just signed
 * in (brief section 8.6). The anonymous id is removed once linked; it isn't needed any more.
 */
export async function linkAnonChecks(uid: string, learner: Learner, anonSid: string) {
  const snap = await db().collection("checkResults").where("anonSid", "==", anonSid).limit(50).get();
  const unlinked = snap.docs.filter((d) => !d.get("uid"));
  if (!unlinked.length) return 0;
  const batch = db().batch();
  for (const d of unlinked) {
    batch.update(d.ref, { uid, learnerId: learner.id, anonSid: FieldValue.delete(), ...(d.get("gradeBand") ? {} : { gradeBand: learner.gradeBand ?? null }) });
  }
  await batch.commit();
  return unlinked.length;
}
