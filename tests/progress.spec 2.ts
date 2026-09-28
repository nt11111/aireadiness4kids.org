/**
 * Phase 4 progress (brief sections 7, 8.2, and 8.5), against the Firebase emulators only.
 * API tests call the server directly; the browser tests are the three flows the phase asks for:
 * a guest's progress carries into a new account, progress survives signing out and in, and a
 * parent's learner profiles each keep their own progress.
 */
import { test, expect, type Page } from "@playwright/test";
import { BIAS_MODULE, BIAS_STEPS } from "./routes";
import { account, adminAuth, adminDb, BASE, call, createUser, idTokenFor, LEARNER_SIGNUP, sessionCookieFrom, signInBrowser, unique, type Account } from "./support/firebase";
import { beforeHydration, hydrated } from "./support/hydration";
import { chooseBirth, confirmEmail, PASSWORD, signInWithForm } from "./support/flows";

const MOD = "investigators/bias-in-ai";
const DOC = "investigators__bias-in-ai";
const RIGHT = { "pc-training-data": "a", "pc-past-hiring": "b", "pc-catch-bias": "b" };
const WRONG = { "pc-training-data": "b", "pc-past-hiring": "a", "pc-catch-bias": "a" };
const PHASE = process.env.PHASE ?? "phase-4";

/** A unique ?src= tag, so each test reads its own stats/bySrc_ doc (the shared ones change under parallel tests). */
const newSrc = () => `t-${unique()}`.toLowerCase().slice(0, 40);

async function learnerAccount(src?: string): Promise<Account & { learnerId: string }> {
  const user = await createUser();
  const res = await call("/api/session", { body: { idToken: await idTokenFor(user), signup: LEARNER_SIGNUP("Robin"), ...(src ? { src } : {}) } });
  const cookie = sessionCookieFrom(res.headers)!.split(";")[0];
  const learnerId = (await adminDb.collection(`users/${user.uid}/learners`).get()).docs[0].id;
  return { ...user, cookie, learnerId };
}

const progressDoc = (uid: string, learnerId: string) => adminDb.doc(`users/${uid}/learners/${learnerId}/progress/${DOC}`);
const bySrc = async (src: string) => (await adminDb.doc(`stats/bySrc_${src}`).get()).data() ?? {};
const stepsIn = async (uid: string, learnerId: string) => Object.keys((await progressDoc(uid, learnerId).get()).get("steps") ?? {}).sort();

test.describe("progress API", () => {
  test("step completions save under the learner; a module start and completion count once, credited to the first src", async () => {
    const src = newSrc();
    const a = await learnerAccount(src);
    expect((await adminDb.doc(`users/${a.uid}`).get()).get("firstSrc")).toBe(src);
    expect(await bySrc(src)).toMatchObject({ src, accounts_13to17: 1, learners: 1 });

    const first = await call("/api/progress/step", { cookie: a.cookie, body: { learnerId: a.learnerId, moduleId: MOD, step: BIAS_STEPS[0] } });
    expect(first.json).toMatchObject({ ok: true, started: true, completed: false });
    const again = await call("/api/progress/step", { cookie: a.cookie, body: { learnerId: a.learnerId, moduleId: MOD, step: BIAS_STEPS[0] } });
    expect(again.json).toMatchObject({ ok: true, started: false, completed: false });

    for (const step of BIAS_STEPS.slice(1)) expect((await call("/api/progress/step", { cookie: a.cookie, body: { learnerId: a.learnerId, moduleId: MOD, step } })).status).toBe(200);
    const doc = await progressDoc(a.uid, a.learnerId).get();
    expect(Object.keys(doc.get("steps")).sort()).toEqual([...BIAS_STEPS].sort());
    expect(doc.get("completedAt")).toBeTruthy();
    // Finishing again changes nothing.
    expect((await call("/api/progress/step", { cookie: a.cookie, body: { learnerId: a.learnerId, moduleId: MOD, step: BIAS_STEPS[5] } })).json?.completed).toBe(false);

    const stats = await bySrc(src);
    expect(stats).toMatchObject({ moduleStarts: 1, moduleCompletions: 1 });
    const today = new Date().toISOString().slice(0, 10);
    expect((await adminDb.doc(`stats/daily_${today}`).get()).get(`bySrc.${src}.moduleCompletions`)).toBe(1);
    expect((await adminDb.doc(`stats/byModule_${DOC}`).get()).get("moduleCompletions")).toBeGreaterThanOrEqual(1);

    // What the browser loads: its own progress, as step ids with the numbers the pages use.
    const got = await call("/api/progress", { method: "GET", cookie: a.cookie });
    expect(got.status).toBe(200);
    expect(got.json?.learner).toEqual({ id: a.learnerId, nickname: "Robin" });
    expect(got.json?.modules[MOD].steps.sort()).toEqual([...BIAS_STEPS].sort());
    expect(got.json?.modules[MOD].completedAt).toBeTruthy();
  });

  test("the pre-check is scored on the server, and the first result is the one kept", async () => {
    const src = newSrc();
    const a = await learnerAccount(src);
    // A score in the request is ignored: only the answers count.
    const res = await call("/api/progress/precheck", { cookie: a.cookie, body: { learnerId: a.learnerId, moduleId: MOD, answers: { ...RIGHT, "pc-past-hiring": "a" }, score: 3 } });
    expect(res.json).toMatchObject({ ok: true, score: 2, outOf: 3 });
    const retake = await call("/api/progress/precheck", { cookie: a.cookie, body: { learnerId: a.learnerId, moduleId: MOD, answers: RIGHT } });
    expect(retake.json).toMatchObject({ score: 2, outOf: 3 });
    expect((await progressDoc(a.uid, a.learnerId).get()).get("pre")).toMatchObject({ score: 2, outOf: 3 });
    expect(await bySrc(src)).toMatchObject({ preCount: 1, preScoreSum: 67 });
  });

  test("anything that isn't real content is rejected before it's stored", async () => {
    const a = await learnerAccount();
    const step = (body: object) => call("/api/progress/step", { cookie: a.cookie, body: { learnerId: a.learnerId, moduleId: MOD, step: BIAS_STEPS[0], ...body } });
    expect((await step({ moduleId: "investigators/not-a-module" })).status).toBe(404);
    expect((await step({ step: "not-a-step" })).status).toBe(400);
    for (const moduleId of ["../users", "investigators", "Investigators/Bias", `${MOD}/x`, "a".repeat(100)]) expect((await step({ moduleId })).status, moduleId).toBe(400);
    for (const s of ["01-what-is-bias", "../x", "What-Is-Bias", ""]) expect((await step({ step: s })).status, s).toBe(400);
    const pre = (answers: object) => call("/api/progress/precheck", { cookie: a.cookie, body: { learnerId: a.learnerId, moduleId: MOD, answers } });
    expect((await pre({ "pc-training-data": "a" })).status, "missing answers").toBe(400);
    expect((await pre({ ...RIGHT, "pc-catch-bias": "z" })).status, "not an option").toBe(400);
    expect((await pre({ ...RIGHT, extra: "a" })).status, "extra question").toBe(400);
    expect((await pre({})).status, "no answers").toBe(400);
    expect((await progressDoc(a.uid, a.learnerId).get()).exists).toBe(false);
  });

  test("user A can't read, write, merge into, or switch to user B's learners", async () => {
    const a = await account("parent", { name: "Ann" });
    const b = await account("parent", { name: "Bea" });
    const la = (await call("/api/account/learners/create", { cookie: a.cookie, body: { nickname: "Andy", gradeBand: "3-5" } })).json?.learner.id as string;
    const lb = (await call("/api/account/learners/create", { cookie: b.cookie, body: { nickname: "Bo", gradeBand: "6-8" } })).json?.learner.id as string;
    await adminDb.doc(`users/${b.uid}/learners/${lb}/progress/${DOC}`).set({ moduleId: MOD, steps: { "what-is-bias": 1 } });

    const asA = { cookie: a.cookie };
    expect((await call("/api/progress/step", { ...asA, body: { learnerId: lb, moduleId: MOD, step: BIAS_STEPS[1] } })).status).toBe(404);
    expect((await call("/api/progress/precheck", { ...asA, body: { learnerId: lb, moduleId: MOD, answers: RIGHT } })).status).toBe(404);
    expect((await call("/api/progress/merge", { ...asA, body: { learnerId: lb, steps: { [MOD]: [BIAS_STEPS[2]] } } })).status).toBe(404);
    expect((await call("/api/account/learners/active", { ...asA, body: { learnerId: lb } })).status).toBe(404);
    for (const bad of ["../../x", `${b.uid}/learners/${lb}`, "a".repeat(64)]) {
      expect((await call("/api/progress/step", { ...asA, body: { learnerId: bad, moduleId: MOD, step: BIAS_STEPS[0] } })).status, bad).toBe(400);
    }
    // B's progress is untouched, and A's own view never mentions B.
    expect(Object.keys((await adminDb.doc(`users/${b.uid}/learners/${lb}/progress/${DOC}`).get()).get("steps"))).toEqual(["what-is-bias"]);
    const view = await call("/api/progress", { method: "GET", ...asA });
    expect(view.json?.learners.map((l: { id: string }) => l.id)).toEqual([la]);
    for (const other of [lb, b.uid, `"Bo"`, `"Bea"`]) expect(view.text).not.toContain(other);
    // A forged "active learner" cookie pointing at B's learner is ignored.
    const forged = await call("/api/progress", { method: "GET", cookie: `${a.cookie}; ark_learner=${lb}` });
    expect(forged.json?.learner.id).toBe(la);
    expect(forged.text).not.toContain(lb);
  });

  test("merge brings in guest steps, the pre-check, and anonymous workshop checks, and skips content that's gone", async () => {
    const a = await learnerAccount();
    const anonSid = crypto.randomUUID();
    const check = await call("/api/checks", { body: { moduleId: MOD, phase: "pre", answers: RIGHT, anonSid }, headers: { "x-ark-test-ip": `10.0.0.${Math.floor(Math.random() * 250)}` } });
    expect(check.status).toBe(200);
    const res = await call("/api/progress/merge", {
      cookie: a.cookie,
      body: { learnerId: a.learnerId, steps: { [MOD]: [BIAS_STEPS[0]], "investigators/gone-module": ["x"] }, pre: { [MOD]: WRONG }, anonSid },
    });
    expect(res.json).toMatchObject({ ok: true, merged: { steps: 1, pre: 1, checks: 1 } });
    expect(await stepsIn(a.uid, a.learnerId)).toEqual([BIAS_STEPS[0]]);
    expect((await progressDoc(a.uid, a.learnerId).get()).get("pre")).toMatchObject({ score: 0, outOf: 3 });
    const linked = (await adminDb.collection("checkResults").where("uid", "==", a.uid).get()).docs;
    expect(linked).toHaveLength(1);
    expect(linked[0].get("learnerId")).toBe(a.learnerId);
    expect(linked[0].get("anonSid")).toBeUndefined();
  });

  test("the progress API needs a session", async () => {
    expect((await call("/api/progress", { method: "GET" })).status).toBe(401);
    expect((await call("/api/progress/step", { body: { learnerId: "x".repeat(20), moduleId: MOD, step: BIAS_STEPS[0] } })).status).toBe(401);
  });
});

/** The module overview's "N of 6 steps done." line, once progress has loaded. */
async function stepsDone(page: Page) {
  await page.goto(BIAS_MODULE);
  await hydrated(page);
  return page.getByRole("status").filter({ hasText: /steps done|finished every step/ });
}

/** Presses Next on the open step and waits for the next step's heading. */
async function next(page: Page, title: string) {
  await page.locator("[data-lesson-next]").click();
  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
}

test("a guest does step 1 and the pre-check, signs up, and both carry over (with the ?src= tag)", async ({ page }) => {
  const src = newSrc();
  await page.goto(`${BIAS_MODULE}?src=${src}`);
  // The tag is kept, then removed from the address bar.
  await expect(page).toHaveURL((u) => !u.search.includes("src="));
  await hydrated(page);
  await page.getByRole("button", { name: "Try the pre-check" }).click();
  await page.getByRole("radio", { name: "Training data" }).click();
  await page.getByRole("radio", { name: "Favor applicants who resemble the people hired before" }).click();
  await page.getByRole("radio", { name: "Make the tool run faster" }).click();
  await page.getByRole("button", { name: "See my score" }).click();
  await expect(page.getByText("You got 2 of 3.")).toBeVisible();

  await page.getByRole("link", { name: "Start the module" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "What is bias?" })).toBeVisible();
  await hydrated(page);
  await page.locator("[data-lesson-next]").click();
  await expect(page.getByRole("dialog", { name: "Keep going for free" })).toBeVisible();
  const guest = await page.evaluate(() => JSON.parse(localStorage.getItem("ark.guest.v1") ?? "null"));
  expect(guest).toMatchObject({ v: 1, src, steps: { [MOD]: [BIAS_STEPS[0]] }, pre: { [MOD]: { score: 2, total: 3 } } });

  await page.getByRole("link", { name: "Sign up with email" }).click();
  await chooseBirth(page, 16, 2);
  const email = `guest-${unique()}@example.test`;
  await page.getByLabel("What should we call you?").fill("Jules");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
  const step2 = `${BIAS_MODULE}/${BIAS_STEPS[1]}`;
  await confirmEmail(page, email, step2);
  await signInWithForm(page, email);
  await expect(page).toHaveURL(step2);

  // The step-2 page loads progress, merges the guest key into the new account, then clears it.
  const uid = (await adminAuth.getUserByEmail(email)).uid;
  const learnerId = (await adminDb.collection(`users/${uid}/learners`).get()).docs[0].id;
  await expect.poll(() => stepsIn(uid, learnerId)).toEqual([BIAS_STEPS[0]]);
  // The merge writes the steps, then the pre-check: wait for both.
  await expect.poll(async () => (await progressDoc(uid, learnerId).get()).get("pre")).toMatchObject({ score: 2, outOf: 3 });
  await expect.poll(() => page.evaluate(() => localStorage.getItem("ark.guest.v1"))).toBeNull();
  // Made in this browser, so nobody is asked: the progress was theirs.
  await expect(page.getByRole("dialog", { name: "Progress found on this device" })).toHaveCount(0);
  expect((await adminDb.doc(`users/${uid}`).get()).get("firstSrc")).toBe(src);
  expect(await bySrc(src)).toMatchObject({ accounts_13to17: 1, learners: 1, moduleStarts: 1, preCount: 1 });

  await expect(await stepsDone(page)).toHaveText("1 of 6 steps done.");
  await page.screenshot({ path: `screenshots/${PHASE}/progress/guest-merged-module.png`, fullPage: true });
});

test("progress persists across signing out and back in", async ({ page, context }) => {
  const acct = await account("learner", { name: "Max" });
  await signInBrowser(context, acct);
  await page.goto(`${BIAS_MODULE}/${BIAS_STEPS[0]}`);
  await hydrated(page);
  await next(page, "Where does bias come from?");
  await next(page, "Scenario: the summer jobs bot");
  const learnerId = (await adminDb.collection(`users/${acct.uid}/learners`).get()).docs[0].id;
  await expect.poll(() => stepsIn(acct.uid, learnerId)).toEqual([BIAS_STEPS[0], BIAS_STEPS[1]].sort());

  await page.goto("/my-learning");
  await hydrated(page);
  await page.getByRole("button", { name: "Account menu for Max" }).click();
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL((u) => u.pathname === "/");
  await page.goto(BIAS_MODULE);
  await hydrated(page);
  await expect(page.getByRole("link", { name: /Start module/ })).toBeVisible();

  await page.goto("/signin");
  await signInWithForm(page, acct.email);
  await expect(page).toHaveURL((u) => u.pathname === "/my-learning");
  await expect(page.getByText("2 of 6 steps done")).toBeVisible();
  await expect(page.getByRole("link", { name: "Continue Bias in AI" })).toHaveAttribute("href", `${BIAS_MODULE}/${BIAS_STEPS[2]}`);
  await expect(await stepsDone(page)).toHaveText("2 of 6 steps done.");
  await expect(page.getByRole("link", { name: /^Continue/ }).first()).toHaveAttribute("href", `${BIAS_MODULE}/${BIAS_STEPS[2]}`);
});

test("a parent switches between two learner profiles, and each keeps its own progress", async ({ page, context }) => {
  const parent = await account("parent", { name: "Pat" });
  const sam = (await call("/api/account/learners/create", { cookie: parent.cookie, body: { nickname: "Sam", gradeBand: "6-8" } })).json?.learner.id as string;
  const kit = (await call("/api/account/learners/create", { cookie: parent.cookie, body: { nickname: "Kit", gradeBand: "3-5" } })).json?.learner.id as string;
  await signInBrowser(context, parent);

  await page.goto("/my-learning");
  await hydrated(page);
  await expect(page.getByRole("heading", { level: 1, name: "Sam's learning" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Sam/, pressed: true })).toBeVisible();
  await page.goto(`${BIAS_MODULE}/${BIAS_STEPS[0]}`);
  await hydrated(page);
  await next(page, "Where does bias come from?");
  await next(page, "Scenario: the summer jobs bot");
  await expect.poll(() => stepsIn(parent.uid, sam)).toEqual([BIAS_STEPS[0], BIAS_STEPS[1]].sort());

  await page.goto("/my-learning");
  await hydrated(page);
  await page.getByRole("button", { name: /Kit/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Kit's learning" })).toBeVisible();
  await expect(page.getByText("You haven't started a module yet.", { exact: false })).toBeVisible();
  await page.screenshot({ path: `screenshots/${PHASE}/progress/parent-switched-to-kit.png`, fullPage: true });
  await page.goto(BIAS_MODULE);
  await hydrated(page);
  await expect(page.getByRole("link", { name: /Start module/ })).toBeVisible();
  await page.goto(`${BIAS_MODULE}/${BIAS_STEPS[0]}`);
  await hydrated(page);
  await next(page, "Where does bias come from?");
  await expect.poll(() => stepsIn(parent.uid, kit)).toEqual([BIAS_STEPS[0]]);

  // The header's switcher works too.
  await page.goto("/my-learning");
  await hydrated(page);
  await page.getByRole("button", { name: "Account menu for Pat" }).click();
  await page.getByRole("button", { name: "Learning as Sam" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Sam's learning" })).toBeVisible();
  await expect(page.getByText("2 of 6 steps done")).toBeVisible();
  expect(await stepsIn(parent.uid, sam)).toEqual([BIAS_STEPS[0], BIAS_STEPS[1]].sort());
  expect(await stepsIn(parent.uid, kit)).toEqual([BIAS_STEPS[0]]);
});

// --- Phase 4 follow-ups: shared computers, and parents with no learner profile yet ---

const OFFER = "Progress found on this device";
const guestKey = (page: Page) => page.evaluate(() => localStorage.getItem("ark.guest.v1"));

/** Someone else's guest progress left in this browser (step 1 of Bias in AI). */
async function leaveGuestProgress(page: Page) {
  await page.goto("/");
  await page.evaluate((mod) => localStorage.setItem("ark.guest.v1", JSON.stringify({ v: 1, steps: { [mod]: ["what-is-bias"] }, pre: {} })), MOD);
}

async function selfLearner(uid: string) {
  return (await adminDb.collection(`users/${uid}/learners`).get()).docs[0].id;
}

test("signing in where someone left guest progress asks first, and \"Add it\" adds it", async ({ page, context }) => {
  const acct = await account("learner", { name: "Ada" });
  const learnerId = await selfLearner(acct.uid);
  await leaveGuestProgress(page);
  await signInBrowser(context, acct);
  await page.goto(BIAS_MODULE);
  const dialog = page.getByRole("dialog", { name: OFFER });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("We found progress on this device from before you signed in. Add it to your account?");
  // Nothing is added before the person answers.
  expect((await progressDoc(acct.uid, learnerId).get()).exists).toBe(false);
  await page.screenshot({ path: `screenshots/${PHASE}/progress/guest-offer.png` });
  await dialog.getByRole("button", { name: "Add it" }).click();
  await expect(dialog).toBeHidden();
  await expect.poll(() => stepsIn(acct.uid, learnerId)).toEqual([BIAS_STEPS[0]]);
  expect(await guestKey(page)).toBeNull();
  await expect(page.getByRole("status").filter({ hasText: "steps done" })).toHaveText("1 of 6 steps done.");
});

test("\"No thanks\" deletes this device's copy and adds nothing", async ({ page, context }) => {
  const acct = await account("learner", { name: "Bo" });
  const learnerId = await selfLearner(acct.uid);
  await leaveGuestProgress(page);
  await signInBrowser(context, acct);
  await page.goto("/my-learning");
  const dialog = page.getByRole("dialog", { name: OFFER });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "No thanks" }).click();
  await expect(dialog).toBeHidden();
  expect(await guestKey(page)).toBeNull();
  expect((await progressDoc(acct.uid, learnerId).get()).exists).toBe(false);
  // It's gone for good: the next page doesn't ask again.
  await page.goto(BIAS_MODULE);
  await hydrated(page);
  await expect(page.getByRole("link", { name: /Start module/ })).toBeVisible();
  await expect(dialog).toHaveCount(0);
});

test("confirming the email on another device still brings this device's progress in, without asking", async ({ page, browser }) => {
  // This device: step 1 as a guest, then sign up from the gate panel.
  await page.goto(`${BIAS_MODULE}/${BIAS_STEPS[0]}`);
  await hydrated(page);
  await page.locator("[data-lesson-next]").click();
  await page.getByRole("dialog", { name: "Keep going for free" }).getByRole("link", { name: "Sign up with email" }).click();
  await chooseBirth(page, 17, 4);
  const email = `x-${unique()}@example.test`;
  await page.getByLabel("What should we call you?").fill("Cam");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();

  // Another device (say, a phone) opens the email link and signs in. It has no guest progress.
  const phone = await (await browser.newContext({ baseURL: BASE, reducedMotion: "reduce" })).newPage();
  const step2 = `${BIAS_MODULE}/${BIAS_STEPS[1]}`;
  await confirmEmail(phone, email, step2);
  await signInWithForm(phone, email);
  await expect(phone).toHaveURL(step2);
  const uid = (await adminAuth.getUserByEmail(email)).uid;
  const learnerId = await selfLearner(uid);
  await phone.context().close();

  // Back on this device: signing in adds step 1 straight away, because this account was made here.
  await page.goto(`/signin?next=${encodeURIComponent(BIAS_MODULE)}`);
  await signInWithForm(page, email);
  await expect(page).toHaveURL((u) => u.pathname === BIAS_MODULE);
  await expect.poll(() => stepsIn(uid, learnerId)).toEqual([BIAS_STEPS[0]]);
  await expect.poll(() => guestKey(page)).toBeNull();
  await expect(page.getByRole("dialog", { name: OFFER })).toHaveCount(0);
});

test("a parent with no learner profile is asked to add one before a lesson, then goes back to it", async ({ page, context }) => {
  const parent = await account("parent", { name: "Pia" });
  await signInBrowser(context, parent);
  const step2 = `${BIAS_MODULE}/${BIAS_STEPS[1]}`;
  await page.goto(step2);
  await expect(page).toHaveURL((u) => u.pathname === "/account/add-learner" && u.searchParams.get("next") === step2);
  await expect(page.getByRole("heading", { level: 1, name: "Add your first learner" })).toBeVisible();
  await page.screenshot({ path: `screenshots/${PHASE}/progress/add-first-learner.png`, fullPage: true });

  // Typed before the page's JavaScript loads, and kept.
  await beforeHydration(page, page.url(), async () => {
    await page.getByLabel("Nickname").fill("Remy");
    await page.getByLabel("Grade").selectOption("6-8");
  });
  await expect(page.getByLabel("Nickname")).toHaveValue("Remy");
  await page.getByRole("button", { name: "Add and continue" }).click();
  await expect(page).toHaveURL((u) => u.pathname === step2);
  await expect(page.getByRole("heading", { level: 1, name: "Where does bias come from?" })).toBeVisible();

  // Progress now has somewhere to go.
  await hydrated(page);
  await next(page, "Scenario: the summer jobs bot");
  const remy = (await adminDb.collection(`users/${parent.uid}/learners`).get()).docs[0];
  expect(remy.get("nickname")).toBe("Remy");
  await expect.poll(() => stepsIn(parent.uid, remy.id)).toEqual([BIAS_STEPS[1]]);

  // With a learner, the page isn't in the way any more.
  await page.goto(`/account/add-learner?next=${encodeURIComponent("/my-learning")}`);
  await expect(page).toHaveURL((u) => u.pathname === "/my-learning");
});

test("My learning sends a parent with no learner profile to add one first", async ({ page, context }) => {
  const parent = await account("parent", { name: "Quin" });
  await signInBrowser(context, parent);
  await page.goto("/my-learning");
  await expect(page).toHaveURL((u) => u.pathname === "/account/add-learner" && u.searchParams.get("next") === "/my-learning");
  await hydrated(page);
  await page.getByLabel("Nickname").fill("Ola");
  await page.getByLabel("Grade").selectOption("3-5");
  await page.getByRole("button", { name: "Add and continue" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Ola's learning" })).toBeVisible();
});
