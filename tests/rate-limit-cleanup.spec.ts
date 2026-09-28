// The daily rate-limit cleanup (netlify/functions/cleanup-rate-limits.mts), on the Firestore
// emulator (project demo-ark). It replaces Firestore's TTL policy, which needs the Blaze plan.
import { test, expect } from "@playwright/test";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb, unique } from "./support/firebase";
import { deleteExpiredRateLimits } from "../src/lib/rate-limit-cleanup";

const HOUR = 60 * 60 * 1000;

async function seed(prefix: string, expired: number, live: number, collection = "rateLimits") {
  const now = Date.now();
  const batch = adminDb.batch();
  const ids = { expired: [] as string[], live: [] as string[] };
  for (let i = 0; i < expired; i++) {
    const id = `${prefix}-old-${i}`;
    ids.expired.push(id);
    batch.set(adminDb.collection(collection).doc(id), { count: 3, expiresAt: Timestamp.fromMillis(now - HOUR - i * 1000) });
  }
  for (let i = 0; i < live; i++) {
    const id = `${prefix}-live-${i}`;
    ids.live.push(id);
    batch.set(adminDb.collection(collection).doc(id), { count: 1, expiresAt: Timestamp.fromMillis(now + HOUR) });
  }
  await batch.commit();
  return ids;
}

const exists = async (id: string, collection = "rateLimits") => (await adminDb.collection(collection).doc(id).get()).exists;

test("cleanup deletes expired rate-limit counters in batches and keeps current ones", async () => {
  const collection = `rateLimitsTest-${unique()}`;
  const ids = await seed("t", 7, 3, collection);
  // Batches of 2, so 7 expired documents take four rounds.
  expect(await deleteExpiredRateLimits(adminDb, { batchSize: 2, collection })).toBe(7);
  for (const id of ids.expired) expect(await exists(id, collection), `${id} should be deleted`).toBe(false);
  for (const id of ids.live) expect(await exists(id, collection), `${id} should be kept`).toBe(true);
  expect(await deleteExpiredRateLimits(adminDb, { collection })).toBe(0);
});

test("cleanup stops starting new batches after its deadline", async () => {
  const collection = `rateLimitsTest-${unique()}`;
  const ids = await seed("t", 3, 0, collection);
  expect(await deleteExpiredRateLimits(adminDb, { batchSize: 1, deadline: Date.now() - 1, collection })).toBe(0);
  for (const id of ids.expired) expect(await exists(id, collection)).toBe(true);
  expect(await deleteExpiredRateLimits(adminDb, { collection })).toBe(3);
});

// The real collection, so other tests may delete these expired documents first; either way they go.
test("the scheduled function runs the cleanup and logs only a count", async () => {
  const ids = await seed(`t-${unique()}`, 2, 1);
  process.env.PUBLIC_FIREBASE_PROJECT_ID = "demo-ark";
  const { default: handler, config } = await import("../netlify/functions/cleanup-rate-limits.mts");
  expect(config.schedule).toBe("@daily");

  const lines: string[] = [];
  const log = console.log;
  const error = console.error;
  console.log = (...args: unknown[]) => { lines.push(args.join(" ")); };
  console.error = (...args: unknown[]) => { lines.push(args.join(" ")); };
  let res: Response;
  try {
    res = await handler();
  } finally {
    console.log = log;
    console.error = error;
  }
  expect(res.status).toBe(204);
  expect(lines).toHaveLength(1);
  expect(lines[0]).toMatch(/^\[cleanup-rate-limits\] deleted \d+$/);
  for (const id of ids.expired) expect(await exists(id)).toBe(false);
  expect(await exists(ids.live[0])).toBe(true);
});
