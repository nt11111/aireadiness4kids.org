/**
 * Workshop knowledge checks (brief sections 8.4 and 8.6), against the Firebase emulators only:
 * /check/[module]/[phase] is open to everyone, /api/checks scores on the server, counts each
 * browser once, and rate-limits per IP and per anonymous browser id.
 */
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { account, adminDb, call, signInBrowser, unique } from "./support/firebase";
import { beforeHydration, hydrated } from "./support/hydration";

const MOD = "literate/bias-in-ai";
const PAGE = "/check/bias-in-ai/pre";
const RIGHT = { "pc-training-data": "a", "pc-past-hiring": "b", "pc-catch-bias": "b" };
const PHASE = process.env.PHASE ?? "phase-4";

let ipCounter = 0;
/** Each test gets its own "IP" (honored only on the emulators), so parallel tests never share a limit. */
const testIp = () => `10.${(process.pid % 250) + 1}.${Math.floor(Math.random() * 250)}.${ipCounter++ % 250}`;
const submit = (body: object, ip = testIp(), cookie?: string) =>
  call("/api/checks", { body: { moduleId: MOD, phase: "pre", answers: RIGHT, anonSid: crypto.randomUUID(), ...body }, headers: { "x-ark-test-ip": ip }, cookie });

test("anyone can take a workshop check: scored on the server, tagged with the workshop's src, no account needed", async ({ page }) => {
  const src = `ws-${unique()}`.toLowerCase().slice(0, 40);
  await page.goto(`${PAGE}?src=${src}`);
  await expect(page).toHaveURL((u) => !u.search.includes("src="));
  await expect(page.getByRole("heading", { level: 1, name: "Before we start: quick check" })).toBeVisible();
  await hydrated(page);

  // Unanswered questions are named, and focus goes to the first one.
  await page.getByRole("radio", { name: "Training data" }).check();
  await page.getByRole("button", { name: "Send my answers" }).click();
  await expect(page.getByRole("alert")).toHaveText("Answer every question first: questions 2, 3 are still empty.");
  await expect(page.getByRole("group", { name: /Question 2 of 3/ }).getByRole("radio").first()).toBeFocused();

  await page.getByRole("radio", { name: "Favor applicants who resemble the people hired before" }).check();
  await page.getByRole("radio", { name: "Make the tool run faster" }).check();
  await page.getByLabel("What grade are you in? (optional)").selectOption("6-8");
  await page.getByRole("button", { name: "Send my answers" }).click();
  await expect(page.getByText("Thanks! Your answers are in.")).toBeVisible();
  await expect(page.getByText("You got 2 of 3.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Create a free account" })).toHaveAttribute("href", "/signup?next=%2Fcourses%2Fliterate%2Fbias-in-ai");
  await page.screenshot({ path: `screenshots/${PHASE}/checks/thanks.png`, fullPage: true });
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => v.id)).toEqual([]);

  const anonSid = await page.evaluate(() => JSON.parse(localStorage.getItem("ark.guest.v1") ?? "{}").anonSid);
  expect(anonSid).toMatch(/^[0-9a-f-]{36}$/);
  const docs = (await adminDb.collection("checkResults").where("anonSid", "==", anonSid).get()).docs;
  expect(docs).toHaveLength(1);
  expect(docs[0].data()).toMatchObject({ moduleId: MOD, phase: "pre", src, gradeBand: "6-8", score: 2, outOf: 3 });
  expect(docs[0].get("uid")).toBeUndefined();
  expect((await adminDb.doc(`stats/bySrc_${src}`).get()).data()).toMatchObject({ preCount: 1, preScoreSum: 67 });
});

test("answers picked before the page's JavaScript loads are kept, and the form can't be sent early", async ({ page }) => {
  await beforeHydration(page, PAGE, async () => {
    await page.getByRole("radio", { name: "Training data" }).check();
    await page.getByRole("radio", { name: "Favor applicants who resemble the people hired before" }).check();
    await page.getByRole("radio", { name: "Test how well it works for many different groups of people" }).check();
    await page.getByLabel("What grade are you in? (optional)").selectOption("9-12");
    await expect(page.getByRole("button", { name: "Send my answers" })).toBeDisabled();
  });
  await expect(page.getByRole("radio", { name: "Training data" })).toBeChecked();
  await expect(page.getByLabel("What grade are you in? (optional)")).toHaveValue("9-12");
  await page.getByRole("button", { name: "Send my answers" }).click();
  await expect(page.getByText("You got 3 of 3.")).toBeVisible();
  const anonSid = await page.evaluate(() => JSON.parse(localStorage.getItem("ark.guest.v1") ?? "{}").anonSid);
  const doc = (await adminDb.collection("checkResults").where("anonSid", "==", anonSid).get()).docs[0];
  expect(doc.data()).toMatchObject({ gradeBand: "9-12", score: 3 });
});

test("a signed-in learner's check is linked to them, with no anonymous id kept", async ({ page, context }) => {
  const acct = await account("learner", { name: "Lee" });
  await signInBrowser(context, acct);
  await page.goto("/check/bias-in-ai/post");
  await hydrated(page);
  await page.getByRole("radio", { name: "Training data" }).check();
  await page.getByRole("radio", { name: "Favor applicants who resemble the people hired before" }).check();
  await page.getByRole("radio", { name: "Test how well it works for many different groups of people" }).check();
  await page.getByRole("button", { name: "Send my answers" }).click();
  await expect(page.getByText("You got 3 of 3.")).toBeVisible();
  await expect(page.getByRole("link", { name: /Keep learning: Bias in AI/ })).toBeVisible();
  const docs = (await adminDb.collection("checkResults").where("uid", "==", acct.uid).get()).docs;
  expect(docs).toHaveLength(1);
  expect(docs[0].data()).toMatchObject({ phase: "post", score: 3, gradeBand: "6-8" });
  expect(docs[0].get("learnerId")).toMatch(/^[A-Za-z0-9]{20}$/);
  expect(docs[0].get("anonSid")).toBeUndefined();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("ark.guest.v1") ?? "{}").anonSid)).toBeUndefined();
});

test.describe("/api/checks", () => {
  test("each browser counts once per module and phase", async () => {
    const src = `dup-${unique()}`.toLowerCase().slice(0, 40);
    const anonSid = crypto.randomUUID();
    const first = await submit({ anonSid, src });
    expect(first.json).toMatchObject({ ok: true, score: 3, outOf: 3, duplicate: false });
    const again = await submit({ anonSid, src, answers: { "pc-training-data": "b", "pc-past-hiring": "a", "pc-catch-bias": "a" } });
    expect(again.json).toMatchObject({ ok: true, score: 3, duplicate: true });
    expect((await submit({ anonSid, src, phase: "post" })).json?.duplicate).toBe(false);
    expect((await adminDb.doc(`stats/bySrc_${src}`).get()).data()).toMatchObject({ preCount: 1, preScoreSum: 100, postCount: 1, postScoreSum: 100 });
    expect((await adminDb.collection("checkResults").where("anonSid", "==", anonSid).get()).size).toBe(2);
  });

  test("bad input is rejected", async () => {
    expect((await submit({ moduleId: "literate/not-a-module" })).status).toBe(404);
    // A module with no check questions has no check.
    expect((await submit({ moduleId: "aware/what-is-ai" })).status).toBe(404);
    expect((await submit({ phase: "during" })).status).toBe(400);
    expect((await submit({ answers: { "pc-training-data": "a" } })).status).toBe(400);
    expect((await submit({ answers: { ...RIGHT, "pc-catch-bias": "e" } })).status).toBe(400);
    expect((await submit({ anonSid: "short" })).status).toBe(400);
    expect((await submit({ src: "Not A Valid Src!" })).status).toBe(400);
    expect((await submit({ gradeBand: "college" })).status).toBe(400);
    expect((await call("/api/checks", { method: "GET" })).status).toBe(405);
  });

  test("rate limits: a dozen tries per browser, and per IP enough for two classes", async () => {
    test.setTimeout(90_000);
    // Limits count in fixed 10-minute windows; start well clear of a window's edge so none resets mid-test.
    const intoWindow = Date.now() % 600_000;
    if (intoWindow > 560_000) await new Promise((r) => setTimeout(r, 600_000 - intoWindow + 1_000));
    const anonSid = crypto.randomUUID();
    const statuses = [];
    for (let i = 0; i < 13; i++) statuses.push((await submit({ anonSid, phase: i % 2 ? "post" : "pre" })).status);
    expect(statuses.slice(0, 12).every((s) => s === 200)).toBe(true);
    expect(statuses[12]).toBe(429);

    // One after another: they all update the same counter, like a class submitting in turn.
    const ip = testIp();
    const results: number[] = [];
    for (let i = 0; i < 121; i++) results.push((await submit({}, ip)).status);
    expect(results.filter((s) => s === 200)).toHaveLength(120);
    expect(results.at(-1)).toBe(429);

    // The limiter never stores an IP or browser id in the clear.
    const stored = JSON.stringify((await adminDb.collection("rateLimits").get()).docs.map((d) => ({ id: d.id, ...d.data() })));
    expect(stored).not.toContain(ip);
    expect(stored).not.toContain(anonSid);
  });
});
