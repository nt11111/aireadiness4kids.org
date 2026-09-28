/**
 * (b) Direct client access to Firestore is denied (brief section 8.2): the browser SDK can't read or
 * write anything, signed in or not. Runs against the Firestore emulator with firestore.rules loaded.
 */
import { readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import { EMULATORS } from "../scripts/test-env.mjs";

let env: RulesTestEnvironment;

test.beforeAll(async () => {
  const [host, port] = EMULATORS.firestore.split(":");
  env = await initializeTestEnvironment({ projectId: "demo-ark", firestore: { rules: readFileSync("firestore.rules", "utf8"), host, port: Number(port) } });
  // Seed with rules off, so the denials below aren't just "document missing".
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), "users/alice"), { accountType: "learner" });
    await setDoc(doc(ctx.firestore(), "users/alice/learners/l1"), { nickname: "Al" });
    await setDoc(doc(ctx.firestore(), "certificates/c1"), { uid: "alice", public: true });
  });
});

test.afterAll(async () => {
  await env?.cleanup();
});

test("the emulator is reachable (control)", async () => {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await assertSucceeds(getDoc(doc(ctx.firestore(), "users/alice")));
  });
});

for (const who of ["signed in as the owner", "signed in as someone else", "signed out"] as const) {
  test(`client reads and writes are denied: ${who}`, async () => {
    const ctx = who === "signed out" ? env.unauthenticatedContext() : env.authenticatedContext(who === "signed in as the owner" ? "alice" : "mallory");
    const db = ctx.firestore();
    await assertFails(getDoc(doc(db, "users/alice")));
    await assertFails(getDoc(doc(db, "users/alice/learners/l1")));
    await assertFails(getDocs(collection(db, "users/alice/learners")));
    await assertFails(getDoc(doc(db, "certificates/c1")));
    await assertFails(getDocs(collection(db, "certificates")));
    await assertFails(setDoc(doc(db, "users/alice"), { accountType: "parent" }));
    await assertFails(setDoc(doc(db, "users/alice/learners/l2"), { nickname: "Sneaky" }));
    await assertFails(setDoc(doc(db, "stats/global"), { learners: 1_000_000 }));
    await assertFails(setDoc(doc(db, "checkResults/x"), { score: 3 }));
    await assertFails(deleteDoc(doc(db, "users/alice")));
    expect(true).toBe(true);
  });
}
