/**
 * Phase 5: module completion, the post-check, and certificates (brief sections 7 and 8.2), against
 * the Firebase emulators only. 13+ learners' certificates are public at /verify/{id}; a parent's
 * child profile gets a printable certificate only.
 */
import { test, expect } from "@playwright/test";
import { BIAS_MODULE, BIAS_STEPS } from "./routes";
import { account, adminDb, call, createUser, idTokenFor, LEARNER_SIGNUP, sessionCookieFrom, signInBrowser, unique, type Account } from "./support/firebase";
import { hydrated } from "./support/hydration";

const MOD = "literate/bias-in-ai";
const DOC = "literate__bias-in-ai";
const RIGHT = { "pc-training-data": "a", "pc-past-hiring": "b", "pc-catch-bias": "b" };
const newSrc = () => `t-${unique()}`.toLowerCase().slice(0, 40);

async function learnerAccount(name = "Robin", src?: string): Promise<Account & { learnerId: string }> {
  const user = await createUser();
  const res = await call("/api/session", { body: { idToken: await idTokenFor(user), signup: LEARNER_SIGNUP(name), ...(src ? { src } : {}) } });
  const cookie = sessionCookieFrom(res.headers)!.split(";")[0];
  const learnerId = (await adminDb.collection(`users/${user.uid}/learners`).get()).docs[0].id;
  return { ...user, cookie, learnerId };
}

async function finish(acct: Pick<Account, "cookie">, learnerId: string, steps = BIAS_STEPS) {
  for (const step of steps) expect((await call("/api/progress/step", { cookie: acct.cookie, body: { learnerId, moduleId: MOD, step } })).status).toBe(200);
}
const issue = (acct: Pick<Account, "cookie">, learnerId: string) => call("/api/certificates/issue", { cookie: acct.cookie, body: { learnerId, moduleId: MOD } });

test.describe("certificates API", () => {
  test("issued only for a finished module, once, public for a 13+ learner, and counted once", async () => {
    const src = newSrc();
    const a = await learnerAccount("Robin", src);
    await finish(a, a.learnerId, BIAS_STEPS.slice(0, 5));
    expect((await issue(a, a.learnerId)).json).toEqual({ error: "not-complete" });
    await finish(a, a.learnerId, BIAS_STEPS.slice(5));

    const first = await issue(a, a.learnerId);
    expect(first.json).toMatchObject({ ok: true, public: true, issued: true });
    const id = first.json?.id as string;
    expect(id).toMatch(/^[A-Za-z0-9_-]{22}$/);
    const again = await issue(a, a.learnerId);
    expect(again.json).toMatchObject({ id, issued: false });

    const cert = (await adminDb.doc(`certificates/${id}`).get()).data();
    expect(cert).toMatchObject({ uid: a.uid, learnerId: a.learnerId, scope: "module", refId: MOD, displayName: "Robin", public: true });
    expect((await adminDb.doc(`users/${a.uid}/learners/${a.learnerId}/progress/${DOC}`).get()).get("certificateId")).toBe(id);
    expect((await adminDb.doc(`stats/bySrc_${src}`).get()).data()).toMatchObject({ certificates: 1, byModule: { [DOC]: { certificates: 1 } } });
    expect((await adminDb.collection("certificates").where("uid", "==", a.uid).get()).size).toBe(1);
  });

  test("a child's certificate is private: printable by the parent, never on /verify", async () => {
    const p = await account("parent", { name: "Pat" });
    const kid = (await call("/api/account/learners/create", { cookie: p.cookie, body: { nickname: "Sunny", gradeBand: "3-5" } })).json?.learner.id as string;
    await finish(p, kid);
    const res = await issue(p, kid);
    expect(res.json).toMatchObject({ ok: true, public: false });
    const id = res.json?.id as string;
    expect((await adminDb.doc(`certificates/${id}`).get()).get("displayName")).toBe("Sunny");

    const own = await call(`/certificates/${id}`, { method: "GET", cookie: p.cookie });
    expect(own.status).toBe(200);
    expect(own.text).toContain("Sunny");
    expect(own.text).not.toContain("/verify/");
    const pub = await call(`/verify/${id}`, { method: "GET" });
    expect(pub.status).toBe(404);
    expect(pub.text).not.toContain("Sunny");
  });

  test("user A can't issue, view, or verify-leak user B's certificate", async () => {
    const a = await learnerAccount("Ann");
    const b = await learnerAccount("Bea");
    await finish(b, b.learnerId);
    expect((await issue(a, b.learnerId)).status).toBe(404);
    const id = (await issue(b, b.learnerId)).json?.id as string;

    const asA = await call(`/certificates/${id}`, { method: "GET", cookie: a.cookie });
    expect(asA.status).toBe(404);
    expect(asA.text).not.toContain("Bea");
    // Signed out: the owner page needs a session; the public page shows only name, module, and date.
    const signedOut = await call(`/certificates/${id}`, { method: "GET" });
    expect(signedOut.status).toBe(302);
    expect(signedOut.headers.get("location")).toContain("/signin?next=");
    const pub = await call(`/verify/${id}`, { method: "GET" });
    expect(pub.status).toBe(200);
    expect(pub.text).toContain("Bea");
    expect(pub.text).toContain("Bias in AI");
    for (const secret of [b.email, b.uid, b.learnerId]) expect(pub.text).not.toContain(secret);
    // Made-up or malformed ids get the same not-found as private ones.
    for (const bad of ["AAAAAAAAAAAAAAAAAAAAAA", "../users", "x"]) expect((await call(`/verify/${bad}`, { method: "GET" })).status, bad).toBe(404);
  });

  test("the certificate API needs a session, POST, and this site's Origin", async () => {
    const a = await learnerAccount();
    expect((await call("/api/certificates/issue", { body: { learnerId: a.learnerId, moduleId: MOD } })).status).toBe(401);
    expect((await call("/api/certificates/issue", { method: "GET", cookie: a.cookie })).status).toBe(405);
    expect((await call("/api/certificates/issue", { cookie: a.cookie, origin: "https://evil.example", body: { learnerId: a.learnerId, moduleId: MOD } })).status).toBe(403);
    expect((await call("/api/certificates/issue", { cookie: a.cookie, body: { learnerId: a.learnerId, moduleId: "literate/nope" } })).status).toBe(404);
  });

  test("the post-check is scored on the server and the first result is kept", async () => {
    const src = newSrc();
    const a = await learnerAccount("Robin", src);
    const res = await call("/api/progress/postcheck", { cookie: a.cookie, body: { learnerId: a.learnerId, moduleId: MOD, answers: RIGHT, score: 0 } });
    expect(res.json).toMatchObject({ ok: true, score: 3, outOf: 3 });
    const retake = await call("/api/progress/postcheck", { cookie: a.cookie, body: { learnerId: a.learnerId, moduleId: MOD, answers: { ...RIGHT, "pc-catch-bias": "a" } } });
    expect(retake.json).toMatchObject({ score: 3, outOf: 3 });
    expect((await adminDb.doc(`stats/bySrc_${src}`).get()).data()).toMatchObject({ postCount: 1, postScoreSum: 100 });
    const b = await learnerAccount("Bea");
    expect((await call("/api/progress/postcheck", { cookie: b.cookie, body: { learnerId: a.learnerId, moduleId: MOD, answers: RIGHT } })).status).toBe(404);
  });
});

test.describe("completion page", () => {
  test("signed out, it asks for sign-in; stub modules have no completion page", async () => {
    const res = await call(`${BIAS_MODULE}/complete`, { method: "GET" });
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe(`/signin?next=${encodeURIComponent(`${BIAS_MODULE}/complete`)}`);
    const a = await learnerAccount();
    expect((await call("/courses/literate/deepfakes-and-misinformation/complete", { method: "GET", cookie: a.cookie })).status).toBe(404);
  });

  test("before the last step it says what's left", async ({ page }) => {
    const a = await learnerAccount();
    await finish(a, a.learnerId, BIAS_STEPS.slice(0, 2));
    await signInBrowser(page.context(), a);
    await page.goto(`${BIAS_MODULE}/complete`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Almost there: Bias in AI");
    await expect(page.getByText("2 of 6 steps done.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Continue with step 3" })).toHaveAttribute("href", `${BIAS_MODULE}/scenario-hiring-bot`);
    await expect(page.getByRole("button", { name: "Get my certificate" })).toHaveCount(0);
  });

  test("Finish module saves the last step, then: post-check comparison, certificate, verify page", async ({ page }) => {
    const a = await learnerAccount("Robin");
    await finish(a, a.learnerId, BIAS_STEPS.slice(0, 5));
    // A starting score of 1/3.
    await call("/api/progress/precheck", { cookie: a.cookie, body: { learnerId: a.learnerId, moduleId: MOD, answers: { ...RIGHT, "pc-past-hiring": "a", "pc-catch-bias": "a" } } });
    await signInBrowser(page.context(), a);

    await page.goto(`${BIAS_MODULE}/recap`, { waitUntil: "networkidle" });
    await hydrated(page);
    await page.getByRole("link", { name: "Finish module" }).click();
    await page.waitForURL(`**${BIAS_MODULE}/complete`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("You finished Bias in AI");

    await hydrated(page);
    await page.getByRole("button", { name: "Try the questions again" }).click();
    await page.getByRole("radio", { name: "Training data" }).click();
    await page.getByRole("radio", { name: "Favor applicants who resemble the people hired before" }).click();
    await page.getByRole("radio", { name: "Test how well it works for many different groups of people" }).click();
    await page.getByRole("button", { name: "See my score" }).click();
    await expect(page.locator("[data-compare]")).toHaveText("You improved from 1/3 to 3/3.");
    expect((await adminDb.doc(`users/${a.uid}/learners/${a.learnerId}/progress/${DOC}`).get()).get("post")).toMatchObject({ score: 3, outOf: 3 });

    await page.getByRole("button", { name: "Get my certificate" }).click();
    const view = page.getByRole("link", { name: "View and print" });
    await expect(view).toBeFocused();
    const verifyHref = await page.getByRole("link", { name: "Public verify page" }).getAttribute("href");
    await view.click();
    await expect(page.locator("[data-cert-name]")).toHaveText("Robin");
    await expect(page.locator("[data-cert-module]")).toHaveText("Bias in AI");
    await expect(page.locator("[data-cert-verify]")).toHaveText(`aireadiness4kids.org${verifyHref}`);

    // Back on the completion page, the certificate is already there; My learning offers a reprint.
    await page.goto(`${BIAS_MODULE}/complete`);
    await expect(page.getByRole("link", { name: "View and print" })).toBeVisible();
    await expect(page.getByText("You improved from 1/3 to 3/3.")).toBeVisible();
    await page.goto("/my-learning");
    await expect(page.getByRole("link", { name: "Reprint certificate for Bias in AI" })).toHaveAttribute("href", /^\/certificates\//);

    await page.context().clearCookies();
    await page.goto(verifyHref!);
    await expect(page.getByText("Verified by ARK")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Robin");
  });
});
