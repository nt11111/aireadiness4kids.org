import type { Page } from "@playwright/test";
import { Timestamp } from "firebase-admin/firestore";
import type { Route } from "../routes";
import { account, adminDb, call, signInBrowser, type Account } from "./firebase";

const BIAS = "literate/bias-in-ai";
const BIAS_STEPS = ["what-is-bias", "where-it-comes-from", "scenario-hiring-bot", "check", "reflect", "recap"];

/**
 * Saved progress for the route's account: 3 of Bias in AI's 6 steps and its pre-check, or with
 * "complete", every step (parents get two learner profiles, the first with that progress).
 * Returns the learner id that has it.
 */
async function seedProgress(acct: Account, kind: "learner" | "parent", amount: true | "complete") {
  let learnerId: string;
  if (kind === "parent") {
    learnerId = (await call("/api/account/learners/create", { cookie: acct.cookie, body: { nickname: "Sam", gradeBand: "6-8" } })).json?.learner.id;
    await call("/api/account/learners/create", { cookie: acct.cookie, body: { nickname: "Kit", gradeBand: "3-5" } });
  } else {
    learnerId = (await adminDb.collection(`users/${acct.uid}/learners`).get()).docs[0].id;
  }
  const at = Timestamp.now();
  const steps = amount === "complete" ? BIAS_STEPS : BIAS_STEPS.slice(0, 3);
  await adminDb.doc(`users/${acct.uid}/learners/${learnerId}/progress/${BIAS.replace("/", "__")}`).set({
    moduleId: BIAS,
    steps: Object.fromEntries(steps.map((s) => [s, at])),
    startedAt: at,
    updatedAt: at,
    ...(amount === "complete" ? { completedAt: at } : {}),
    pre: { score: amount === "complete" ? 1 : 2, outOf: 3, at },
  });
  return learnerId;
}

/**
 * Gets the route's account ready (signing the page's browser in unless the route is looked at
 * signed out), and returns the path to open: "{cert}" in a route's path becomes the id of a
 * certificate issued for it.
 */
export async function prepare(page: Page, route: Route): Promise<string> {
  if (!route.auth) return route.path;
  const kind = route.auth === "parent" ? "parent" : "learner";
  const acct = kind === "parent" ? await account("parent") : await account("learner", route.auth === "learner" ? {} : { role: route.auth as "admin" | "facilitator" });
  let path = route.path;
  if (route.progress) {
    const learnerId = await seedProgress(acct, kind, route.progress);
    if (path.includes("{cert}")) {
      const res = await call("/api/certificates/issue", { cookie: acct.cookie, body: { learnerId, moduleId: BIAS } });
      if (res.status !== 200) throw new Error(`certificate: ${res.status} ${res.text}`);
      path = path.replace("{cert}", res.json?.id);
    }
  }
  if (!route.signedOut) await signInBrowser(page.context(), acct);
  return path;
}
