/**
 * Account data in Firestore (brief section 8.2), server only. Every function takes the uid from a
 * verified session (see authz.ts) and only touches paths under users/{uid}, or documents whose
 * uid field matches it.
 */
import { FieldValue, Timestamp, type DocumentData } from "firebase-admin/firestore";
import { z } from "astro/zod";
import { adminAuth, db } from "./firebase-admin";
import { HttpError, requireLearner } from "./authz";
import { GRADE_BANDS, MAX_LEARNERS, NAME_PATTERN, PARENT_NOTICE_VERSION, type AccountType, type AgeBand } from "./account-rules";
import { bumpStats } from "./stats";

export const Name = z.string().trim().regex(NAME_PATTERN);
export const Grade = z.enum(GRADE_BANDS.map((g) => g.id) as [string, ...string[]]);
export const Src = z.string().regex(/^[a-z0-9-]{1,40}$/);

export const Signup = z.discriminatedUnion("accountType", [
  z.object({ accountType: z.literal("learner"), ageBand: z.enum(["13to17", "18plus"]), displayName: Name, gradeBand: Grade.optional() }),
  z.object({ accountType: z.literal("parent"), displayName: Name, parentConsent: z.literal(true) }),
]);
export type SignupInput = z.infer<typeof Signup>;

export type Profile = { accountType: AccountType; ageBand: AgeBand; displayName: string; firstSrc: string | null };

const userRef = (uid: string) => db().doc(`users/${uid}`);

export async function getProfile(uid: string): Promise<Profile | null> {
  const snap = await userRef(uid).get();
  return snap.exists ? (snap.data() as Profile) : null;
}

/**
 * Creates the account profile once, at sign-up. 13+ learners get one learner profile for themselves;
 * parents add their children's profiles afterwards. Parents are always stored as 18plus. The sign-up
 * counters (brief section 8.2) are updated in the same transaction, attributed to the first src.
 */
export async function createProfile(uid: string, signup: SignupInput, src?: string) {
  const ref = userRef(uid);
  await db().runTransaction(async (tx) => {
    if ((await tx.get(ref)).exists) return;
    const now = FieldValue.serverTimestamp();
    if (signup.accountType === "learner") {
      tx.create(ref, { accountType: "learner", ageBand: signup.ageBand, displayName: signup.displayName, firstSrc: src ?? null, createdAt: now });
      tx.create(ref.collection("learners").doc(), { nickname: signup.displayName, gradeBand: signup.gradeBand ?? null, isSelf: true, createdAt: now });
      bumpStats(tx, { [`accounts_${signup.ageBand}`]: 1, learners: 1 }, { src });
    } else {
      tx.create(ref, {
        accountType: "parent",
        ageBand: "18plus",
        displayName: signup.displayName,
        firstSrc: src ?? null,
        parentConsent: { version: PARENT_NOTICE_VERSION, at: now },
        createdAt: now,
      });
      bumpStats(tx, { accounts_18plus: 1 }, { src });
    }
  });
}

export type Learner = { id: string; nickname: string; gradeBand: string | null; isSelf: boolean };

export async function listLearners(uid: string): Promise<Learner[]> {
  const snap = await userRef(uid).collection("learners").orderBy("createdAt").get();
  return snap.docs.map((d) => ({ id: d.id, nickname: d.get("nickname"), gradeBand: d.get("gradeBand") ?? null, isSelf: Boolean(d.get("isSelf")) }));
}

export async function updateProfile(uid: string, input: { displayName: string; gradeBand?: string | null }) {
  const profile = await getProfile(uid);
  if (!profile) throw new HttpError(404, "no-profile");
  const batch = db().batch();
  batch.update(userRef(uid), { displayName: input.displayName });
  if (profile.accountType === "learner") {
    // A 13+ learner's own profile shares their display name.
    const self = await userRef(uid).collection("learners").where("isSelf", "==", true).limit(1).get();
    self.docs.forEach((d) => batch.update(d.ref, { nickname: input.displayName, ...(input.gradeBand !== undefined ? { gradeBand: input.gradeBand } : {}) }));
  }
  await batch.commit();
}

export async function addLearner(uid: string, input: { nickname: string; gradeBand: string }) {
  const profile = await getProfile(uid);
  if (profile?.accountType !== "parent") throw new HttpError(403, "parents-only");
  const learners = userRef(uid).collection("learners");
  const count = (await learners.count().get()).data().count;
  if (count >= MAX_LEARNERS) throw new HttpError(409, "too-many-learners");
  const doc = learners.doc();
  const batch = db().batch();
  batch.create(doc, { nickname: input.nickname, gradeBand: input.gradeBand, isSelf: false, createdAt: FieldValue.serverTimestamp() });
  bumpStats(batch, { learners: 1 }, { src: profile.firstSrc });
  await batch.commit();
  return { id: doc.id };
}

export async function updateLearner(uid: string, learnerId: string, input: { nickname: string; gradeBand: string }) {
  const learner = await requireLearner(uid, learnerId);
  const batch = db().batch();
  batch.update(learner.ref, { nickname: input.nickname, gradeBand: input.gradeBand });
  if (learner.isSelf) batch.update(userRef(uid), { displayName: input.nickname });
  await batch.commit();
}

/** Removes a child's profile with its progress and certificates, and unlinks their check results. */
export async function deleteLearner(uid: string, learnerId: string) {
  const learner = await requireLearner(uid, learnerId);
  if (learner.isSelf) throw new HttpError(409, "cannot-remove-self");
  await deleteWhere(db().collection("certificates").where("uid", "==", uid).where("learnerId", "==", learnerId));
  await updateWhere(db().collection("checkResults").where("uid", "==", uid).where("learnerId", "==", learnerId), { learnerId: FieldValue.delete() });
  await db().recursiveDelete(learner.ref);
}

/**
 * Everything ARK holds about this account, for "Download my data". Reflections aren't here:
 * they never leave the learner's browser.
 */
export async function exportAccount(uid: string) {
  const user = await adminAuth().getUser(uid);
  const profileSnap = await userRef(uid).get();
  const learnerSnaps = await userRef(uid).collection("learners").get();
  const learners = await Promise.all(
    learnerSnaps.docs.map(async (d) => ({
      id: d.id,
      ...plain(d.data()),
      progress: (await d.ref.collection("progress").get()).docs.map((p) => ({ moduleId: p.id.replace("__", "/"), ...plain(p.data()) })),
    })),
  );
  const certificates = (await db().collection("certificates").where("uid", "==", uid).get()).docs.map((d) => ({ id: d.id, ...plain(d.data()) }));
  const checkResults = (await db().collection("checkResults").where("uid", "==", uid).get()).docs.map((d) => ({ id: d.id, ...plain(d.data()) }));
  return {
    exportedAt: new Date().toISOString(),
    note: "Everything ARK stores about this account. Reflections you wrote in lessons are only saved in your own browser, so they aren't included.",
    account: {
      email: user.email ?? null,
      emailVerified: user.emailVerified,
      signInMethods: user.providerData.map((p) => p.providerId),
      role: (user.customClaims?.role as string | undefined) ?? null,
      createdAt: user.metadata.creationTime,
      lastSignInAt: user.metadata.lastSignInTime,
    },
    profile: profileSnap.exists ? plain(profileSnap.data() ?? {}) : null,
    learners,
    certificates,
    checkResults,
  };
}

/**
 * Deletes the account (brief section 7): profile, learner profiles, progress, and certificates are
 * removed, check results are unlinked (kept only as anonymous totals), then the sign-in account itself
 * is deleted. Firestore goes first, so if anything fails the person can still sign in and retry.
 */
export async function deleteAccount(uid: string) {
  await deleteWhere(db().collection("certificates").where("uid", "==", uid));
  await updateWhere(db().collection("checkResults").where("uid", "==", uid), { uid: FieldValue.delete(), learnerId: FieldValue.delete() });
  await db().recursiveDelete(userRef(uid));
  await adminAuth().deleteUser(uid);
}

async function deleteWhere(query: FirebaseFirestore.Query) {
  for (;;) {
    const snap = await query.limit(400).get();
    if (snap.empty) return;
    const batch = db().batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}

async function updateWhere(query: FirebaseFirestore.Query, data: DocumentData) {
  for (;;) {
    const snap = await query.limit(400).get();
    if (snap.empty) return;
    const batch = db().batch();
    snap.docs.forEach((d) => batch.update(d.ref, data));
    await batch.commit();
    if (snap.size < 400) return;
  }
}

/** Firestore data as plain JSON (timestamps become ISO strings). */
function plain(data: DocumentData): Record<string, unknown> {
  return JSON.parse(JSON.stringify(data, (_k, v) => (v instanceof Timestamp ? v.toDate().toISOString() : v)));
}
