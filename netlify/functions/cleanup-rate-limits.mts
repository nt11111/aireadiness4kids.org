/**
 * Netlify scheduled function: once a day, delete expired rate-limit counters (rateLimits docs
 * whose expiresAt has passed). This replaces Firestore's TTL policy, which needs the Blaze plan.
 * See docs/SETUP_FIREBASE.md.
 *
 * Netlify runs scheduled functions only on the published production deploy (not branch deploys
 * or previews). It logs only a count: never a document id or key.
 */
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { deleteExpiredRateLimits } from "../../src/lib/rate-limit-cleanup";

const APP_NAME = "ark-cleanup";
// Scheduled functions get 30 seconds; stop starting new batches well before that.
const TIME_BUDGET_MS = 20_000;

function app(): App {
  const existing = getApps().find((a) => a.name === APP_NAME);
  if (existing) return existing;
  const projectId = process.env.PUBLIC_FIREBASE_PROJECT_ID;
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    // Tests only. A demo- project can't reach real Firebase.
    if (!projectId?.startsWith("demo-")) throw new Error("FIRESTORE_EMULATOR_HOST is set, but the project isn't a demo- project. Refusing to run.");
    return initializeApp({ projectId }, APP_NAME);
  }
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!projectId || !clientEmail || !privateKey) throw new Error("Firebase isn't configured");
  // Netlify stores the key with literal "\n"; turn those back into newlines.
  return initializeApp({ projectId, credential: cert({ projectId, clientEmail, privateKey: privateKey.replace(/\\n/g, "\n") }) }, APP_NAME);
}

export default async function handler(): Promise<Response> {
  try {
    const deleted = await deleteExpiredRateLimits(getFirestore(app()), { deadline: Date.now() + TIME_BUDGET_MS });
    console.log(`[cleanup-rate-limits] deleted ${deleted}`);
    return new Response(null, { status: 204 });
  } catch (error) {
    // The error's name only: messages can include request details.
    console.error(`[cleanup-rate-limits] failed: ${error instanceof Error ? error.name : "error"}`);
    return new Response(null, { status: 500 });
  }
}

// Netlify reads this export at deploy time: run once a day (midnight UTC).
export const config = { schedule: "@daily" };
