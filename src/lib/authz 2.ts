/**
 * Authorization helpers (brief section 8.2). The Admin SDK bypasses Firestore's rules, so every
 * server route must go through these before touching data. No route takes a uid from the request:
 * the uid always comes from the verified session.
 */
import type { DocumentReference } from "firebase-admin/firestore";
import { db } from "./firebase-admin";
import type { Role, SessionUser } from "./session";

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(code);
  }
}

/** The signed-in user, or a 401. */
export function requireUser(locals: App.Locals): SessionUser {
  if (!locals.user) throw new HttpError(401, "signed-out");
  return locals.user;
}

/** A signed-in user with one of these roles (custom claims set only by scripts/set-role.ts), or 401/403. */
export function requireRole(locals: App.Locals, ...roles: Role[]): SessionUser {
  const user = requireUser(locals);
  if (!user.role || !roles.includes(user.role)) throw new HttpError(403, "forbidden");
  return user;
}

/** Firestore auto IDs: 20 letters and digits. Rejects path tricks like "../" before any lookup. */
export const LEARNER_ID = /^[A-Za-z0-9]{20}$/;

export type LearnerDoc = { nickname: string; gradeBand: string | null; isSelf: boolean };

/**
 * The learner profile, only if it belongs to this user. Learners live under users/{uid}, so a
 * learnerId from someone else's account simply isn't found: the answer is the same 404 whether it
 * exists elsewhere or not, which reveals nothing.
 */
export async function requireLearner(uid: string, learnerId: string): Promise<LearnerDoc & { id: string; ref: DocumentReference }> {
  if (!LEARNER_ID.test(learnerId)) throw new HttpError(400, "bad-learner-id");
  const snap = await db().doc(`users/${uid}/learners/${learnerId}`).get();
  if (!snap.exists) throw new HttpError(404, "not-found");
  return { id: snap.id, ref: snap.ref, ...(snap.data() as LearnerDoc) };
}
