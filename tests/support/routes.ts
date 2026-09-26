import type { Page } from "@playwright/test";
import { Timestamp } from "firebase-admin/firestore";
import type { Route } from "../routes";
import { account, adminDb, call, signInBrowser, type Account } from "./firebase";

const BIAS = "investigators/bias-in-ai";

/** Saved progress for the route's account: 3 of Bias in AI's 6 steps and its pre-check. */
async function seedProgress(acct: Account, kind: "learner" | "parent") {
  let learnerId: string;
  if (kind === "parent") {
    learnerId = (await call("/api/account/learners/create", { cookie: acct.cookie, body: { nickname: "Sam", gradeBand: "6-8" } })).json?.learner.id;
    await call("/api/account/learners/create", { cookie: acct.cookie, body: { nickname: "Kit", gradeBand: "3-5" } });
  } else {
    learnerId = (await adminDb.collection(`users/${acct.uid}/learners`).get()).docs[0].id;
  }
  const at = Timestamp.now();
  await adminDb.doc(`users/${acct.uid}/learners/${learnerId}/progress/${BIAS.replace("/", "__")}`).set({
    moduleId: BIAS,
    steps: { "what-is-bias": at, "where-it-comes-from": at, "scenario-hiring-bot": at },
    startedAt: at,
    updatedAt: at,
    pre: { score: 2, outOf: 3, at },
  });
}

/** Signs the page's browser in first when the route needs an account (and gives it progress if asked). */
export async function prepare(page: Page, route: Route) {
  if (!route.auth) return;
  const kind = route.auth === "parent" ? "parent" : "learner";
  const acct = kind === "parent" ? await account("parent") : await account("learner", route.auth === "learner" ? {} : { role: route.auth as "admin" | "facilitator" });
  if (route.progress) await seedProgress(acct, kind);
  await signInBrowser(page.context(), acct);
}
