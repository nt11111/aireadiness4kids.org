/**
 * Workshop knowledge checks (brief sections 8.2 and 8.6). Anyone can submit, signed in or not, but
 * only through /api/checks: scored here against the answer key, stored in checkResults, and added
 * to the stats counters in the same transaction.
 *
 * One result per person, module, and phase: the document id is a hash of who (the signed-in learner,
 * or the browser's anonymous id) and what, so pressing submit twice or reloading can't count twice.
 */
import { createHash } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "./firebase-admin";
import { HttpError } from "./authz";
import { getCatalog, scoreAnswers, type Answers } from "./catalog";
import { bumpStats, percent } from "./stats";
import type { CheckPhase } from "./learning";

export type CheckSubmission = { moduleId: string; phase: CheckPhase; answers: Answers; anonSid: string; src?: string; gradeBand?: string };
export type Submitter = { uid: string; learnerId: string; gradeBand: string | null } | null;

export async function submitCheck(input: CheckSubmission, who: Submitter) {
  const mod = (await getCatalog()).get(input.moduleId);
  const questions = input.phase === "pre" ? mod?.preCheck : mod?.postCheck;
  if (!mod || !questions?.length) throw new HttpError(404, "unknown-check");
  const result = scoreAnswers(questions, input.answers);
  if (!result) throw new HttpError(400, "invalid");

  const identity = who ? `learner:${who.uid}/${who.learnerId}` : `anon:${input.anonSid}`;
  const id = createHash("sha256").update(`${identity}|${input.moduleId}|${input.phase}`).digest("hex").slice(0, 40);
  const ref = db().collection("checkResults").doc(id);
  return db().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists) return { score: Number(snap.get("score")), outOf: Number(snap.get("outOf")), duplicate: true };
    const now = Timestamp.now();
    tx.create(ref, {
      ...(who ? { uid: who.uid, learnerId: who.learnerId } : { anonSid: input.anonSid }),
      src: input.src ?? null,
      moduleId: input.moduleId,
      phase: input.phase,
      answers: input.answers,
      score: result.score,
      outOf: result.outOf,
      gradeBand: input.gradeBand ?? who?.gradeBand ?? null,
      createdAt: now,
    });
    const points = percent(result.score, result.outOf);
    const counts = input.phase === "pre" ? { preScoreSum: points, preCount: 1 } : { postScoreSum: points, postCount: 1 };
    bumpStats(tx, counts, { src: input.src, moduleId: input.moduleId, at: now.toDate() });
    return { ...result, duplicate: false };
  });
}
