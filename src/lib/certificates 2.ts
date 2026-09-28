/**
 * Certificates (brief sections 7 and 8.2), server only. A learner earns one per finished module,
 * issued from their account:
 *
 *   certificates/{certId}   certId = 128 random bits, base64url (unguessable)
 *     uid, learnerId, scope: "module", refId: moduleId, displayName, issuedAt, public
 *
 * 13+ learners' certificates are public, so /verify/{certId} can confirm them (display name, module,
 * date, nothing else). A parent's child profile gets a printable certificate only: public is always
 * false, and /verify answers "not found" exactly as it does for an id that doesn't exist.
 *
 * The progress doc keeps the certificate id, so issuing twice (a double click, two tabs) returns
 * the same certificate and counts it once.
 */
import { randomBytes } from "node:crypto";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "./firebase-admin";
import { HttpError, requireLearner } from "./authz";
import { getProfile } from "./accounts";
import { getCatalog, moduleDocId } from "./catalog";
import { bumpStats } from "./stats";

export const CERT_ID = /^[A-Za-z0-9_-]{22}$/;

export type Certificate = {
  id: string;
  learnerId: string;
  scope: "module";
  moduleId: string;
  displayName: string;
  issuedAt: string;
  public: boolean;
};

const toCert = (id: string, d: FirebaseFirestore.DocumentData): Certificate => ({
  id,
  learnerId: String(d.learnerId),
  scope: "module",
  moduleId: String(d.refId),
  displayName: String(d.displayName),
  issuedAt: d.issuedAt instanceof Timestamp ? d.issuedAt.toDate().toISOString() : "",
  public: d.public === true,
});

/** Issues the certificate for a module the learner has finished, or returns the one already issued. */
export async function issueCertificate(uid: string, learnerId: string, moduleId: string): Promise<Certificate & { issued: boolean }> {
  const learner = await requireLearner(uid, learnerId);
  if (!(await getCatalog()).has(moduleId)) throw new HttpError(404, "unknown-module");
  const profile = await getProfile(uid);
  if (!profile) throw new HttpError(404, "no-profile");
  // Only a 13+ learner's own profile gets a public, verifiable certificate; children's never do.
  const isPublic = profile.accountType === "learner" && learner.isSelf;
  const progressRef = learner.ref.collection("progress").doc(moduleDocId(moduleId));

  return db().runTransaction(async (tx) => {
    const progress = await tx.get(progressRef);
    if (!progress.get("completedAt")) throw new HttpError(409, "not-complete");
    const existing = progress.get("certificateId");
    if (typeof existing === "string") {
      const snap = await tx.get(db().doc(`certificates/${existing}`));
      if (snap.exists) return { ...toCert(snap.id, snap.data()!), issued: false };
    }
    const id = randomBytes(16).toString("base64url");
    const now = Timestamp.now();
    const data = { uid, learnerId: learner.id, scope: "module", refId: moduleId, displayName: learner.nickname, issuedAt: now, public: isPublic };
    tx.create(db().doc(`certificates/${id}`), data);
    tx.update(progressRef, { certificateId: id });
    bumpStats(tx, { certificates: 1 }, { src: profile.firstSrc, moduleId, at: now.toDate() });
    return { ...toCert(id, data), issued: true };
  });
}

/**
 * A certificate for its owner's own page (/certificates/{id}): only if it belongs to this account.
 * Anyone else's id gets the same null as one that doesn't exist.
 */
export async function ownCertificate(uid: string, certId: string): Promise<Certificate | null> {
  if (!CERT_ID.test(certId)) return null;
  const snap = await db().doc(`certificates/${certId}`).get();
  if (!snap.exists || snap.get("uid") !== uid) return null;
  return toCert(snap.id, snap.data()!);
}

/** What /verify/{id} may show: only for public certificates, and only name, module, and date. */
export async function publicCertificate(certId: string): Promise<Pick<Certificate, "id" | "displayName" | "moduleId" | "issuedAt"> | null> {
  if (!CERT_ID.test(certId)) return null;
  const snap = await db().doc(`certificates/${certId}`).get();
  if (!snap.exists || snap.get("public") !== true) return null;
  const c = toCert(snap.id, snap.data()!);
  return { id: c.id, displayName: c.displayName, moduleId: c.moduleId, issuedAt: c.issuedAt };
}

/** One learner's certificates, keyed by module id (My learning's "Reprint certificate"). */
export async function learnerCertificates(uid: string, learnerId: string): Promise<Map<string, Certificate>> {
  const snap = await db().collection("certificates").where("uid", "==", uid).where("learnerId", "==", learnerId).get();
  return new Map(snap.docs.map((d) => [String(d.get("refId")), toCert(d.id, d.data())]));
}

/** "September 26, 2026", the way a certificate shows its date. */
export const certificateDate = (iso: string) => (iso ? new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }) : "");
