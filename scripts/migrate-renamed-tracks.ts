/**
 * Moves what Firestore holds under the old track ids (src/lib/renamed-tracks.mjs) to the new ones,
 * so progress, certificates, workshop check results, and the stats counters made before the course
 * rename keep working after it. Run it right after the rename is deployed.
 *
 *   node scripts/migrate-renamed-tracks.ts            preview: prints every change, writes nothing
 *   node scripts/migrate-renamed-tracks.ts --apply    makes the changes
 *
 * Credentials and the emulator: the same as scripts/count-renamed-tracks.ts. Running it twice is
 * safe: the second run finds nothing left to move. Afterwards, count-renamed-tracks.ts should show 0.
 *
 * What moves (each document in its own transaction):
 *   progress       users/{uid}/learners/{id}/progress/{old__slug} -> {new__slug}, moduleId updated.
 *                  If the new doc already exists (used after the deploy), the two are combined.
 *   certificates   refId updated in place; the certificate id (and its /verify link) doesn't change.
 *   checkResults   re-keyed: the doc id hashes the module id (checks.ts), so the person stays deduped.
 *   stats          byModule_{old__slug} counters added into byModule_{new__slug}, then deleted; the
 *                  byModule maps inside bySrc_* and daily_* (and daily_*.bySrc.*) re-keyed the same way.
 */
import { createHash } from "node:crypto";
import { applicationDefault, cert, initializeApp } from "firebase-admin/app";
import { FieldPath, FieldValue, getFirestore, type DocumentReference, type Timestamp } from "firebase-admin/firestore";
import { RENAMED_TRACKS, renameModuleId } from "../src/lib/renamed-tracks.mjs";

const projectId = process.env.PUBLIC_FIREBASE_PROJECT_ID ?? process.env.GCLOUD_PROJECT;
const emulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
const credential = emulator
  ? undefined
  : process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY
    ? cert({ projectId, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n") })
    : applicationDefault();
initializeApp({ projectId, ...(credential ? { credential } : {}) });
const db = getFirestore();
const apply = process.argv.includes("--apply");

const OLD = Object.keys(RENAMED_TRACKS);
const isOldDocId = (id: string) => OLD.some((t) => id.startsWith(`${t}__`));
const isOldModuleId = (id: unknown): id is string => typeof id === "string" && OLD.some((t) => id.startsWith(`${t}/`));
/** "investigators__bias-in-ai" -> "literate__bias-in-ai" */
const renameDocId = (id: string) => renameModuleId(id.replace("__", "/")).replace("/", "__");

const changes: string[] = [];
const plan = (line: string) => changes.push(line);

type Ts = Timestamp | undefined;
const earliest = (a: Ts, b: Ts) => (!a ? b : !b ? a : a.toMillis() <= b.toMillis() ? a : b);
const latest = (a: Ts, b: Ts) => (!a ? b : !b ? a : a.toMillis() >= b.toMillis() ? a : b);

// --- Progress ---
for (const old of (await db.collectionGroup("progress").get()).docs) {
  if (!isOldDocId(old.id)) continue;
  const target = old.ref.parent.doc(renameDocId(old.id));
  const moduleId = renameModuleId(old.id.replace("__", "/"));
  plan(`progress  ${old.ref.path} -> ${target.id}`);
  if (!apply) continue;
  await db.runTransaction(async (tx) => {
    const [from, to] = await Promise.all([tx.get(old.ref), tx.get(target)]);
    if (!from.exists) return;
    const a = from.data()!;
    const b = to.exists ? to.data()! : {};
    const steps: Record<string, Timestamp> = { ...(a.steps ?? {}) };
    for (const [slug, at] of Object.entries((b.steps ?? {}) as Record<string, Timestamp>)) steps[slug] = earliest(steps[slug], at)!;
    const merged: Record<string, unknown> = { ...a, ...b, moduleId, steps };
    for (const key of ["startedAt", "completedAt"] as const) {
      const at = earliest(a[key], b[key]);
      if (at) merged[key] = at;
    }
    const updated = latest(a.updatedAt, b.updatedAt);
    if (updated) merged.updatedAt = updated;
    for (const key of ["pre", "post", "certificateId"] as const) {
      if (b[key] === undefined && a[key] !== undefined) merged[key] = a[key];
    }
    tx.set(target, merged);
    tx.delete(old.ref);
  });
}

// --- Certificates ---
for (const c of (await db.collection("certificates").get()).docs) {
  const refId = c.get("refId");
  if (!isOldModuleId(refId)) continue;
  plan(`certificate  certificates/${c.id}  refId ${refId} -> ${renameModuleId(refId)}`);
  if (apply) await c.ref.update({ refId: renameModuleId(refId) });
}

// --- Workshop check results (doc id = sha256("{identity}|{moduleId}|{phase}"), see src/lib/checks.ts) ---
for (const r of (await db.collection("checkResults").get()).docs) {
  const moduleId = r.get("moduleId");
  if (!isOldModuleId(moduleId)) continue;
  const identity = r.get("uid") ? `learner:${r.get("uid")}/${r.get("learnerId")}` : `anon:${r.get("anonSid")}`;
  const next = renameModuleId(moduleId);
  const id = createHash("sha256").update(`${identity}|${next}|${r.get("phase")}`).digest("hex").slice(0, 40);
  const target = db.collection("checkResults").doc(id);
  plan(`checkResult  checkResults/${r.id} -> checkResults/${id}  (${moduleId} -> ${next})`);
  if (!apply) continue;
  await db.runTransaction(async (tx) => {
    const [from, to] = await Promise.all([tx.get(r.ref), tx.get(target)]);
    if (!from.exists) return;
    // Already answered under the new id (after the deploy): that answer wins, the old one is dropped.
    if (!to.exists) tx.set(target, { ...from.data(), moduleId: next });
    tx.delete(r.ref);
  });
}

// --- Stats ---
/** Field updates that add an old byModule entry's counters into the new key and remove the old key. */
function moveCounters(prefix: string[], oldKey: string, counters: Record<string, unknown>): [FieldPath, unknown][] {
  const out: [FieldPath, unknown][] = [];
  for (const [name, n] of Object.entries(counters)) {
    if (typeof n === "number") out.push([new FieldPath(...prefix, renameDocId(oldKey), name), FieldValue.increment(n)]);
  }
  out.push([new FieldPath(...prefix, oldKey), FieldValue.delete()]);
  return out;
}

async function update(ref: DocumentReference, fields: [FieldPath, unknown][]) {
  const [first, ...rest] = fields.flat() as [FieldPath, unknown, ...unknown[]];
  await ref.update(first, ...rest);
}

for (const s of (await db.collection("stats").get()).docs) {
  if (s.id.startsWith("byModule_") && isOldDocId(s.id.slice("byModule_".length))) {
    const oldKey = s.id.slice("byModule_".length);
    const target = db.collection("stats").doc(`byModule_${renameDocId(oldKey)}`);
    plan(`stats  stats/${s.id} -> stats/${target.id}  (counters added)`);
    if (apply) {
      await db.runTransaction(async (tx) => {
        const from = await tx.get(s.ref);
        if (!from.exists) return;
        const inc = Object.fromEntries(Object.entries(from.data()!).filter(([, n]) => typeof n === "number").map(([k, n]) => [k, FieldValue.increment(n as number)]));
        tx.set(target, { ...inc, moduleId: renameModuleId(oldKey.replace("__", "/")) }, { merge: true });
        tx.delete(s.ref);
      });
    }
    continue;
  }
  const fields: [FieldPath, unknown][] = [];
  for (const [key, counters] of Object.entries((s.get("byModule") ?? {}) as Record<string, Record<string, unknown>>)) {
    if (!isOldDocId(key)) continue;
    plan(`stats  stats/${s.id}  byModule.${key} -> ${renameDocId(key)}`);
    fields.push(...moveCounters(["byModule"], key, counters ?? {}));
  }
  for (const [src, part] of Object.entries((s.get("bySrc") ?? {}) as Record<string, { byModule?: Record<string, Record<string, unknown>> }>)) {
    for (const [key, counters] of Object.entries(part?.byModule ?? {})) {
      if (!isOldDocId(key)) continue;
      plan(`stats  stats/${s.id}  bySrc.${src}.byModule.${key} -> ${renameDocId(key)}`);
      fields.push(...moveCounters(["bySrc", src, "byModule"], key, counters ?? {}));
    }
  }
  if (apply && fields.length) await update(s.ref, fields);
}

console.log(`Project: ${projectId ?? "(default)"}${emulator ? " (emulator)" : ""}. ${apply ? "APPLIED" : "Preview only, nothing written (add --apply to make these changes)"}.\n`);
console.log(changes.length ? changes.map((c) => `  ${c}`).join("\n") : "  Nothing under the old track ids. Nothing to do.");
console.log(`\n${changes.length} change(s)${apply ? " made" : " planned"}.`);
