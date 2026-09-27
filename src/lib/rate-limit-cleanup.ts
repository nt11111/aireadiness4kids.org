/**
 * Deletes rate-limit counters whose window is over (rateLimits docs with expiresAt in the past).
 * Firestore's own TTL cleanup needs the paid Blaze plan, so a Netlify scheduled function
 * (netlify/functions/cleanup-rate-limits.mts) calls this once a day instead.
 *
 * Plain firebase-admin, no Astro imports: it runs outside the site and in the tests.
 */
import { Timestamp, type Firestore } from "firebase-admin/firestore";

export type CleanupOptions = {
  /** Anything that expired before this is deleted. */
  now?: Timestamp;
  /** Documents per batch (Firestore allows up to 500 writes in one batch). */
  batchSize?: number;
  /** Stop starting new batches after this time (ms since epoch), so the function ends inside its time limit. */
  deadline?: number;
  /** Tests use their own collection so parallel runs don't clean up each other's documents. */
  collection?: string;
};

/** Returns how many documents were deleted. */
export async function deleteExpiredRateLimits(db: Firestore, { now = Timestamp.now(), batchSize = 400, deadline = Infinity, collection = "rateLimits" }: CleanupOptions = {}): Promise<number> {
  let deleted = 0;
  while (Date.now() < deadline) {
    const snap = await db.collection(collection).where("expiresAt", "<", now).limit(batchSize).get();
    if (snap.empty) break;
    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    deleted += snap.size;
    if (snap.size < batchSize) break;
  }
  return deleted;
}
