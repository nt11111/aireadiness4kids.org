/**
 * Read-only: counts what Firestore holds under the old track ids from before the courses were renamed
 * (src/lib/renamed-tracks.mjs), so we know whether anything needs moving. It writes nothing.
 *
 *   node scripts/count-renamed-tracks.ts            totals, plus a list of the docs
 *   node scripts/count-renamed-tracks.ts --totals   totals only
 *
 * Credentials (never commit them), the same as scripts/set-role.ts:
 *   - GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json (delete the file when you're done), or
 *   - FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, and PUBLIC_FIREBASE_PROJECT_ID in your shell.
 * With FIRESTORE_EMULATOR_HOST set, it reads the local emulator instead.
 *
 * The list shows document paths, module ids, dates, and counts only: no names, emails, or answers.
 */
import { applicationDefault, cert, initializeApp } from "firebase-admin/app";
import { getFirestore, type Timestamp } from "firebase-admin/firestore";
import { RENAMED_TRACKS } from "../src/lib/renamed-tracks.mjs";

const projectId = process.env.PUBLIC_FIREBASE_PROJECT_ID ?? process.env.GCLOUD_PROJECT;
const emulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
const credential = emulator
  ? undefined
  : process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY
    ? cert({ projectId, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n") })
    : applicationDefault();
initializeApp({ projectId, ...(credential ? { credential } : {}) });
const db = getFirestore();
const totalsOnly = process.argv.includes("--totals");

const OLD = Object.keys(RENAMED_TRACKS);
/** "old/slug" or "old__slug" */
const isOld = (id: unknown) => typeof id === "string" && OLD.some((t) => id.startsWith(`${t}/`) || id.startsWith(`${t}__`));
const day = (t: unknown) => ((t as Timestamp | undefined)?.toDate?.() ?? null)?.toISOString().slice(0, 10) ?? "-";

const rows: Record<string, string[]> = { progress: [], certificates: [], checkResults: [], "stats/byModule_*": [], "stats byModule map keys": [] };
const accounts = new Set<string>();

// Progress: users/{uid}/learners/{learnerId}/progress/{track__slug}
for (const d of (await db.collectionGroup("progress").get()).docs) {
  if (!isOld(d.id) && !isOld(d.get("moduleId"))) continue;
  accounts.add(d.ref.path.split("/")[1]);
  rows.progress.push(`${d.ref.path}  steps=${Object.keys(d.get("steps") ?? {}).length} completed=${day(d.get("completedAt"))} certificate=${d.get("certificateId") ? "yes" : "no"}`);
}

// Certificates: refId is the module id.
for (const d of (await db.collection("certificates").get()).docs) {
  if (!isOld(d.get("refId"))) continue;
  accounts.add(d.get("uid"));
  rows.certificates.push(`certificates/${d.id}  ${d.get("refId")}  public=${Boolean(d.get("public"))} issued=${day(d.get("issuedAt") ?? d.get("createdAt"))}`);
}

// Check results (pre/post checks, signed in or anonymous).
for (const d of (await db.collection("checkResults").get()).docs) {
  if (!isOld(d.get("moduleId"))) continue;
  if (d.get("uid")) accounts.add(d.get("uid"));
  rows.checkResults.push(`checkResults/${d.id}  ${d.get("moduleId")}  ${d.get("uid") ? "signed in" : "anonymous"} at=${day(d.get("at") ?? d.get("createdAt"))}`);
}

// Stats: byModule_{track__slug} docs, and the byModule maps nested in bySrc_* and daily_* (daily_* also per src).
for (const d of (await db.collection("stats").get()).docs) {
  if (d.id.startsWith("byModule_") && isOld(d.id.slice("byModule_".length))) {
    rows["stats/byModule_*"].push(`stats/${d.id}  ${JSON.stringify(Object.fromEntries(Object.entries(d.data()).filter(([, v]) => typeof v === "number")))}`);
  }
  const maps: [string, Record<string, unknown> | undefined][] = [["byModule", d.get("byModule")]];
  for (const [src, part] of Object.entries((d.get("bySrc") ?? {}) as Record<string, { byModule?: Record<string, unknown> }>)) maps.push([`bySrc.${src}.byModule`, part?.byModule]);
  for (const [field, map] of maps) {
    const keys = Object.keys(map ?? {}).filter(isOld);
    if (keys.length) rows["stats byModule map keys"].push(`stats/${d.id}  ${field}: ${keys.join(", ")}`);
  }
}

console.log(`Project: ${projectId ?? "(default)"}${emulator ? " (emulator)" : ""}. Old track ids: ${OLD.join(", ")}.\n`);
for (const [name, list] of Object.entries(rows)) console.log(`${name.padEnd(26)} ${list.length}`);
console.log(`${"accounts involved".padEnd(26)} ${accounts.size}`);
if (!totalsOnly) {
  for (const [name, list] of Object.entries(rows)) {
    if (!list.length) continue;
    console.log(`\n${name}:`);
    for (const line of list) console.log(`  ${line}`);
  }
  if (accounts.size) console.log(`\naccount uids (match them against Firebase Auth to tell test accounts from real ones):\n  ${[...accounts].join("\n  ")}`);
}
