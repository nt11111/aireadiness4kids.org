/**
 * Rate limits for open endpoints (brief section 8.4: /api/checks per IP and per anon_sid).
 * Netlify runs many short-lived function instances, so counts live in Firestore, not memory.
 *
 * Fixed windows counted with plain increments (no transactions), so a whole class submitting at
 * once never waits on a lock or fails on contention; at a window's edge a few extra requests can
 * slip through, which is fine for a limit like this.
 *
 * Keys are HMAC'd with a server-only secret before they're stored, so rateLimits/ never holds an
 * IP address or browser id, even one that could be recovered by hashing every possible value.
 * Each doc has an expiresAt field; a Firestore TTL policy on rateLimits.expiresAt deletes old
 * ones (docs/SETUP_FIREBASE.md).
 */
import { createHash, createHmac } from "node:crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { FIREBASE_PRIVATE_KEY } from "astro:env/server";
import { db } from "./firebase-admin";
import { HttpError } from "./authz";

export type Limit = { key: string; limit: number; windowSeconds: number };

// Derived from the service account key so there's no extra secret to set up. Test runs have none.
const pepper = createHash("sha256").update(`ark-rate-limit|${FIREBASE_PRIVATE_KEY ?? "emulator"}`).digest();
const docId = (key: string) => createHmac("sha256", pepper).update(key).digest("hex").slice(0, 40);

/** Counts one request against every limit, and throws 429 if any is over. */
export async function rateLimit(limits: Limit[]) {
  const now = Date.now();
  const counts = await Promise.all(
    limits.map(async (l) => {
      const windowMs = l.windowSeconds * 1000;
      const window = Math.floor(now / windowMs);
      const ref = db().collection("rateLimits").doc(docId(`${l.key}|${window}`));
      await ref.set({ count: FieldValue.increment(1), expiresAt: Timestamp.fromMillis((window + 1) * windowMs) }, { merge: true });
      return Number((await ref.get()).get("count") ?? 0);
    }),
  );
  if (counts.some((c, i) => c > limits[i].limit)) throw new HttpError(429, "rate-limited");
}
